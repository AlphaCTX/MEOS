import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { ApiService } from '../services/api.js';
import { UserSession } from '../types/index.js';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await ApiService.login(username, password);
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Inloggen mislukt. Controleer uw gegevens.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-blue-950/40 to-transparent border-b border-zinc-800 text-center">
          <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/10">
            <Shield className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-zinc-100">MEOS Authenticatie Portaal</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Mobiel Effectief Op Straat • Beveiligde Ambtelijke Toegang
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Gebruikersnaam
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Gebruikersnaam"
                required
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-blue-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Wachtwoord
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-blue-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticeren...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Veilig Aanmelden</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          </form>

        <div className="p-3 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 px-6">
          <span>Beveiligde SSL/TLS Sessie</span>
          <span>Sessie verlopen. Log opnieuw in.</span>
        </div>
      </div>
    </div>
  );
};
