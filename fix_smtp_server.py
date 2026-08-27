import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

smtp_state = """
  private smtpSettings: any = {
    host: '',
    port: '587',
    user: '',
    pass: '',
    fromEmail: 'noreply@marechaussee.nl',
    fromName: 'MEOS Systeem'
  };

  public getSmtpSettings(): any {
    return this.smtpSettings;
  }

  public saveSmtpSettings(adminContext: { userId: string; userName: string; userRole: string }, settings: any): any {
    this.smtpSettings = { ...this.smtpSettings, ...settings };
    this.logAudit({
      action: 'SYSTEM_SETTINGS_UPDATE',
      userId: adminContext.userId,
      userName: adminContext.userName,
      userRole: adminContext.userRole,
      metadata: 'SMTP instellingen bijgewerkt',
    });
    return this.smtpSettings;
  }
"""

if "smtpSettings:" not in content:
    content = content.replace("private sequenceCounter: number = 1000;", "private sequenceCounter: number = 1000;\n" + smtp_state)

with open('src/server/db.ts', 'w') as f:
    f.write(content)

with open('server.ts', 'r') as f:
    server_content = f.read()

smtp_endpoints = """
  app.get('/api/admin/smtp', (req: Request, res: Response) => {
    try {
      getOfficerContext(req); // just check auth
      res.json({ success: true, data: db.getSmtpSettings() });
    } catch(err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  });

  app.put('/api/admin/smtp', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      const updated = db.saveSmtpSettings(userCtx, req.body);
      res.json({ success: true, data: updated, message: 'SMTP instellingen opgeslagen' });
    } catch(err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  });
"""

if "/api/admin/smtp" not in server_content:
    server_content = server_content.replace("app.get('/api/admin/permissions'", smtp_endpoints + "\n  app.get('/api/admin/permissions'")

with open('server.ts', 'w') as f:
    f.write(server_content)
