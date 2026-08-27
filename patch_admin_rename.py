import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

if "if (originalId === 'ADMIN' && role.id !== 'ADMIN')" not in content:
    content = content.replace(
        "// It's a rename",
        "// It's a rename\n      if (originalId === 'ADMIN' && role.id !== 'ADMIN') {\n        throw new Error('De ID van het hoofd-beheerdersprofiel (ADMIN) kan niet worden gewijzigd');\n      }"
    )

with open('src/server/db.ts', 'w') as f:
    f.write(content)
