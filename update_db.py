import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

# Add RoleDefinition to imports if not there (it's already exported in types, let's just make sure it's imported)
if 'RoleDefinition' not in content:
    content = content.replace('RolePermissionMatrix,', 'RolePermissionMatrix,\n  RoleDefinition,')

# Add DEFAULT_ROLES before LawEnforcementDatabase
default_roles_str = """
export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'ADMIN',
    title: 'Systeembeheerder (ADMIN)',
    desc: 'Volledige beheerrechten & auditrechten',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30',
  },
  {
    id: 'WATCH_COMMANDER',
    title: 'Hulp-Officier / Wachtcommandant',
    desc: 'Dossierautorisatie, dwangmiddelen & validatie',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
  },
  {
    id: 'INVESTIGATOR',
    title: 'Rechercheur / Onderzoeker',
    desc: 'Uitgebreide opsporing & dossierinzage',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'PATROL_OFFICER',
    title: 'Patrouilleur / Verbalisant',
    desc: 'Ambtelijke registratie & waarnemingen',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30',
  }
];
"""

content = content.replace('class LawEnforcementDatabase {', default_roles_str + '\nclass LawEnforcementDatabase {')

# Add roles to LawEnforcementDatabase
content = content.replace('private rolePermissions: RolePermissionMatrix', 'private roleDefinitions: RoleDefinition[] = JSON.parse(JSON.stringify(DEFAULT_ROLES));\n  private rolePermissions: RolePermissionMatrix')

# Add getters/setters for roles inside LawEnforcementDatabase
methods_str = """
  public getRoleDefinitions(): RoleDefinition[] {
    return this.roleDefinitions;
  }

  public saveRoleDefinition(adminContext: { userId: string; userName: string; userRole: UserRole }, role: RoleDefinition): void {
    if (!this.checkPermission(adminContext.userRole, 'PERMISSIONS_MANAGE')) {
      this.logSecurityEvent(adminContext, 'ROLE_SAVE_DENIED', 'Attempt to save role without permission');
      throw new Error('Onvoldoende rechten om profielen te bewerken');
    }
    const idx = this.roleDefinitions.findIndex(r => r.id === role.id);
    if (idx >= 0) {
      this.roleDefinitions[idx] = role;
    } else {
      this.roleDefinitions.push(role);
      // add default empty permissions
      if (!this.rolePermissions[role.id]) {
        this.rolePermissions[role.id] = {};
        PERMISSION_DEFINITIONS.forEach(def => {
          this.rolePermissions[role.id][def.key] = false;
        });
      }
    }
  }

  public deleteRoleDefinition(adminContext: { userId: string; userName: string; userRole: UserRole }, roleId: string): void {
    if (!this.checkPermission(adminContext.userRole, 'PERMISSIONS_MANAGE')) {
      this.logSecurityEvent(adminContext, 'ROLE_DELETE_DENIED', 'Attempt to delete role without permission');
      throw new Error('Onvoldoende rechten om profielen te verwijderen');
    }
    
    // Check if any users have this role
    let hasUsers = false;
    for (const user of this.users.values()) {
      if (user.role === roleId) {
        hasUsers = true;
        break;
      }
    }
    if (hasUsers) {
      throw new Error('Kan dit profiel niet verwijderen omdat er nog gebruikers aan gekoppeld zijn');
    }

    this.roleDefinitions = this.roleDefinitions.filter(r => r.id !== roleId);
    delete this.rolePermissions[roleId];
  }
"""

content = content.replace('public getPermissionsMatrix():', methods_str + '\n  public getPermissionsMatrix():')

# Also, need to update getPermissionsMatrix output if needed? No, wait, ApiService will need updating too.
with open('src/server/db.ts', 'w') as f:
    f.write(content)
