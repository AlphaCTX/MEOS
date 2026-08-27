import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add Shield import
if "import { Shield } from 'lucide-react';" not in content:
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { Shield } from 'lucide-react';")

# Add showSplash state
if "const [showSplash," not in content:
    content = content.replace("  const [activeTab, setActiveTab] = useState<", "  const [showSplash, setShowSplash] = useState(true);\n  const [activeTab, setActiveTab] = useState<")

# Add showSplash effect
effect_code = """
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);
"""
if "const timer = setTimeout(() => setShowSplash(false), 2000);" not in content:
    content = content.replace("  const loadData = async", effect_code + "\n  const loadData = async")

# Add splash screen render before !currentOfficer check
splash_render = """
  if (showSplash) {
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
  }
"""

if "if (showSplash) {" not in content:
    content = content.replace("  if (!currentOfficer) {", splash_render + "\n  if (!currentOfficer) {")

with open('src/App.tsx', 'w') as f:
    f.write(content)
