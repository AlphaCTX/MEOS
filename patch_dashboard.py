import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Add UserSession import if missing
if "UserSession" not in content.split('} from \'../types/index.js\';')[0]:
    content = content.replace("MutationType,", "MutationType,\n  UserSession,")

# Add session to DashboardProps
old_props = """interface DashboardProps {
  mutations: MutationRecord[];"""
new_props = """interface DashboardProps {
  session: UserSession | null;
  mutations: MutationRecord[];"""
content = content.replace(old_props, new_props)

old_fc = """export const Dashboard: React.FC<DashboardProps> = ({
  mutations,"""
new_fc = """export const Dashboard: React.FC<DashboardProps> = ({
  session,
  mutations,"""
content = content.replace(old_fc, new_fc)

# Replace the grid
old_grid_start = """      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">"""

old_grid_end = """<div className="text-[11px] text-zinc-500">Inclusief RDW registraties</div>
          </div>
        </div>
      )}"""

# We'll use regex to replace the entire block
# Wait, it's safer to just find the indices and slice
start_idx = content.find("      {/* KPI Stats Grid */}")
end_idx = content.find("      {/* Main Search & Advanced Filter Section */}")

if start_idx != -1 and end_idx != -1:
    new_grid = """      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div
            onClick={() => onFilterChange({ category: 'ALL', status: 'ALL' })}
            className="p-3.5 rounded-2xl bg-[#0c0c0e] border border-zinc-800 hover:border-zinc-700 transition cursor-pointer shadow-md"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Totaal Mutaties</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-100 font-mono">{stats.totalMutations}</div>
            <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-0.5">
              <span>{stats.todayCount} vandaag geregistreerd</span>
            </div>
          </div>
          <div
            onClick={() => onFilterChange({ serviceNumber: session?.badgeNumber })}
            className={`p-3.5 rounded-2xl bg-[#0c0c0e] border transition cursor-pointer shadow-md ${
              filters.serviceNumber === session?.badgeNumber
                ? 'border-indigo-500 bg-indigo-950/20'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Mijn mutaties</span>
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">{mutations.filter(m => m.authorBadge === session?.badgeNumber).length}</div>
            <div className="text-[11px] text-zinc-500">Mutaties door jou geregistreerd</div>
          </div>
          <div
            className="p-3.5 rounded-2xl bg-[#0c0c0e] border border-zinc-800 shadow-md"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Mutaties Huidige brigade</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{mutations.filter(m => m.authorBrigade === session?.activeBrigade).length}</div>
            <div className="text-[11px] text-zinc-500">{session?.activeBrigade || 'Geen brigade gekoppeld'}</div>
          </div>
        </div>
      )}
"""
    content = content[:start_idx] + new_grid + content[end_idx:]
else:
    print("Could not find grid boundaries.")

# Add User import if missing
if "User," not in content:
    content = content.replace("Users,", "Users,\n  User,")

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
