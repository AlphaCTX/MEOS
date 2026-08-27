import re

with open('src/components/LoginModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("const [username, setUsername] = useState('AlphaCTX');", "const [username, setUsername] = useState('');")
content = content.replace("const [password, setPassword] = useState('Stormpie1!');", "const [password, setPassword] = useState('');")

with open('src/components/LoginModal.tsx', 'w') as f:
    f.write(content)
