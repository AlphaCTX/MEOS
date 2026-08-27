import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Shield,
  Sliders,
  Sparkles,
  Activity,
  CheckCircle,
  AlertCircle,
  Radio,
  MapPin,
  Car,
  Server, Mail, Code2,
  Database,
  Building,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { UserManager } from './admin/UserManager.js';
import { BrigadeManager } from './admin/BrigadeManager.js';
import { PermissionsMatrixEditor } from './admin/PermissionsMatrixEditor.js';
import { SchemaViewer } from './SchemaViewer.js';
import { SmtpSettings } from './admin/SmtpSettings.js';
import { ApiService } from '../services/api.js';

interface AdminPanelProps {
  onClearData: () => void;
  onSelectTab?: (tab: 'feed' | 'wizard' | 'profile' | 'entities' | 'audit' | 'admin') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClearData, onSelectTab }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'users' | 'brigades' | 'matrix' | 'smtp' | 'diagnostics'>('users');

  // Diagnostics states
  const [pdokStatus, setPdokStatus] = useState<'idle' | 'testing' | 'online' | 'error'>('idle');
  const [pdokTestAddress, setPdokTestAddress] = useState<string | null>(null);
  const [rdwStatus, setRdwStatus] = useState<'idle' | 'testing' | 'online' | 'error'>('idle');
  const [rdwTestData, setRdwTestData] = useState<string | null>(null);

  const handleTestPdokLive = async () => {
    try {
      setPdokStatus('testing');
      const res = await ApiService.lookupLocation('2595BW', '472');
      if (res && res.data && res.data.volledigAdres) {
        setPdokStatus('online');
        setPdokTestAddress(res.data.volledigAdres);
      } else {
        setPdokStatus('error');
      }
    } catch (e) {
      setPdokStatus('error');
    }
  };

  const handleTestRdwLive = async () => {
    try {
      setRdwStatus('testing');
      const res = await ApiService.lookupRdw('12TGB4');
      if (res && res.found && res.data) {
        setRdwStatus('online');
        setRdwTestData(`${res.data.merk} ${res.data.handelsbenaming} (${res.data.eersteKleur}) - ${res.data.voertuigsoort}`);
      } else {
        setRdwStatus('online');
        setRdwTestData('RDW API koppeling actief (Geen voertuig gevonden voor testkenteken)');
      }
    } catch (e) {
      setRdwStatus('error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-2xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0c1626] border-[#1e334d] text-zinc-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl border ${
              isLight
                ? 'bg-blue-50 text-[#154273] border-blue-200'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black uppercase tracking-wider">
                MEOS Systeembeheer & Autorisatie
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#154273] text-white border border-[#0f3259] font-mono">
                KONINKLIJKE MARECHAUSSEE
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Beheer van verbalisanten, KMar brigades, autorisatiematrix (RBAC), testscenario&apos;s en API-koppelingen
            </p>
          </div>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div
        className={`flex items-center gap-1 p-1.5 rounded-xl border text-xs overflow-x-auto ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0a1322] border-[#1e334d]'
        }`}
      >
        <button
          onClick={() => setActiveAdminSubTab('users')}
          className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeAdminSubTab === 'users'
              ? isLight
                ? 'bg-white text-[#154273] shadow-sm'
                : 'bg-[#154273] text-white shadow-md'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Verbalisanten & Profielen</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('brigades')}
          className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeAdminSubTab === 'brigades'
              ? isLight
                ? 'bg-white text-[#154273] shadow-sm'
                : 'bg-[#154273] text-white shadow-md'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Building className="w-4 h-4 text-blue-500" />
          <span>Brigades Beheer (CRUD)</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('matrix')}
          className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeAdminSubTab === 'matrix'
              ? isLight
                ? 'bg-white text-[#154273] shadow-sm'
                : 'bg-[#154273] text-white shadow-md'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>Autorisatiematrix (RBAC)</span>
        </button>

        

        
          <button
            onClick={() => setActiveAdminSubTab('schema')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeAdminSubTab === 'schema'
                ? isLight
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-emerald-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">MariaDB Schema</span>
          </button>
          
          <button
            onClick={() => setActiveAdminSubTab('smtp')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeAdminSubTab === 'smtp'
                ? isLight
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-purple-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">SMTP Instellingen</span>
          </button>
<button
          onClick={() => setActiveAdminSubTab('diagnostics')}
          className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeAdminSubTab === 'diagnostics'
              ? isLight
                ? 'bg-white text-[#154273] shadow-sm'
                : 'bg-[#154273] text-white shadow-md'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>Systeemdiagnostiek & PDOK</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeAdminSubTab === 'users' && <UserManager />}

      {activeAdminSubTab === 'brigades' && <BrigadeManager />}

      {activeAdminSubTab === 'matrix' && <PermissionsMatrixEditor />}

      {activeAdminSubTab === 'schema' && <SchemaViewer />}
      {activeAdminSubTab === 'smtp' && <SmtpSettings />}

      {activeAdminSubTab === 'diagnostics' && (
        <div className="space-y-6">
          <div
            className={`border rounded-2xl p-6 shadow-md transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0c1626] border-[#1e334d]'
            }`}
          >
            <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
              <Activity className="w-5 h-5 text-emerald-500" />
              <span>Live Koppelingen & Integraties</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PDOK Box */}
              <div
                className={`border rounded-xl p-4 transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-xs">PDOK Kadaster BAG Locatieservice</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      pdokStatus === 'online'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : pdokStatus === 'error'
                        ? 'bg-red-500/15 text-red-600 border border-red-500/30'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {pdokStatus === 'online' ? 'OPERATIONEEL (200 OK)' : pdokStatus === 'testing' ? 'TESTEN...' : 'STANDBY'}
                  </span>
                </div>

                <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Valideert officiële Nederlandse adresgegevens via de Rijksoverheid Kadaster BAG API.
                </p>

                {pdokTestAddress && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-mono mb-3">
                    Resultaat: {pdokTestAddress}
                  </div>
                )}

                <button
                  onClick={handleTestPdokLive}
                  disabled={pdokStatus === 'testing'}
                  className="px-3 py-1.5 bg-[#154273] hover:bg-[#0e2c4d] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Test Adreslookup (2595BW, 472)</span>
                </button>
              </div>

              {/* RDW Box */}
              <div
                className={`border rounded-xl p-4 transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-xs">RDW Open Data Kentekenregister</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      rdwStatus === 'online'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : rdwStatus === 'error'
                        ? 'bg-red-500/15 text-red-600 border border-red-500/30'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {rdwStatus === 'online' ? 'OPERATIONEEL (200 OK)' : rdwStatus === 'testing' ? 'TESTEN...' : 'STANDBY'}
                  </span>
                </div>

                <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Directe koppeling met het Open Data register van de RDW voor kenteken- en APK-verificatie.
                </p>

                {rdwTestData && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-mono mb-3">
                    {rdwTestData}
                  </div>
                )}

                <button
                  onClick={handleTestRdwLive}
                  disabled={rdwStatus === 'testing'}
                  className="px-3 py-1.5 bg-[#154273] hover:bg-[#0e2c4d] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Test Kenteken (12-TGB-4)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
