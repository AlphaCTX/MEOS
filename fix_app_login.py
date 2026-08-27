import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("<LoginModal onClose={() => {}} onSuccess={setCurrentOfficer} />", "<LoginModal isOpen={true} onClose={() => {}} onLoginSuccess={setCurrentOfficer} />")

with open('src/App.tsx', 'w') as f:
    f.write(content)
