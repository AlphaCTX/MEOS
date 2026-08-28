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
  MapPin,
  Mail,
  Key,
  Save,
  AlertCircle,
  CheckCircle,
  Settings,
  Lock,
  Sparkles,
} from 'lucide-react';
import { UserSession, MutationRecord, MutationType, IncidentCategory } from '../types/index.js';
import { ApiService } from '../services/api.js';
import { PdfService } from '../services/pdfService.js';
import { useTheme } from '../context/ThemeContext.js';

interface OfficerProfileProps {
  currentUser: UserSession;
  onSelectMutation: (id: string) => void;
  onCreateNew: () => void;
  onProfileUpdated?: (updatedUser: UserSession) => void;
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
  onProfileUpdated,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeSection, setActiveSection] = useState<'mutations' | 'settings'>('mutations');

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
    name: currentUser.name || '',
    email: currentUser.email || '',
    department: currentUser.department || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'PRIMARY' | 'ASSISTING'>('ALL');

  // Keep form in sync when currentUser changes
  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      name: currentUser.name || '',
      email: currentUser.email || '',
      department: currentUser.department || '',
    }));
  }, [currentUser]);

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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileError(null);
      setProfileSuccess(null);

      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          throw new Error('De nieuwe wachtwoorden komen niet met elkaar overeen.');
        }
        if (!profileForm.currentPassword) {
          throw new Error('Voer uw huidige wachtwoord in om een nieuw wachtwoord in te stellen.');
        }
        if (profileForm.newPassword.length < 6) {
          throw new Error('Het nieuwe wachtwoord moet minimaal 6 tekens bevatten.');
        }
      }

      setProfileSaving(true);

      const payload: {
        email?: string;
        name?: string;
        department?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        email: profileForm.email.trim(),
        name: profileForm.name.trim(),
        department: profileForm.department.trim(),
      };

      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }

      const updatedUser = await ApiService.updateUserProfile(payload);

      setProfileSuccess('Uw profielgegevens zijn succesvol opgeslagen en direct bijgewerkt.');
      setProfileForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }

      setTimeout(() => setProfileSuccess(null), 5000);
    } catch (err: any) {
      setProfileError(err.message || 'Fout bij opslaan profiel');
    } finally {
      setProfileSaving(false);
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
                {currentUser.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-sans">
                      <Mail className="w-3.5 h-3.5" />
                      {currentUser.email}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onCreateNew}
              className="px-4 py-2.5 bg-[#154273] hover:bg-[#0e2c4d] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nieuwe Mutatie</span>
            </button>
          </div>
        </div>

        {/* Top Section Tabs: Mutations vs Settings */}
        <div
          className={`flex items-center gap-2 mt-6 pt-5 border-t ${
            isLight ? 'border-slate-200' : 'border-[#1e334d]'
          }`}
        >
          <button
            onClick={() => setActiveSection('mutations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSection === 'mutations'
                ? isLight
                  ? 'bg-[#154273] text-white shadow-sm'
                  : 'bg-blue-600 text-white shadow-md'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-[#08101d] hover:bg-[#122238] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Mijn Mutaties ({stats.total})</span>
          </button>

          <button
            onClick={() => setActiveSection('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSection === 'settings'
                ? isLight
                  ? 'bg-[#154273] text-white shadow-sm'
                  : 'bg-blue-600 text-white shadow-md'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-[#08101d] hover:bg-[#122238] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Mijn Gegevens & Instellingen</span>
          </button>
        </div>

        {/* Stats Grid */}
        {activeSection === 'mutations' && (
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t ${
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
        )}
      </div>

      {/* SECTION: SETTINGS (Mijn Gegevens & E-mail & Wachtwoord) */}
      {activeSection === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {profileError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-6">
            {/* Personal Details Card */}
            <div
              className={`border rounded-2xl p-6 shadow-xl space-y-5 transition-colors ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0c1626] border-[#1e334d] text-zinc-100'
              }`}
            >
              <div className="border-b pb-4 flex items-center justify-between flex-wrap gap-2 border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-[#154273] dark:text-blue-400" />
                    <span>Persoonlijke Gegevens & E-mailadres</span>
                  </h2>
                  <p className="text-xs opacity-70 mt-0.5">
                    Pas uw contactgegevens en e-mailadres aan voor het ontvangen van PDF mutaties en dossiers.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                  MEOS PROFIEL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>E-mailadres *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="uw.naam@marechaussee.nl"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none transition ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#154273] focus:bg-white'
                        : 'bg-[#08101d] border-[#1e334d] text-zinc-100 focus:border-blue-500'
                    }`}
                  />
                  <p className="text-[11px] opacity-60 mt-1">
                    Dit e-mailadres is nodig om proces-verbalen per mail naar uzelf of collega's te versturen.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80">
                    Volledige Naam van de Verbalisant *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Wmr. I J. van den Berg"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none transition ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#154273] focus:bg-white'
                        : 'bg-[#08101d] border-[#1e334d] text-zinc-100 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80">
                    Afdeling / Dienst
                  </label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    placeholder="Grensbewaking & Handhaving"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none transition ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#154273] focus:bg-white'
                        : 'bg-[#08101d] border-[#1e334d] text-zinc-100 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Read only info block */}
                <div className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'}`}>
                  <div className="font-bold opacity-80 flex items-center justify-between">
                    <span>Ambtelijke Gegevens (Vastgesteld):</span>
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="opacity-60 block">Dienstnummer:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{currentUser.badgeNumber}</span>
                    </div>
                    <div>
                      <span className="opacity-60 block">Rang:</span>
                      <span className="font-semibold">{currentUser.rank}</span>
                    </div>
                    <div>
                      <span className="opacity-60 block">Autorisatierol:</span>
                      <span className="font-mono font-bold">{currentUser.role}</span>
                    </div>
                    <div>
                      <span className="opacity-60 block">Brigade:</span>
                      <span className="font-semibold">{currentUser.activeBrigade || currentUser.activeUnit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change Card */}
            <div
              className={`border rounded-2xl p-6 shadow-xl space-y-5 transition-colors ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0c1626] border-[#1e334d] text-zinc-100'
              }`}
            >
              <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>Wachtwoord Wijzigen (Optioneel)</span>
                </h2>
                <p className="text-xs opacity-70 mt-0.5">
                  Laat deze velden leeg indien u uw huidige wachtwoord wilt behouden.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80">
                    Huidig Wachtwoord
                  </label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none transition ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#154273] focus:bg-white'
                        : 'bg-[#08101d] border-[#1e334d] text-zinc-100 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80">
                    Nieuw Wachtwoord
                  </label>
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    placeholder="Minimaal 6 tekens"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none transition ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#154273] focus:bg-white'
                        : 'bg-[#08101d] border-[#1e334d] text-zinc-100 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80">
                    Bevestig Nieuw Wachtwoord
                  </label>
                  <input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    placeholder="Herhaal nieuw wachtwoord"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none transition ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#154273] focus:bg-white'
                        : 'bg-[#08101d] border-[#1e334d] text-zinc-100 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-3 bg-[#154273] hover:bg-[#0e2c4d] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{profileSaving ? 'Gegevens Opslaan...' : 'Wijzigingen Opslaan in MEOS'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION: MUTATIONS (Officer's Personal Mutations Section) */}
      {activeSection === 'mutations' && (
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
      )}
    </div>
  );
};
