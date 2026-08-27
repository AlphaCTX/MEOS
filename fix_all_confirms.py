import re

# 1. Fix PermissionsMatrixEditor
with open('src/components/admin/PermissionsMatrixEditor.tsx', 'r') as f:
    content = f.read()

state_vars = """
  const [roleForm, setRoleForm] = useState<RoleDefinition>({
    id: '', title: '', desc: '', badgeColor: BADGE_OPTIONS[3].value
  });
  const [confirmReset, setConfirmReset] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
"""
content = re.sub(r'\s*const \[roleForm, setRoleForm\] = useState<RoleDefinition>\(\{[\s\S]*?\}\);', state_vars, content)

old_handleReset = """  const handleReset = async () => {
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
      setError(err.message || 'Fout bij herstellen');
    } finally {
      setSaving(false);
      setConfirmReset(false);
    }
  };"""

# Let's just redefine handleReset and deleteRole entirely to be safe
content = re.sub(r'  const handleReset = async \(\) => \{[\s\S]*?  \};', """  const handleReset = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await ApiService.resetPermissionsMatrix();
      setMatrix(res.matrix || {});
      setHasChanges(false);
      setSuccessMsg('Rechtenmatrix succesvol hersteld naar standaardinstellingen.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Fout bij herstellen');
    } finally {
      setSaving(false);
      setConfirmReset(false);
    }
  };""", content)

content = re.sub(r'  const deleteRole = async \([\s\S]*?  \};', """  const deleteRole = async () => {
    if (!roleToDelete) return;
    try {
      setSaving(true);
      setError(null);
      await ApiService.deleteRole(roleToDelete);
      setSuccessMsg('Profiel succesvol verwijderd!');
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadMatrix();
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen profiel (zijn er nog gebruikers met deze rol?)');
    } finally {
      setSaving(false);
      setRoleToDelete(null);
    }
  };""", content)

with open('src/components/admin/PermissionsMatrixEditor.tsx', 'w') as f:
    f.write(content)


# 2. Fix UserManager
with open('src/components/admin/UserManager.tsx', 'r') as f:
    content = f.read()

user_states = """  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{username: string, name: string} | null>(null);"""
content = content.replace("  const [isModalOpen, setIsModalOpen] = useState(false);", user_states)

old_deleteUser = """  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Weet u zeker dat u account ${username} wilt verwijderen?`)) {
      return;
    }
    try {
      setLoading(true);
      await ApiService.deleteUser(username);
      setSuccessMsg(`Gebruiker ${username} verwijderd.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen');
    } finally {
      setLoading(false);
    }
  };"""

new_deleteUser = """  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setLoading(true);
      await ApiService.deleteUser(userToDelete.username);
      setSuccessMsg(`Gebruiker ${userToDelete.username} verwijderd.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen');
    } finally {
      setLoading(false);
      setUserToDelete(null);
    }
  };"""
content = content.replace(old_deleteUser, new_deleteUser)
content = content.replace("onClick={() => handleDeleteUser(u.username)}", "onClick={() => setUserToDelete({username: u.username, name: u.name})}")

user_modal = """
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isLight ? 'bg-white' : 'bg-[#0c1626] border border-[#1e334d]'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Gebruiker Verwijderen</h3>
            <p className={`text-sm mb-6 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Weet u zeker dat u account "{userToDelete.username}" ({userToDelete.name}) wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setUserToDelete(null)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#0a1322] hover:bg-[#142338] text-zinc-300 border-[#1e334d]'}`}>Annuleren</button>
              <button onClick={handleDeleteUser} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md">
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Modal */}"""
content = content.replace("{/* Add/Edit Modal */}", user_modal)

with open('src/components/admin/UserManager.tsx', 'w') as f:
    f.write(content)


# 3. Fix BrigadeManager
with open('src/components/admin/BrigadeManager.tsx', 'r') as f:
    content = f.read()

brigade_states = """  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brigadeToDelete, setBrigadeToDelete] = useState<{code: string, name: string} | null>(null);"""
content = content.replace("  const [isModalOpen, setIsModalOpen] = useState(false);", brigade_states)

old_deleteBrigade = """  const handleDeleteBrigade = async (code: string, name: string) => {
    if (!confirm(`Weet u zeker dat u brigade "${name}" (${code}) wilt verwijderen?`)) {
      return;
    }
    try {
      setLoading(true);
      await ApiService.deleteBrigade(code);
      setSuccessMsg(`Brigade ${code} verwijderd.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadBrigades();
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen');
    } finally {
      setLoading(false);
    }
  };"""

new_deleteBrigade = """  const handleDeleteBrigade = async () => {
    if (!brigadeToDelete) return;
    try {
      setLoading(true);
      await ApiService.deleteBrigade(brigadeToDelete.code);
      setSuccessMsg(`Brigade ${brigadeToDelete.code} verwijderd.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadBrigades();
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen');
    } finally {
      setLoading(false);
      setBrigadeToDelete(null);
    }
  };"""
content = content.replace(old_deleteBrigade, new_deleteBrigade)
content = content.replace("onClick={() => handleDeleteBrigade(b.code, b.name)}", "onClick={() => setBrigadeToDelete({code: b.code, name: b.name})}")

brigade_modal = """
      {brigadeToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isLight ? 'bg-white' : 'bg-[#0c1626] border border-[#1e334d]'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Brigade Verwijderen</h3>
            <p className={`text-sm mb-6 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Weet u zeker dat u brigade "{brigadeToDelete.name}" ({brigadeToDelete.code}) wilt verwijderen? Dit kan gevolgen hebben voor gekoppelde eenheden.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setBrigadeToDelete(null)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#0a1322] hover:bg-[#142338] text-zinc-300 border-[#1e334d]'}`}>Annuleren</button>
              <button onClick={handleDeleteBrigade} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md">
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Form */}"""
content = content.replace("{/* Modal Form */}", brigade_modal)

with open('src/components/admin/BrigadeManager.tsx', 'w') as f:
    f.write(content)
