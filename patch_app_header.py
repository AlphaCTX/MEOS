import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("<Header activeTab={activeTab}", "<Header session={currentOfficer} activeTab={activeTab}")
content = content.replace("<Header\n        activeTab={activeTab}", "<Header\n        session={currentOfficer}\n        activeTab={activeTab}")

with open('src/App.tsx', 'w') as f:
    f.write(content)
