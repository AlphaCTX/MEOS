import re

with open('server.ts', 'r') as f:
    content = f.read()

old_stats_route = """  app.get('/api/stats', (_req: Request, res: Response) => {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  });"""

new_stats_route = """  app.get('/api/stats', (req: Request, res: Response) => {
    const badgeNumber = req.header('x-user-badge');
    let userBrigade = undefined;
    if (badgeNumber) {
      const users = Array.from(db['users'].values());
      const user = users.find(u => u.badgeNumber === badgeNumber);
      if (user) {
        userBrigade = user.activeBrigade;
      }
    }
    const stats = db.getStats(badgeNumber, userBrigade);
    res.json({ success: true, data: stats });
  });"""

content = content.replace(old_stats_route, new_stats_route)

with open('server.ts', 'w') as f:
    f.write(content)
