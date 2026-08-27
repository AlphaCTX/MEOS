import re

# Update src/server/db.ts
with open('src/server/db.ts', 'r') as f:
    content = f.read()

# Add email to UserAccount interface
content = content.replace("  rank: string;", "  rank: string;\n  email?: string;")

# Add email to initial users (AlphaCTX, etc.)
content = content.replace("      department: 'Korpsleiding & Systeembeheer',", "      department: 'Korpsleiding & Systeembeheer',\n      email: 'alphactx@marechaussee.nl',")
content = content.replace("      department: 'Bereden Brigade',", "      department: 'Bereden Brigade',\n      email: 'j.v.doorn@marechaussee.nl',")

# In updateAdminUser and createAdminUser, make sure email is passed
if 'email?: string;' not in content:
    content = content.replace("    password?: string;", "    password?: string;\n    email?: string;")

if "email: userData.email," not in content:
    content = content.replace("department: userData.department,", "department: userData.department,\n      email: userData.email,")

if "email: updateData.email !== undefined ? updateData.email : existing.email," not in content:
    content = content.replace("department: updateData.department || existing.department,", "department: updateData.department || existing.department,\n      email: updateData.email !== undefined ? updateData.email : existing.email,")

# Also for public methods, we need updateProfile
if "updateProfile" not in content:
    profile_method = """
  public updateProfile(
    userId: string,
    updateData: { email?: string; currentPassword?: string; newPassword?: string }
  ): UserAccount {
    const existing = this.users.get(userId.toLowerCase());
    if (!existing) throw new Error('Gebruiker niet gevonden');
    
    if (updateData.newPassword) {
      if (existing.passwordHash !== updateData.currentPassword) {
        throw new Error('Huidig wachtwoord is onjuist');
      }
      existing.passwordHash = updateData.newPassword;
    }
    
    if (updateData.email !== undefined) {
      existing.email = updateData.email;
    }
    
    this.logAudit({
      action: 'USER_UPDATE_PROFILE',
      userId: existing.username,
      userName: existing.name,
      userRole: existing.role,
      targetId: existing.username,
      details: 'Profiel bijgewerkt (wachtwoord/email)',
      timestamp: new Date().toISOString()
    });
    
    return { ...existing, passwordHash: '••••••••' };
  }
"""
    content = content.replace("  public createAdminUser", profile_method + "\n  public createAdminUser")

with open('src/server/db.ts', 'w') as f:
    f.write(content)

# Update server.ts
with open('server.ts', 'r') as f:
    server_content = f.read()

profile_endpoints = """
  app.put('/api/user/profile', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      const updated = db.updateProfile(userCtx.userId, req.body);
      res.json({ success: true, data: updated, message: 'Profiel succesvol bijgewerkt' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });
"""
if "/api/user/profile" not in server_content:
    server_content = server_content.replace("app.get('/api/users'", profile_endpoints + "\n  app.get('/api/users'")

with open('server.ts', 'w') as f:
    f.write(server_content)
