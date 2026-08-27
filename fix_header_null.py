import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

content = content.replace("const hasPerm = (perm: string) => currentSession.permissions?.includes(perm) || currentSession.isAdmin;", "const hasPerm = (perm: string) => currentSession?.permissions?.includes(perm) || currentSession?.isAdmin;")

# Hide navigation and user menu if !currentSession
# In Header.tsx: `if (!currentSession) return <header>...</header>;`
no_auth_header = """
  if (!currentSession) {
    return (
      <header className={`border-b sticky top-0 z-40 shadow-xl transition-colors duration-200 ${
        isLight ? 'bg-[#154273] border-[#0e2c4d] text-white' : 'bg-[#0a1424] border-[#1e334d] text-zinc-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl bg-gradient-to-br from-[#1e4e8c] to-[#154273] shadow-inner`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white">MEOS</h1>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Digitaal Mutatiesysteem</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
              isLight ? 'bg-white hover:bg-slate-100 text-[#154273] shadow-sm' : 'bg-[#0c1626] hover:bg-zinc-800 text-zinc-300 border border-[#1e334d]'
            }`}>
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>
    );
  }
"""

content = content.replace("const isLight = theme === 'light';", "const isLight = theme === 'light';\n" + no_auth_header)

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
