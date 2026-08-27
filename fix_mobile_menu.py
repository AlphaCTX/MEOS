import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r'<\s*button\s*onClick=\{\(\) => \{\s*setIsLoginModalOpen\(true\);\s*setIsMobileMenuOpen\(false\);\s*\}\}[\s\S]*?Sessie Wisselen \(Test\)[\s\S]*?<\s*/\s*button\s*>[\s\S]*?<\s*button\s*onClick=\{\(\) => \{\s*onClearData\(\);\s*setIsMobileMenuOpen\(false\);\s*\}\}[\s\S]*?Systeem Herstarten[\s\S]*?<\s*/\s*button\s*>', re.DOTALL)
# wait, maybe the text wasn't exactly 'Sessie Wisselen (Test)' because I already replaced it! Let's check.
