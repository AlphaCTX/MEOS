import re

with open('src/components/admin/PermissionsMatrixEditor.tsx', 'r') as f:
    content = f.read()

# Add states for confirmation modals
state_injection = """  const [roleForm, setRoleForm] = useState<RoleDefinition>({
    id: '', title: '', desc: '', badgeColor: BADGE_OPTIONS[3].value
  });
  
  const [confirmReset, setConfirmReset] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);"""

content = re.sub(r'  const \[roleForm, setRoleForm\] = useState<RoleDefinition>\(\{\n    id: \'\', title: \'\', desc: \'\', badgeColor: BADGE_OPTIONS\[3\]\.value\n  \}\);', state_injection, content)


# Modify handleReset
old_handleReset = """  const handleReset = async () => {
    if (!confirm('Weet u zeker dat u alle rechten wilt herstellen naar de standaard KMar autorisatiematrix?')) {
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const res = await ApiService.resetPermissions();
      setMatrix(res.matrix);
      setSuccessMsg('Rechten succesvol hersteld');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Fout bij herstellen');
    } finally {
      setSaving(false);
    }
  };"""

new_handleReset = """  const handleReset = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await ApiService.resetPermissions();
      setMatrix(res.matrix);
      setSuccessMsg('Rechten succesvol hersteld');
      setTimeout(() => setSuccessMsg(null), 3000);
      setConfirmReset(false);
    } catch (err: any) {
      setError(err.message || 'Fout bij herstellen');
    } finally {
      setSaving(false);
    }
  };"""

content = content.replace(old_handleReset, new_handleReset)

# Modify handleReset button
content = content.replace("onClick={handleReset}", "onClick={() => setConfirmReset(true)}")


# Modify deleteRole
old_deleteRole = """  const deleteRole = async (roleId: string) => {
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
  };"""

new_deleteRole = """  const deleteRole = async () => {
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
  };"""

content = content.replace(old_deleteRole, new_deleteRole)

# Modify deleteRole button
content = content.replace("onClick={() => deleteRole(r.id)}", "onClick={() => setRoleToDelete(r.id)}")


# Add Confirmation Modals
confirmation_modals = """
      {/* Role Editor Modal */}"""

new_confirmation_modals = """
      {/* Reset Confirmation Modal */}
      {confirmReset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isLight ? 'bg-white' : 'bg-[#0c1626] border border-[#1e334d]'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Standaard Matrix Herstellen</h3>
            <p className={`text-sm mb-6 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Weet u zeker dat u alle rechten wilt herstellen naar de standaard autorisatiematrix? Deze actie kan niet ongedaan worden gemaakt.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmReset(false)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#0a1322] hover:bg-[#142338] text-zinc-300 border-[#1e334d]'}`}>Annuleren</button>
              <button onClick={handleReset} disabled={saving} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md flex items-center gap-2">
                Bevestigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {roleToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isLight ? 'bg-white' : 'bg-[#0c1626] border border-[#1e334d]'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Profiel Verwijderen</h3>
            <p className={`text-sm mb-6 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Weet u zeker dat u profiel "{roleToDelete}" wilt verwijderen? Dit is alleen mogelijk als er geen gebruikers meer aan dit profiel gekoppeld zijn.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRoleToDelete(null)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#0a1322] hover:bg-[#142338] text-zinc-300 border-[#1e334d]'}`}>Annuleren</button>
              <button onClick={deleteRole} disabled={saving} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md flex items-center gap-2">
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Role Editor Modal */}"""

content = content.replace(confirmation_modals, new_confirmation_modals)

with open('src/components/admin/PermissionsMatrixEditor.tsx', 'w') as f:
    f.write(content)
