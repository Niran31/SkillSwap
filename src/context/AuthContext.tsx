import React, { createContext, useState, useContext, useEffect } from 'react';

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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  completeOnboarding: (learningStyle: string, strengths: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('skillswap_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock authentication
    // In a real app, this would make an API call
    const mockUser: User = {
      id: '1',
      name: 'Demo User',
      email,
      xp: 250,
      level: 3,
      streak: 5,
      badges: ['Quick Learner', 'Helper'],
    };
    
    setUser(mockUser);
    localStorage.setItem('skillswap_user', JSON.stringify(mockUser));
  };

  const signup = async (name: string, email: string, password: string) => {
    // Mock signup
    const mockUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      xp: 0,
      level: 1,
      streak: 0,
      badges: ['Newcomer'],
    };
    
    setUser(mockUser);
    localStorage.setItem('skillswap_user', JSON.stringify(mockUser));
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
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
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