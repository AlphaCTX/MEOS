with open('src/types/index.ts', 'r') as f:
    content = f.read()
    
# Add SYSTEM_SETTINGS_UPDATE to AuditAction
content = content.replace("  | 'DATABASE_RESET'", "  | 'DATABASE_RESET'\n  | 'SYSTEM_SETTINGS_UPDATE'\n  | 'USER_UPDATE_PROFILE'")

with open('src/types/index.ts', 'w') as f:
    f.write(content)

with open('src/components/admin/UserManager.tsx', 'r') as f:
    content = f.read()

# Add email to UserItem
if "email?: string;" not in content:
    content = content.replace("isActive?: boolean;", "isActive?: boolean;\n  email?: string;")

# Remove duplicate email lines
lines = content.split('\n')
new_lines = []
for i, line in enumerate(lines):
    if "email:" in line and "email:" in lines[i-1]:
        continue # skip duplicate
    new_lines.append(line)

with open('src/components/admin/UserManager.tsx', 'w') as f:
    f.write('\n'.join(new_lines))
