with open('src/types/index.ts', 'r') as f:
    content = f.read()

content = content.replace("department: string;", "department: string;\n  email?: string;")

with open('src/types/index.ts', 'w') as f:
    f.write(content)
