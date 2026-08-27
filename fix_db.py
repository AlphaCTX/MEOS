import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

bad_save = """  public saveRoleDefinition(adminContext: { userId: string; userName: string; userRole: UserRole }, role: RoleDefinition): void {
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
  }"""

good_save = """  public saveRoleDefinition(
    adminContext: { userId: string; userName: string; userRole: UserRole },
    role: RoleDefinition
  ): void {
    const idx = this.roleDefinitions.findIndex(r => r.id === role.id);
    if (idx >= 0) {
      this.roleDefinitions[idx] = role;
    } else {
      this.roleDefinitions.push(role);
      if (!this.rolePermissions[role.id]) {
        this.rolePermissions[role.id] = {};
        PERMISSION_DEFINITIONS.forEach(def => {
          this.rolePermissions[role.id][def.key] = false;
        });
      }
    }
    this.logAudit({
      action: 'PERMISSIONS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      targetId: 'ROLE_' + role.id,
      details: 'Opgeslagen profiel: ' + role.title,
      timestamp: new Date().toISOString()
    });
  }"""

content = content.replace(bad_save, good_save)

bad_delete = """  public deleteRoleDefinition(adminContext: { userId: string; userName: string; userRole: UserRole }, roleId: string): void {
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
  }"""

good_delete = """  public deleteRoleDefinition(
    adminContext: { userId: string; userName: string; userRole: UserRole },
    roleId: string
  ): void {
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
    this.logAudit({
      action: 'PERMISSIONS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      targetId: 'ROLE_' + roleId,
      details: 'Verwijderd profiel: ' + roleId,
      timestamp: new Date().toISOString()
    });
  }"""

content = content.replace(bad_delete, good_delete)

# Also fix getPermissionsMatrix return. In server.ts, does it return roles? Let's check getPermissionsMatrix
content = content.replace('  public getPermissionsMatrix(): RolePermissionMatrix {\n    return this.rolePermissions;\n  }', '  public getPermissionsMatrix(): any {\n    return { matrix: this.rolePermissions, definitions: PERMISSION_DEFINITIONS, roles: this.roleDefinitions };\n  }')

# But wait, api.ts probably fetches from an endpoint in server.ts. Let's see what endpoint returns.

with open('src/server/db.ts', 'w') as f:
    f.write(content)
