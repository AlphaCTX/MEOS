import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace state and useEffect
old_state = """  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<"""

new_state = """  const [showSplash, setShowSplash] = useState(true);
  const [isFadingSplash, setIsFadingSplash] = useState(false);
  const [activeTab, setActiveTab] = useState<"""
content = content.replace(old_state, new_state)

old_effect = """  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);"""

new_effect = """  useEffect(() => {
    const timer1 = setTimeout(() => setIsFadingSplash(true), 2000);
    const timer2 = setTimeout(() => setShowSplash(false), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);"""
content = content.replace(old_effect, new_effect)

# Remove the top-level splash
old_splash_block = """  if (showSplash) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans transition-colors duration-500 ${
        isLight
          ? 'bg-[#F3F5F8] text-[#1A202C]'
          : 'bg-[#080E18] text-zinc-100'
      }`}>
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">MEOS</h1>
          <p className="text-sm opacity-60">Mobiel Effectief Op Straat</p>
          
          <div className="mt-8 flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }"""
content = content.replace(old_splash_block, "")

# Add the splash as an overlay inside `if (!currentOfficer)`
old_not_officer = """  if (!currentOfficer) {
    return (
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight
          ? 'bg-[#F3F5F8] text-[#1A202C] selection:bg-[#154273] selection:text-white'
          : 'bg-[#080E18] text-zinc-100 selection:bg-blue-600 selection:text-white'
      }`}>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} onClearData={handleClearData} onAuthChange={setCurrentOfficer} />
        <LoginModal isOpen={true} onClose={() => {}} onLoginSuccess={setCurrentOfficer} />
      </div>
    );
  }"""

new_not_officer = """  if (!currentOfficer) {
    return (
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight
          ? 'bg-[#F3F5F8] text-[#1A202C] selection:bg-[#154273] selection:text-white'
          : 'bg-[#080E18] text-zinc-100 selection:bg-blue-600 selection:text-white'
      }`}>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} onClearData={handleClearData} onAuthChange={setCurrentOfficer} />
        <LoginModal isOpen={true} onClose={() => {}} onLoginSuccess={setCurrentOfficer} />

        {showSplash && (
          <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center font-sans transition-opacity duration-500 ${isFadingSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${
            isLight
              ? 'bg-[#F3F5F8] text-[#1A202C]'
              : 'bg-[#080E18] text-zinc-100'
          }`}>
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20">
                <Shield className="w-10 h-10 text-blue-500" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">MEOS</h1>
              <p className="text-sm opacity-60">Mobiel Effectief Op Straat</p>
              
              <div className="mt-8 flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }"""
content = content.replace(old_not_officer, new_not_officer)

with open('src/App.tsx', 'w') as f:
    f.write(content)
