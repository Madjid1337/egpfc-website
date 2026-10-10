import { supabase } from '@/lib/supabase';

export type ItemCondition = 'bon' | 'pas_bon' | 'use';

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  bon: 'Bon',
  pas_bon: 'Pas bon',
  use: 'Usé',
};

export const ITEM_CATEGORIES = ['Chaise', 'Outil', 'Bureau', 'Armoire', 'Matériel', 'Autre'] as const;

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  cemeteryId: string | null;
  condition: ItemCondition;
  barcode: string;
  notes: string;
};

export type InventoryCampaign = {
  id: string;
  year: number;
  status: 'open' | 'closed';
};

export type InventoryTeam = {
  id: string;
  campaignId: string;
  team: number;
  userId: string | null;
  fullName: string;
  email: string;
  tempPassword: string;
};

export type TeamAccountInput = {
  fullName: string;
  email: string;
  password: string;
};

export type TeamSession = {
  teamId: string;
  team: number;
  fullName: string;
  email: string;
  password: string;
  campaignId: string;
  year: number;
};

const TEAM_SESSION_KEY = 'egpfc-inventory-team';

export type InventoryCount = {
  id: string;
  campaignId: string;
  itemId: string;
  team: number;
  condition: ItemCondition;
  createdAt: string;
};

export function readTeamSession(): TeamSession | null {
  const raw = sessionStorage.getItem(TEAM_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TeamSession;
  } catch {
    return null;
  }
}

export function clearTeamSession() {
  sessionStorage.removeItem(TEAM_SESSION_KEY);
}

function newBarcode() {
  const n = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${n}`;
}

export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase.from('inventory_items').select('*').order('name');
  if (error) {
    console.warn('[inventory items]', error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    cemeteryId: row.cemetery_id,
    condition: row.condition,
    barcode: row.barcode,
    notes: row.notes,
  }));
}

export async function createInventoryItem(input: {
  name: string;
  category: string;
  cemeteryId: string;
  condition: ItemCondition;
  notes?: string;
}) {
  const barcode = newBarcode();
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      name: input.name.trim(),
      category: input.category.trim(),
      cemetery_id: input.cemeteryId,
      condition: input.condition,
      barcode,
      notes: input.notes?.trim() ?? '',
    })
    .select('*')
    .single();

  if (error || !data) return { item: null as InventoryItem | null, error: error?.message ?? 'Création impossible' };
  return {
    item: {
      id: data.id,
      name: data.name,
      category: data.category,
      cemeteryId: data.cemetery_id,
      condition: data.condition,
      barcode: data.barcode,
      notes: data.notes,
    },
    error: undefined as string | undefined,
  };
}

export async function updateInventoryItem(input: {
  id: string;
  name: string;
  category: string;
  cemeteryId: string;
  condition: ItemCondition;
}) {
  const { error } = await supabase
    .from('inventory_items')
    .update({
      name: input.name.trim(),
      category: input.category.trim(),
      cemetery_id: input.cemeteryId,
      condition: input.condition,
    })
    .eq('id', input.id);
  return { error: error?.message };
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  return { error: error?.message };
}

export async function fetchItemByBarcode(barcode: string): Promise<InventoryItem | null> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('barcode', barcode.trim())
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    cemeteryId: data.cemetery_id,
    condition: data.condition,
    barcode: data.barcode,
    notes: data.notes,
  };
}

export async function fetchCampaigns(): Promise<InventoryCampaign[]> {
  const { data, error } = await supabase.from('inventory_campaigns').select('*').order('year', { ascending: false });
  if (error) return [];
  return (data ?? []).map((row) => ({ id: row.id, year: row.year, status: row.status }));
}

export async function fetchTeams(campaignId: string): Promise<InventoryTeam[]> {
  const { data, error } = await supabase
    .from('inventory_teams')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('team');
  if (error) return [];
  return (data ?? []).map((row) => ({
    id: row.id,
    campaignId: row.campaign_id,
    team: row.team,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    tempPassword: row.temp_password,
  }));
}

export async function fetchCounts(campaignId: string): Promise<InventoryCount[]> {
  const { data, error } = await supabase
    .from('inventory_counts')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map((row) => ({
    id: row.id,
    campaignId: row.campaign_id,
    itemId: row.item_id,
    team: row.team,
    condition: row.condition,
    createdAt: row.created_at,
  }));
}

export async function createAnnualInventory(year: number, accounts: TeamAccountInput[]) {
  let campaign: InventoryCampaign | null = null;
  const { data: existing } = await supabase
    .from('inventory_campaigns')
    .select('*')
    .eq('year', year)
    .maybeSingle();

  if (existing) {
    campaign = { id: existing.id, year: existing.year, status: existing.status };
  } else {
    const { data: created, error } = await supabase
      .from('inventory_campaigns')
      .insert({ year, status: 'open' })
      .select('*')
      .single();
    if (error || !created) {
      return {
        campaign: null as InventoryCampaign | null,
        teams: [] as InventoryTeam[],
        error: error?.message ?? 'Création impossible. Exécutez supabase/inventory.sql dans Supabase.',
      };
    }
    campaign = { id: created.id, year: created.year, status: created.status };
  }

  const current = await fetchTeams(campaign.id);
  const teams = [...current];

  for (const team of [1, 2, 3] as const) {
    const account = accounts[team - 1];
    const payload = {
      campaign_id: campaign.id,
      team,
      user_id: null,
      full_name: account.fullName.trim(),
      email: account.email.trim(),
      temp_password: account.password,
    };
    const existingTeam = teams.find((row) => row.team === team);
    const query = existingTeam
      ? supabase.from('inventory_teams').update(payload).eq('id', existingTeam.id).select('*').single()
      : supabase.from('inventory_teams').insert(payload).select('*').single();
    const { data: row, error: teamError } = await query;
    if (teamError || !row) {
      return { campaign, teams, error: teamError?.message ?? `Équipe ${team} non enregistrée` };
    }
    const mapped: InventoryTeam = {
      id: row.id,
      campaignId: row.campaign_id,
      team: row.team,
      userId: row.user_id,
      fullName: row.full_name,
      email: row.email,
      tempPassword: row.temp_password,
    };
    const index = teams.findIndex((rowTeam) => rowTeam.team === team);
    if (index >= 0) teams[index] = mapped;
    else teams.push(mapped);
  }

  return { campaign, teams, error: undefined as string | undefined };
}

export async function fetchMyOpenAssignment(userId: string) {
  const { data, error } = await supabase
    .from('inventory_teams')
    .select('team, campaign_id, inventory_campaigns(id, year, status)')
    .eq('user_id', userId);

  if (error || !data) return null;
  const open = data.find((row) => {
    const campaign = row.inventory_campaigns as { status?: string } | null;
    return campaign?.status === 'open';
  });
  if (!open) return null;
  const campaign = open.inventory_campaigns as { id: string; year: number; status: 'open' | 'closed' };
  return { team: open.team, campaign };
}

export async function submitCount(input: {
  campaignId: string;
  itemId: string;
  team: number;
  condition: ItemCondition;
  userId: string;
}) {
  const { error } = await supabase.from('inventory_counts').upsert(
    {
      campaign_id: input.campaignId,
      item_id: input.itemId,
      team: input.team,
      condition: input.condition,
      counted_by: input.userId,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'campaign_id,item_id,team' },
  );
  if (error) return { error: error.message };

  if (input.team === 3) {
    await supabase.from('inventory_items').update({ condition: input.condition }).eq('id', input.itemId);
  }
  return { error: undefined as string | undefined };
}

export type InventoryUnite = {
  id: string;
  name: string;
  nameAr: string;
};

export async function fetchUnitesForTeam(): Promise<InventoryUnite[]> {
  const session = readTeamSession();
  if (!session) return [];
  const { data, error } = await supabase.rpc('inventory_list_unites', {
    p_email: session.email,
    p_password: session.password,
  });
  if (error || !data) return [];
  return data;
}

export async function loginInventoryTeam(email: string, password: string) {
  const { data, error } = await supabase.rpc('inventory_team_login', {
    p_email: email.trim(),
    p_password: password,
  });
  if (error) {
    return { session: null as TeamSession | null, error: error.message };
  }
  if (!data) {
    return { session: null as TeamSession | null, error: 'Email ou mot de passe incorrect.' };
  }
  const session: TeamSession = { ...data, password };
  sessionStorage.setItem(TEAM_SESSION_KEY, JSON.stringify(session));
  return { session, error: undefined as string | undefined };
}

export async function fetchItemForTeam(barcode: string): Promise<InventoryItem | null> {
  const session = readTeamSession();
  if (!session) return null;
  const { data, error } = await supabase.rpc('inventory_item_by_barcode', {
    p_email: session.email,
    p_password: session.password,
    p_barcode: barcode,
  });
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    cemeteryId: data.cemeteryId,
    condition: data.condition,
    barcode: data.barcode,
    notes: '',
  };
}

export async function fetchCountsForTeam(itemId: string): Promise<InventoryCount[]> {
  const session = readTeamSession();
  if (!session) return [];
  const { data, error } = await supabase.rpc('inventory_item_counts', {
    p_email: session.email,
    p_password: session.password,
    p_item_id: itemId,
  });
  if (error || !data) return [];
  return data.map((row) => ({
    id: `${itemId}-${row.team}`,
    campaignId: session.campaignId,
    itemId,
    team: row.team,
    condition: row.condition,
    createdAt: '',
  }));
}

export async function submitTeamCount(itemId: string, condition: ItemCondition) {
  const session = readTeamSession();
  if (!session) return { error: 'Session expirée. Reconnectez-vous.' };
  const { data, error } = await supabase.rpc('inventory_submit_count', {
    p_email: session.email,
    p_password: session.password,
    p_item_id: itemId,
    p_condition: condition,
  });
  if (error) return { error: error.message };
  if (data) return { error: data };
  return { error: undefined as string | undefined };
}
