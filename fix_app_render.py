import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

if "import { LoginModal }" not in content:
    content = content.replace("import { Header } from './components/Header.js';", "import { Header } from './components/Header.js';\nimport { LoginModal } from './components/LoginModal.js';")

# We want to replace the `return (` of MainApp to check for currentOfficer
mainapp_render = """
  if (!currentOfficer) {
    return (
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight
          ? 'bg-[#F3F5F8] text-[#1A202C] selection:bg-[#154273] selection:text-white'
          : 'bg-[#080E18] text-zinc-100 selection:bg-blue-600 selection:text-white'
      }`}>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} onClearData={handleClearData} onAuthChange={setCurrentOfficer} />
        <LoginModal onClose={() => {}} onSuccess={setCurrentOfficer} />
      </div>
    );
  }

  return ("""

pattern = re.compile(r'  return \(\n    <div\n      className=\{`min-h-screen')
content = pattern.sub(mainapp_render + "\n    <div\n      className={`min-h-screen", content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
