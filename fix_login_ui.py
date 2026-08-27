import re

with open('src/components/LoginModal.tsx', 'r') as f:
    content = f.read()

# Remove quick login helper
pattern = re.compile(r'\{\/\* Quick login helper with default admin credentials \*\/\}.*?<\/form>', re.DOTALL)
content = pattern.sub('</form>', content)

# Remove "Sluiten" button
pattern2 = re.compile(r'<\s*button\s*type="button"\s*onClick=\{onClose\}\s*className="hover:text-zinc-300 transition text-zinc-400 font-medium"\s*>\s*Sluiten\s*<\s*/\s*button\s*>', re.DOTALL)
content = pattern2.sub('<span>Sessie verlopen. Log opnieuw in.</span>', content)

with open('src/components/LoginModal.tsx', 'w') as f:
    f.write(content)
