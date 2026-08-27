with open('src/types/index.ts', 'r') as f:
    content = f.read()

content = content.replace("  | 'LOGIN'", "  | 'LOGIN'\n  | 'DATABASE_CLEAR'\n  | 'SYSTEM_SETTINGS_UPDATE'\n  | 'SYSTEM_LOGIN'\n  | 'USER_UPDATE_PROFILE'")

with open('src/types/index.ts', 'w') as f:
    f.write(content)
