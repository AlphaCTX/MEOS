import re

content = """import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Shield,
  Check,
  X,
  RotateCcw,
  Save,
  CheckCircle,
  AlertCircle,
  Lock,
  RefreshCw,
  Info,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';
import { ApiService } from '../../services/api.js';
import { RolePermissionMatrix, PermissionDefinition, UserRole, RoleDefinition } from '../../types/index.js';
import { useTheme } from '../../context/ThemeContext.js';

const categoryLabels: Record<string, string> = {
  MUTATIES: 'Mutaties & Registratie',
  DOSSIERS: 'Dossiers & Validatie (HOvJ)',
  ENTITEITEN: 'Registers (Personen & Voertuigen)',
  ADMIN_BEHEER: 'Systeembeheer & Autorisatie',
};

export const PermissionsMatrixEditor: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [matrix, setMatrix] = useState<RolePermissionMatrix>({});
  const [definitions, setDefinitions] = useState<PermissionDefinition[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Role Management Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [roleForm, setRoleForm] = useState<RoleDefinition>({
    id: '', title: '', desc: '', badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30'
  });

  const loadMatrix = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getPermissionsMatrix();
      setMatrix(data.matrix || {});
      setDefinitions(data.definitions || []);
      setRoles(data.roles || []);
      setHasChanges(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Fout bij ophalen autorisatiematrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  const handleToggle = (roleId: string, permKey: string) => {
    setMatrix((prev) => {
      const rolePerms = { ...(prev[roleId] || {}) };
      rolePerms[permKey] = !rolePerms[permKey];
      return {
        ...prev,
        [roleId]: rolePerms,
      };
    });
    setHasChanges(true);
  };

  const handleSaveMatrix = async () => {
    try {
      setSaving(true);
      setError(null);
      await ApiService.savePermissionsMatrix(matrix);
      setSuccessMsg('Autorisatiematrix succesvol opgeslagen en geactiveerd voor alle sessies!');
      setHasChanges(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan autorisatiematrix');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Weet u zeker dat u alle rechten wilt herstellen naar de standaard KMar autorisatiematrix?')) {
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const res = await ApiService.resetPermissionsMatrix();
      setMatrix(res.matrix || {});
      // We don't reset roles here, only matrix
      setHasChanges(false);
      setSuccessMsg('Rechtenmatrix succesvol hersteld naar standaardinstellingen.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Fout bij herstellen rechten');
    } finally {
      setSaving(false);
    }
  };

  const openAddRoleModal = () => {
    setEditingRole(null);
    setRoleForm({
      id: '', title: '', desc: '', badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30'
    });
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (role: RoleDefinition) => {
    setEditingRole(role);
    setRoleForm(role);
    setIsRoleModalOpen(true);
  };

  const saveRole = async () => {
    try {
      if (!roleForm.id || !roleForm.title) {
        throw new Error('ID en Titel zijn verplicht');
      }
      setSaving(true);
      setError(null);
      // Validate ID: uppercase and underscores only
      const safeId = roleForm.id.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
      const finalRole = { ...roleForm, id: safeId };
      await ApiService.saveRole(finalRole);
      setSuccessMsg('Profiel succesvol opgeslagen!');
      setTimeout(() => setSuccessMsg(null), 3000);
      setIsRoleModalOpen(false);
      await loadMatrix();
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan profiel');
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('Weet je zeker dat je dit profiel wilt verwijderen?')) return;
    try {
      setSaving(true);
      setError(null);
      await ApiService.deleteRole(roleId);
      setSuccessMsg('Profiel succesvol verwijderd!');
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadMatrix();
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen profiel (zijn er nog gebruikers met deze rol?)');
    } finally {
      setSaving(false);
    }
  };

  // Group definitions by category
  const categories = Array.from(new Set(definitions.map((d) => d.category)));

  return (
    <div className="space-y-6">
      {/* Header Info & Actions */}
      <div
        className={`p-6 rounded-2xl border shadow-md flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0c1626] border-[#1e334d]'
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
              Autorisatiematrix & Rolgebaseerde Toegangscontrole (RBAC)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 font-mono">
              BEVEILIGD
            </span>
          </div>
          <p className={`text-xs mt-1 max-w-2xl ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Configureer exact welke bevoegdheden elke gebruikersrol heeft binnen het MEOS systeem, en maak eigen profielen aan.
            Wijzigingen in de matrix zijn direct van kracht na het opslaan.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
             {roles.map(r => (
               <div key={r.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a1322] border-[#1e334d]'}`}>
                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${r.badgeColor}`}>{r.id}</span>
                 <span className={isLight ? 'text-slate-700' : 'text-zinc-300'}>{r.title}</span>
                 <button onClick={() => openEditRoleModal(r)} className="ml-1 text-blue-500 hover:text-blue-400" title="Bewerk profiel"><Edit2 className="w-3.5 h-3.5" /></button>
                 <button onClick={() => deleteRole(r.id)} className="text-red-500 hover:text-red-400" title="Verwijder profiel"><Trash2 className="w-3.5 h-3.5" /></button>
               </div>
             ))}
             <button onClick={openAddRoleModal} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-emerald-500/50 text-emerald-600 dark:text-emerald-400 text-xs hover:bg-emerald-500/10 transition cursor-pointer">
               <Plus className="w-3.5 h-3.5" /> Nieuw Profiel
             </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            disabled={saving}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-[#0a1322] hover:bg-[#142338] border-[#1e334d] text-zinc-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Herstel Standaard Matrix</span>
          </button>
          <button
            onClick={handleSaveMatrix}
            disabled={saving || !hasChanges}
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 ${
              hasChanges
                ? 'bg-[#154273] hover:bg-[#0e2c4d] text-white cursor-pointer'
                : 'bg-slate-300 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Opslaan...' : 'Rechtenmatrix Opslaan'}</span>
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

      {/* Matrix Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Autorisatiematrix ophalen...
        </div>
      ) : (
        <div
          className={`border rounded-2xl shadow-md overflow-hidden transition-colors ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0c1626] border-[#1e334d]'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#09111e] border-[#1e334d]'}`}>
                  <th className={`p-4 font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'} w-1/3 min-w-[250px]`}>
                    Bevoegdheid / Permissie
                  </th>
                  {roles.map((r) => (
                    <th key={r.id} className="p-4 text-center min-w-[140px]">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border font-mono ${r.badgeColor}`}>
                        {r.id}
                      </span>
                      <div className={`text-[10px] font-normal mt-1 opacity-70 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {r.title}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {categories.map((cat: string) => {
                  const catDefs = definitions.filter((d) => d.category === cat);
                  return (
                    <React.Fragment key={cat}>
                      <tr className={`${isLight ? 'bg-blue-50/50' : 'bg-blue-950/20'}`}>
                        <td
                          colSpan={roles.length + 1}
                          className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider font-mono ${
                            isLight ? 'text-[#154273]' : 'text-blue-400'
                          }`}
                        >
                          {(categoryLabels as Record<string, string>)[cat] || cat}
                        </td>
                      </tr>
                      {catDefs.map((def) => (
                        <tr
                          key={def.key}
                          className={`transition ${
                            isLight ? 'hover:bg-slate-50' : 'hover:bg-[#0e1b2e]'
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                                {def.label}
                              </span>
                              <span className="font-mono text-[10px] opacity-50">({def.key})</span>
                            </div>
                            <p className={`text-[11px] mt-0.5 opacity-70 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                              {def.description}
                            </p>
                          </td>
                          {roles.map((r) => {
                            const isAllowed = matrix[r.id]?.[def.key] ?? false;
                            return (
                              <td key={r.id} className="p-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggle(r.id, def.key)}
                                  className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition cursor-pointer border ${
                                    isAllowed
                                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                      : isLight
                                      ? 'bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-300'
                                      : 'bg-zinc-800/80 text-zinc-600 border-zinc-700 hover:border-zinc-600'
                                  }`}
                                  title={`${def.label} voor ${r.id}: ${isAllowed ? 'Toegestaan' : 'Geweigerd'}`}
                                >
                                  {isAllowed ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  ) : (
                                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Editor Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isLight ? 'bg-white' : 'bg-[#0c1626] border border-[#1e334d]'}`}>
             <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                  {editingRole ? 'Profiel Bewerken' : 'Nieuw Profiel Aanmaken'}
                </h3>
                <button onClick={() => setIsRoleModalOpen(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5"/></button>
             </div>
             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">Profiel ID (Uniek, Geen spaties)</label>
                  <input type="text" disabled={!!editingRole} value={roleForm.id} onChange={(e) => setRoleForm({...roleForm, id: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_')})} className={`w-full p-2.5 rounded-xl text-sm border ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#080e18] border-[#1e334d] text-zinc-100'}`} placeholder="Bijv. WACHTCOMMANDANT"/>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">Weergavetitel</label>
                  <input type="text" value={roleForm.title} onChange={(e) => setRoleForm({...roleForm, title: e.target.value})} className={`w-full p-2.5 rounded-xl text-sm border ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#080e18] border-[#1e334d] text-zinc-100'}`} placeholder="Bijv. Wachtcommandant"/>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">Omschrijving (Optioneel)</label>
                  <input type="text" value={roleForm.desc} onChange={(e) => setRoleForm({...roleForm, desc: e.target.value})} className={`w-full p-2.5 rounded-xl text-sm border ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#080e18] border-[#1e334d] text-zinc-100'}`}/>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">Badge Kleur / Styling Classes</label>
                  <input type="text" value={roleForm.badgeColor} onChange={(e) => setRoleForm({...roleForm, badgeColor: e.target.value})} className={`w-full p-2.5 rounded-xl text-sm border font-mono text-[10px] ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#080e18] border-[#1e334d] text-zinc-100'}`}/>
                  <div className="mt-2 text-[10px] opacity-70">
                    Voorbeeld: <span className={`px-2 py-0.5 rounded-full border ${roleForm.badgeColor}`}>Voorbeeld Badge</span>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-zinc-800">
                  <button onClick={() => setIsRoleModalOpen(false)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#0a1322] hover:bg-[#142338] text-zinc-300 border-[#1e334d]'}`}>Annuleren</button>
                  <button onClick={saveRole} disabled={saving} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#154273] hover:bg-[#0e2c4d] text-white shadow-md flex items-center gap-2">
                    <Save className="w-4 h-4"/> Opslaan
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};
"""

with open('src/components/admin/PermissionsMatrixEditor.tsx', 'w') as f:
    f.write(content)
