import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

# Strip all instances of:
#     if (!this.checkPermission(..., '...')) {
#       throw new Error('...');
#     }
pattern = re.compile(r'\s*if \(\!this\.checkPermission\([^\)]+\)\) \{\s*throw new Error\(\'[^\']+\'\);\s*\}', re.DOTALL)
content = pattern.sub('', content)

# Also fix the checkPermission method I added earlier which probably got preserved or stripped?
# Actually, checkPermission itself doesn't throw an error, it returns boolean. So it's safe from the regex.

with open('src/server/db.ts', 'w') as f:
    f.write(content)
