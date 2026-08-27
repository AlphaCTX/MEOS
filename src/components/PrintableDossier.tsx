import React, { useState } from 'react';
import { MutationRecord, IncidentCategory, MutationType } from '../types/index.js';
import { Shield, Printer, ArrowLeft, Download, CheckCircle, FileText } from 'lucide-react';
import { PdfService } from '../services/pdfService.js';
import { ApiService } from '../services/api.js';

interface PrintableDossierProps {
  mutation: MutationRecord;
  onBack: () => void;
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
  OFFICER: 'Collega / Verbalisant',
};

export const PrintableDossier: React.FC<PrintableDossierProps> = ({ mutation, onBack }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      try {
        await ApiService.exportDossier(
          mutation.id,
          'Officiële uitdraai Proces-Verbaal van Bevindingen (PDF download)'
        );
      } catch (e) {
        console.warn('Audit export logging notice:', e);
      }

      PdfService.generateMutationPdf(mutation);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    } catch (err) {
      console.error('Fout bij genereren PDF:', err);
      alert('Er is een fout opgetreden bij het genereren van het PDF document.');
    } finally {
      setDownloading(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print bg-[#09090b] border border-zinc-800 p-4 rounded-xl shadow-lg">
        <button
          onClick={onBack}
          className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Terug naar Dossier</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBrowserPrint}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Afdrukken (Browser)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-900/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloaded ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span>PDF Gedownload!</span>
              </>
            ) : downloading ? (
              <>
                <FileText className="w-4 h-4 animate-spin" />
                <span>Genereren...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Exporteer als PDF (MEOS PV)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Official MEOS Formatted Document */}
      <div className="bg-white text-slate-950 p-8 md:p-12 rounded-xl shadow-2xl border border-slate-300 print:shadow-none print:border-none print:p-0 font-serif leading-relaxed text-sm">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-slate-900 text-white flex items-center justify-center font-bold shadow">
                <Shield className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-wider text-slate-900 font-sans">
                  MEOS
                </h1>
                <p className="text-xs text-slate-700 font-sans uppercase tracking-tight font-semibold">
                  Mobiel Effectief Op Straat • Digitaal Ambtelijk Verslag
                </p>
                <p className="text-[11px] text-slate-500 font-sans">
                  {mutation.department} • Eenheid {mutation.unitId}
                </p>
              </div>
            </div>

            <div className="text-right font-sans">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 text-[11px] font-bold tracking-wider uppercase border border-slate-300 rounded mb-1">
                AMBTELIJK VERSLAG / VERTROUWELIJK
              </span>
              <div className="text-xs font-mono font-bold text-slate-800">
                REF: {mutation.referenceNumber}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Datum: {new Date(mutation.timestamp).toLocaleDateString('nl-NL')}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Official Declaration */}
        <div className="mb-6 bg-slate-50 p-4 rounded border border-slate-200 font-sans text-xs">
          <div className="font-bold text-slate-900 uppercase tracking-wider mb-1">
            Proces-Verbaal van Bevindingen en Mutatie
          </div>
          <p className="text-slate-700">
            Ik, ondergetekende, <strong>{mutation.officerName}</strong>, met dienstnummer{' '}
            <strong>{mutation.officerBadge}</strong>, werkzaam bij {mutation.department} (eenheid{' '}
            {mutation.unitId}),
            {mutation.assistingOfficers && mutation.assistingOfficers.length > 0 && (
              <>
                {' '}mede namens assisterend(e) collega(&apos;s):{' '}
                <strong>
                  {mutation.assistingOfficers.map((a) => `${a.name} (${a.badgeNumber})`).join(', ')}
                </strong>
                ,
              </>
            )}{' '}
            verklaar op ambtseed / ambtsbelofte het volgende te hebben waargenomen en
            verricht:
          </p>
        </div>

        {/* Incident Metadata Table */}
        <div className="mb-6 font-sans text-xs">
          <table className="w-full border-collapse border border-slate-300">
            <tbody>
              <tr className="bg-slate-100">
                <td className="border border-slate-300 p-2 font-bold w-1/3">Registratienummer</td>
                <td className="border border-slate-300 p-2 font-mono font-bold text-slate-900">
                  {mutation.referenceNumber}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-bold">Mutatiesoort</td>
                <td className="border border-slate-300 p-2 font-semibold text-blue-900">
                  {typeMap[mutation.mutationType] || mutation.mutationType}
                </td>
              </tr>
              <tr className="bg-slate-50">
                <td className="border border-slate-300 p-2 font-bold">Soort incident / Categorie</td>
                <td className="border border-slate-300 p-2 font-semibold">
                  {catMap[mutation.category] || mutation.category}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-bold">Dossier Status</td>
                <td className="border border-slate-300 p-2">
                  <span className="font-semibold">{mutation.status}</span>
                </td>
              </tr>
              <tr className="bg-slate-50">
                <td className="border border-slate-300 p-2 font-bold">Volledige Locatie & Adres</td>
                <td className="border border-slate-300 p-2 font-semibold">
                  {mutation.primaryAddress} {mutation.district ? `(${mutation.district})` : ''}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-bold">Datum & Tijdstip Incident</td>
                <td className="border border-slate-300 p-2">
                  {new Date(mutation.incidentDate || mutation.timestamp).toLocaleString('nl-NL')}
                </td>
              </tr>
              {mutation.assistingOfficers && mutation.assistingOfficers.length > 0 && (
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 p-2 font-bold">Gekoppelde Dienstnummers</td>
                  <td className="border border-slate-300 p-2">
                    <div className="flex flex-wrap gap-1.5">
                      {mutation.assistingOfficers.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-[11px]">
                          {a.name} ({a.badgeNumber}) - {a.role || 'Bijstand'}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Narrative Observations */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 font-sans text-slate-900">
            1. Relatering van de Waarnemingen (Ambtseedig Narratief)
          </h2>
          <div className="whitespace-pre-line text-slate-800 text-xs leading-relaxed text-justify">
            {mutation.narrativeSummary}
          </div>
        </div>

        {/* Tactical Actions */}
        {mutation.tacticalAction && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 font-sans text-slate-900">
              2. Getroffen Maatregelen & Ambtelijk Optreden
            </h2>
            <p className="text-slate-800 text-xs leading-relaxed">{mutation.tacticalAction}</p>
          </div>
        )}

        {/* Linked Persons */}
        {mutation.persons && mutation.persons.length > 0 && (
          <div className="mb-6 font-sans">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
              3. Geregistreerde Betrokken Personen ({mutation.persons.length})
            </h2>
            <div className="space-y-3">
              {mutation.persons.map((p, idx) => (
                <div key={idx} className="border border-slate-300 p-3 rounded text-xs bg-slate-50">
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span>
                      {p.person.lastName}, {p.person.firstName} {p.person.alias ? `(alias: "${p.person.alias}")` : ''}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-bold">
                      ROL: {roleLabels[p.role] || p.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div>BSN: {p.person.bsnNumber || 'Niet geregistreerd'} • Geboortedatum: {p.person.dateOfBirth || 'Onbekend'} • Nationaliteit: {p.person.nationality || 'Nederlandse'}</div>
                    <div>Adres: {p.person.address || 'Geen vaste woon- of verblijfplaats geregistreerd'}</div>
                    {p.statementSummary && (
                      <div className="mt-1 p-2 bg-white rounded border border-slate-200 italic">
                        Verklaring: &quot;{p.statementSummary}&quot;
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linked Vehicles */}
        {mutation.vehicles && mutation.vehicles.length > 0 && (
          <div className="mb-6 font-sans">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
              4. Betrokken Voertuigen ({mutation.vehicles.length})
            </h2>
            <div className="space-y-2">
              {mutation.vehicles.map((v, idx) => (
                <div key={idx} className="border border-slate-300 p-2.5 rounded text-xs flex justify-between items-center bg-slate-50">
                  <div>
                    <span className="font-mono font-bold text-slate-900 mr-2 bg-amber-100 px-2 py-0.5 border border-amber-300 rounded">
                      {v.vehicle.licensePlate}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {v.vehicle.make} {v.vehicle.model} ({v.vehicle.color})
                    </span>
                    {v.vehicle.rdwVerified && (
                      <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        RDW Geverifieerd
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    Rol: {v.role} {v.isImpounded ? '• IN BESLAG GENOMEN' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidence */}
        {mutation.evidence && mutation.evidence.length > 0 && (
          <div className="mb-6 font-sans">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 text-slate-900">
              5. In Beslag Genomen Goederen / Bewijsmateriaal ({mutation.evidence.length})
            </h2>
            <div className="space-y-2">
              {mutation.evidence.map((e, idx) => (
                <div key={idx} className="border border-slate-300 p-2.5 rounded text-xs bg-slate-50">
                  <div className="font-bold text-slate-900 flex justify-between">
                    <span>{e.evidence.description}</span>
                    <span className="font-mono text-[10px] text-slate-600">{e.evidence.itemNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Status: {e.evidence.seizureStatus} • Opslag: {e.evidence.storageLocker || 'Hoofdbureau'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Signoff Block */}
        <div className="pt-8 border-t-2 border-slate-900 font-sans text-xs">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-slate-600 text-[11px]">
                Waarvan door mij opgemaakt op ambtseed / ambtsbelofte op{' '}
                {new Date().toLocaleDateString('nl-NL')}.
              </p>
              <div className="mt-8 pt-2 border-t border-slate-400 w-48 text-center text-slate-800">
                Handtekening Verbalisant
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-slate-900">{mutation.officerName}</div>
              <div className="text-slate-600 text-[11px]">
                Dienstnummer: {mutation.officerBadge}
              </div>
              <div className="text-slate-600 text-[11px]">
                Eenheid: {mutation.unitId} • {mutation.department}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
