import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

init_users_pattern = re.compile(r'private initUsers\(\): void \{.*?\n  \}', re.DOTALL)
new_init_users = """private initUsers(): void {
    // Default Admin Account (AlphaCTX / Stormpie1!)
    this.users.set('alphactx', {
      username: 'AlphaCTX',
      passwordHash: 'Stormpie1!',
      badgeNumber: 'ADM-01',
      name: 'Systeembeheerder AlphaCTX',
      rank: 'Luitenant-kolonel',
      role: 'ADMIN',
      department: 'Korpsstaf & MEOS Systeembeheer',
      activeBrigade: 'BRIGADE-HQ-COMMAND',
      activeUnit: 'BRIGADE-HQ-COMMAND',
      isActive: true,
    });
  }"""

content = init_users_pattern.sub(new_init_users, content)

with open('src/server/db.ts', 'w') as f:
    f.write(content)
