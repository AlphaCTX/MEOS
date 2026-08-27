import re

with open('server.ts', 'r') as f:
    content = f.read()
    
# In server.ts, replace `const allUsers = db.getUsers ? db.getUsers() : (db as any).users ? Array.from((db as any).users.values()) : [];`
# with `const allUsers = (db as any).getAdminUsers ? (db as any).getAdminUsers() : (db as any).users ? Array.from((db as any).users.values()) : [];`
content = content.replace("db.getUsers ?", "(db as any).getAdminUsers ?")
content = content.replace("db.getUsers()", "(db as any).getAdminUsers()")

with open('server.ts', 'w') as f:
    f.write(content)

with open('src/types/index.ts', 'r') as f:
    content = f.read()

content = content.replace("  | 'DATABASE_RESET'\n  | 'SYSTEM_SETTINGS_UPDATE'\n  | 'SYSTEM_LOGIN'\n  | 'USER_UPDATE_PROFILE'", "  | 'DATABASE_RESET'")
content = content.replace("  | 'DATABASE_RESET'", "  | 'DATABASE_RESET'\n  | 'SYSTEM_SETTINGS_UPDATE'\n  | 'SYSTEM_LOGIN'\n  | 'USER_UPDATE_PROFILE'")

with open('src/types/index.ts', 'w') as f:
    f.write(content)
