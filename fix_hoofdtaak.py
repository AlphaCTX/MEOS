with open('src/components/admin/BrigadeManager.tsx', 'r') as f:
    content = f.read()

old_options = """<option value="Grensbewaking & Handhaving">Grensbewaking & Handhaving (MTV)</option>
                    <option value="Luchtvaartpolitie & Beveiliging">Luchtvaartpolitie & Beveiliging</option>
                    <option value="Hoog Risico Beveiliging">Hoog Risico Beveiliging (HRB)</option>
                    <option value="Bereden Brigade">Bereden Brigade</option>
                    <option value="Recherche & Opsporing">Recherche & Opsporing</option>
                    <option value="Kmar Opleidingscentrum">Kmar Opleidingscentrum</option>"""

new_options = """<option value="Opsporing & handhaving">Opsporing & handhaving</option>
                    <option value="Bewaken & beveiligen">Bewaken & beveiligen</option>
                    <option value="Grenspolitietaak">Grenspolitietaak</option>"""

content = content.replace(old_options, new_options)

with open('src/components/admin/BrigadeManager.tsx', 'w') as f:
    f.write(content)
