import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

old_my_mutations = """<div className="text-2xl font-bold text-indigo-400 font-mono">{mutations.filter(m => m.authorBadge === session?.badgeNumber).length}</div>"""
new_my_mutations = """<div className="text-2xl font-bold text-indigo-400 font-mono">{stats.myMutationsCount || 0}</div>"""
content = content.replace(old_my_mutations, new_my_mutations)

old_brigade_mutations = """<div className="text-2xl font-bold text-emerald-400 font-mono">{mutations.filter(m => m.authorBrigade === session?.activeBrigade).length}</div>"""
new_brigade_mutations = """<div className="text-2xl font-bold text-emerald-400 font-mono">{stats.brigadeMutationsCount || 0}</div>"""
content = content.replace(old_brigade_mutations, new_brigade_mutations)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
