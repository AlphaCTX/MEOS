import re

with open('src/components/admin/BrigadeManager.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const [showModal, setShowModal] = useState(false);", "  const [showModal, setShowModal] = useState(false);\n  const [brigadeToDelete, setBrigadeToDelete] = useState<{code: string, name: string} | null>(null);")

with open('src/components/admin/BrigadeManager.tsx', 'w') as f:
    f.write(content)
