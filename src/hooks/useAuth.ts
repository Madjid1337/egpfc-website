import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { fetchMyProfile, ensureMyProfile } from '@/lib/operationsApi';
import { hasFullAccess, type Profile } from '@/lib/operationsTypes';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadProfile(nextUser: User | null) {
      if (!nextUser) {
        if (mounted) setProfile(null);
        return;
      }
      let p = await ensureMyProfile();
      if (!p) p = await fetchMyProfile(nextUser.id);
      if (mounted) setProfile(p);
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await loadProfile(data.session?.user ?? null);
      if (mounted) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUser(next?.user ?? null);
      void loadProfile(next?.user ?? null).then(() => {
        if (mounted) setLoading(false);
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  const role = profile?.role ?? null;
  const isFullAccess = hasFullAccess(role);
  const isDev = role === 'dev';
  const isDirecteur = role === 'directeur';
  const isChef = role === 'chef_unite';
  const isInventory = role === 'inventaire';

  return {
    session,
    user,
    profile,
    role,
    isFullAccess,
    isDev,
    isDirecteur,
    isChef,
    isInventory,
    uniteId: profile?.uniteId ?? null,
    loading,
    isAuthenticated: Boolean(session),
    signIn,
    signOut,
    configured: isSupabaseConfigured,
  };
}
