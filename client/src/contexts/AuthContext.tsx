import { createContext, useContext } from 'react';
import type { UserDto } from '../generated-ts-client';

type AuthContextType = {
  requestLogin(email: string): Promise<boolean>;
  verify(token: string): Promise<string>;
  refresh(): Promise<string>;
  user: UserDto | null;
  logout(): void;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
