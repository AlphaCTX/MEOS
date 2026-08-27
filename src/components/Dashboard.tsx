import React, { useState } from 'react';
import {
  Search,
  Filter,
  Car,
  Users,
  User,
  Package,
  Clock,
  MapPin,
  FileText,
  ShieldAlert,
  Plus,
  Download,
  Eye,
  RotateCcw,
  Shield,
  Layers,
} from 'lucide-react';
import {
  MutationRecord,
  SystemStats,
  IncidentCategory,
  MutationStatus,
  SearchFilterParams,
  MutationType,
  UserSession,
} from '../types/index.js';
import { PdfService } from '../services/pdfService.js';

interface DashboardProps {
  session: UserSession | null;
  mutations: MutationRecord[];
  stats: SystemStats | null;
  loading: boolean;
  filters: SearchFilterParams;
  onFilterChange: (newFilters: Partial<SearchFilterParams>) => void;
  onResetFilters: () => void;
  onSelectMutation: (id: string) => void;
  onCreateNew: () => void;
}

const typeMap: Record<MutationType,
  UserSession, string> = {
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

export const Dashboard: React.FC<DashboardProps> = ({
  session,
  mutations,
  stats,
  loading,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectMutation,
  onCreateNew,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const getStatusBadge = (status: MutationStatus) => {
    switch (status) {
      case 'FINAL':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/70">
            DEFINITIEF
          </span>
        );
      case 'AMENDED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/70">
            GEWIJZIGD (PV)
          </span>
        );
      case 'DRAFT':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
            CONCEPT
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-900 text-zinc-500 border border-zinc-800">
            GEARCHIVEERD
          </span>
        );
    }
  };

  const handleDownloadPdf = (e: React.MouseEvent, m: MutationRecord) => {
    e.stopPropagation();
    PdfService.generateMutationPdf(m);
  };

  const hasActiveFilters =
    Boolean(filters.query) ||
    Boolean(filters.licensePlate) ||
    Boolean(filters.personName) ||
    Boolean(filters.bsn) ||
    Boolean(filters.serviceNumber) ||
    Boolean(filters.location) ||
    Boolean(filters.district) ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate) ||
    (filters.category && filters.category !== 'ALL') ||
    (filters.status && filters.status !== 'ALL');

  return (
    <div className="space-y-6 pb-16">
      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div
            onClick={() => onFilterChange({ category: 'ALL', status: 'ALL' })}
            className="p-3.5 rounded-2xl bg-[#0c0c0e] border border-zinc-800 hover:border-zinc-700 transition cursor-pointer shadow-md"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Totaal Mutaties</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-100 font-mono">{stats.totalMutations}</div>
            <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-0.5">
              <span>{stats.todayCount} vandaag geregistreerd</span>
            </div>
          </div>
          <div
            onClick={() => onFilterChange({ serviceNumber: session?.badgeNumber })}
            className={`p-3.5 rounded-2xl bg-[#0c0c0e] border transition cursor-pointer shadow-md ${
              filters.serviceNumber === session?.badgeNumber
                ? 'border-indigo-500 bg-indigo-950/20'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Mijn mutaties</span>
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">{stats.myMutationsCount || 0}</div>
            <div className="text-[11px] text-zinc-500">Mutaties door jou geregistreerd</div>
          </div>
          <div
            className="p-3.5 rounded-2xl bg-[#0c0c0e] border border-zinc-800 shadow-md"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Mutaties Huidige brigade</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.brigadeMutationsCount || 0}</div>
            <div className="text-[11px] text-zinc-500">{session?.activeBrigade || 'Geen brigade gekoppeld'}</div>
          </div>
        </div>
      )}
      {/* Main Search & Advanced Filter Section */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Primary Search Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.query || ''}
              onChange={(e) => onFilterChange({ query: e.target.value })}
              placeholder="Zoek op trefwoord, referentienummer, feiten of ambtseedig relaas..."
              className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-2 cursor-pointer ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                title="Wis alle actieve zoekfilters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </button>
            )}

            <button
              onClick={onCreateNew}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nieuwe Mutatie</span>
            </button>
          </div>
        </div>

        {/* Extended Filter Drawer */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in">
            {/* Location filter */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Locatie / Straat / Postcode
              </label>
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => onFilterChange({ location: e.target.value })}
                placeholder="bv. Keizersgracht of 1016"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
              />
            </div>

            {/* Service number filter */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Dienstnummer (Hoofd- of Bijstand)
              </label>
              <input
                type="text"
                value={filters.serviceNumber || ''}
                onChange={(e) => onFilterChange({ serviceNumber: e.target.value })}
                placeholder="bv. AlphaCTX of OF-8492"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono outline-none"
              />
            </div>

            {/* License plate filter */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Kenteken (Voertuig)
              </label>
              <input
                type="text"
                value={filters.licensePlate || ''}
                onChange={(e) => onFilterChange({ licensePlate: e.target.value.toUpperCase() })}
                placeholder="bv. KX-812-B"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono uppercase outline-none"
              />
            </div>

            {/* Person name or BSN */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Persoonsnaam of BSN
              </label>
              <input
                type="text"
                value={filters.personName || filters.bsn || ''}
                onChange={(e) => onFilterChange({ personName: e.target.value })}
                placeholder="bv. Jansen of BSN"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
              />
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Feitcategorie
              </label>
              <select
                value={filters.category || 'ALL'}
                onChange={(e) => onFilterChange({ category: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
              >
                <option value="ALL">Alle Feitcategorieën</option>
                <option value="WEAPONS_FIREARMS">Wapens & Vuurwapens (WWM)</option>
                <option value="NARCOTICS_DRUGS">Verdovende Middelen (Opiumwet)</option>
                <option value="TRAFFIC_VIOLATION_INCIDENT">Verkeer & Wegenverkeerswet</option>
                <option value="VIOLENT_CRIME_ASSAULT">Geweld & Mishandeling</option>
                <option value="BURGLARY_THEFT">Diefstal & Inbraak</option>
                <option value="PUBLIC_ORDER_DISTURBANCE">Openbare Orde (APV)</option>
                <option value="SUSPICIOUS_PERSON_ACTIVITY">Verdachte Situatie</option>
                <option value="DOMESTIC_INCIDENT">Huiselijk Geweld & Zorg</option>
                <option value="FRAUD_FINANCIAL">Fraude & Financieel</option>
                <option value="PROPERTY_DAMAGE_VANDALISM">Vernieling & Zaaksschade</option>
                <option value="ENVIRONMENTAL_HAZARD">Milieu & Veiligheid</option>
                <option value="OTHER_OBSERVATION">Overige Waarneming</option>
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Dossier Status
              </label>
              <select
                value={filters.status || 'ALL'}
                onChange={(e) => onFilterChange({ status: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
              >
                <option value="ALL">Alle Statussen</option>
                <option value="FINAL">Definitief</option>
                <option value="AMENDED">Gewijzigd (PV)</option>
                <option value="DRAFT">Concept</option>
                <option value="ARCHIVED">Gearchiveerd</option>
              </select>
            </div>

            {/* Date Range Start */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Datum Vanaf
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange({ startDate: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Datum Tot
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFilterChange({ endDate: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mutations Table / List */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-zinc-100">
              Geregistreerde MEOS Mutaties ({mutations.length})
            </h2>
          </div>
          <div className="text-xs text-zinc-400">
            MEOS Register • Mobiel Effectief Op Straat
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-zinc-500">
            Mutaties ophalen uit het MEOS register...
          </div>
        ) : mutations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-600">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">Geen mutaties gevonden</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
              Er zijn momenteel geen mutaties geregistreerd die voldoen aan de zoekcriteria. Het
              systeem is schoon en gereed voor operationele invoer.
            </p>
            <button
              onClick={onCreateNew}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
            >
              Nieuwe Mutatie Registreren
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {mutations.map((m) => (
              <div
                key={m.id}
                onClick={() => onSelectMutation(m.id)}
                className="p-4 hover:bg-zinc-900/60 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Badges row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-400 group-hover:text-blue-300">
                      {m.referenceNumber}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/30 font-mono">
                      {typeMap[m.mutationType] || m.mutationType}
                    </span>
                    {getStatusBadge(m.status)}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase tracking-wider">
                      {catMap[m.category] || m.category}
                    </span>
                  </div>

                  {/* Narrative preview */}
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {m.narrativeSummary}
                  </p>

                  {/* Metadata footer */}
                  <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {m.primaryAddress}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {new Date(m.incidentDate || m.timestamp).toLocaleString('nl-NL')}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-zinc-400">
                      Verbalisant: {m.officerName} ({m.officerBadge})
                    </span>
                    {m.assistingOfficers && m.assistingOfficers.length > 0 && (
                      <span className="text-blue-400 font-mono text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded">
                        +{m.assistingOfficers.length} bijstand
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={(e) => handleDownloadPdf(e, m)}
                    title="Exporteer Proces-Verbaal direct als PDF"
                    className="p-2 bg-zinc-800 hover:bg-blue-600 text-zinc-300 hover:text-white rounded-lg text-xs transition border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>

                  <button
                    onClick={() => onSelectMutation(m.id)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Dossier</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
