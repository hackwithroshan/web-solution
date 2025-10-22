import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { useToast } from './useToast';
import { sendRegistrationOtp } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ twoFactorRequired?: boolean; twoFactorToken?: string; }>;
  verifyLogin2FA: (token: string, code: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, address: string, otp: string, companyName?: string, gstNumber?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsInitializing(false);
  }, []);

  const handleAuthResponse = async (response: Response) => {
    if (!response.ok) {
      let errorMessage = `Request failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // The response might not be JSON, use the status text.
        console.error("Could not parse error response JSON", e);
      }
      throw new Error(errorMessage);
    }
    return response.json();
  };
  
  const setAuthState = (data: { user: User, token: string }) => {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const url = `${API_URL}/api/auth/login`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleAuthResponse(response);
      
      if (data.twoFactorRequired) {
          return { twoFactorRequired: true, twoFactorToken: data.twoFactorToken };
      }
      
      setAuthState(data);
      addToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
      return {};
    } catch (error: any) {
        addToast(error.message || 'An unknown login error occurred.', 'error');
        throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyLogin2FA = async (token: string, code: string) => {
      setIsLoading(true);
      try {
          const response = await fetch(`${API_URL}/api/auth/login/verify-2fa`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, code }),
          });
          const data = await handleAuthResponse(response);
          setAuthState(data);
          addToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
      } catch (error: any) {
          addToast(error.message || 'An unknown 2FA error occurred.', 'error');
          throw error;
      } finally {
          setIsLoading(false);
      }
  };


  const register = async (name: string, email: string, password: string, phone: string, address: string, otp: string, companyName?: string, gstNumber?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, address, companyName, gstNumber, otp }),
      });
      const data = await handleAuthResponse(response);
      
      setAuthState(data);
      addToast(`Welcome, ${data.user.name.split(' ')[0]}! Your account has been created.`, 'success');
    } catch (error: any) {
        addToast(error.message || 'An unknown registration error occurred.', 'error');
        throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    addToast('You have been logged out.', 'info');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
  };

  const value = { user, token, login, verifyLogin2FA, register, logout, isLoading, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {!isInitializing && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};