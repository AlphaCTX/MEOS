import re

with open('src/types/index.ts', 'r') as f:
    content = f.read()

old_stats = """export interface SystemStats {
  totalMutations: number;
  draftsCount: number;
  finalCount: number;
  amendedCount: number;
  todayCount: number;
  activePersonsWithCaution: number;
  stolenVehiclesTracked: number;
  seizedEvidenceCount: number;
  arrestsCount: number;
  reportsCount: number;
}"""

new_stats = """export interface SystemStats {
  totalMutations: number;
  draftsCount: number;
  finalCount: number;
  amendedCount: number;
  todayCount: number;
  activePersonsWithCaution: number;
  stolenVehiclesTracked: number;
  seizedEvidenceCount: number;
  arrestsCount: number;
  reportsCount: number;
  myMutationsCount?: number;
  brigadeMutationsCount?: number;
}"""

content = content.replace(old_stats, new_stats)

with open('src/types/index.ts', 'w') as f:
    f.write(content)
