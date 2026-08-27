import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

old_update = """  public updateBrigade(
    code: string,
    updateData: Partial<BrigadeEntity>,
    adminContext: { userId: string; userName: string; userRole: UserRole }
  ): BrigadeEntity {
    const cleanCode = (code || '').trim().toUpperCase();
    const existing = this.brigades.get(cleanCode);
    if (!existing) {
      throw new Error(`Brigade met code "${code}" niet gevonden.`);
    }

    const updated: BrigadeEntity = {
      ...existing,
      name: updateData.name ? updateData.name.trim() : existing.name,
      region: updateData.region ? updateData.region.trim() : existing.region,
      taskType: updateData.taskType ? updateData.taskType.trim() : existing.taskType,
      stationLocation: updateData.stationLocation ? updateData.stationLocation.trim() : existing.stationLocation,
      commanderBadge: updateData.commanderBadge !== undefined ? updateData.commanderBadge.trim() : existing.commanderBadge,
      description: updateData.description !== undefined ? updateData.description.trim() : existing.description,
      isActive: updateData.isActive !== undefined ? updateData.isActive : existing.isActive,
    };

    this.brigades.set(cleanCode, updated);"""

new_update = """  public updateBrigade(
    code: string,
    updateData: Partial<BrigadeEntity>,
    adminContext: { userId: string; userName: string; userRole: UserRole }
  ): BrigadeEntity {
    const cleanCode = (code || '').trim().toUpperCase();
    const existing = this.brigades.get(cleanCode);
    if (!existing) {
      throw new Error(`Brigade met code "${code}" niet gevonden.`);
    }

    let newCode = cleanCode;
    if (updateData.code && updateData.code.trim().toUpperCase() !== cleanCode) {
      newCode = updateData.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if (cleanCode === 'BRIGADE-HQ-COMMAND') {
        throw new Error('De code van de Staf/HQ Brigade kan niet worden gewijzigd.');
      }
      if (this.brigades.has(newCode)) {
        throw new Error(`Er bestaat al een brigade met code "${newCode}".`);
      }
    }

    const updated: BrigadeEntity = {
      ...existing,
      code: newCode,
      name: updateData.name ? updateData.name.trim() : existing.name,
      region: updateData.region ? updateData.region.trim() : existing.region,
      taskType: updateData.taskType ? updateData.taskType.trim() : existing.taskType,
      stationLocation: updateData.stationLocation ? updateData.stationLocation.trim() : existing.stationLocation,
      commanderBadge: updateData.commanderBadge !== undefined ? updateData.commanderBadge.trim() : existing.commanderBadge,
      description: updateData.description !== undefined ? updateData.description.trim() : existing.description,
      isActive: updateData.isActive !== undefined ? updateData.isActive : existing.isActive,
    };

    if (newCode !== cleanCode) {
      this.brigades.delete(cleanCode);
      for (const [username, user] of this.users.entries()) {
        let changed = false;
        if (user.activeBrigade === cleanCode) {
          user.activeBrigade = newCode;
          changed = true;
        }
        if (user.activeUnit === cleanCode) {
          user.activeUnit = newCode;
          changed = true;
        }
        if (changed) {
          this.users.set(username, user);
        }
      }
    }
    this.brigades.set(newCode, updated);"""

if old_update in content:
    content = content.replace(old_update, new_update)
else:
    print("Could not find old update function in db.ts")

with open('src/server/db.ts', 'w') as f:
    f.write(content)
