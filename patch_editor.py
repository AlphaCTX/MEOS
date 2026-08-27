import re

with open('src/components/admin/PermissionsMatrixEditor.tsx', 'r') as f:
    content = f.read()

badge_options = """
const BADGE_OPTIONS = [
  { label: 'Rood', value: 'bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/30' },
  { label: 'Oranje', value: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30' },
  { label: 'Groen', value: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30' },
  { label: 'Blauw', value: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30' },
  { label: 'Paars', value: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30' },
  { label: 'Indigo', value: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30' },
  { label: 'Grijs', value: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border-zinc-500/30' },
];
"""

if "BADGE_OPTIONS" not in content:
    content = content.replace("export const PermissionsMatrixEditor", badge_options + "\nexport const PermissionsMatrixEditor")

# replace saveRole
old_saveRole = """  const saveRole = async () => {
    try {
      if (!roleForm.id || !roleForm.title) {
        throw new Error('ID en Titel zijn verplicht');
      }
      setSaving(true);
      setError(null);
      // Validate ID: uppercase and underscores only
      const safeId = roleForm.id.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
      const finalRole = { ...roleForm, id: safeId };
      await ApiService.saveRole(finalRole);"""

new_saveRole = """  const saveRole = async () => {
    try {
      if (!roleForm.id || !roleForm.title) {
        throw new Error('ID en Titel zijn verplicht');
      }
      setSaving(true);
      setError(null);
      // Validate ID: uppercase and underscores only
      const safeId = roleForm.id.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
      const finalRole = { ...roleForm, id: safeId };
      await ApiService.saveRole(finalRole, editingRole?.id);"""

content = content.replace(old_saveRole, new_saveRole)

# allow ID editing
content = content.replace(
    """<input type="text" disabled={!!editingRole} value={roleForm.id}""",
    """<input type="text" value={roleForm.id}"""
)

# replace badgeColor input with dropdown
old_badge = """                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">Badge Kleur / Styling Classes</label>
                  <input type="text" value={roleForm.badgeColor} onChange={(e) => setRoleForm({...roleForm, badgeColor: e.target.value})} className={`w-full p-2.5 rounded-xl text-sm border font-mono text-[10px] ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#080e18] border-[#1e334d] text-zinc-100'}`}/>
                  <div className="mt-2 text-[10px] opacity-70">
                    Voorbeeld: <span className={`px-2 py-0.5 rounded-full border ${roleForm.badgeColor}`}>Voorbeeld Badge</span>
                  </div>
                </div>"""

new_badge = """                <div>
                  <label className="block text-xs font-bold mb-2 opacity-80">Badge Kleur</label>
                  <div className="flex flex-wrap gap-2">
                    {BADGE_OPTIONS.map(opt => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setRoleForm({...roleForm, badgeColor: opt.value})}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                          roleForm.badgeColor === opt.value
                            ? 'ring-2 ring-offset-1 ' + (isLight ? 'ring-blue-500' : 'ring-blue-400')
                            : 'opacity-70 hover:opacity-100'
                        } ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080e18] border-[#1e334d]'}`}
                      >
                        <span className={`w-3 h-3 rounded-full border ${opt.value.split(' ')[0]} ${opt.value.split(' ').find(c => c.startsWith('border-')) || ''}`}></span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-[10px] opacity-70 flex items-center gap-2">
                    <span>Voorbeeldweergave:</span> 
                    <span className={`px-2 py-0.5 rounded-full border ${roleForm.badgeColor}`}>
                      {roleForm.id || 'VOORBEELD_ID'}
                    </span>
                  </div>
                </div>"""

content = content.replace(old_badge, new_badge)

with open('src/components/admin/PermissionsMatrixEditor.tsx', 'w') as f:
    f.write(content)
