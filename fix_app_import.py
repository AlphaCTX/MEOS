import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { MutationRecord, SystemStats, SearchFilterParams } from './types/index.js';", "import { MutationRecord, SystemStats, SearchFilterParams, UserSession } from './types/index.js';")

with open('src/App.tsx', 'w') as f:
    f.write(content)
