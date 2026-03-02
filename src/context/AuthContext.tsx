import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginWithCredentials, Auth0User } from '../lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Auth0User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'as_crm_access_token';
const USER_KEY = 'as_crm_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Auth0User | null>(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    const storedUser = sessionStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Local test account — bypasses Auth0 so the UI can be accessed while
    // the Auth0 integration is being configured.
    if (email === 'admin@activateswag.com' && password === 'admin123') {
      const localUser: Auth0User = {
        sub: 'local|1',
        name: 'Test Admin',
        email: 'admin@activateswag.com',
        email_verified: true,
      };
      sessionStorage.setItem(TOKEN_KEY, 'local-dev-token');
      sessionStorage.setItem(USER_KEY, JSON.stringify(localUser));
      setUser(localUser);
      setIsAuthenticated(true);
      return;
    }

    const { tokens, user: authUser } = await loginWithCredentials(email, password);
    sessionStorage.setItem(TOKEN_KEY, tokens.access_token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
