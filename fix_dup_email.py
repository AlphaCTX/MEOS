with open('src/components/admin/UserManager.tsx', 'r') as f:
    content = f.read()

content = content.replace("    email: '',\n      badgeNumber: user.badgeNumber,", "      badgeNumber: user.badgeNumber,")

with open('src/components/admin/UserManager.tsx', 'w') as f:
    f.write(content)
