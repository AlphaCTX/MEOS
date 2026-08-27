import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "db.saveRoleDefinition(userCtx, req.body.role);",
    "db.saveRoleDefinition(userCtx, req.body.role, req.body.originalId);"
)

with open('server.ts', 'w') as f:
    f.write(content)
