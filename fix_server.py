import re

with open('server.ts', 'r') as f:
    content = f.read()

# Add endpoints for /api/admin/roles
new_endpoints = """
  app.post('/api/admin/roles', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      db.saveRoleDefinition(userCtx, req.body.role);
      res.json({ success: true, message: 'Profiel succesvol opgeslagen' });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/admin/roles/:id', (req: Request, res: Response) => {
    try {
      const userCtx = getOfficerContext(req);
      db.deleteRoleDefinition(userCtx, req.params.id);
      res.json({ success: true, message: 'Profiel succesvol verwijderd' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });
"""

if "app.post('/api/admin/roles'" not in content:
    content = content.replace("app.put('/api/admin/permissions',", new_endpoints + "\n  app.put('/api/admin/permissions',")

with open('server.ts', 'w') as f:
    f.write(content)
