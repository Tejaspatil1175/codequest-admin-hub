import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiService } from '@/lib/apiService';
import { tokenStorage } from '@/lib/tokenStorage';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  email: string;
  username: string;
  teamName: string;
  role: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, teamName: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Auto-login on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (tokenStorage.hasToken()) {
        try {
          const user = await apiService.getCurrentUser();
          setAdmin({
            id: user.id,
            email: user.email,
            username: user.username,
            teamName: user.teamName,
            role: user.role,
          });
        } catch (error) {
          // Token is invalid or expired
          tokenStorage.removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ email, password });

      if (response.success && response.token) {
        // Save token
        tokenStorage.saveToken(response.token);

        // Set admin user
        setAdmin({
          id: response.user.id,
          email: response.user.email,
          username: response.user.username,
          teamName: response.user.teamName,
          role: response.user.role,
        });

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${response.user.username}!`,
        });

        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const register = useCallback(async (
    username: string,
    email: string,
    password: string,
    teamName: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.register({
        username,
        email,
        password,
        teamName,
        role: 'admin',
      });

      if (response.success && response.token) {
        // Save token
        tokenStorage.saveToken(response.token);

        // Set admin user
        setAdmin({
          id: response.user.id,
          email: response.user.email,
          username: response.user.username,
          teamName: response.user.teamName,
          role: response.user.role,
        });

        toast({
          title: 'Registration Successful',
          description: `Welcome, ${response.user.username}!`,
        });

        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Could not create account',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const logout = useCallback(() => {
    tokenStorage.removeToken();
    setAdmin(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  }, [toast]);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        register,
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
