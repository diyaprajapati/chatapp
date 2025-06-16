import api from '@/lib/axios';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface SignupData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to indicate initial loading

  // const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = () => {
      const savedUser = localStorage.getItem('chat-user');
      const token = localStorage.getItem('token');

      if (savedUser && token) {
        try {
          // Simple client-side token expiry check
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log(payload);
          if (payload.exp * 1000 > Date.now()) {
            setUser(JSON.parse(savedUser));
          } else {
            // Token expired, clear storage
            localStorage.removeItem('chat-user');
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          // Invalid token format, clear storage
          localStorage.removeItem('chat-user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        // No saved data, ensure clean state
        localStorage.removeItem('chat-user');
        localStorage.removeItem('token');
        setUser(null);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.post("/auth/login", { username, password });

      const { token, user } = res.data;

      // Store token and user
      localStorage.setItem("token", token);
      localStorage.setItem("chat-user", JSON.stringify(user));

      setUser(user);
      return true;
    } catch (error: any) {
      console.error("Login error:", error?.response?.data?.message || error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.post("/auth/register", data);

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("chat-user", JSON.stringify(user));

      setUser(user);
      return true;
    } catch (error: any) {
      console.error("Signup error:", error?.response?.data?.message || error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);

    // Remove BOTH token and user data
    localStorage.removeItem('chat-user');
    localStorage.removeItem('token'); // This was missing!
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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