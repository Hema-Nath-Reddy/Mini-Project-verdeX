import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if there's a stored session
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
        setIsAdmin(parsedUserData.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const result = await response.json();
        const userData = result.data.user;
        
        // Store auth data
        localStorage.setItem('authToken', result.data.session?.access_token || '');
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
        
        toast.success("Login successful");
        return { success: true };
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Login failed");
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again.");
      return { success: false, error: "Network error" };
    }
  };

  const signup = async (email, password, name, phone) => {
    try {
      const response = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, phone }),
      });

      if (response.ok) {
        toast.success("Account created successfully! Please check your email for verification.");
        return { success: true };
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Signup failed");
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Network error. Please try again.");
      return { success: false, error: "Network error" };
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Clear local storage regardless of API response
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null);
      setIsAdmin(false);
      
      if (response.ok) {
        toast.success("Logged out successfully");
      } else {
        toast.success("Logged out successfully");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local data even if API call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null);
      setIsAdmin(false);
      toast.success("Logged out successfully");
    }
  };

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch("http://localhost:3001/api/user-profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const userData = result.user;
        
        // Update local storage and state
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isAdmin,
    isLoading,
    login,
    signup,
    logout,
    checkAuthStatus,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
