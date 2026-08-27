import React, { useState, useEffect } from 'react';
import { Mail, Save, AlertCircle, CheckCircle, Server } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';

export const SmtpSettings: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const [formData, setFormData] = useState({
    host: '',
    port: '',
    user: '',
    pass: '',
    fromEmail: '',
    fromName: 'MEOS Systeem'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchSmtp = async () => {
      try {
        const res = await fetch('/api/admin/smtp', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('user_session') || ''}` }
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setFormData(json.data);
        }
      } catch(err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchSmtp();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const res = await fetch('/api/admin/smtp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('user_session') || ''}`
        },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fout bij opslaan SMTP instellingen');
      
      setSuccessMsg('SMTP instellingen succesvol opgeslagen.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan SMTP instellingen');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-xs opacity-50">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${isLight ? 'bg-white border-slate-200' : 'bg-[#0c1626] border-[#1e334d]'}`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>SMTP & E-mail Instellingen</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 font-mono">MAILSERVER</span>
          </div>
          <p className={`text-xs mt-1 max-w-2xl ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Configureer de uitgaande mailserver voor het versturen van systeemnotificaties, rapportages en wachtwoordherstel.
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 bg-[#154273] hover:bg-[#0e2c4d] text-white cursor-pointer`}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Opslaan...' : 'Instellingen Opslaan'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className={`p-6 rounded-2xl border shadow-md ${isLight ? 'bg-white border-slate-200' : 'bg-[#0c1626] border-[#1e334d]'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold mb-1 opacity-80 flex items-center gap-1.5"><Server className="w-3.5 h-3.5"/> SMTP Host</label>
            <input
              type="text"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}
              placeholder="smtp.example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 opacity-80">SMTP Poort</label>
            <input
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}
              placeholder="587"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 opacity-80">Gebruikersnaam</label>
            <input
              type="text"
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}
              placeholder="smtp_user"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 opacity-80">Wachtwoord</label>
            <input
              type="password"
              value={formData.pass}
              onChange={(e) => setFormData({ ...formData, pass: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 opacity-80 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> Afzender E-mail (From)</label>
            <input
              type="email"
              value={formData.fromEmail}
              onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}
              placeholder="noreply@marechaussee.nl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 opacity-80">Afzender Naam (From Name)</label>
            <input
              type="text"
              value={formData.fromName}
              onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}
              placeholder="MEOS Systeem"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
