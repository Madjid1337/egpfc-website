import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLogin() {
  const { signIn, isAuthenticated, loading, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="min-h-screen bg-deep-forest flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-ivory p-8 lg:p-10">
        <p className="text-[10px] tracking-[0.3em] text-muted-gold uppercase font-medium mb-3">
          Administration
        </p>
        <h1 className="font-display text-3xl font-light text-deep-forest mb-2">EGPFC</h1>
        <p className="text-sm text-olive/70 mb-8">
          Connectez-vous pour gérer les cimetières, le plan et les photos.
        </p>

        {!configured && (
          <p className="mb-4 text-sm text-red-700 bg-red-50 p-3">
            Supabase n’est pas configuré (variables d’environnement manquantes).
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-light-gray bg-white px-3 py-2.5 text-sm text-deep-forest outline-none focus:border-muted-gold"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-light-gray bg-white px-3 py-2.5 text-sm text-deep-forest outline-none focus:border-muted-gold"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !configured}
            className="w-full bg-deep-forest text-ivory py-3 text-sm font-semibold tracking-[0.08em] hover:bg-deep-forest/90 disabled:opacity-50"
          >
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
