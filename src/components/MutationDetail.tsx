import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  MapPin,
  Car,
  Users,
  History,
  Printer,
  FileEdit, Mail,
  ArrowLeft,
  CheckCircle,
  FileText,
  Copy,
  Check,
  Download,
  AlertCircle,
} from 'lucide-react';
import { MutationRecord, MutationType, IncidentCategory } from '../types/index.js';
import { ApiService } from '../services/api.js';
import { PrintableDossier } from './PrintableDossier.js';
import { PdfService } from '../services/pdfService.js';

interface MutationDetailProps {
  mutation: MutationRecord;
  onBack: () => void;
  onMutationUpdated: (updated: MutationRecord) => void;
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
  TRAFFIC_VIOLATION_INCIDENT: 'Verkeersincident / Wegenverkeerswet',
  VIOLENT_CRIME_ASSAULT: 'Geweldsmisdrijf / Mishandeling',
  BURGLARY_THEFT: 'Diefstal / Woninginbraak',
  PUBLIC_ORDER_DISTURBANCE: 'Openbare Orde Verstoring (APV)',
  SUSPICIOUS_PERSON_ACTIVITY: 'Verdacht Persoon / Situatie',
  DOMESTIC_INCIDENT: 'Huiselijk Geweld & Zorg',
  FRAUD_FINANCIAL: 'Fraude / Financieel Economisch',
  PROPERTY_DAMAGE_VANDALISM: 'Vernieling / Zaaksbeschadiging',
  ENVIRONMENTAL_HAZARD: 'Milieu & Veiligheid',
  OTHER_OBSERVATION: 'Overige Ambtelijke Waarneming',
};

const roleLabels: Record<string, string> = {
  SUSPECT: 'Verdachte',
  VICTIM: 'Slachtoffer',
  WITNESS: 'Getuige',
  REPORTER: 'Melder',
  PERSON_OF_INTEREST: 'Betrokkene',
  DRIVER: 'Bestuurder',
  PASSENGER: 'Inzittende',
  OFFICER: 'Collega / Verbalisant',
};

export const MutationDetail: React.FC<MutationDetailProps> = ({
  mutation,
  onBack,
  onMutationUpdated,
}) => {
  const currentOfficer = ApiService.getUserSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'entities' | 'audit' | 'print'>('overview');
  const [copied, setCopied] = useState(false);
  const [isAmending, setIsAmending] = useState(false);

  // Amendment Form State
  const [amendReason, setAmendReason] = useState('');
  const [amendNarrative, setAmendNarrative] = useState(mutation.narrativeSummary);
  const [amendAction, setAmendAction] = useState(mutation.tacticalAction || '');
  const [amendOutcome, setAmendOutcome] = useState(mutation.outcomeNotes || '');
  const [amendLoading, setAmendLoading] = useState(false);

  const copyRef = () => {
    navigator.clipboard.writeText(mutation.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  
  const [isEmailing, setIsEmailing] = useState(false);

  const handleEmailPdf = async () => {
    try {
      setIsEmailing(true);
      const pdfBase64 = PdfService.generateMutationPdf(mutation, true) as string;
      await ApiService.emailDossier(mutation.id, pdfBase64);
      alert('PDF is succesvol naar uw e-mail verzonden.');
    } catch (e: any) {
      alert(e.message || 'Fout bij verzenden e-mail');
    } finally {
      setIsEmailing(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await ApiService.exportDossier(
        mutation.id,
        'Directe PDF uitdraai Proces-Verbaal van Bevindingen'
      );
    } catch (e) {}
    PdfService.generateMutationPdf(mutation);
  };

  const handleAmendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendReason || amendReason.trim().length < 10) {
      alert('Een ambtelijke motivering van minimaal 10 karakters is verplicht om een mutatie te wijzigen.');
      return;
    }

    setAmendLoading(true);
    try {
      const updated = await ApiService.amendMutation(mutation.id, amendReason, {
        narrativeSummary: amendNarrative,
        tacticalAction: amendAction,
        outcomeNotes: amendOutcome,
      });
      setIsAmending(false);
      onMutationUpdated(updated);
      alert('Mutatie succesvol gewijzigd. Er is een onwijzigbaar auditlog-record vastgelegd in MEOS.');
    } catch (err: any) {
      alert(err.message || 'Fout bij wijzigen mutatie');
    } finally {
      setAmendLoading(false);
    }
  };

  if (activeTab === 'print') {
    return <PrintableDossier mutation={mutation} onBack={() => setActiveTab('overview')} />;
  }

  const hasCautionPerson = mutation.persons.some(
    (p) =>
      p.cautionActive ||
      p.person.cautionViolent ||
      p.person.cautionWeapon ||
      p.person.cautionFlight
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c0c0e] border border-zinc-800 p-4 rounded-xl shadow-md">
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-800 transition flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Terug naar Mutaties</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          
          <button
            onClick={handleEmailPdf}
            disabled={isEmailing}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer ${
              isEmailing ? 'bg-indigo-600/50 text-white/70' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{isEmailing ? 'Bezig met verzenden...' : 'Mail PDF'}</span>
          </button>

          {/* Direct PDF Download */}
          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exporteer als PDF (MEOS PV)</span>
          </button>

          {/* Printable Preview */}
          <button
            onClick={() => setActiveTab('print')}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Afdrukweergave</span>
          </button>

          {/* Amend Action */}
          <button
            onClick={() => setIsAmending(true)}
            className="px-3.5 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileEdit className="w-4 h-4" />
            <span>Ambtelijk Wijzigen</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Header */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {hasCautionPerson && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center gap-3 text-red-300 text-xs">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
            <div className="font-semibold">
              VEILIGHEIDSATTENTIE ACTIEF: Minstens één van de gekoppelde personen heeft een
              waarschuwingslabel (Gewelddadig / Vuurwapengevaarlijk / Vluchtgevaarlijk).
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 font-mono text-xs font-bold text-blue-400">
                <span>{mutation.referenceNumber}</span>
                <button
                  onClick={copyRef}
                  className="hover:text-white transition p-0.5"
                  title="Kopieer referentienummer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 font-mono">
                {typeMap[mutation.mutationType] || mutation.mutationType}
              </span>

              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${
                  mutation.status === 'FINAL'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : mutation.status === 'AMENDED'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                STATUS: {mutation.status}
              </span>

              {mutation.isAmended && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AANVULLEND PV
                </span>
              )}
            </div>

            <div className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>{catMap[mutation.category] || mutation.category}</span>
            </div>

            {/* Procedural badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {mutation.cautionGiven && (
                <span className="px-2 py-0.5 bg-blue-950/60 text-blue-300 border border-blue-800 text-[10px] font-semibold rounded">
                  Cautie Medegedeeld
                </span>
              )}
              {mutation.coercionUsed && (
                <span className="px-2 py-0.5 bg-red-950/60 text-red-300 border border-red-800 text-[10px] font-semibold rounded">
                  Dwangmiddel / Geweld Gebruikt
                </span>
              )}
              {mutation.welfareNotified && (
                <span className="px-2 py-0.5 bg-purple-950/60 text-purple-300 border border-purple-800 text-[10px] font-semibold rounded">
                  Zorgmelding (E33 / Veilig Thuis)
                </span>
              )}
              {mutation.breathTestConducted && (
                <span className="px-2 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-800 text-[10px] font-semibold rounded">
                  Blaas-/Speekseltest Afgenomen
                </span>
              )}
            </div>
          </div>

          {/* Officer & Unit Block */}
          <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs space-y-1 shrink-0">
            <div className="text-[11px] text-zinc-400 font-medium">Hoofdverbalisant:</div>
            <div className="font-bold text-zinc-100">{mutation.officerName}</div>
            <div className="text-zinc-400 flex items-center gap-2">
              <span className="font-mono text-blue-400 font-semibold">{mutation.officerBadge}</span>
              <span>•</span>
              <span>{mutation.unitId}</span>
            </div>
            {mutation.assistingOfficers && mutation.assistingOfficers.length > 0 && (
              <div className="pt-1 text-[11px] text-blue-300 border-t border-zinc-800/80">
                + {mutation.assistingOfficers.length} gekoppelde dienstnummer(s)
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-800/80 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dossier & Feitenrelaas</span>
          </button>

          <button
            onClick={() => setActiveTab('entities')}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'entities'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              Entiteiten ({mutation.persons.length + mutation.vehicles.length + mutation.evidence.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Auditlog ({mutation.auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Narrative & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Narrative Box */}
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>1. Relatering van de Waarnemingen (Ambtseedig Narratief)</span>
              </h2>
              <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed whitespace-pre-line text-justify font-sans">
                {mutation.narrativeSummary}
              </div>
            </div>

            {/* Tactical Action */}
            {mutation.tacticalAction && (
              <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-3">
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>2. Getroffen Maatregelen & Ambtelijk Optreden</span>
                </h2>
                <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed">
                  {mutation.tacticalAction}
                </div>
              </div>
            )}

            {/* Outcome Notes */}
            {mutation.outcomeNotes && (
              <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-3">
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>3. Afhandeling & Overdracht</span>
                </h2>
                <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-xs text-zinc-300">
                  {mutation.outcomeNotes}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Metadata & Verbalisanten */}
          <div className="space-y-6">
            {/* Incident Details Card */}
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
                Locatie- & Tijdstipgegevens
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Volledig Adres:</span>
                  <span className="text-zinc-200 font-semibold flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    {mutation.primaryAddress}
                  </span>
                </div>

                {mutation.areaCode && (
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Postcode & District:</span>
                    <span className="text-zinc-300 font-mono">
                      {mutation.areaCode} {mutation.district ? `• ${mutation.district}` : ''}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-zinc-500 block text-[11px]">Tijdstip Incident:</span>
                  <span className="text-zinc-300 font-mono">
                    {new Date(mutation.incidentDate || mutation.timestamp).toLocaleString('nl-NL')}
                  </span>
                </div>
              </div>
            </div>

            {/* Gekoppelde Dienstnummers Card */}
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center justify-between">
                <span>Geregistreerde Verbalisanten</span>
                <Users className="w-4 h-4 text-blue-400" />
              </h3>

              <div className="space-y-2.5">
                {/* Primary Officer */}
                <div className="p-3 bg-zinc-900/80 rounded-xl border border-blue-500/20 text-xs">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    Hoofdverbalisant
                  </span>
                  <div className="font-bold text-zinc-100 mt-0.5">{mutation.officerName}</div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    Dienstnr: {mutation.officerBadge} • {mutation.unitId}
                  </div>
                </div>

                {/* Assisting Officers */}
                {mutation.assistingOfficers && mutation.assistingOfficers.length > 0 ? (
                  mutation.assistingOfficers.map((ao, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800 text-xs"
                    >
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        Gekoppeld Dienstnummer ({ao.role || 'Bijstand'})
                      </span>
                      <div className="font-semibold text-zinc-200 mt-0.5">{ao.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        Dienstnr: {ao.badgeNumber}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-zinc-500 italic p-2">
                    Geen secundaire dienstnummers gekoppeld.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ENTITIES */}
      {activeTab === 'entities' && (
        <div className="space-y-6">
          {/* Persons List */}
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Geregistreerde Personen ({mutation.persons.length})</span>
            </h3>

            {mutation.persons.length === 0 ? (
              <div className="text-xs text-zinc-500 py-4 text-center">Geen personen geregistreerd.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mutation.persons.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-zinc-100 text-sm">
                        {p.person.lastName}, {p.person.firstName} {p.person.alias ? `("${p.person.alias}")` : ''}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded font-mono text-[10px]">
                        ROL: {roleLabels[p.role] || p.role}
                      </span>
                    </div>

                    <div className="text-zinc-400 space-y-0.5 text-[11px]">
                      <div>Geboortedatum: <span className="text-zinc-200 font-semibold">{p.person.dateOfBirth || 'Onbekend'}</span></div>
                      <div>BSN: {p.person.bsnNumber || 'Niet geregistreerd'}</div>
                      <div>Adres: {p.person.address || 'Geen vaste woon- of verblijfplaats'}</div>
                    </div>

                    {(p.person.cautionViolent || p.person.cautionWeapon || p.person.cautionFlight || p.person.cautionDrugs) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {p.person.cautionViolent && (
                          <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold">
                            Gewelddadig
                          </span>
                        )}
                        {p.person.cautionWeapon && (
                          <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold">
                            Vuurwapengevaarlijk
                          </span>
                        )}
                        {p.person.cautionFlight && (
                          <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-bold">
                            Vluchtgevaarlijk
                          </span>
                        )}
                        {p.person.cautionDrugs && (
                          <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded font-bold">
                            Drugs / Middelen
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicles List */}
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-400" />
              <span>Geregistreerde Voertuigen ({mutation.vehicles.length})</span>
            </h3>

            {mutation.vehicles.length === 0 ? (
              <div className="text-xs text-zinc-500 py-4 text-center">Geen voertuigen geregistreerd.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mutation.vehicles.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-mono font-bold text-sm">
                        {v.vehicle.licensePlate}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">ROL: {v.role}</span>
                    </div>

                    <div className="font-semibold text-zinc-200">
                      {v.vehicle.make} {v.vehicle.model} ({v.vehicle.color})
                    </div>

                    {v.vehicle.remarks && (
                      <div className="text-[11px] text-zinc-400 bg-zinc-950 p-2 rounded border border-zinc-800 font-mono">
                        {v.vehicle.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: AUDIT */}
      {activeTab === 'audit' && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <span>Onwijzigbare Auditlog van dit Dossier (MEOS)</span>
          </h3>

          <div className="space-y-2">
            {mutation.auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="font-semibold text-zinc-200">{log.userName}</span>
                    <span className="text-zinc-500 font-mono text-[11px]">({log.userId})</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">{log.justification || 'Geen toelichting opgegeven'}</p>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString('nl-NL')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amend Modal */}
      {isAmending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-amber-400" />
                <span>Ambtelijke Wijziging / Aanvullend PV Opmaken</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Alle wijzigingen worden onherroepelijk gelogd met tijdstip en verbalisant-gegevens.
              </p>
            </div>

            <form onSubmit={handleAmendSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Ambtelijke Motivering / Reden van Wijziging *
                </label>
                <textarea
                  rows={2}
                  value={amendReason}
                  onChange={(e) => setAmendReason(e.target.value)}
                  placeholder="bv. Aanvullende verklaring van getuige verwerkt na nieuw verhoor..."
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Gewijzigd Narratief (Relatering)
                </label>
                <textarea
                  rows={6}
                  value={amendNarrative}
                  onChange={(e) => setAmendNarrative(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAmending(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium cursor-pointer"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={amendLoading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {amendLoading ? 'Vastleggen...' : 'Ambtelijk Vastleggen in MEOS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
