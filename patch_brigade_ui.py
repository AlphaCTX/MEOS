import re

with open('src/components/admin/BrigadeManager.tsx', 'r') as f:
    content = f.read()

# Replace defaults
content = content.replace("taskType: 'Grensbewaking & Handhaving',", "taskType: 'Handhaving & Opsporing',")

# Replace options
old_options = """                  >
                    <option value="Grensbewaking & Handhaving">Grensbewaking & Handhaving (MTV)</option>
                    <option value="Luchtvaartpolitie & Beveiliging">Luchtvaartpolitie & Beveiliging</option>
                    <option value="Hoog Risico Beveiliging">Hoog Risico Beveiliging (HRB)</option>
                    <option value="Militaire Politiezorg & Buitenland">Militaire Politiezorg (MP)</option>
                    <option value="Recherche & Fraudeonderzoek">Recherche & Fraudeonderzoek</option>
                    <option value="Persoonsbeveiliging & Escorte">Persoonsbeveiliging & Escorte (BSB)</option>
                  </select>"""

new_options = """                  >
                    <option value="Handhaving & Opsporing">Handhaving & Opsporing</option>
                    <option value="Grenspolitietaak">Grenspolitietaak</option>
                    <option value="Bewaken beveiligen">Bewaken beveiligen</option>
                    <option value="Recherche/FO">Recherche/FO</option>
                  </select>"""

if old_options in content:
    content = content.replace(old_options, new_options)
else:
    print("Could not find old options.")

with open('src/components/admin/BrigadeManager.tsx', 'w') as f:
    f.write(content)
