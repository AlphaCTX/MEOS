with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

dynamic_menu = """
  const hasPerm = (perm: string) => currentSession.permissions?.includes(perm) || currentSession.isAdmin;

  const menuItems: Array<{ id: string; icon: any; label: string; iconColor?: string; highlight?: boolean }> = [
    { id: 'feed', icon: FileText, label: 'Mutaties' }
  ];

  if (hasPerm('MUTATION_CREATE')) {
    menuItems.push({ id: 'wizard', icon: PlusCircle, label: 'Nieuwe Mutatie', iconColor: 'text-emerald-400' });
  }

  menuItems.push({ id: 'profile', icon: User, label: 'Mijn Profiel', iconColor: 'text-amber-300' });
  menuItems.push({ id: 'entities', icon: Users, label: 'Entiteiten & RDW' });

  if (hasPerm('USER_MANAGE') || hasPerm('BRIGADE_MANAGE') || hasPerm('PERMISSIONS_MANAGE')) {
    menuItems.push({ id: 'admin', icon: ShieldCheck, label: 'Admin Beheer', highlight: true });
  }

  menuItems.push({ id: 'audit', icon: History, label: 'Auditlog' });
"""

old_menu = """  const menuItems: Array<{ id: string; icon: any; label: string; iconColor?: string; highlight?: boolean }> = [
    { id: 'feed', icon: FileText, label: 'Mutaties' },
    { id: 'wizard', icon: PlusCircle, label: 'Nieuwe Mutatie', iconColor: 'text-emerald-400' },
    { id: 'profile', icon: User, label: 'Mijn Profiel', iconColor: 'text-amber-300' },
    { id: 'entities', icon: Users, label: 'Entiteiten & RDW' },
    { id: 'admin', icon: ShieldCheck, label: 'Admin Beheer', highlight: true },
    { id: 'audit', icon: History, label: 'Auditlog' },
  ];"""

content = content.replace(old_menu, dynamic_menu)

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
