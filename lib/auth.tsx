'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  name: string;
  phone: string;
  token?: string;
  wallet_balance?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'https://blue-penguin-872241.hostingersite.com/api';
const USER_STORAGE_KEY = 'user';
const JWT_TOKEN_STORAGE_KEY = 'jwt_token';
const WALLET_ME_ENDPOINT = `${API_URL}/wallet/me`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchAndSetWalletBalance = async () => {
    const token = localStorage.getItem(JWT_TOKEN_STORAGE_KEY);
    if (!token) return;

    try {
      const response = await fetch(WALLET_ME_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        toast({ 
          title: 'Session Expired', 
          description: 'Please log in again.', 
          variant: 'destructive' 
        });
        logout();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `Failed to fetch wallet balance: ${response.status}` 
        }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      const responseData = await response.json();
      let balanceValue: string | number | undefined;

      if (responseData && responseData.data) {
        balanceValue = responseData.data.wallet_balance;
      }
      
      let numericBalance: number | undefined;
      if (typeof balanceValue === 'string') {
        numericBalance = parseFloat(balanceValue);
      } else if (typeof balanceValue === 'number') {
        numericBalance = balanceValue;
      }

      if (typeof numericBalance === 'number' && !isNaN(numericBalance)) {
        setUser(prevUser => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, wallet_balance: numericBalance };
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch wallet balance:', error);
      toast({ 
        title: 'Wallet Error', 
        description: `Could not fetch wallet balance: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const storedUserString = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUserString) {
      try {
        const parsedUser: User = JSON.parse(storedUserString);
        setUser(parsedUser);
        setIsAuthenticated(true);
        fetchAndSetWalletBalance();
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(JWT_TOKEN_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    console.log('Starting login process...');
    
    try {
      console.log('Sending login request...');
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const contentType = response.headers.get("content-type");
      let responseData;
      
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const textData = await response.text();
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}. Body: ${textData}`);
      }

      console.log('Login API Response Data:', responseData);

      if (response.ok) {
        const token = responseData.token || responseData.jwt || responseData.data?.token;
        if (token) {
          localStorage.setItem(JWT_TOKEN_STORAGE_KEY, token);
        }

        const userData = {
          id: responseData.user.id,
          name: responseData.user.name,
          phone: responseData.user.phone,
          token: token,
          wallet_balance: responseData.user.wallet_balance || 0
        };

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        
        toast({ 
          title: 'Login Successful', 
          description: `Welcome back, ${userData.name}!` 
        });
        
        await fetchAndSetWalletBalance();
        router.push('/my-tickets');
      } else {
        let errorMessage = 'Login failed. Please check your credentials.';
        if (responseData && responseData.message) {
          errorMessage = responseData.message;
          if (responseData.errors) {
            const errorDetails = Object.values(responseData.errors).flat().join(' ');
            errorMessage += ` Details: ${errorDetails}`;
          }
        }
        toast({ 
          title: 'Login Failed', 
          description: errorMessage, 
          variant: 'destructive' 
        });
        setIsAuthenticated(false);
        localStorage.removeItem(JWT_TOKEN_STORAGE_KEY);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({ 
        title: 'Login Error', 
        description: error.message || 'An unexpected error occurred during login.', 
        variant: 'destructive' 
      });
      setIsAuthenticated(false);
      localStorage.removeItem(JWT_TOKEN_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoading(true);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(JWT_TOKEN_STORAGE_KEY);
    toast({ 
      title: 'Logged Out', 
      description: 'You have been successfully logged out.' 
    });
    router.push('/login');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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