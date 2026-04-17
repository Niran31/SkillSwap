import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

interface User {
  id: string;
  name: string;
  email: string;
  learningStyle?: string;
  strengths?: string[];
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  bio?: string;
  customSkills?: { name: string; level: number }[];
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string, learningStyle?: string, strengths?: string[]) => Promise<void>;
  completeOnboarding: (learningStyle: string, strengths: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved user and token in localStorage
    const savedUser = localStorage.getItem('skillswap_user');
    const savedToken = localStorage.getItem('skillswap_token');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { user, token } = response.data;
      setUser(user);
      localStorage.setItem('skillswap_user', JSON.stringify(user));
      localStorage.setItem('skillswap_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, learningStyle?: string, strengths?: string[]) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password, learningStyle, strengths });
      const { user, token } = response.data;
      setUser(user);
      localStorage.setItem('skillswap_user', JSON.stringify(user));
      localStorage.setItem('skillswap_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const completeOnboarding = (learningStyle: string, strengths: string[]) => {
    if (user) {
      const updatedUser = {
        ...user,
        learningStyle,
        strengths,
      };
      setUser(updatedUser);
      localStorage.setItem('skillswap_user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillswap_user');
    localStorage.removeItem('skillswap_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      isAuthenticated: !!user, 
      login, 
      logout, 
      signup,
      completeOnboarding
    }}>
      {children}
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