with open('src/types/index.ts', 'r') as f:
    content = f.read()

content = content.replace("  | 'EXPORT_PDF'\n  | 'PRINT'", "  | 'EXPORT_PDF'\n  | 'PRINT'\n  | 'SYSTEM_SETTINGS_UPDATE'\n  | 'SYSTEM_LOGIN'\n  | 'USER_UPDATE_PROFILE'")

with open('src/types/index.ts', 'w') as f:
    f.write(content)

with open('src/components/admin/UserManager.tsx', 'r') as f:
    content = f.read()

# find duplicate email lines
import re
content = re.sub(r'email: user\.email \|\| \'\',\s*email: user\.email \|\| \'\',', "email: user.email || '',", content)

with open('src/components/admin/UserManager.tsx', 'w') as f:
    f.write(content)
