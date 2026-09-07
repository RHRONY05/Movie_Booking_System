import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('cinereserve_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const toast = useToast();

  // Rehydrate user profile on initial mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cinereserve_token');
      if (storedToken) {
        try {
          const response = await authApi.getMe();
          const userData = response?.user || response?.data?.user;
          if (userData) {
            setUser(userData);
          }
        } catch (error) {
          console.warn('Session expired or invalid token. Clearing local auth state.');
          localStorage.removeItem('cinereserve_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Log in with Google credential/token
   */
  const loginWithGoogle = async (googleToken) => {
    try {
      const response = await authApi.googleLogin(googleToken);
      const jwtToken = response?.token || response?.data?.token;
      const userData = response?.user || response?.data?.user;

      if (jwtToken) {
        localStorage.setItem('cinereserve_token', jwtToken);
        setToken(jwtToken);
      }
      if (userData) {
        setUser(userData);
      }
      setIsAuthModalOpen(false);

      if (userData?.name) {
        toast.success(`Welcome back, ${userData.name}!`, 'Signed In Successfully');
      } else {
        toast.success('You are now signed in.', 'Signed In Successfully');
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error('Google login failed:', error);
      toast.error(error.message || 'Authentication with Google failed.', 'Sign In Error');
      throw error;
    }
  };

  /**
   * Log out and clear state
   */
  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch (err) {
      console.warn('Logout API error, clearing local state anyway', err);
    } finally {
      localStorage.removeItem('cinereserve_token');
      setToken(null);
      setUser(null);
      toast.info('You have been signed out of CineReserve.', 'Signed Out');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
