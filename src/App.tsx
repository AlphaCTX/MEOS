import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Header } from './components/Header.js';
import { LoginModal } from './components/LoginModal.js';
import { Dashboard } from './components/Dashboard.js';
import { MutationWizard } from './components/MutationWizard.js';
import { MutationDetail } from './components/MutationDetail.js';
import { OfficerProfile } from './components/OfficerProfile.js';
import { EntityRegistry } from './components/EntityRegistry.js';
import { AuditLogViewer } from './components/AuditLogViewer.js';
import { SchemaViewer } from './components/SchemaViewer.js';
import { AdminPanel } from './components/AdminPanel.js';
import { ThemeProvider, useTheme } from './context/ThemeContext.js';
import { ApiService } from './services/api.js';
import { MutationRecord, SystemStats, SearchFilterParams, UserSession } from './types/index.js';

function MainApp() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingSplash, setIsFadingSplash] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'feed' | 'wizard' | 'profile' | 'entities' | 'audit' | 'admin'
  >('feed');
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const [selectedMutation, setSelectedMutation] = useState<MutationRecord | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentOfficer, setCurrentOfficer] = useState<UserSession | null>(ApiService.getUserSession());

  const [filters, setFilters] = useState<SearchFilterParams>({
    query: '',
    category: 'ALL',
    priority: 'ALL',
    status: 'ALL',
    licensePlate: '',
    personName: '',
    bsn: '',
    serviceNumber: '',
    location: '',
    district: '',
    startDate: '',
    endDate: '',
  });


  useEffect(() => {
    const timer1 = setTimeout(() => setIsFadingSplash(true), 2000);
    const timer2 = setTimeout(() => setShowSplash(false), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const loadData = async (params = filters) => {
    setLoading(true);
    try {
      const [res, statsData] = await Promise.all([
        ApiService.searchMutations(params),
        ApiService.getStats(),
      ]);
      setMutations(res.items);
      setStats(statsData);
    } catch (err) {
      console.error('Fout bij ophalen mutaties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<SearchFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      category: 'ALL',
      priority: 'ALL',
      status: 'ALL',
      licensePlate: '',
      personName: '',
      bsn: '',
      serviceNumber: '',
      location: '',
      district: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleSelectMutation = async (id: string) => {
    try {
      const mut = await ApiService.getMutation(id);
      setSelectedMutation(mut);
    } catch (err) {
      console.error('Fout bij ophalen dossier:', err);
    }
  };

  const handleClearData = async () => {
    try {
      await ApiService.clearData();
      await loadData();
      alert('De database is succesvol gewist. Er zijn geen mutaties meer aanwezig.');
    } catch (err: any) {
      alert(err.message || 'Wissen mislukt');
    }
  };

  const handleWizardSuccess = async (createdId: string) => {
    await loadData();
    setActiveTab('feed');
    handleSelectMutation(createdId);
  };





  if (!currentOfficer) {
    return (
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight
          ? 'bg-[#F3F5F8] text-[#1A202C] selection:bg-[#154273] selection:text-white'
          : 'bg-[#080E18] text-zinc-100 selection:bg-blue-600 selection:text-white'
      }`}>
        <Header session={currentOfficer} activeTab={activeTab} setActiveTab={setActiveTab} onClearData={handleClearData} onAuthChange={setCurrentOfficer} />
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
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight
          ? 'bg-[#F3F5F8] text-[#1A202C] selection:bg-[#154273] selection:text-white'
          : 'bg-[#080E18] text-zinc-100 selection:bg-blue-600 selection:text-white'
      }`}
    >
      {/* Tactical Top Header & Navigation */}
      <Header
        session={currentOfficer}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedMutation(null);
          setActiveTab(tab);
        }}
        onClearData={handleClearData}
        onAuthChange={setCurrentOfficer}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {selectedMutation ? (
          <MutationDetail
            mutation={selectedMutation}
            onBack={() => setSelectedMutation(null)}
            onMutationUpdated={(updated) => {
              setSelectedMutation(updated);
              loadData();
            }}
          />
        ) : activeTab === 'feed' ? (
          <Dashboard
            session={currentOfficer}
            mutations={mutations}
            stats={stats}
            loading={loading}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onSelectMutation={handleSelectMutation}
            onCreateNew={() => setActiveTab('wizard')}
          />
        ) : activeTab === 'wizard' ? (
          <MutationWizard
            onSuccess={handleWizardSuccess}
            onCancel={() => setActiveTab('feed')}
          />
        ) : activeTab === 'profile' ? (
          <OfficerProfile
            currentUser={currentOfficer}
            onSelectMutation={handleSelectMutation}
            onCreateNew={() => setActiveTab('wizard')}
          />
        ) : activeTab === 'entities' ? (
          <EntityRegistry onSelectMutation={handleSelectMutation} />
        ) : activeTab === 'admin' ? (
          <AdminPanel
            onClearData={handleClearData}
        onAuthChange={setCurrentOfficer}
            onSelectTab={(tab) => {
              setSelectedMutation(null);
              setActiveTab(tab);
            }}
          />
        ) : activeTab === 'audit' ? (
          <AuditLogViewer onSelectMutation={handleSelectMutation} />
        ) : (
          <SchemaViewer />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

