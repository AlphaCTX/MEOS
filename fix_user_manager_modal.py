import re

with open('src/components/admin/UserManager.tsx', 'r') as f:
    content = f.read()

modal_html = """
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
"""

content = re.sub(r'    </div>\s*  \);\s*\};\s*$', modal_html, content)

with open('src/components/admin/UserManager.tsx', 'w') as f:
    f.write(content)
