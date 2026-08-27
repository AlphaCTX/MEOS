import re

with open('src/components/admin/UserManager.tsx', 'r') as f:
    content = f.read()

# Add RoleDefinition to imports
if 'RoleDefinition' not in content:
    content = content.replace('BrigadeEntity } from', 'BrigadeEntity, RoleDefinition } from')

# Add roles state
content = content.replace('const [brigades, setBrigades] = useState<BrigadeEntity[]>([]);', 'const [brigades, setBrigades] = useState<BrigadeEntity[]>([]);\n  const [roles, setRoles] = useState<RoleDefinition[]>([]);')

# Load roles in loadData
content = content.replace('const res = await ApiService.getAdminUsers();', 'const [res, perms] = await Promise.all([ApiService.getAdminUsers(), ApiService.getPermissionsMatrix()]);\n      setRoles(perms.roles || []);')

# Update the select box
old_select = """                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                    }`}
                  >
                    <option value="PATROL_OFFICER">Patrouilleur / Verbalisant (PATROL_OFFICER)</option>
                    <option value="INVESTIGATOR">Rechercheur / Onderzoeker (INVESTIGATOR)</option>
                    <option value="WATCH_COMMANDER">Hulp-Officier / Wachtcommandant (WATCH_COMMANDER)</option>
                    <option value="ADMIN">Systeembeheerder (ADMIN)</option>
                  </select>"""

new_select = """                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                    }`}
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.title} ({r.id})</option>
                    ))}
                  </select>"""

if old_select in content:
    content = content.replace(old_select, new_select)
else:
    # Use regex if exact match fails
    pattern = re.compile(r'<select[^>]+value=\{formData\.role\}[^>]*>.*?</select>', re.DOTALL)
    content = pattern.sub(new_select, content)

with open('src/components/admin/UserManager.tsx', 'w') as f:
    f.write(content)
