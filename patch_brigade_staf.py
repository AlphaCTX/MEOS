import re

with open('src/server/db.ts', 'r') as f:
    content_db = f.read()

# Remove the check in db.ts
db_block_to_remove = """      if (cleanCode === 'BRIGADE-HQ-COMMAND') {
        throw new Error('De code van de Staf/HQ Brigade kan niet worden gewijzigd.');
      }
"""
content_db = content_db.replace(db_block_to_remove, "")

with open('src/server/db.ts', 'w') as f:
    f.write(content_db)


with open('src/components/admin/BrigadeManager.tsx', 'r') as f:
    content_ui = f.read()

# Remove disabled on code input
old_input = """                  <input
                    type="text"
                    required
                    disabled={editingBrigade?.code === 'BRIGADE-HQ-COMMAND'}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="BRIGADE-SCHIPHOL"
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono outline-none ${
                      editingBrigade?.code === 'BRIGADE-HQ-COMMAND' ? 'opacity-50 cursor-not-allowed ' : ''
                    }${
                      isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                    }`}
                  />"""

new_input = """                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="BRIGADE-SCHIPHOL"
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200 focus:border-[#154273]' : 'bg-[#08101d] border-[#1e334d] focus:border-blue-500'
                    }`}
                  />"""

content_ui = content_ui.replace(old_input, new_input)

# Add Staf to taskType
old_select = """                    <option value="Recherche/FO">Recherche/FO</option>
                  </select>"""

new_select = """                    <option value="Recherche/FO">Recherche/FO</option>
                    <option value="Staf">Staf</option>
                  </select>"""

content_ui = content_ui.replace(old_select, new_select)

with open('src/components/admin/BrigadeManager.tsx', 'w') as f:
    f.write(content_ui)
