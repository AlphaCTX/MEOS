import React, { useState, useEffect } from 'react';
import {
  Users,
  Car,
  Search,
  AlertTriangle,
  Flame,
  ShieldAlert,
  FileText,
  BadgeAlert,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PersonEntity, VehicleEntity } from '../types/index.js';
import { ApiService } from '../services/api.js';

interface EntityRegistryProps {
  onSelectMutation: (id: string) => void;
}

export const EntityRegistry: React.FC<EntityRegistryProps> = ({ onSelectMutation }) => {
  const [tab, setTab] = useState<'persons' | 'vehicles'>('persons');
  const [persons, setPersons] = useState<PersonEntity[]>([]);
  const [vehicles, setVehicles] = useState<VehicleEntity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pList, vList] = await Promise.all([
          ApiService.getPersons(),
          ApiService.getVehicles(),
        ]);
        setPersons(pList);
        setVehicles(vList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPersons = persons.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      (p.alias && p.alias.toLowerCase().includes(q)) ||
      (p.bsnNumber && p.bsnNumber.includes(q))
    );
  });

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.licensePlate.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Sub-nav */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>MEOS Entiteiten & RDW Register</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Relatieve koppelingen van personen, veiligheidsattenties en geverifieerde voertuigen.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setTab('persons')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              tab === 'persons'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Personenregister ({persons.length})</span>
          </button>

          <button
            onClick={() => setTab('vehicles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              tab === 'vehicles'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Voertuigenregister ({vehicles.length})</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            tab === 'persons'
              ? 'Zoek op achternaam, voornaam, alias of 9-cijferig BSN...'
              : 'Zoek op kenteken, merk of model...'
          }
          className="w-full bg-[#0c0c0e] border border-zinc-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition"
        />
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-16 text-xs text-zinc-500">
          Gegevens ophalen uit operationele database...
        </div>
      ) : tab === 'persons' ? (
        filteredPersons.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl p-8">
            <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">Geen personen gevonden</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
              Er zijn nog geen personen geregistreerd in de database. Maak een mutatie aan om
              betrokkenen vast te leggen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersons.map((p) => (
              <div
                key={p.id}
                className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">
                      {p.lastName}, {p.firstName}
                    </h3>
                    {p.alias && (
                      <p className="text-xs text-zinc-400 font-mono italic">Alias: &quot;{p.alias}&quot;</p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono rounded font-semibold">
                    BSN: {p.bsnNumber || 'Onbekend'}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 space-y-1">
                  <div>Geboortedatum: {p.dateOfBirth || 'Niet geregistreerd'}</div>
                  <div>Adres: {p.address || 'Geen vast verblijfadres'}</div>
                </div>

                {/* Caution Flags */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
                  {p.cautionViolent && (
                    <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold">
                      Gewelddadig
                    </span>
                  )}
                  {p.cautionWeapon && (
                    <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold">
                      Vuurwapengevaarlijk
                    </span>
                  )}
                  {p.cautionFlight && (
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-bold">
                      Vluchtgevaarlijk
                    </span>
                  )}
                  {!p.cautionViolent && !p.cautionWeapon && !p.cautionFlight && (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold">
                      Geen actieve veiligheidsattenties
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl p-8">
          <Car className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-300">Geen voertuigen gevonden</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
            Er zijn nog geen voertuigen opgeslagen in de database. Voer kentekens in bij nieuwe
            mutaties om ze met RDW koppeling op te slaan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-black text-sm rounded-lg">
                  {v.licensePlate}
                </span>
                {v.rdwVerified && (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    RDW Geverifieerd
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-100">
                  {v.make} {v.model}
                </h3>
                <p className="text-xs text-zinc-400">
                  Kleur: {v.color || 'Onbekend'} {v.year ? `• Bouwjaar: ${v.year}` : ''}
                </p>
              </div>

              {v.remarks && (
                <div className="text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 font-mono">
                  {v.remarks}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
