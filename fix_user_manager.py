import re

with open('src/components/admin/UserManager.tsx', 'r') as f:
    content = f.read()

# state already added maybe? Let's check.
if "const [userToDelete," not in content:
    content = content.replace("  const [isModalOpen, setIsModalOpen] = useState(false);", "  const [isModalOpen, setIsModalOpen] = useState(false);\n  const [userToDelete, setUserToDelete] = useState<{username: string, name: string} | null>(null);")

old_handleDelete = """  const handleDelete = async (username: string) => {
    if (username.toLowerCase() === 'alphactx') {
      alert('Het hoofd-admin account AlphaCTX kan niet worden verwijderd.');
      return;
    }
    if (!confirm(`Weet u zeker dat u account ${username} wilt verwijderen?`)) {
      return;
    }
    try {
      await ApiService.deleteAdminUser(username);
      setSuccessMsg(`Account ${username} succesvol verwijderd.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen gebruiker');
    }
  };"""

new_handleDelete = """  const handleDelete = async () => {
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
  };"""

content = content.replace(old_handleDelete, new_handleDelete)
content = content.replace("onClick={() => handleDelete(u.username)}", "onClick={() => setUserToDelete({username: u.username, name: u.name})}")

user_modal = """
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isLight ? 'bg-white' : 'bg-[#0c1626] border border-[#1e334d]'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Gebruiker Verwijderen</h3>
            <p className={`text-sm mb-6 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Weet u zeker dat u account "{userToDelete.username}" ({userToDelete.name}) wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setUserToDelete(null)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#0a1322] hover:bg-[#142338] text-zinc-300 border-[#1e334d]'}`}>Annuleren</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md">
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Modal */}"""

if "userToDelete &&" not in content:
    content = content.replace("{/* Add/Edit Modal */}", user_modal)

with open('src/components/admin/UserManager.tsx', 'w') as f:
    f.write(content)
