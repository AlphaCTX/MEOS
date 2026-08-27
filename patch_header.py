import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

old_interface = """interface HeaderProps {
  activeTab: 'feed' | 'wizard' | 'profile' | 'entities' | 'audit' | 'admin';
  setActiveTab: (tab: 'feed' | 'wizard' | 'profile' | 'entities' | 'audit' | 'admin') => void;
  onClearData: () => void;
  onAuthChange?: (session: UserSession | null) => void;
}"""

new_interface = """interface HeaderProps {
  session: UserSession | null;
  activeTab: 'feed' | 'wizard' | 'profile' | 'entities' | 'audit' | 'admin';
  setActiveTab: (tab: 'feed' | 'wizard' | 'profile' | 'entities' | 'audit' | 'admin') => void;
  onClearData: () => void;
  onAuthChange?: (session: UserSession | null) => void;
}"""
content = content.replace(old_interface, new_interface)

old_component = """export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onClearData, onAuthChange }) => {
  const [currentSession, setCurrentSession] = useState<UserSession>(ApiService.getUserSession());"""

new_component = """export const Header: React.FC<HeaderProps> = ({ session, activeTab, setActiveTab, onClearData, onAuthChange }) => {
  const currentSession = session;"""
content = content.replace(old_component, new_component)

old_login_handler = """  const handleLoginSuccess = (session: UserSession) => {
    setCurrentSession(session);
    if (onAuthChange) onAuthChange(session);
  };"""

content = content.replace(old_login_handler, "")

old_logout = """                    setIsUserMenuOpen(false);
                    ApiService.logout();
                    setCurrentSession(null);
                    if (onAuthChange) onAuthChange(null);"""

new_logout = """                    setIsUserMenuOpen(false);
                    ApiService.logout();
                    if (onAuthChange) onAuthChange(null);"""
content = content.replace(old_logout, new_logout)

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
