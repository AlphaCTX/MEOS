import re

with open('src/components/OfficerProfile.tsx', 'r') as f:
    content = f.read()

if "import { ApiService }" in content and "Mail" not in content:
    content = content.replace("MapPin,", "MapPin, Mail, Key, Save, AlertCircle, CheckCircle,")

state_additions = """
  const [profileForm, setProfileForm] = useState({
    email: currentUser.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const handleProfileSave = async () => {
    try {
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        throw new Error('Nieuwe wachtwoorden komen niet overeen');
      }
      if (profileForm.newPassword && !profileForm.currentPassword) {
        throw new Error('Huidig wachtwoord is verplicht om een nieuw wachtwoord in te stellen');
      }
      
      setProfileSaving(true);
      setProfileError(null);
      setProfileSuccess(null);
      
      const payload: any = {};
      if (profileForm.email !== currentUser.email) payload.email = profileForm.email;
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }
      
      if (Object.keys(payload).length === 0) {
        setProfileSaving(false);
        return;
      }
      
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('user_session') || ''}`
        },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fout bij bijwerken profiel');
      
      setProfileSuccess('Profiel succesvol bijgewerkt. U moet mogelijk opnieuw inloggen om alle wijzigingen te zien.');
      setProfileForm({ ...profileForm, currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setProfileSuccess(null), 5000);
    } catch(err: any) {
      setProfileError(err.message || 'Fout bij bijwerken profiel');
    } finally {
      setProfileSaving(false);
    }
  };
"""

content = content.replace("const [loading, setLoading] = useState(true);", state_additions + "\n  const [loading, setLoading] = useState(true);")

# Add the UI for profile updates inside the grid or just below the personal info
profile_ui = """
      {/* Profile Settings */}
      <div className={`p-6 rounded-2xl border shadow-md ${isLight ? 'bg-white border-slate-200' : 'bg-[#0c1626] border-[#1e334d]'}`}>
        <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
          <Shield className="w-4 h-4" /> Account & Beveiliging
        </h3>
        
        {profileError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{profileError}</span>
          </div>
        )}
        {profileSuccess && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1 opacity-80 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> E-mailadres</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                }`}
                placeholder="naam@marechaussee.nl"
              />
            </div>
            
            <div className="pt-2">
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 ${
                  profileSaving ? 'bg-slate-500' : 'bg-[#154273] hover:bg-[#0e2c4d]'
                }`}
              >
                <Save className="w-4 h-4" />
                {profileSaving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1 opacity-80 flex items-center gap-1.5"><Key className="w-3.5 h-3.5"/> Huidig wachtwoord</label>
              <input
                type="password"
                value={profileForm.currentPassword}
                onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                }`}
                placeholder="Nodig voor wachtwoordwijziging"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Nieuw wachtwoord</label>
                <input
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                  }`}
                  placeholder="Optioneel"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 opacity-80">Bevestig nieuw</label>
                <input
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                  }`}
                  placeholder="Optioneel"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
"""

# Insert it before the grid containing My Mutations
if "{/* Profile Settings */}" not in content:
    content = content.replace("<div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">", profile_ui + "\n\n      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">")

with open('src/components/OfficerProfile.tsx', 'w') as f:
    f.write(content)
