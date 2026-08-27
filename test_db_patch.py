import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

# Let's add a strict check for ADMIN deletion just in case
if "if (roleId === 'ADMIN')" not in content:
    content = content.replace("    if (hasUsers) {", "    if (roleId === 'ADMIN') {\n      throw new Error('Het hoofd-beheerdersprofiel (ADMIN) kan niet worden verwijderd');\n    }\n    if (hasUsers) {")

with open('src/server/db.ts', 'w') as f:
    f.write(content)
