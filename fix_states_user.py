import re

with open('src/components/admin/UserManager.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const [showModal, setShowModal] = useState(false);", "  const [showModal, setShowModal] = useState(false);\n  const [userToDelete, setUserToDelete] = useState<{username: string, name: string} | null>(null);")

with open('src/components/admin/UserManager.tsx', 'w') as f:
    f.write(content)
