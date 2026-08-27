import re

with open('src/components/admin/BrigadeManager.tsx', 'r') as f:
    content = f.read()

# add state
brigade_states = """  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brigadeToDelete, setBrigadeToDelete] = useState<{code: string, name: string} | null>(null);"""
content = content.replace("  const [isModalOpen, setIsModalOpen] = useState(false);", brigade_states)

# replace handleDelete
old_handleDelete = """  const handleDelete = async (code: string, name: string) => {
    if (!confirm(`Weet u zeker dat u brigade "${name}" (${code}) wilt verwijderen?`)) {
      return;
    }
    try {
      await ApiService.deleteBrigade(code);
      setSuccessMsg(`Brigade "${name}" succesvol verwijderd.`);
      loadBrigades();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen brigade');
    }
  };"""

new_handleDelete = """  const handleDelete = async () => {
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
  };"""

content = content.replace(old_handleDelete, new_handleDelete)
content = content.replace("onClick={() => handleDelete(b.code, b.name)}", "onClick={() => setBrigadeToDelete({code: b.code, name: b.name})}")

# add modal
brigade_modal = """
      {brigadeToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isLight ? 'bg-white' : 'bg-[#0c1626] border border-[#1e334d]'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>Brigade Verwijderen</h3>
            <p className={`text-sm mb-6 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>Weet u zeker dat u brigade "{brigadeToDelete.name}" ({brigadeToDelete.code}) wilt verwijderen? Dit kan gevolgen hebben voor gekoppelde eenheden.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setBrigadeToDelete(null)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#0a1322] hover:bg-[#142338] text-zinc-300 border-[#1e334d]'}`}>Annuleren</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md">
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
