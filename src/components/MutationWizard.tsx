import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileCheck,
  UserPlus,
  Car,
  Package,
  MapPin,
  AlertTriangle,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Search,
  Loader2,
  CheckCircle2,
  Users,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  CreateMutationInput,
  PersonInput,
  VehicleInput,
  EvidenceInput,
  CreateMutationSchema,
} from '../lib/validations/mutation.js';
import {
  IncidentCategory,
  MutationType,
  PersonEntity,
  VehicleEntity,
  AssistingOfficer,
} from '../types/index.js';
import { ApiService } from '../services/api.js';

interface MutationWizardProps {
  onSuccess: (createdId: string) => void;
  onCancel: () => void;
}

const MUTATION_TYPES: Array<{
  type: MutationType;
  label: string;
  description: string;
  group: 'Interne Politie-mutaties' | 'Officiële Processen-Verbaal (Juridisch)';
}> = [
  {
    type: 'VRIJE_MUTATIE',
    label: 'Vrije Mutatie (Bevindingen)',
    description: 'Informeel verslag na melding of waarneming.',
    group: 'Interne Politie-mutaties',
  },
  {
    type: 'KLADMUTATIE',
    label: 'Kladmutatie',
    description: 'Voorlopige snelle vastlegging van basisgegevens.',
    group: 'Interne Politie-mutaties',
  },
  {
    type: 'INFORMATIERAPPORT',
    label: 'Informatierapport (ID-rapport)',
    description: 'Zachte informatie of vermoedens voor de Intelligence afdeling.',
    group: 'Interne Politie-mutaties',
  },
  {
    type: 'PV_BEVINDINGEN',
    label: 'PV van Bevindingen (PVB)',
    description: 'Objectief chronologisch verslag op ambtseed.',
    group: 'Officiële Processen-Verbaal (Juridisch)',
  },
  {
    type: 'PV_AANGIFTE',
    label: 'PV van Aangifte',
    description: 'Verklaring slachtoffer/getuige voor formele vervolging.',
    group: 'Officiële Processen-Verbaal (Juridisch)',
  },
  {
    type: 'PV_VERHOOR',
    label: 'PV van Verhoor',
    description: 'Uitwerking van vragen/antwoorden tijdens verhoor.',
    group: 'Officiële Processen-Verbaal (Juridisch)',
  },
  {
    type: 'PV_AANHOUDING',
    label: 'PV van Aanhouding',
    description: 'Vastlegging van arrestatie, fouillering en dwangmiddelen.',
    group: 'Officiële Processen-Verbaal (Juridisch)',
  },
  {
    type: 'EIND_PV',
    label: 'Eind-PV (Opsporingsindicatie)',
    description: 'Compleet verzameldossier voor de Officier van Justitie.',
    group: 'Officiële Processen-Verbaal (Juridisch)',
  },
];

export const MutationWizard: React.FC<MutationWizardProps> = ({ onSuccess, onCancel }) => {
  const currentOfficer = ApiService.getUserSession();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [, setKnownPersons] = useState<PersonEntity[]>([]);
  const [, setKnownVehicles] = useState<VehicleEntity[]>([]);

  // RDW State
  const [rdwLoadingIndex, setRdwLoadingIndex] = useState<number | null>(null);
  const [rdwMessage, setRdwMessage] = useState<{ index: number; text: string; success: boolean } | null>(null);

  // Address Lookup State
  const [postcodeLookup, setPostcodeLookup] = useState('');
  const [huisnummerLookup, setHuisnummerLookup] = useState('');
  const [toevoegingLookup, setToevoegingLookup] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ id: string; weergavenaam: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateMutationInput>({
    mutationType: 'SURVEILLANCE_OBSERVATION',
    category: 'WEAPONS_FIREARMS',
    status: 'FINAL',
    incidentDate: new Date().toISOString().slice(0, 16),
    narrativeSummary: '',
    tacticalAction: '',
    outcomeNotes: '',
    unitId: currentOfficer.activeUnit || 'UNIT-01',
    officerBadge: currentOfficer.badgeNumber,
    officerName: currentOfficer.name,
    department: currentOfficer.department,
    district: 'Centrum',
    primaryAddress: '',
    areaCode: '',
    streetName: '',
    houseNumber: '',
    city: '',
    cautionGiven: false,
    coercionUsed: false,
    welfareNotified: false,
    breathTestConducted: false,
    assistingOfficers: [],
    persons: [],
    vehicles: [],
    locations: [],
    evidence: [],
    attachments: [],
  });

  // Fetch known registries
  useEffect(() => {
    const loadRegistries = async () => {
      try {
        const [p, v] = await Promise.all([ApiService.getPersons(), ApiService.getVehicles()]);
        setKnownPersons(p);
        setKnownVehicles(v);
      } catch (err) {
        console.error('Failed to load entity registries', err);
      }
    };
    loadRegistries();
  }, []);

  // ----------------------------------------------------------------------------
  // LOCATION LOOKUP (PDOK BAG)
  // ----------------------------------------------------------------------------
  const [addressVerifiedMessage, setAddressVerifiedMessage] = useState<string | null>(null);

  const handleAddressSearch = async () => {
    let cleanPc = postcodeLookup.trim();
    let cleanNum = huisnummerLookup.trim();
    let cleanToev = toevoegingLookup.trim();

    // Als de gebruiker bv. "2595BW, 472" of "2595BW 472" in het eerste veld invult:
    if (cleanPc.includes(',') || cleanPc.includes(' ')) {
      const parts = cleanPc.split(/[, ]+/).filter(Boolean);
      if (parts.length >= 2) {
        cleanPc = parts[0];
        if (!cleanNum) {
          cleanNum = parts[1];
        }
        if (parts.length >= 3 && !cleanToev) {
          cleanToev = parts[2];
        }
      }
    }

    if (!cleanPc || !cleanNum) {
      alert('Vul a.u.b. zowel postcode als huisnummer in (bijv. 2595BW en 472).');
      return;
    }

    setAddressLoading(true);
    setAddressVerifiedMessage(null);

    try {
      const res = await ApiService.lookupLocation(
        cleanPc,
        cleanNum,
        cleanToev
      );

      if (res.data) {
        const fullAddress = res.data.volledigAdres || res.data.weergavenaam;
        setFormData((prev) => ({
          ...prev,
          primaryAddress: fullAddress,
          areaCode: res.data.postcode || cleanPc,
          streetName: res.data.straatnaam,
          houseNumber: res.data.huisnummer || cleanNum,
          city: res.data.woonplaatsnaam,
          district: res.data.gemeentenaam || prev.district,
          coordinatesLat: res.data.lat,
          coordinatesLng: res.data.lng,
        }));
        setAddressVerifiedMessage(`Officieel BAG adres geverifieerd: ${fullAddress}`);
      }
    } catch (err: any) {
      console.error('Adres lookup fout:', err);
      alert('Kon het adres niet automatisch verifiëren bij PDOK.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddressSuggestQuery = async (query: string) => {
    setFormData((prev) => ({ ...prev, primaryAddress: query }));
    if (query.length >= 3) {
      const res = await ApiService.suggestLocations(query);
      setAddressSuggestions(res.suggestions || []);
      setShowSuggestions(true);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectAddressSuggestion = (suggestionText: string) => {
    setFormData((prev) => ({ ...prev, primaryAddress: suggestionText }));
    setShowSuggestions(false);
  };

  // ----------------------------------------------------------------------------
  // RDW KENTEKEN LOOKUP
  // ----------------------------------------------------------------------------
  const handleRdwLookup = async (index: number, plate: string) => {
    if (!plate || plate.trim().length < 4) {
      setRdwMessage({
        index,
        text: 'Voer eerst een geldig kenteken in (minimaal 4 tekens)',
        success: false,
      });
      return;
    }

    setRdwLoadingIndex(index);
    setRdwMessage(null);

    try {
      const res = await ApiService.lookupRdw(plate);
      if (res.found && res.data) {
        const r = res.data;
        setFormData((prev) => {
          const updatedVehicles = [...prev.vehicles];
          updatedVehicles[index] = {
            ...updatedVehicles[index],
            make: r.merk,
            model: r.handelsbenaming,
            color: r.eersteKleur,
            year: r.bouwjaar,
            vehicleType: r.voertuigsoort,
            remarks: `RDW: Brandstof ${r.brandstofOmschrijving || 'Benzine'} • APK tot ${
              r.vervaldatumApk || 'Onbekend'
            } • WAM-verzekerd: ${r.wamVerzekerd || 'Ja'}`,
          };
          return { ...prev, vehicles: updatedVehicles };
        });

        setRdwMessage({
          index,
          text: `RDW Gegevens gevonden: ${r.merk} ${r.handelsbenaming} (${r.eersteKleur})`,
          success: true,
        });
      } else {
        setRdwMessage({
          index,
          text: res.message || 'Kenteken niet gevonden in RDW register.',
          success: false,
        });
      }
    } catch (err: any) {
      setRdwMessage({
        index,
        text: 'Fout bij raadplegen RDW database.',
        success: false,
      });
    } finally {
      setRdwLoadingIndex(null);
    }
  };

  // ----------------------------------------------------------------------------
  // ASSISTING OFFICERS HANDLERS
  // ----------------------------------------------------------------------------
  const addAssistingOfficer = () => {
    setFormData((prev) => ({
      ...prev,
      assistingOfficers: [
        ...(prev.assistingOfficers || []),
        { badgeNumber: '', name: '', role: 'Tweede verbalisant', unitId: prev.unitId },
      ],
    }));
  };

  const updateAssistingOfficer = (index: number, field: keyof AssistingOfficer, value: string) => {
    setFormData((prev) => {
      const list = [...(prev.assistingOfficers || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, assistingOfficers: list };
    });
  };

  const removeAssistingOfficer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      assistingOfficers: (prev.assistingOfficers || []).filter((_, i) => i !== index),
    }));
  };

  // ----------------------------------------------------------------------------
  // PERSON LINKING & CREATION
  // ----------------------------------------------------------------------------
  const addPerson = () => {
    setFormData((prev) => ({
      ...prev,
      persons: [
        ...prev.persons,
        {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          role: 'SUSPECT',
          cautionViolent: false,
          cautionWeapon: false,
          cautionFlight: false,
          cautionMental: false,
          cautionDrugs: false,
          isDetained: false,
          cautionActive: false,
        },
      ],
    }));
  };

  const removePerson = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      persons: prev.persons.filter((_, i) => i !== index),
    }));
  };

  const updatePersonField = (index: number, field: keyof PersonInput, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.persons];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, persons: updated };
    });
  };

  // ----------------------------------------------------------------------------
  // VEHICLE LINKING & CREATION
  // ----------------------------------------------------------------------------
  const addVehicle = () => {
    setFormData((prev) => ({
      ...prev,
      vehicles: [
        ...prev.vehicles,
        {
          licensePlate: '',
          make: '',
          model: '',
          color: '',
          role: 'TARGET_SUSPECT_VEHICLE',
          isStolen: false,
          isWanted: false,
          isImpounded: false,
        },
      ],
    }));
  };

  const removeVehicle = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index),
    }));
  };

  const updateVehicleField = (index: number, field: keyof VehicleInput, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.vehicles];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, vehicles: updated };
    });
  };

  // ----------------------------------------------------------------------------
  // EVIDENCE LINKING
  // ----------------------------------------------------------------------------
  const addEvidence = () => {
    setFormData((prev) => ({
      ...prev,
      evidence: [
        ...prev.evidence,
        {
          category: 'FIREARMS_WEAPONS',
          description: '',
          seizureStatus: 'SEIZED_CONFISCATED',
          storageLocker: 'Kluis Hoofdbureau',
        },
      ],
    }));
  };

  const removeEvidence = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index),
    }));
  };

  const updateEvidenceField = (index: number, field: keyof EvidenceInput, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.evidence];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, evidence: updated };
    });
  };

  // ----------------------------------------------------------------------------
  // SUBMISSION
  // ----------------------------------------------------------------------------
  const handleSubmit = async () => {
    setValidationErrors({});
    const validation = CreateMutationSchema.safeParse(formData);

    if (!validation.success) {
      setValidationErrors(validation.error.flatten().fieldErrors);
      const issues = validation.error.issues.map((i) => i.path[0]);
      if (
        issues.includes('mutationType') ||
        issues.includes('category') ||
        issues.includes('primaryAddress') ||
        issues.includes('unitId')
      ) {
        setStep(1);
      } else if (issues.includes('narrativeSummary')) {
        setStep(2);
      }
      return;
    }

    setLoading(true);
    try {
      const created = await ApiService.createMutation(validation.data);
      onSuccess(created.id);
    } catch (err: any) {
      if (err.details) {
        setValidationErrors(err.details);
      } else {
        alert(err.message || 'Fout bij opslaan mutatie');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-zinc-100">
              Nieuwe MEOS Mutatie Opmaken
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Mobiel Effectief Op Straat • Digitaal Proces-Verbaal & Verslaglegging
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800 text-xs">
          {[
            { num: 1, label: 'Soort & Locatie' },
            { num: 2, label: 'Ambtseedig Narratief' },
            { num: 3, label: 'Personen & Voertuigen' },
            { num: 4, label: 'Verificatie & Sluiting' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                step === s.num
                  ? 'bg-blue-600 text-white font-bold'
                  : step > s.num
                  ? 'text-zinc-300 hover:text-white bg-zinc-800/50'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  step === s.num ? 'bg-white text-blue-600 font-bold' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: Mutatiesoort, Categorie, Dienstnummers, Locatie via PDOK */}
      {step === 1 && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-400" />
              <span>1. Mutatiesoort, Categorie, Dienstnummers & Locatie</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Selecteer de aard van de mutatie, koppel verbalisanten en verifieer het volledige adres.
            </p>
          </div>

          {/* Mutatiesoort Selection */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-zinc-200">
              Mutatiesoort (Ambtelijke Typeverdeling) *
            </label>
            
            <div className="space-y-4">
              {['Interne Politie-mutaties', 'Officiële Processen-Verbaal (Juridisch)'].map((groupName) => (
                <div key={groupName} className="space-y-2">
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{groupName}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {MUTATION_TYPES.filter(m => m.group === groupName).map((m) => {
                      const isSelected = formData.mutationType === m.type;
                      return (
                        <div
                          key={m.type}
                          onClick={() => setFormData({ ...formData, mutationType: m.type })}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-950/40 border-blue-500 text-white shadow-md shadow-blue-900/20'
                              : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs flex items-center justify-between">
                              <span>{m.label}</span>
                              {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                              {m.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {validationErrors.mutationType && (
              <p className="text-[11px] text-red-400 mt-1">{validationErrors.mutationType[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Feitcategorie */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Feitcategorie / Incidentklasse *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as IncidentCategory })
                }
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition cursor-pointer"
              >
                <option value="WEAPONS_FIREARMS">Wapens & Vuurwapens (Wet Wapens & Munitie)</option>
                <option value="NARCOTICS_DRUGS">Verdovende Middelen (Opiumwet)</option>
                <option value="TRAFFIC_VIOLATION_INCIDENT">Verkeersincident / Wegenverkeerswet</option>
                <option value="VIOLENT_CRIME_ASSAULT">Geweldsmisdrijf / Mishandeling</option>
                <option value="BURGLARY_THEFT">Diefstal / Woninginbraak</option>
                <option value="PUBLIC_ORDER_DISTURBANCE">Openbare Orde Verstoring (APV)</option>
                <option value="SUSPICIOUS_PERSON_ACTIVITY">Verdacht Persoon / Situatie</option>
                <option value="DOMESTIC_INCIDENT">Huiselijk Geweld & Zorg</option>
                <option value="FRAUD_FINANCIAL">Fraude / Financieel Economisch</option>
                <option value="PROPERTY_DAMAGE_VANDALISM">Vernieling / Zaaksbeschadiging</option>
                <option value="ENVIRONMENTAL_HAZARD">Milieu & Veiligheid</option>
                <option value="OTHER_OBSERVATION">Overige Ambtelijke Waarneming</option>
              </select>
            </div>

            {/* Incident Timestamp */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Datum & Tijdstip Incident *
              </label>
              <input
                type="datetime-local"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition"
              />
            </div>

            {/* Brigade & Unit ID */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Brigade / Patrouille & Roepnummer *
              </label>
              <input
                type="text"
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                placeholder="bv. BRIGADE-SCHIPHOL / PAT-01"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition"
              />
            </div>

            {/* Context Checkmarks (Procedural Flags) */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Ambtelijke Procedures & Notificaties
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-[11px] text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cautionGiven}
                    onChange={(e) => setFormData({ ...formData, cautionGiven: e.target.checked })}
                    className="rounded bg-zinc-800 border-zinc-700 text-blue-600"
                  />
                  <span>Cautie Medegedeeld</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-[11px] text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.coercionUsed}
                    onChange={(e) => setFormData({ ...formData, coercionUsed: e.target.checked })}
                    className="rounded bg-zinc-800 border-zinc-700 text-blue-600"
                  />
                  <span>Dwangmiddel / Geweld</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-[11px] text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.welfareNotified}
                    onChange={(e) => setFormData({ ...formData, welfareNotified: e.target.checked })}
                    className="rounded bg-zinc-800 border-zinc-700 text-blue-600"
                  />
                  <span>Zorgmelding (E33)</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-[11px] text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.breathTestConducted}
                    onChange={(e) => setFormData({ ...formData, breathTestConducted: e.target.checked })}
                    className="rounded bg-zinc-800 border-zinc-700 text-blue-600"
                  />
                  <span>Blaas-/Speekseltest</span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION: MEERDERE DIENSTNUMMERS */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Verbalisanten & Gekoppelde Dienstnummers</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Koppel meerdere dienstnummers van assisterende collega&apos;s aan dit dossier.
                </p>
              </div>
              <button
                type="button"
                onClick={addAssistingOfficer}
                className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dienstnummer Toevoegen</span>
              </button>
            </div>

            {/* Primary Officer Block */}
            <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                  Hoofdverbalisant (Ingelogd)
                </span>
                <span className="text-xs font-bold text-zinc-100">{formData.officerName}</span>
                <span className="text-xs text-zinc-400 ml-2 font-mono">
                  (Dienstnr: {formData.officerBadge})
                </span>
              </div>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded">
                Primaire Registratie
              </span>
            </div>

            {/* Assisting Officers List */}
            {formData.assistingOfficers && formData.assistingOfficers.length > 0 && (
              <div className="space-y-3">
                {formData.assistingOfficers.map((ao, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 relative"
                  >
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Dienstnummer *
                      </label>
                      <input
                        type="text"
                        value={ao.badgeNumber}
                        onChange={(e) => updateAssistingOfficer(idx, 'badgeNumber', e.target.value)}
                        placeholder="bv. OF-7721"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Naam Collega *
                      </label>
                      <input
                        type="text"
                        value={ao.name}
                        onChange={(e) => updateAssistingOfficer(idx, 'name', e.target.value)}
                        placeholder="bv. K. Visser"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                          Rol / Functie
                        </label>
                        <select
                          value={ao.role || 'Tweede verbalisant'}
                          onChange={(e) => updateAssistingOfficer(idx, 'role', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        >
                          <option value="Tweede verbalisant">Tweede verbalisant</option>
                          <option value="Bijstand">Bijstand / Noodhulp</option>
                          <option value="Chauffeur">Chauffeur dienstvoertuig</option>
                          <option value="Rechercheur">Rechercheur</option>
                          <option value="Hondengeleider">Hondengeleider</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAssistingOfficer(idx)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION: LOCATIE OPHALEN VIA POSTCODE & HUISNUMMER (PDOK) */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Locatiegegevens & Adresverificatie (PDOK)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Vraag adresgegevens op middels postcode en huisnummer of typ direct in de adresbalk.
              </p>
            </div>

            {/* Quick Postcode + Huisnummer Tool */}
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-3">
              <div className="text-xs font-semibold text-zinc-300">
                Adres opvragen via Postcode & Huisnummer:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <input
                    type="text"
                    value={postcodeLookup}
                    onChange={(e) => setPostcodeLookup(e.target.value)}
                    placeholder="Postcode (bv. 1012AB)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 uppercase font-mono outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={huisnummerLookup}
                    onChange={(e) => setHuisnummerLookup(e.target.value)}
                    placeholder="Huisnr (bv. 78)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={toevoegingLookup}
                    onChange={(e) => setToevoegingLookup(e.target.value)}
                    placeholder="Toev. (optioneel)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    disabled={addressLoading}
                    className="w-full h-full min-h-[34px] bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {addressLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Haal Adresregel Op</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Full Formatted Primary Address Field with Auto-Suggest */}
            <div className="relative">
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Volledige Adresregel van Incident *
              </label>
              <input
                type="text"
                value={formData.primaryAddress}
                onChange={(e) => handleAddressSuggestQuery(e.target.value)}
                placeholder="bv. Keizersgracht 421, 1016EK Amsterdam"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {addressSuggestions.map((sug) => (
                    <div
                      key={sug.id}
                      onClick={() => selectAddressSuggestion(sug.weergavenaam)}
                      className="p-2.5 hover:bg-blue-950/40 text-xs text-zinc-200 cursor-pointer border-b border-zinc-800/50 last:border-0 transition"
                    >
                      {sug.weergavenaam}
                    </div>
                  ))}
                </div>
              )}
              {validationErrors.primaryAddress && (
                <p className="text-[11px] text-red-400 mt-1">{validationErrors.primaryAddress[0]}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Narrative Free-Text */}
      {step === 2 && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-400" />
              <span>2. Ambtseedig Narratief & Feitenrelaas</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Gedetailleerde relatering van waarnemingen, bevindingen en handhavend optreden.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Relatering van de Waarnemingen (Ambtseedig Narratief) *
            </label>
            <textarea
              rows={9}
              value={formData.narrativeSummary}
              onChange={(e) => setFormData({ ...formData, narrativeSummary: e.target.value })}
              placeholder="Op [datum] omstreeks [tijdstip] bevonden wij, verbalisanten, ons in opvallend dienstvoertuig ter hoogte van [locatie]. Aldaar zagen wij..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition leading-relaxed"
            />
            {validationErrors.narrativeSummary && (
              <p className="text-[11px] text-red-400 mt-1">
                {validationErrors.narrativeSummary[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Getroffen Maatregelen & Ambtelijk Optreden (Optioneel)
            </label>
            <textarea
              rows={3}
              value={formData.tacticalAction}
              onChange={(e) => setFormData({ ...formData, tacticalAction: e.target.value })}
              placeholder="bv. Verdachte conform procedure aangehouden, cautie medegedeeld, fouillering art. 55b Sv uitgevoerd..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Afhandeling & Vervolgacties (Optioneel)
            </label>
            <input
              type="text"
              value={formData.outcomeNotes}
              onChange={(e) => setFormData({ ...formData, outcomeNotes: e.target.value })}
              placeholder="bv. Overgedragen aan Recherche (DRR) / Hulpofficier van Justitie"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition"
            />
          </div>
        </div>
      )}

      {/* STEP 3: Persons & Vehicles with RDW Lookup */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Persons Section */}
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  <span>Betrokken Personen ({formData.persons.length})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verdachten, melders, getuigen en betrokkenen met geboortedatum registreren.
                </p>
              </div>
              <button
                type="button"
                onClick={addPerson}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Persoon Toevoegen</span>
              </button>
            </div>

            {formData.persons.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                Geen personen gekoppeld aan deze mutatie.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.persons.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">Persoon #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removePerson(idx)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Verwijderen</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Voornaam *</label>
                        <input
                          type="text"
                          value={p.firstName}
                          onChange={(e) => updatePersonField(idx, 'firstName', e.target.value)}
                          placeholder="Voornaam"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Achternaam *</label>
                        <input
                          type="text"
                          value={p.lastName}
                          onChange={(e) => updatePersonField(idx, 'lastName', e.target.value)}
                          placeholder="Achternaam"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">
                          Geboortedatum
                        </label>
                        <input
                          type="date"
                          value={p.dateOfBirth || ''}
                          onChange={(e) => updatePersonField(idx, 'dateOfBirth', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">BSN-Nummer</label>
                        <input
                          type="text"
                          value={p.bsnNumber || ''}
                          onChange={(e) => updatePersonField(idx, 'bsnNumber', e.target.value)}
                          placeholder="9 cijfers"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Rol in Incident</label>
                        <select
                          value={p.role}
                          onChange={(e) => updatePersonField(idx, 'role', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        >
                          <option value="SUSPECT">Verdachte</option>
                          <option value="REPORTER">Melder</option>
                          <option value="PERSON_OF_INTEREST">Betrokkene</option>
                          <option value="VICTIM">Slachtoffer</option>
                          <option value="WITNESS">Getuige</option>
                          <option value="DRIVER">Bestuurder</option>
                          <option value="PASSENGER">Inzittende</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Woon- of Verblijfadres</label>
                        <input
                          type="text"
                          value={p.address || ''}
                          onChange={(e) => updatePersonField(idx, 'address', e.target.value)}
                          placeholder="Straatnaam, Huisnummer, Woonplaats"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        />
                      </div>
                    </div>

                    {/* Caution Flags */}
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-amber-400 block mb-1.5">
                        Veiligheidsattenties:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'cautionViolent', label: 'Gewelddadig' },
                          { key: 'cautionWeapon', label: 'Vuurwapengevaarlijk' },
                          { key: 'cautionFlight', label: 'Vluchtgevaarlijk' },
                          { key: 'cautionDrugs', label: 'Middelen / Drugs' },
                        ].map((c) => (
                          <label
                            key={c.key}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border cursor-pointer flex items-center gap-1.5 transition ${
                              (p as any)[c.key]
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!(p as any)[c.key]}
                              onChange={(e) => updatePersonField(idx, c.key as any, e.target.checked)}
                              className="hidden"
                            />
                            <span>{c.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicles Section with RDW Lookup */}
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-400" />
                  <span>Betrokken Voertuigen & RDW Register ({formData.vehicles.length})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Haal automatisch live voertuiggegevens op uit de officiële RDW database.
                </p>
              </div>
              <button
                type="button"
                onClick={addVehicle}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Voertuig Toevoegen</span>
              </button>
            </div>

            {formData.vehicles.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                Geen voertuigen gekoppeld aan deze mutatie.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.vehicles.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">Voertuig #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeVehicle(idx)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Verwijderen</span>
                      </button>
                    </div>

                    {/* License Plate & RDW Action */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] text-zinc-400 mb-1">
                          Kenteken (RDW Lookup) *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={v.licensePlate}
                            onChange={(e) =>
                              updateVehicleField(idx, 'licensePlate', e.target.value.toUpperCase())
                            }
                            placeholder="bv. KX-812-B"
                            className="w-full bg-zinc-900 border border-amber-500/30 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono font-bold uppercase outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRdwLookup(idx, v.licensePlate)}
                            disabled={rdwLoadingIndex === idx}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs transition flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            {rdwLoadingIndex === idx ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <span>RDW</span>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Merk *</label>
                        <input
                          type="text"
                          value={v.make}
                          onChange={(e) => updateVehicleField(idx, 'make', e.target.value)}
                          placeholder="Merk"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Model *</label>
                        <input
                          type="text"
                          value={v.model}
                          onChange={(e) => updateVehicleField(idx, 'model', e.target.value)}
                          placeholder="Handelsbenaming"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        />
                      </div>
                    </div>

                    {/* RDW status message banner */}
                    {rdwMessage && rdwMessage.index === idx && (
                      <div
                        className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                          rdwMessage.success
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {rdwMessage.success ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{rdwMessage.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Kleur</label>
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => updateVehicleField(idx, 'color', e.target.value)}
                          placeholder="Kleur"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Rol</label>
                        <select
                          value={v.role}
                          onChange={(e) => updateVehicleField(idx, 'role', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        >
                          <option value="TARGET_SUSPECT_VEHICLE">Doelvoertuig / Verdacht</option>
                          <option value="INVOLVED">Betrokken</option>
                          <option value="FLEEING_VEHICLE">Vluchtvoertuig</option>
                          <option value="STOLEN">Gestolen Voertuig</option>
                          <option value="WITNESS_VEHICLE">Getuige Voertuig</option>
                          <option value="IMPOUNDED">Inbeslaggenomen</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 pt-5">
                        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={v.isImpounded}
                            onChange={(e) =>
                              updateVehicleField(idx, 'isImpounded', e.target.checked)
                            }
                            className="rounded bg-zinc-900 border-zinc-700 text-blue-600"
                          />
                          <span>Inbeslagname</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidence Section */}
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <span>Inbeslaggenomen Goederen & Bewijs ({formData.evidence.length})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Wapens, verdovende middelen, documenten of contanten registreren.
                </p>
              </div>
              <button
                type="button"
                onClick={addEvidence}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Goed Toevoegen</span>
              </button>
            </div>

            {formData.evidence.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                Geen inbeslaggenomen goederen geregistreerd.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">Goed #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeEvidence(idx)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Verwijderen</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Categorie *</label>
                        <select
                          value={ev.category}
                          onChange={(e) => updateEvidenceField(idx, 'category', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        >
                          <option value="FIREARMS_WEAPONS">Wapens / Vuurwapens</option>
                          <option value="NARCOTICS_CONTRABAND">Verdovende Middelen</option>
                          <option value="CASH_CURRENCY">Contant Geld</option>
                          <option value="ELECTRONICS_DIGITAL">Elektronica / Telefoons</option>
                          <option value="DOCUMENTS_ID">Documenten / Identiteitsbewijzen</option>
                          <option value="STOLEN_PROPERTY">Gestolen Goederen</option>
                          <option value="OTHER_EVIDENCE">Overig Bewijsmateriaal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">
                          Omschrijving Goed *
                        </label>
                        <input
                          type="text"
                          value={ev.description}
                          onChange={(e) => updateEvidenceField(idx, 'description', e.target.value)}
                          placeholder="bv. Beretta 9mm met patroonhouder en munitie"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Review & Final Submission */}
      {step === 4 && (
        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span>4. Controle & Ambtelijke Ondertekening</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Controleer de geregistreerde feiten alvorens definitief vast te leggen in het MEOS register.
            </p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-zinc-400 block font-medium">Mutatiesoort:</span>
                <span className="text-blue-400 font-bold">
                  {MUTATION_TYPES.find((m) => m.type === formData.mutationType)?.label || formData.mutationType}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block font-medium">Classificatie:</span>
                <span className="text-zinc-100 font-semibold">{formData.category}</span>
              </div>
              <div>
                <span className="text-zinc-400 block font-medium">Volledig Adres:</span>
                <span className="text-zinc-100 font-semibold">
                  {formData.primaryAddress || 'Nog niet ingevuld'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block font-medium">Verbalisanten:</span>
                <span className="text-zinc-100 font-semibold">
                  {formData.officerName} ({formData.officerBadge})
                  {formData.assistingOfficers && formData.assistingOfficers.length > 0 && (
                    <>
                      {' '}+ {formData.assistingOfficers.length} assisterend(e) dienstnummer(s)
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <span className="text-zinc-400 block font-medium mb-1">Gekoppelde Entiteiten:</span>
              <div className="flex gap-4 text-zinc-300">
                <span>{formData.persons.length} Persoon/Personen</span>
                <span>•</span>
                <span>{formData.vehicles.length} Voertuig(en)</span>
                <span>•</span>
                <span>{formData.evidence.length} Inbeslaggenomen Goed(eren)</span>
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="p-4 bg-blue-950/20 border border-blue-800/30 rounded-xl text-xs text-blue-200">
            <p className="font-semibold mb-1">Ambtseed / Ambtsbelofte Verklaring:</p>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              Door deze mutatie definitief op te slaan verklaart verbalisant{' '}
              <strong>{formData.officerName}</strong> (dienstnr: {formData.officerBadge}) dat alle
              vermelde waarnemingen en verrichtingen naar waarheid zijn opgemaakt in het kader van de
              wettelijke politietaak. Na opslag wordt direct een onwijzigbaar auditlog-record
              aangemaakt in MEOS.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={step === 1 ? onCancel : () => setStep((step - 1) as any)}
          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{step === 1 ? 'Annuleren' : 'Vorige Stap'}</span>
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((step + 1) as any)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Volgende Stap</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Opslaan in MEOS...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Definitief Registreren</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
