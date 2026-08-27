import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("<Dashboard\n            mutations={mutations}", "<Dashboard\n            session={currentOfficer}\n            mutations={mutations}")

with open('src/App.tsx', 'w') as f:
    f.write(content)
