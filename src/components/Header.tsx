import React, { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  FileText,
  PlusCircle,
  Users,
  History,
  Code2,
  LogIn,
  User,
  ChevronDown,
  ShieldCheck,
  RotateCcw,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { UserSession } from '../types/index.js';
import { ApiService } from '../services/api.js';
import { useTheme } from '../context/ThemeContext.js';

interface HeaderProps {
  session: UserSession | null;
  activeTab: 'feed' | 'wizard' | 'profile' | 'entities' | 'audit' | 'admin';
  setActiveTab: (tab: 'feed' | 'wizard' | 'profile' | 'entities' | 'audit' | 'admin') => void;
  onClearData: () => void;
  onAuthChange?: (session: UserSession | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ session, activeTab, setActiveTab, onClearData, onAuthChange }) => {
  const currentSession = session;
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('nl-NL', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' CET'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);



  const isLight = theme === 'light';

  if (!currentSession) {
    return (
      <header className={`border-b sticky top-0 z-40 shadow-xl transition-colors duration-200 ${
        isLight ? 'bg-[#154273] border-[#0e2c4d] text-white' : 'bg-[#0a1424] border-[#1e334d] text-zinc-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl bg-gradient-to-br from-[#1e4e8c] to-[#154273] shadow-inner`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white">MEOS</h1>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Digitaal Mutatiesysteem</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
              isLight ? 'bg-white hover:bg-slate-100 text-[#154273] shadow-sm' : 'bg-[#0c1626] hover:bg-zinc-800 text-zinc-300 border border-[#1e334d]'
            }`}>
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>
    );
  }



  const hasPerm = (perm: string) => currentSession?.permissions?.includes(perm) || currentSession?.isAdmin;

  const menuItems: Array<{ id: string; icon: any; label: string; iconColor?: string; highlight?: boolean }> = [
    { id: 'feed', icon: FileText, label: 'Mutaties' }
  ];

  if (hasPerm('MUTATION_CREATE')) {
    menuItems.push({ id: 'wizard', icon: PlusCircle, label: 'Nieuwe Mutatie', iconColor: 'text-emerald-400' });
  }

  menuItems.push({ id: 'profile', icon: User, label: 'Mijn Profiel', iconColor: 'text-amber-300' });
  menuItems.push({ id: 'entities', icon: Users, label: 'Entiteiten & RDW' });

  if (hasPerm('USER_MANAGE') || hasPerm('BRIGADE_MANAGE') || hasPerm('PERMISSIONS_MANAGE')) {
    menuItems.push({ id: 'admin', icon: ShieldCheck, label: 'Admin Beheer', highlight: true });
  }

  menuItems.push({ id: 'audit', icon: History, label: 'Auditlog' });


  return (
    <header
      className={`border-b sticky top-0 z-40 shadow-xl transition-colors duration-200 ${
        isLight
          ? 'bg-[#154273] border-[#0e2c4d] text-white'
          : 'bg-[#0a1424] border-[#1e334d] text-zinc-100'
      }`}
    >
      {/* Primary Navigation & Title Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('feed')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition border ${
              isLight
                ? 'bg-white text-[#154273] border-white/30'
                : 'bg-[#132238] text-amber-400 border-amber-400/30'
            }`}
            title="Naar Mutatieoverzicht"
          >
            <Shield className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base uppercase tracking-wider text-white">
                MEOS
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                  isLight
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                v2.6 OPERATIONEEL
              </span>
            </div>
            <p className={`text-[11px] ${isLight ? 'text-blue-100' : 'text-zinc-400'}`}>
              Mobiel Effectief Op Straat
            </p>
          </div>
        </div>

        {/* Right Controls: Theme Switcher, User Account, Hamburger */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
              isLight
                ? 'bg-[#0f3259] hover:bg-[#0c2847] text-amber-300 border border-[#1d4d82]'
                : 'bg-[#132238] hover:bg-[#1a2d48] text-amber-400 border border-[#1e334d]'
            }`}
            title={isLight ? 'Schakel naar tactisch thema (Donker)' : 'Schakel naar standaard thema (Licht)'}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* User Account Menu (Desktop) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                isLight
                  ? 'bg-white text-[#154273] hover:bg-slate-50 border-white/20 shadow-sm'
                  : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border-zinc-700 shadow-md'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isLight ? 'bg-[#154273] text-white' : 'bg-blue-900 text-blue-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-xs font-bold leading-none">{currentSession.userName}</span>
                <span className={`text-[9px] font-mono leading-none mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {currentSession.badgeNumber} • {currentSession.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
            </button>

            {isUserMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl py-1 overflow-hidden animate-fade-in ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                }`}
              >
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    ApiService.logout();
                    if (onAuthChange) onAuthChange(null);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 transition cursor-pointer ${
                    isLight ? 'hover:bg-red-50 text-red-600' : 'hover:bg-red-950/30 text-red-400'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Uitloggen
                </button>
              </div>
            )}
          </div>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-[#154273] shadow-sm'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 shadow-md'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hamburger Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Hamburger Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-72 md:w-80 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isLight
            ? 'bg-white border-l border-slate-200 text-slate-800'
            : 'bg-zinc-900 border-l border-zinc-800 text-zinc-100'
        }`}
      >
        <div className={`p-4 border-b flex justify-between items-center ${isLight ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-900/50'}`}>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="font-bold">Navigatie Menu</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className={`p-1.5 rounded-lg cursor-pointer transition ${
              isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeTab === item.id
                  ? isLight
                    ? 'bg-[#154273] text-white shadow-md'
                    : 'bg-blue-600 text-white shadow-md'
                  : item.highlight
                  ? isLight
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.iconColor || ''} ${activeTab === item.id ? 'text-white' : ''}`} />
              {item.label}
            </button>
          ))}
          
          <div className={`mt-6 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
            <div className="px-4 pb-2 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                Actieve Sessie
              </span>
              <div className="flex items-center gap-3 mt-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isLight ? 'bg-[#154273] text-white' : 'bg-blue-900 text-blue-200'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold">{currentSession.userName}</span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    {currentSession.badgeNumber} • {currentSession.role}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                ApiService.logout();
                if (onAuthChange) onAuthChange(null);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                isLight ? 'hover:bg-red-50 text-red-600' : 'hover:bg-red-950/30 text-red-400'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Uitloggen
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
