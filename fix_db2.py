import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

bad = """  public getPermissionsMatrix(): { matrix: RolePermissionMatrix; definitions: PermissionDefinition[] } {
    return {
      matrix: JSON.parse(JSON.stringify(this.rolePermissions)),
      definitions: PERMISSION_DEFINITIONS,
    };
  }"""

good = """  public getPermissionsMatrix(): any {
    return {
      matrix: JSON.parse(JSON.stringify(this.rolePermissions)),
      definitions: PERMISSION_DEFINITIONS,
      roles: this.roleDefinitions,
    };
  }"""

content = content.replace(bad, good)

with open('src/server/db.ts', 'w') as f:
    f.write(content)
