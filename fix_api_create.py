with open('src/services/api.ts', 'r') as f:
    content = f.read()

content = content.replace("password?: string;", "password?: string;\n    email?: string;")
with open('src/services/api.ts', 'w') as f:
    f.write(content)
