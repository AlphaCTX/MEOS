import re

with open('server.ts', 'r') as f:
    content = f.read()

pattern = re.compile(r'\s*app\.post\(\'/api/admin/seed-kmar\', \(req: Request, res: Response\) => \{.*?\n  \}\);\n', re.DOTALL)
content = pattern.sub('', content)

with open('server.ts', 'w') as f:
    f.write(content)
