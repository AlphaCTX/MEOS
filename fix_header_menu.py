import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# Replace the user menu buttons
pattern = re.compile(r'<\s*button\s*onClick=\{\(\) => \{\s*setIsUserMenuOpen\(false\);\s*setIsLoginModalOpen\(true\);\s*\}\}[\s\S]*?<LogIn[\s\S]*?Sessie Wisselen \(Test\)[\s\S]*?<\s*/\s*button\s*>[\s\S]*?<div className=\{`h-px my-1 \$\{isLight \? \'bg-slate-100\' : \'bg-zinc-800\'\}`\} />[\s\S]*?<\s*button\s*onClick=\{\(\) => \{\s*setIsUserMenuOpen\(false\);\s*onClearData\(\);\s*\}\}[\s\S]*?<RotateCcw[\s\S]*?Systeem Reset & Flush DB[\s\S]*?<\s*/\s*button\s*>', re.DOTALL)

logout_button = """<button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    ApiService.logout();
                    setCurrentSession(null);
                    if (onAuthChange) onAuthChange(null);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 transition cursor-pointer ${
                    isLight ? 'hover:bg-red-50 text-red-600' : 'hover:bg-red-950/30 text-red-400'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Uitloggen
                </button>"""

content = pattern.sub(logout_button, content)

# Also mobile menu
mobile_pattern = re.compile(r'<\s*button\s*onClick=\{\(\) => \{\s*setIsLoginModalOpen\(true\);\s*setIsMobileMenuOpen\(false\);\s*\}\}[\s\S]*?Sessie Wisselen \(Test\)[\s\S]*?<\s*/\s*button\s*>[\s\S]*?<\s*button\s*onClick=\{\(\) => \{\s*onClearData\(\);\s*setIsMobileMenuOpen\(false\);\s*\}\}[\s\S]*?Systeem Herstarten[\s\S]*?<\s*/\s*button\s*>', re.DOTALL)
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
content = mobile_pattern.sub(mobile_logout, content)

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
