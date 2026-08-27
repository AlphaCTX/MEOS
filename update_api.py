import re

with open('src/services/api.ts', 'r') as f:
    content = f.read()

# Make sure RoleDefinition is imported
if 'RoleDefinition' not in content:
    content = content.replace('RolePermissionMatrix,', 'RolePermissionMatrix,\n  RoleDefinition,')

# update getPermissionsMatrix signature
if 'Promise<{ matrix: RolePermissionMatrix; definitions: PermissionDefinition[] }>' in content:
    content = content.replace(
        'Promise<{ matrix: RolePermissionMatrix; definitions: PermissionDefinition[] }>',
        'Promise<{ matrix: RolePermissionMatrix; definitions: PermissionDefinition[]; roles: RoleDefinition[] }>'
    )

content = content.replace(
    'return { matrix: db.getPermissionsMatrix(), definitions: db.getPermissionDefinitions() };',
    'return { matrix: db.getPermissionsMatrix(), definitions: db.getPermissionDefinitions(), roles: db.getRoleDefinitions() };'
)

# add saveRole and deleteRole
methods_str = """
  static async saveRole(role: RoleDefinition): Promise<void> {
    await this.delay();
    const db = this.getDb();
    const session = this.getUserSession();
    db.saveRoleDefinition({ userId: session.userId, userName: session.userName, userRole: session.role }, role);
  }

  static async deleteRole(roleId: string): Promise<void> {
    await this.delay();
    const db = this.getDb();
    const session = this.getUserSession();
    db.deleteRoleDefinition({ userId: session.userId, userName: session.userName, userRole: session.role }, roleId);
  }
"""

content = content.replace('static async savePermissionsMatrix', methods_str + '\n  static async savePermissionsMatrix')

# in getUsers, we might need roles to render them correctly? Wait, UserManager already imports roles, but since they are dynamic now, UserManager should probably fetch roles too, or we can fetch them via getPermissionsMatrix.

with open('src/services/api.ts', 'w') as f:
    f.write(content)
