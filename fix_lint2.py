with open('src/types/index.ts', 'r') as f:
    content = f.read()

content = content.replace("| 'SYSTEM_SETTINGS_UPDATE'", "| 'SYSTEM_SETTINGS_UPDATE'\n  | 'SYSTEM_LOGIN'")
with open('src/types/index.ts', 'w') as f:
    f.write(content)

with open('src/components/admin/UserManager.tsx', 'r') as f:
    content = f.read()

# Add email to UserItem properly
if "interface UserItem {" in content:
    if "email?: string;" not in content.split("interface UserItem {")[1].split("}")[0]:
        content = content.replace("isActive?: boolean;", "isActive?: boolean;\n  email?: string;")

# Clean up duplicate email lines manually:
content = content.replace("      email: '',\n      email: user.email || '',", "      email: user.email || '',")
content = content.replace("          email: formData.email,\n          email: formData.email,", "          email: formData.email,")

with open('src/components/admin/UserManager.tsx', 'w') as f:
    f.write(content)
