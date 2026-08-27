import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  FileText,
  Clock,
  Download,
  Eye,
  Plus,
  Search,
  Building,
  BadgeCheck,
  MapPin, Mail, Key, Save, AlertCircle, CheckCircle,
} from 'lucide-react';
import { UserSession, MutationRecord, MutationType, IncidentCategory } from '../types/index.js';
import { ApiService } from '../services/api.js';
import { PdfService } from '../services/pdfService.js';
import { useTheme } from '../context/ThemeContext.js';

interface OfficerProfileProps {
  currentUser: UserSession;
  onSelectMutation: (id: string) => void;
  onCreateNew: () => void;
}

const typeMap: Record<MutationType, string> = {
  VRIJE_MUTATIE: 'Vrije mutatie',
  KLADMUTATIE: 'Kladmutatie',
  INFORMATIERAPPORT: 'Informatierapport (ID)',
  PV_BEVINDINGEN: 'PV van Bevindingen',
  PV_AANGIFTE: 'PV van Aangifte',
  PV_VERHOOR: 'PV van Verhoor',
  PV_AANHOUDING: 'PV van Aanhouding',
  EIND_PV: 'Eind-PV (Opsporingsindicatie)',
};

const catMap: Record<IncidentCategory, string> = {
  WEAPONS_FIREARMS: 'Wapens & Vuurwapens (WWM)',
  NARCOTICS_DRUGS: 'Verdovende Middelen (Opiumwet)',
  TRAFFIC_VIOLATION_INCIDENT: 'Verkeer & Wegenverkeerswet',
  VIOLENT_CRIME_ASSAULT: 'Geweld & Mishandeling',
  BURGLARY_THEFT: 'Diefstal & Inbraak',
  PUBLIC_ORDER_DISTURBANCE: 'Openbare Orde (APV)',
  SUSPICIOUS_PERSON_ACTIVITY: 'Verdachte Situatie',
  DOMESTIC_INCIDENT: 'Huiselijk Geweld & Zorg',
  FRAUD_FINANCIAL: 'Fraude & Financieel',
  PROPERTY_DAMAGE_VANDALISM: 'Vernieling & Zaaksschade',
  ENVIRONMENTAL_HAZARD: 'Milieu & Veiligheid',
  OTHER_OBSERVATION: 'Overige Waarneming',
};

export const OfficerProfile: React.FC<OfficerProfileProps> = ({
  currentUser,
  onSelectMutation,
  onCreateNew,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    drafts: number;
    final: number;
    amended: number;
    asPrimary: number;
    asAssisting: number;
  }>({
    total: 0,
    drafts: 0,
    final: 0,
    amended: 0,
    asPrimary: 0,
    asAssisting: 0,
  });
  
  const [profileForm, setProfileForm] = useState({
    email: currentUser.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const handleProfileSave = async () => {
    try {
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        throw new Error('Nieuwe wachtwoorden komen niet overeen');
      }
      if (profileForm.newPassword && !profileForm.currentPassword) {
        throw new Error('Huidig wachtwoord is verplicht om een nieuw wachtwoord in te stellen');
      }
      
      setProfileSaving(true);
      setProfileError(null);
      setProfileSuccess(null);
      
      const payload: any = {};
      if (profileForm.email !== currentUser.email) payload.email = profileForm.email;
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }
      
      if (Object.keys(payload).length === 0) {
        setProfileSaving(false);
        return;
      }
      
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('user_session') || ''}`
        },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fout bij bijwerken profiel');
      
      setProfileSuccess('Profiel succesvol bijgewerkt. U moet mogelijk opnieuw inloggen om alle wijzigingen te zien.');
      setProfileForm({ ...profileForm, currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setProfileSuccess(null), 5000);
    } catch(err: any) {
      setProfileError(err.message || 'Fout bij bijwerken profiel');
    } finally {
      setProfileSaving(false);
    }
  };

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'PRIMARY' | 'ASSISTING'>('ALL');

  useEffect(() => {
    loadOfficerData();
  }, [currentUser.badgeNumber]);

  const loadOfficerData = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getOfficerMutations(currentUser.badgeNumber);
      setMutations(data.mutations);
      setStats(data.stats);
    } catch (err) {
      console.error('Fout bij laden profieldata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = (e: React.MouseEvent, m: MutationRecord) => {
    e.stopPropagation();
    PdfService.generateMutationPdf(m);
  };

  const filteredMutations = mutations.filter((m) => {
    const isPrimary = m.officerBadge.toLowerCase() === currentUser.badgeNumber.toLowerCase();
    if (filterRole === 'PRIMARY' && !isPrimary) return false;
    if (filterRole === 'ASSISTING' && isPrimary) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.referenceNumber.toLowerCase().includes(q) ||
      m.primaryAddress.toLowerCase().includes(q) ||
      m.narrativeSummary.toLowerCase().includes(q) ||
      (typeMap[m.mutationType] && typeMap[m.mutationType].toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Officer Header Card */}
      <div
        className={`border rounded-2xl p-6 shadow-xl relative overflow-hidden transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0c1626] border-[#1e334d] text-zinc-100'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shrink-0 ${
                isLight
                  ? 'bg-[#154273] text-white shadow-blue-900/20'
                  : 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-blue-600/20'
              }`}
            >
              <User className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                  {currentUser.name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                    isLight
                      ? 'bg-blue-50 text-[#154273] border-blue-200'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}
                >
                  {currentUser.badgeNumber}
                </span>
                {currentUser.isAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    SYSTEEMBEHEERDER
                  </span>
                )}
              </div>

              <p
                className={`text-xs mt-1.5 flex items-center gap-3 flex-wrap ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}
              >
                <span className="flex items-center gap-1 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-[#154273] dark:text-blue-400" />
                  {currentUser.rank}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 opacity-60" />
                  {currentUser.department}
                </span>
                <span>•</span>
                <span className={`font-mono font-bold ${isLight ? 'text-blue-900' : 'text-blue-300'}`}>
                  Brigade: {currentUser.activeBrigade || currentUser.activeUnit}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onCreateNew}
            className="px-4 py-2.5 bg-[#154273] hover:bg-[#0e2c4d] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nieuwe Mutatie Registreren</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t ${
            isLight ? 'border-slate-200' : 'border-[#1e334d]'
          }`}
        >
          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}>
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Totaal Gekoppeld</div>
            <div className={`text-xl font-black mt-1 font-mono ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>{stats.total}</div>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}>
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Hoofdverbalisant</div>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">{stats.asPrimary}</div>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}>
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Assistent / Bijstand</div>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">{stats.asAssisting}</div>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}>
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Definitief</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{stats.final}</div>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}>
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Gewijzigd (PV)</div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">{stats.amended}</div>
          </div>

          <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}>
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Concepten</div>
            <div className="text-xl font-black text-slate-500 dark:text-zinc-400 mt-1 font-mono">{stats.drafts}</div>
          </div>
        </div>
      </div>

      {/* Officer's Mutations Section */}
      <div
        className={`border rounded-2xl p-6 shadow-xl space-y-4 transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0c1626] border-[#1e334d] text-zinc-100'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
              <FileText className="w-5 h-5 text-[#154273] dark:text-blue-400" />
              <span>Geregistreerde Mutaties van Verbalisant</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Overzicht van alle ambtelijke registraties waarin dienstnummer ({currentUser.badgeNumber}) voorkomt.
            </p>
          </div>

          {/* Role Filter tabs */}
          <div
            className={`flex items-center p-1 rounded-xl border text-xs ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
            }`}
          >
            <button
              onClick={() => setFilterRole('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterRole === 'ALL'
                  ? isLight
                    ? 'bg-[#154273] text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Alle ({stats.total})
            </button>
            <button
              onClick={() => setFilterRole('PRIMARY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterRole === 'PRIMARY'
                  ? isLight
                    ? 'bg-[#154273] text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Hoofdverbalisant ({stats.asPrimary})
            </button>
            <button
              onClick={() => setFilterRole('ASSISTING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterRole === 'ASSISTING'
                  ? isLight
                    ? 'bg-[#154273] text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bijstand ({stats.asAssisting})
            </button>
          </div>
        </div>

        {/* Search bar within personal list */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek in uw mutaties op referentie, locatie, soort of feiten..."
            className={`w-full border rounded-xl pl-10 pr-4 py-2 text-xs outline-none transition ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#154273]'
                : 'bg-[#08101d] border-[#1e334d] text-zinc-100 placeholder-zinc-500 focus:border-blue-500'
            }`}
          />
        </div>

        {/* Mutation List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Mutaties ophalen uit MEOS database...
          </div>
        ) : filteredMutations.length === 0 ? (
          <div
            className={`text-center py-12 border border-dashed rounded-xl p-8 ${
              isLight ? 'border-slate-200 bg-slate-50/50' : 'border-[#1e334d] bg-[#08101d]'
            }`}
          >
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>
              Geen mutaties gevonden
            </h3>
            <p className={`text-xs max-w-md mx-auto mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Er zijn nog geen mutaties geregistreerd onder dienstnummer {currentUser.badgeNumber}.
              Klik op de knop hierboven om een ambtelijke mutatie aan te maken.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredMutations.map((m) => {
              const isPrimary =
                m.officerBadge.toLowerCase() === currentUser.badgeNumber.toLowerCase();

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMutation(m.id)}
                  className={`p-4 border rounded-xl transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                    isLight
                      ? 'bg-slate-50/70 hover:bg-white hover:shadow-md border-slate-200 hover:border-blue-300'
                      : 'bg-[#08101d] hover:bg-[#101c2e] border-[#1e334d] hover:border-blue-700/50'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#154273] dark:text-blue-400">
                        {m.referenceNumber}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-600/10 text-[#154273] dark:text-blue-300 border border-blue-500/20 font-mono">
                        {typeMap[m.mutationType] || m.mutationType}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          m.status === 'FINAL'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : m.status === 'AMENDED'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {m.status}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                        {catMap[m.category] || m.category}
                      </span>
                      {isPrimary ? (
                        <span className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded font-medium">
                          Hoofdverbalisant
                        </span>
                      ) : (
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-medium">
                          Bijstand
                        </span>
                      )}
                    </div>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      {m.narrativeSummary}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-zinc-400 pt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 opacity-60" />
                        {m.primaryAddress}
                      </span>
                      <span>•</span>
                      <span>
                        <Clock className="w-3.5 h-3.5 opacity-60 inline mr-1" />
                        {new Date(m.incidentDate || m.timestamp).toLocaleString('nl-NL')}
                      </span>
                      {m.persons.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{m.persons.length} persoon/personen</span>
                        </>
                      )}
                      {m.vehicles.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{m.vehicles.length} voertuig(en)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={(e) => handleDownloadPdf(e, m)}
                      title="Exporteer Proces-Verbaal als PDF"
                      className={`p-2 rounded-lg text-xs transition border flex items-center gap-1.5 cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-blue-50 text-slate-700 hover:text-[#154273] border-slate-200'
                          : 'bg-zinc-800 hover:bg-blue-600 text-zinc-300 hover:text-white border-zinc-700'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    <button
                      onClick={() => onSelectMutation(m.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                        isLight
                          ? 'bg-blue-50 hover:bg-[#154273] text-[#154273] hover:text-white border-blue-200'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Dossier</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

