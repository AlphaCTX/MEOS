import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  BadgeCheck,
  Search,
  CheckCircle,
  AlertCircle,
  LogIn,
  RefreshCw,
  X,
  Check,
  Building,
} from 'lucide-react';
import { UserRole, UserSession, KMAR_RANKS, BrigadeEntity, RoleDefinition } from '../../types/index.js';
import { ApiService } from '../../services/api.js';
import { useTheme } from '../../context/ThemeContext.js';

interface UserItem {
  username: string;
  badgeNumber: string;
  name: string;
  rank: string;
  role: UserRole;
  department: string;
  activeBrigade?: string;
  activeUnit: string;
  isActive?: boolean;
  email?: string;
}

export const UserManager: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [users, setUsers] = useState<UserItem[]>([]);
  const [brigades, setBrigades] = useState<BrigadeEntity[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{username: string, name: string} | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formData, setFormData] = useState<{
    username: string;
    password?: string;
    email?: string;
    badgeNumber: string;
    name: string;
    rank: string;
    role: UserRole;
    department: string;
    activeBrigade: string;
    activeUnit: string;
    isActive: boolean;
  }>({
    username: '',
    password: '',
    email: '',
    badgeNumber: '',
    name: '',
    rank: 'Wachtmeester',
    role: 'PATROL_OFFICER',
    department: 'Koninklijke Marechaussee',
    activeBrigade: 'BRIGADE-SCHIPHOL',
    activeUnit: 'BRIGADE-SCHIPHOL',
    isActive: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, brigadesData] = await Promise.all([
        ApiService.getAdminUsers(),
        ApiService.getBrigades(),
      ]);
      setUsers(usersData);
      setBrigades(brigadesData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Fout bij ophalen gebruikers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
    email: '',
      badgeNumber: '',
      name: '',
      rank: 'Wachtmeester',
      role: 'PATROL_OFFICER',
      department: 'Koninklijke Marechaussee',
      activeBrigade: brigades[0]?.code || 'BRIGADE-SCHIPHOL',
      activeUnit: brigades[0]?.code || 'BRIGADE-SCHIPHOL',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      badgeNumber: user.badgeNumber,
      name: user.name,
      email: user.email || '',
      rank: user.rank,
      role: user.role,
      department: user.department,
      activeBrigade: user.activeBrigade || user.activeUnit || 'BRIGADE-SCHIPHOL',
      activeUnit: user.activeBrigade || user.activeUnit || 'BRIGADE-SCHIPHOL',
      isActive: user.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.username || !formData.badgeNumber || !formData.name) {
        setError('Vul alle verplichte velden in');
        return;
      }

      if (editingUser) {
        await ApiService.updateAdminUser(editingUser.username, {
          name: formData.name,
          badgeNumber: formData.badgeNumber,
          rank: formData.rank,
          role: formData.role,
          department: formData.department,
          activeBrigade: formData.activeBrigade,
          activeUnit: formData.activeBrigade,
          isActive: formData.isActive,
          ...(formData.password ? { password: formData.password } : {}),
          email: formData.email,
        });
        setSuccessMsg(`Profiel "${formData.name}" succesvol bijgewerkt.`);
      } else {
        await ApiService.createAdminUser({
          username: formData.username,
          password: formData.password || 'kmar2026',
          email: formData.email,
          badgeNumber: formData.badgeNumber,
          name: formData.name,
          rank: formData.rank,
          role: formData.role,
          department: formData.department,
          activeBrigade: formData.activeBrigade,
          activeUnit: formData.activeBrigade,
        });
        setSuccessMsg(`Nieuw profiel "${formData.name}" succesvol aangemaakt.`);
      }

      setShowModal(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan profiel');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    if (userToDelete.username.toLowerCase() === 'alphactx') {
      alert('Het hoofd-admin account AlphaCTX kan niet worden verwijderd.');
      setUserToDelete(null);
      return;
    }
    try {
      await ApiService.deleteAdminUser(userToDelete.username);
      setSuccessMsg(`Account ${userToDelete.username} succesvol verwijderd.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen gebruiker');
    } finally {
      setUserToDelete(null);
    }
  };

  const handleDirectLoginAs = (u: UserItem) => {
    const session: UserSession = {
      username: u.username,
      badgeNumber: u.badgeNumber,
      name: u.name,
      rank: u.rank,
      role: u.role,
      department: u.department,
      activeBrigade: u.activeBrigade || u.activeUnit,
      activeUnit: u.activeBrigade || u.activeUnit,
      isAdmin: u.role === 'ADMIN' || u.username.toLowerCase() === 'alphactx',
    };
    ApiService.setUserSession(session);
    setSuccessMsg(`Ingelogd als: ${u.name} (${u.role})! De sessie is actief.`);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const filtered = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.badgeNumber.toLowerCase().includes(q) ||
      u.rank.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.activeBrigade && u.activeBrigade.toLowerCase().includes(q))
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
            placeholder="Zoek verbalisant op naam, dienstnummer, rang of brigade..."
            className={`w-full border rounded-xl pl-10 pr-4 py-2 text-xs outline-none transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#154273]'
                : 'bg-[#0a1322] border-[#1e334d] text-zinc-100 placeholder-zinc-500 focus:border-blue-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-[#0a1322] hover:bg-[#142338] border-[#1e334d] text-zinc-300'
            }`}
            title="Ververs profielen"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#154273] hover:bg-[#0e2c4d] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nieuw Profiel Toevoegen</span>
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

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Verbalisanten & profielen ophalen...
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
                  <th className={`p-4 font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Verbalisant & Naam</th>
                  <th className={`p-4 font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Dienstnummer</th>
                  <th className={`p-4 font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>KMar Rang</th>
                  <th className={`p-4 font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Rol & Rechten</th>
                  <th className={`p-4 font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Brigade</th>
                  <th className={`p-4 font-bold text-right ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Acties</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {filtered.map((u) => (
                  <tr
                    key={u.username}
                    className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#0e1b2e]'}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isLight
                              ? 'bg-blue-50 text-[#154273] border border-blue-200'
                              : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                            {u.name}
                          </div>
                          <div className={`text-[11px] font-mono opacity-60 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                            @{u.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-bold text-[#154273] dark:text-blue-400">
                      {u.badgeNumber}
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {u.rank}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border font-mono ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30'
                            : u.role === 'WATCH_COMMANDER'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30'
                            : u.role === 'INVESTIGATOR'
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Building className="w-3.5 h-3.5 opacity-50" />
                        <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                          {u.activeBrigade || u.activeUnit}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDirectLoginAs(u)}
                          title={`Inloggen als ${u.name}`}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isLight
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <LogIn className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="Profiel bewerken"
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isLight
                              ? 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#154273] border-slate-200'
                              : 'bg-[#0a1322] hover:bg-[#142338] text-zinc-300 border-[#1e334d]'
                          }`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {u.username.toLowerCase() !== 'alphactx' && (
                          <button
                            onClick={() => setUserToDelete({username: u.username, name: u.name})}
                            title="Account verwijderen"
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isLight
                                ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Create / Edit Profile */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 ${
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
                    {editingUser ? `Profiel Bewerken: ${editingUser.name}` : 'Nieuw MEOS Profiel Aanmaken'}
                  </h2>
                  <p className="text-xs opacity-70">
                    Koninklijke Marechaussee verbalisantengegevens & autorisaties
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
                    Gebruikersnaam / Inlognaam *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="j.vandenberg"
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Dienstnummer *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value.toUpperCase() })}
                    placeholder="KMAR-4482"
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  Volledige Naam van de Verbalisant *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Wmr. I J. van den Berg"
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Koninklijke Marechaussee Rang *
                  </label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                    }`}
                  >
                    {KMAR_RANKS.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Systeemrol & Autorisatie *
                  </label>
                                    <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                    }`}
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.title} ({r.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Toegewezen Brigade *
                  </label>
                  <select
                    value={formData.activeBrigade}
                    onChange={(e) => setFormData({ ...formData, activeBrigade: e.target.value, activeUnit: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                    }`}
                  >
                    {brigades.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                    {brigades.length === 0 && (
                      <option value="BRIGADE-SCHIPHOL">Brigade Schiphol (BRIGADE-SCHIPHOL)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Dienst / Afdeling
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Koninklijke Marechaussee / Grenstoezicht"
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">
                  {editingUser ? 'Wachtwoord wijzigen (optioneel)' : 'Wachtwoord'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? 'Laat leeg om huidig wachtwoord te behouden' : 'kmar2026'}
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
                  <span>{editingUser ? 'Profiel Bijwerken' : 'Profiel Aanmaken'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isLight ? 'bg-white' : 'bg-[#0c1626] border border-[#1e334d]'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Gebruiker Verwijderen</h3>
            <p className={`text-sm mb-6 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Weet u zeker dat u account "{userToDelete.username}" ({userToDelete.name}) wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setUserToDelete(null)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#0a1322] hover:bg-[#142338] text-zinc-300 border-[#1e334d]'}`}>Annuleren</button>
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
