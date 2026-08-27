import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

# Helper to inject checkPermission
def inject_check(method_name, permission, action, error_msg):
    global content
    
    # We look for public methodName(..., userContext: { userId: string; userName: string; userRole: UserRole... }) {
    # and insert check
    pattern = re.compile(r'(public ' + method_name + r'\([^)]*(?:userContext|adminContext):\s*\{[^}]*userRole[^}]*\}[^)]*\)\s*(?::\s*[^{]+)?\s*\{)')
    
    check_code = f"""
    if (!this.checkPermission(arguments[1]?.userRole || arguments[2]?.userRole || arguments[0]?.userRole || 'PATROL_OFFICER', '{permission}')) {{
      throw new Error('{error_msg}');
    }}
"""
    # Wait, using arguments is brittle in TS. Let's do it explicitly per method.

methods = [
    ("createMutation", "MUTATION_CREATE", "userContext.userRole", "U heeft geen rechten om mutaties aan te maken."),
    ("updateMutation", "MUTATION_AMEND", "userContext.userRole", "U heeft geen rechten om mutaties te wijzigen."),
    ("validateMutation", "DOSSIER_VALIDATE", "userContext.userRole", "U heeft geen rechten om dossiers te valideren."),
    ("saveRoleDefinition", "PERMISSIONS_MANAGE", "adminContext.userRole", "U heeft geen rechten om rollen te beheren."),
    ("deleteRoleDefinition", "PERMISSIONS_MANAGE", "adminContext.userRole", "U heeft geen rechten om rollen te beheren."),
    ("savePermissionsMatrix", "PERMISSIONS_MANAGE", "adminContext.userRole", "U heeft geen rechten om rollen te beheren."),
    ("createAdminUser", "USER_MANAGE", "adminContext.userRole", "U heeft geen rechten om gebruikers te beheren."),
    ("updateAdminUser", "USER_MANAGE", "adminContext.userRole", "U heeft geen rechten om gebruikers te beheren."),
    ("deleteAdminUser", "USER_MANAGE", "adminContext.userRole", "U heeft geen rechten om gebruikers te verwijderen."),
    ("saveBrigade", "BRIGADE_MANAGE", "adminContext.userRole", "U heeft geen rechten om brigades te beheren."),
    ("deleteBrigade", "BRIGADE_MANAGE", "adminContext.userRole", "U heeft geen rechten om brigades te beheren."),
]

for method, perm, context_role, err in methods:
    # Find the method start:
    search_str = f"  public {method}("
    idx = content.find(search_str)
    if idx == -1:
        continue
        
    # Find the first '{' after idx
    brace_idx = content.find('{', idx)
    if brace_idx == -1:
        continue
        
    injection = f"""
    if (!this.checkPermission({context_role}, '{perm}')) {{
      throw new Error('{err}');
    }}"""
    
    content = content[:brace_idx+1] + injection + content[brace_idx+1:]


with open('src/server/db.ts', 'w') as f:
    f.write(content)
