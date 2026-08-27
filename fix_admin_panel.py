import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

# Remove ScenarioGenerator import
content = content.replace("import { ScenarioGenerator } from './admin/ScenarioGenerator.js';\n", "")

# Add Mail and Code2 imports from lucide-react
if "Mail" not in content:
    content = content.replace("Server,", "Server, Mail, Code2,")

# Add SchemaViewer import
if "SchemaViewer" not in content:
    content = content.replace("import { PermissionsMatrixEditor } from './admin/PermissionsMatrixEditor.js';", "import { PermissionsMatrixEditor } from './admin/PermissionsMatrixEditor.js';\nimport { SchemaViewer } from './SchemaViewer.js';\nimport { SmtpSettings } from './admin/SmtpSettings.js';")

# Replace the useState
old_state = "const [activeAdminSubTab, setActiveAdminSubTab] = useState<"
# Find the full type definition of activeAdminSubTab
pattern_state = re.compile(r'const \[activeAdminSubTab, setActiveAdminSubTab\] = useState<\s*\'users\' \| \'brigades\' \| \'matrix\' \| \'testing\' \| \'diagnostics\'\s*>\(\'users\'\);')
new_state = "const [activeAdminSubTab, setActiveAdminSubTab] = useState<'users' | 'brigades' | 'matrix' | 'schema' | 'smtp' | 'diagnostics'>('users');"
content = pattern_state.sub(new_state, content)

# Remove the 'testing' tab button
pattern_testing_btn = re.compile(r'<\s*button[^>]*onClick=\{\(\) => setActiveAdminSubTab\(\'testing\'\)\}[^>]*>.*?<\s*/\s*button>', re.DOTALL)
content = pattern_testing_btn.sub('', content)

# Add schema and smtp buttons
new_buttons = """
          <button
            onClick={() => setActiveAdminSubTab('schema')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeAdminSubTab === 'schema'
                ? isLight
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-emerald-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">MariaDB Schema</span>
          </button>
          
          <button
            onClick={() => setActiveAdminSubTab('smtp')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeAdminSubTab === 'smtp'
                ? isLight
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-purple-600 text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">SMTP Instellingen</span>
          </button>
"""
# insert before diagnostics button
pattern_diag_btn = re.compile(r'(<\s*button[^>]*onClick=\{\(\) => setActiveAdminSubTab\(\'diagnostics\'\)\})', re.DOTALL)
content = pattern_diag_btn.sub(new_buttons + r'\1', content)

# Replace the renders
content = content.replace("{activeAdminSubTab === 'testing' && <ScenarioGenerator onClearData={onClearData} />}", "{activeAdminSubTab === 'schema' && <SchemaViewer />}\n      {activeAdminSubTab === 'smtp' && <SmtpSettings />}")

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)
