import re

with open('src/services/api.ts', 'r') as f:
    content = f.read()

# Fix getPermissionsMatrix return type
content = content.replace('Promise<{ matrix: any; definitions: any[] }>', 'Promise<any>')

# Rewrite saveRole and deleteRole to use fetch
fetch_methods = """
  public static async saveRole(role: RoleDefinition): Promise<void> {
    const res = await fetch('/api/admin/roles', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ role }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij opslaan profiel');
  }

  public static async deleteRole(roleId: string): Promise<void> {
    const res = await fetch(`/api/admin/roles/${roleId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Fout bij verwijderen profiel');
  }
"""

# Replace the wrong ones
wrong_methods = """  static async saveRole(role: RoleDefinition): Promise<void> {
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
  }"""

content = content.replace(wrong_methods, fetch_methods)

with open('src/services/api.ts', 'w') as f:
    f.write(content)
