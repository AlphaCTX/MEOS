import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

old_get_stats = """  public getStats(): SystemStats {
    const list = Array.from(this.mutations.values());"""

new_get_stats = """  public getStats(userBadge?: string, userBrigade?: string): SystemStats {
    const list = Array.from(this.mutations.values());"""
content = content.replace(old_get_stats, new_get_stats)

old_return = """    return {
      totalMutations: list.length,
      draftsCount,
      finalCount,
      amendedCount,
      todayCount,
      activePersonsWithCaution,
      stolenVehiclesTracked,
      seizedEvidenceCount,
      arrestsCount,
      reportsCount,
    };
  }"""

new_return = """
    let myMutationsCount = 0;
    let brigadeMutationsCount = 0;
    
    if (userBadge) {
      myMutationsCount = list.filter(m => m.authorBadge === userBadge).length;
    }
    if (userBrigade) {
      brigadeMutationsCount = list.filter(m => m.authorBrigade === userBrigade).length;
    }

    return {
      totalMutations: list.length,
      draftsCount,
      finalCount,
      amendedCount,
      todayCount,
      activePersonsWithCaution,
      stolenVehiclesTracked,
      seizedEvidenceCount,
      arrestsCount,
      reportsCount,
      myMutationsCount,
      brigadeMutationsCount
    };
  }"""
content = content.replace(old_return, new_return)

with open('src/server/db.ts', 'w') as f:
    f.write(content)
