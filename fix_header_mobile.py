import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r'<\s*button\s*onClick=\{\(\) => \{\s*setIsLoginModalOpen\(true\);\s*setIsMobileMenuOpen\(false\);\s*\}\}[\s\S]*?Wissel van profiel[\s\S]*?<\s*/\s*button\s*>[\s\S]*?<\s*button\s*onClick=\{\(\) => \{\s*onClearData\(\);\s*setIsMobileMenuOpen\(false\);\s*\}\}[\s\S]*?Systeem Herstarten[\s\S]*?<\s*/\s*button\s*>', re.DOTALL)

mobile_logout = """<button
              onClick={() => {
                ApiService.logout();
                setCurrentSession(null);
                if (onAuthChange) onAuthChange(null);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                isLight ? 'hover:bg-red-50 text-red-600' : 'hover:bg-red-950/30 text-red-400'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Uitloggen
            </button>"""

content = pattern.sub(mobile_logout, content)

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
