import re

with open('src/services/api.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "public static async saveRole(role: import('../types/index.js').RoleDefinition): Promise<void> {",
    "public static async saveRole(role: import('../types/index.js').RoleDefinition, originalId?: string): Promise<void> {"
)

content = content.replace(
    "body: JSON.stringify({ role }),",
    "body: JSON.stringify({ role, originalId }),"
)

with open('src/services/api.ts', 'w') as f:
    f.write(content)
