import QRCode from 'qrcode';
import { createAuthSignupClient, supabase } from '@/lib/supabase';
import type { Alert, Profile, Report, ReportStatus, Unite, UserRole } from '@/lib/operationsTypes';

function mapProfile(row: {
  id: string;
  email: string | null;
  full_name: string;
  role: string;
  unite_id: string | null;
}): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role as UserRole,
    uniteId: row.unite_id,
  };
}

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    console.warn('[profiles]', error?.message);
    return null;
  }
  return mapProfile(data);
}

/** Creates a profile row if missing (needs operations_fix.sql). */
export async function ensureMyProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.rpc('ensure_my_profile');
  if (error) {
    console.warn('[ensure_my_profile]', error.message);
    const { data: session } = await supabase.auth.getUser();
    if (session.user) return fetchMyProfile(session.user.id);
    return null;
  }
  if (!data) return null;
  return mapProfile(data as {
    id: string;
    email: string | null;
    full_name: string;
    role: string;
    unite_id: string | null;
  });
}

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('email');
  if (error) return [];
  return (data ?? []).map(mapProfile);
}

export async function updateProfileRole(
  userId: string,
  role: UserRole,
  uniteId: string | null,
) {
  const { error } = await supabase
    .from('profiles')
    .update({ role, unite_id: uniteId })
    .eq('id', userId);
  return { error: error?.message };
}

export async function fetchUnites(): Promise<Unite[]> {
  const { data, error } = await supabase.from('unites').select('*').order('name');
  if (error) {
    console.warn('[unites]', error.message);
    return [];
  }
  return (data ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    nameAr: u.name_ar,
    chefUserId: u.chef_user_id,
  }));
}

export async function upsertUnite(input: {
  id?: string;
  name: string;
  nameAr: string;
  chefUserId: string | null;
}) {
  if (input.id) {
    const { error } = await supabase
      .from('unites')
      .update({
        name: input.name,
        name_ar: input.nameAr,
        chef_user_id: input.chefUserId,
      })
      .eq('id', input.id);

    if (!error && input.chefUserId) {
      await supabase
        .from('profiles')
        .update({ role: 'chef_unite', unite_id: input.id })
        .eq('id', input.chefUserId);
    }

    return { error: error?.message, id: input.id };
  }

  const { data, error } = await supabase
    .from('unites')
    .insert({
      name: input.name,
      name_ar: input.nameAr,
      chef_user_id: input.chefUserId,
    })
    .select('id')
    .single();

  if (!error && input.chefUserId && data?.id) {
    await supabase
      .from('profiles')
      .update({ role: 'chef_unite', unite_id: data.id })
      .eq('id', input.chefUserId);
  }

  return { error: error?.message, id: data?.id };
}

export async function deleteUnite(id: string) {
  const { error } = await supabase.from('unites').delete().eq('id', id);
  return { error: error?.message };
}

/**
 * Creates a Chef Auth account without replacing the logged-in Dev/Directeur session.
 * Requires Supabase Auth → Providers → Email: "Enable sign ups" ON
 * (and ideally Confirm email OFF for admin-created accounts).
 */
export async function createChefAccount(email: string, password: string, fullName?: string) {
  const trimmed = email.trim().toLowerCase();
  const name = (fullName ?? '').trim();
  if (!trimmed || password.length < 6) {
    return { userId: null as string | null, error: 'Email et mot de passe (min. 6) requis.' };
  }

  // If profile already exists, reuse it (and refresh name if provided)
  const existing = (await fetchProfiles()).find((p) => p.email?.toLowerCase() === trimmed);
  if (existing) {
    if (name) {
      await supabase.from('profiles').update({ full_name: name }).eq('id', existing.id);
    }
    return { userId: existing.id, error: undefined as string | undefined, reused: true };
  }

  const signupClient = createAuthSignupClient();
  const { data, error } = await signupClient.auth.signUp({
    email: trimmed,
    password,
    options: { data: { full_name: name, role: 'chef_unite' } },
  });

  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      return {
        userId: null as string | null,
        error:
          'Ce compte existe déjà. Demandez à la personne de se connecter une fois, puis assignez-la, ou utilisez un autre email.',
      };
    }
    return { userId: null as string | null, error: error.message };
  }

  const userId = data.user?.id;
  if (!userId) {
    return {
      userId: null as string | null,
      error: 'Compte créé mais confirmation email requise. Désactivez « Confirm email » dans Supabase Auth, ou confirmez le mail.',
    };
  }

  await new Promise((r) => setTimeout(r, 400));
  let profile = await fetchMyProfile(userId);
  if (!profile) {
    const { error: insertErr } = await supabase.from('profiles').insert({
      id: userId,
      email: trimmed,
      full_name: name,
      role: 'chef_unite',
    });
    if (insertErr && !/duplicate|unique/i.test(insertErr.message)) {
      return { userId, error: insertErr.message };
    }
  } else if (name) {
    await supabase.from('profiles').update({ full_name: name }).eq('id', userId);
  }

  return { userId, error: undefined as string | undefined, reused: false };
}

export async function createUniteWithChef(input: {
  name: string;
  nameAr: string;
  chefName: string;
  chefEmail: string;
  chefPassword: string;
}) {
  const chef = await createChefAccount(input.chefEmail, input.chefPassword, input.chefName);
  if (!chef.userId) return { error: chef.error ?? 'Création du Chef échouée', id: undefined as string | undefined };

  const { data, error } = await supabase
    .from('unites')
    .insert({
      name: input.name,
      name_ar: input.nameAr,
      chef_user_id: chef.userId,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    return { error: error?.message ?? 'Création unité échouée', id: undefined as string | undefined };
  }

  const { error: roleErr } = await supabase
    .from('profiles')
    .update({
      role: 'chef_unite',
      unite_id: data.id,
      email: input.chefEmail.trim().toLowerCase(),
      full_name: input.chefName.trim(),
    })
    .eq('id', chef.userId);

  if (roleErr) {
    return { error: `Unité créée, mais rôle Chef: ${roleErr.message}`, id: data.id };
  }

  return { error: undefined as string | undefined, id: data.id };
}

export async function updateUniteWithChef(input: {
  id: string;
  name: string;
  nameAr: string;
  chefName?: string;
  chefEmail?: string;
  chefPassword?: string;
  keepChefUserId?: string | null;
}) {
  let chefUserId = input.keepChefUserId ?? null;

  if (input.chefEmail?.trim() && input.chefPassword && input.chefPassword.length >= 6) {
    const chef = await createChefAccount(input.chefEmail, input.chefPassword, input.chefName);
    if (!chef.userId) return { error: chef.error ?? 'Création du Chef échouée' };
    chefUserId = chef.userId;
  } else if (input.chefEmail?.trim()) {
    const existing = (await fetchProfiles()).find(
      (p) => p.email?.toLowerCase() === input.chefEmail!.trim().toLowerCase(),
    );
    if (existing) chefUserId = existing.id;
  }

  const { error } = await supabase
    .from('unites')
    .update({
      name: input.name,
      name_ar: input.nameAr,
      chef_user_id: chefUserId,
    })
    .eq('id', input.id);

  if (error) return { error: error.message };

  if (chefUserId) {
    const patch: { role: UserRole; unite_id: string; full_name?: string } = {
      role: 'chef_unite',
      unite_id: input.id,
    };
    if (input.chefName?.trim()) patch.full_name = input.chefName.trim();
    await supabase.from('profiles').update(patch).eq('id', chefUserId);
  }

  return { error: undefined as string | undefined };
}

export async function generateAndUploadQr(cemeteryId: string): Promise<{ url: string | null; error?: string }> {
  const fromEnv = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.replace(/\/$/, '');
  const origin =
    fromEnv ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  const publicUrl = `${origin}/cimetieres/${cemeteryId}`;

  try {
    const dataUrl = await QRCode.toDataURL(publicUrl, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'M',
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const path = `qr/${cemeteryId}.png`;

    let uploadError = (
      await supabase.storage
        .from('site-images')
        .upload(path, blob, { contentType: 'image/png', upsert: true })
    ).error;

    if (uploadError) {
      await supabase.storage.from('site-images').remove([path]);
      uploadError = (
        await supabase.storage
          .from('site-images')
          .upload(path, blob, { contentType: 'image/png', upsert: false })
      ).error;
    }

    if (uploadError) return { url: null, error: uploadError.message };

    const { data } = supabase.storage.from('site-images').getPublicUrl(path);
    return { url: `${data.publicUrl}?t=${Date.now()}`, publicUrl };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : 'QR generation failed' };
  }
}

export async function submitReport(input: {
  cemeteryId: string;
  issueType: string;
  description: string;
  imageUrl?: string;
}) {
  const { error } = await supabase.from('reports').insert({
    cemetery_id: input.cemeteryId,
    issue_type: input.issueType,
    description: input.description,
    image_url: input.imageUrl ?? '',
    status: 'PENDING',
  });
  return { error: error?.message };
}

export async function uploadReportImage(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `reports/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('site-images')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (uploadError) return { url: null as string | null, error: uploadError.message };

  const { data } = supabase.storage.from('site-images').getPublicUrl(path);
  return { url: data.publicUrl, error: undefined as string | undefined };
}

/** Client-side rate limit: max 3 reports per cemetery per hour */
export function canSubmitReport(cemeteryId: string): { ok: boolean; reason?: string } {
  try {
    const key = `egpfc-report-${cemeteryId}`;
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    const stamps: number[] = raw ? (JSON.parse(raw) as number[]).filter((t) => now - t < windowMs) : [];
    if (stamps.length >= 3) {
      return { ok: false, reason: 'Trop de signalements. Réessayez dans une heure.' };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export function recordReportSubmit(cemeteryId: string) {
  try {
    const key = `egpfc-report-${cemeteryId}`;
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    const stamps: number[] = raw ? (JSON.parse(raw) as number[]).filter((t) => now - t < windowMs) : [];
    stamps.push(now);
    localStorage.setItem(key, JSON.stringify(stamps));
  } catch {
    /* ignore */
  }
}

export async function fetchReports(): Promise<{ data: Report[]; error?: string }> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[reports]', error.message);
    return { data: [], error: error.message };
  }

  const cemeteryIds = [...new Set((data ?? []).map((r) => r.cemetery_id))];
  const nameById = new Map<string, string>();
  if (cemeteryIds.length > 0) {
    const { data: cemRows } = await supabase
      .from('cemeteries')
      .select('id, name')
      .in('id', cemeteryIds);
    for (const c of cemRows ?? []) nameById.set(c.id, c.name);
  }

  return {
    data: (data ?? []).map((r) => ({
      id: r.id,
      cemeteryId: r.cemetery_id,
      cemeteryName: nameById.get(r.cemetery_id),
      issueType: r.issue_type,
      description: r.description,
      imageUrl: r.image_url,
      status: r.status as ReportStatus,
      resolutionNote: r.resolution_note,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  };
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  resolutionNote?: string,
) {
  const { error } = await supabase
    .from('reports')
    .update({
      status,
      resolution_note: resolutionNote ?? '',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  return { error: error?.message };
}

export async function sendAlert(input: {
  reportId: string;
  toUserId: string;
  fromUserId: string;
  message: string;
}) {
  const { error } = await supabase.from('alerts').insert({
    report_id: input.reportId,
    to_user_id: input.toUserId,
    from_user_id: input.fromUserId,
    message: input.message,
  });
  return { error: error?.message };
}

export async function fetchMyAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data ?? []).map((a) => ({
    id: a.id,
    reportId: a.report_id,
    fromUserId: a.from_user_id,
    toUserId: a.to_user_id,
    message: a.message,
    readAt: a.read_at,
    createdAt: a.created_at,
  }));
}

export async function markAlertRead(id: string) {
  const { error } = await supabase
    .from('alerts')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error?.message };
}

export function hoursPending(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
}
