import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

# Fix savePermissionsMatrix signature
content = content.replace("    newMatrix: RolePermissionMatrix,\n  RoleDefinition,\n    adminContext", "    newMatrix: RolePermissionMatrix,\n    adminContext")

# Fix logAudit calls in saveRoleDefinition and deleteRoleDefinition
bad_log_save = """    this.logAudit({
      action: 'PERMISSIONS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      targetId: 'ROLE_' + role.id,
      details: 'Opgeslagen profiel: ' + role.title,
      timestamp: new Date().toISOString()
    });"""

good_log_save = """    this.logAudit({
      action: 'PERMISSIONS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      metadata: 'Opgeslagen profiel: ' + role.title,
    });"""

content = content.replace(bad_log_save, good_log_save)

bad_log_delete = """    this.logAudit({
      action: 'PERMISSIONS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      targetId: 'ROLE_' + roleId,
      details: 'Verwijderd profiel: ' + roleId,
      timestamp: new Date().toISOString()
    });"""

good_log_delete = """    this.logAudit({
      action: 'PERMISSIONS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      metadata: 'Verwijderd profiel: ' + roleId,
    });"""

content = content.replace(bad_log_delete, good_log_delete)

with open('src/server/db.ts', 'w') as f:
    f.write(content)

with open('src/services/api.ts', 'r') as f:
    content_api = f.read()

content_api = content_api.replace("static async saveRole(role: RoleDefinition)", "static async saveRole(role: import('../types/index.js').RoleDefinition)")
content_api = content_api.replace("RolePermissionMatrix,", "RolePermissionMatrix, RoleDefinition,")

with open('src/services/api.ts', 'w') as f:
    f.write(content_api)
