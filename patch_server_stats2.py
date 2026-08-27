import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("db['users']", "(db as any).users")

with open('server.ts', 'w') as f:
    f.write(content)
