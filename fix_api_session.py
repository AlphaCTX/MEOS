import re

with open('src/services/api.ts', 'r') as f:
    content = f.read()

# Replace the default userSession initialization
pattern = re.compile(r'private static userSession: UserSession = ApiService\.loadStoredSession\(\) \|\| \{.*?\n  \};', re.DOTALL)
new_userSession = """private static userSession: UserSession | null = ApiService.loadStoredSession();"""
content = pattern.sub(new_userSession, content)

# Update getUserSession return type
content = content.replace("public static getUserSession(): UserSession {", "public static getUserSession(): UserSession | null {")

with open('src/services/api.ts', 'w') as f:
    f.write(content)
