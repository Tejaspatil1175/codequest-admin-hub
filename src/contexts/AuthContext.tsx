import React, { createContext, useContext, useState, useCallback } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin credentials for demo
const MOCK_ADMIN = {
  email: 'admin@codequest.io',
  password: 'admin123',
  user: {
    id: '1',
    email: 'admin@codequest.io',
    name: 'Admin User',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      setAdmin(MOCK_ADMIN.user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
