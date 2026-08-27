import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Building,
  Users,
  CheckCircle,
  AlertCircle,
  Search,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { BrigadeEntity } from '../../types/index.js';
import { ApiService } from '../../services/api.js';
import { useTheme } from '../../context/ThemeContext.js';

export const BrigadeManager: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [brigades, setBrigades] = useState<BrigadeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [brigadeToDelete, setBrigadeToDelete] = useState<{code: string, name: string} | null>(null);
  const [editingBrigade, setEditingBrigade] = useState<BrigadeEntity | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    region: string;
    taskType: string;
    stationLocation: string;
    commanderBadge: string;
    isActive: boolean;
    description: string;
  }>({
    code: '',
    name: '',
    region: '',
    taskType: 'Handhaving & Opsporing',
    stationLocation: '',
    commanderBadge: '',
    isActive: true,
    description: '',
  });

  const loadBrigades = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getBrigades();
      setBrigades(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Fout bij ophalen brigades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrigades();
  }, []);

  const handleOpenCreate = () => {
    setEditingBrigade(null);
    setFormData({
      code: '',
      name: '',
      region: '',
      taskType: 'Handhaving & Opsporing',
      stationLocation: '',
      commanderBadge: '',
      isActive: true,
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (brigade: BrigadeEntity) => {
    setEditingBrigade(brigade);
    setFormData({
      code: brigade.code,
      name: brigade.name,
      region: brigade.region,
      taskType: brigade.taskType,
      stationLocation: brigade.stationLocation,
      commanderBadge: brigade.commanderBadge || '',
      isActive: brigade.isActive,
      description: brigade.description || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.code || !formData.name || !formData.region) {
        setError('Vul minimaal een brigadecode, naam en regio in');
        return;
      }

      if (editingBrigade) {
        await ApiService.updateBrigade(editingBrigade.code, formData);
        setSuccessMsg(`Brigade "${formData.name}" succesvol bijgewerkt.`);
      } else {
        await ApiService.createBrigade(formData);
        setSuccessMsg(`Brigade "${formData.name}" (${formData.code}) succesvol aangemaakt.`);
      }

      setShowModal(false);
      loadBrigades();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan brigade');
    }
  };

  const handleDelete = async () => {
    if (!brigadeToDelete) return;
    try {
      await ApiService.deleteBrigade(brigadeToDelete.code);
      setSuccessMsg(`Brigade "${brigadeToDelete.name}" succesvol verwijderd.`);
      loadBrigades();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen brigade');
    } finally {
      setBrigadeToDelete(null);
    }
  };

  const filtered = brigades.filter((b) => {
    const q = searchTerm.toLowerCase();
    return (
      b.code.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.region.toLowerCase().includes(q) ||
      b.taskType.toLowerCase().includes(q) ||
      b.stationLocation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top action & search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Zoek brigade op code, naam, standplaats of taakveld..."
            className={`w-full border rounded-xl pl-10 pr-4 py-2 text-xs outline-none transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#154273]'
                : 'bg-[#0a1322] border-[#1e334d] text-zinc-100 placeholder-zinc-500 focus:border-blue-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadBrigades}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-[#0a1322] hover:bg-[#142338] border-[#1e334d] text-zinc-300'
            }`}
            title="Ververs brigades"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#154273] hover:bg-[#0e2c4d] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nieuwe Brigade Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Brigades Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Brigades ophalen uit MEOS database...
        </div>
      ) : filtered.length === 0 ? (
        <div
          className={`text-center py-12 border border-dashed rounded-2xl p-8 ${
            isLight ? 'border-slate-200 bg-slate-50/50' : 'border-[#1e334d] bg-[#08101d]'
          }`}
        >
          <Shield className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>
            Geen brigades gevonden
          </h3>
          <p className={`text-xs max-w-md mx-auto mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Er zijn geen brigades die overeenkomen met de zoekopdracht. Maak een nieuwe brigade aan met de knop hierboven.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div
              key={b.code}
              className={`border rounded-2xl p-5 shadow-md transition-all flex flex-col justify-between relative overflow-hidden group ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
                  : 'bg-[#0c1626] border-[#1e334d] hover:border-blue-600/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm shrink-0 ${
                        isLight
                          ? 'bg-blue-50 text-[#154273] border border-blue-200'
                          : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#154273] dark:text-blue-400">
                          {b.code}
                        </span>
                        {b.isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Actief
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                            Inactief
                          </span>
                        )}
                      </div>
                      <h3 className={`text-sm font-bold mt-0.5 line-clamp-1 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                        {b.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className={`space-y-2 text-xs pt-2 border-t ${isLight ? 'border-slate-100' : 'border-[#142338]'}`}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 opacity-60 shrink-0 text-[#154273] dark:text-blue-400" />
                    <span className={`line-clamp-1 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      {b.region} ({b.stationLocation})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 opacity-60 shrink-0 text-amber-500" />
                    <span className={`line-clamp-1 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      {b.taskType}
                    </span>
                  </div>

                  {b.commanderBadge && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 opacity-60 shrink-0 text-indigo-500" />
                      <span className={`font-mono text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                        Cdt: {b.commanderBadge}
                      </span>
                    </div>
                  )}

                  {b.description && (
                    <p className={`text-[11px] line-clamp-2 mt-2 pt-2 border-t ${isLight ? 'border-slate-100 text-slate-500' : 'border-[#142338] text-zinc-400'}`}>
                      {b.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className={`flex items-center justify-end gap-2 mt-4 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-[#142338]'}`}>
                <button
                  onClick={() => handleOpenEdit(b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#154273] border-slate-200'
                      : 'bg-[#0a1322] hover:bg-[#142338] text-zinc-300 border-[#1e334d]'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Bewerken</span>
                </button>

                <button
                  onClick={() => setBrigadeToDelete({code: b.code, name: b.name})}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                    isLight
                      ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                      : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Verwijderen</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0c1626] border-[#1e334d] text-zinc-100'
            }`}
          >
            <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'border-slate-100 bg-slate-50' : 'border-[#1e334d] bg-[#09111e]'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${isLight ? 'bg-blue-100 text-[#154273]' : 'bg-blue-500/20 text-blue-400'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    {editingBrigade ? 'Brigade Bewerken' : 'Nieuwe Brigade Aanmaken'}
                  </h2>
                  <p className="text-xs opacity-70">
                    Koninklijke Marechaussee operationeel organisatieonderdeel
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Brigade Code * (Uniek)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="BRIGADE-SCHIPHOL"
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                    }`}
                  >
                    <option value="true">Actief (Operationeel)</option>
                    <option value="false">Inactief (Gearchiveerd)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  Volledige Naam van de Brigade *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Brigade Politie & Beveiliging Schiphol"
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Regio / Standplaats *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Luchthaven Schiphol & Grenstoezicht"
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Kazerne / Locatie
                  </label>
                  <input
                    type="text"
                    value={formData.stationLocation}
                    onChange={(e) => setFormData({ ...formData, stationLocation: e.target.value })}
                    placeholder="Schiphol-Centrum / Kazerne"
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Hoofdtaakveld
                  </label>
                  <select
                    value={formData.taskType}
                    onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                    }`}
                  >
                    <option value="Handhaving & Opsporing">Handhaving & Opsporing</option>
                    <option value="Grenspolitietaak">Grenspolitietaak</option>
                    <option value="Bewaken beveiligen">Bewaken beveiligen</option>
                    <option value="Recherche/FO">Recherche/FO</option>
                    <option value="Staf">Staf</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Commandant Dienstnummer
                  </label>
                  <input
                    type="text"
                    value={formData.commanderBadge}
                    onChange={(e) => setFormData({ ...formData, commanderBadge: e.target.value })}
                    placeholder="KMAR-001 (Majoor H. Jansen)"
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  Toelichting / Werkgebied
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Verantwoordelijk voor toezicht op Schengen buitengrenzen, paspoortcontroles en openbare orde handhaving..."
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 opacity-80 hover:opacity-100 cursor-pointer"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#154273] hover:bg-[#0e2c4d] text-white shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingBrigade ? 'Wijzigingen Opslaan' : 'Brigade Toevoegen'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {brigadeToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isLight ? 'bg-white' : 'bg-[#0c1626] border border-[#1e334d]'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Brigade Verwijderen</h3>
            <p className={`text-sm mb-6 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Weet u zeker dat u brigade "{brigadeToDelete.name}" ({brigadeToDelete.code}) wilt verwijderen? Dit kan gevolgen hebben voor gekoppelde eenheden.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setBrigadeToDelete(null)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#0a1322] hover:bg-[#142338] text-zinc-300 border-[#1e334d]'}`}>Annuleren</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md cursor-pointer">
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
