import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface User {
  email: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleModel: string;
  portType: string;
  licensePlate: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const login  = (u: User) => setUser(u);
  const logout = ()        => setUser(null);
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
