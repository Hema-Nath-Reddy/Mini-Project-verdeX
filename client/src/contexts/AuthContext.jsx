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
  const API_BASE = "http://localhost:3001";

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
      const response = await fetch(`${API_BASE}/api/login`, {
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

  const signup = async (email, password, name, phone, mpin) => {
    try {
      const response = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, phone, mpin }),
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
      const response = await fetch(`${API_BASE}/api/logout`, {
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

      const response = await fetch(`${API_BASE}/api/user-profile`, {
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

  // Resend email verification
  const resendEmailVerification = async (email) => {
    try {
      const response = await fetch(`${API_BASE}/api/resend-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send email');
      toast.success('Verification email sent');
      return { success: true };
    } catch (e) {
      toast.error(e.message || 'Failed to send email');
      return { success: false, error: e.message };
    }
  };

  // Forgot password (email link)
  const forgotPassword = async (email) => {
    try {
      // Verify email exists using available admin endpoint before sending reset
      const usersRes = await fetch(`${API_BASE}/api/all-users`);
      let exists = false;
      if (usersRes.ok) {
        const users = await usersRes.json();
        exists = Array.isArray(users) && users.some(u => u.email?.toLowerCase() === email.toLowerCase());
      }
      if (!exists) {
        toast.error('Email is not registered');
        return { success: false, error: 'Email not registered' };
      }

      const response = await fetch(`${API_BASE}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed');
      toast.success('Password reset email sent');
      return { success: true };
    } catch (e) {
      toast.error(e.message || 'Failed to send reset email');
      return { success: false, error: e.message };
    }
  };

  // Reset password with tokens from URL
  const resetPassword = async ({ access_token, refresh_token, new_password }) => {
    try {
      const response = await fetch(`${API_BASE}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token, refresh_token, new_password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed');
      toast.success('Password updated');
      return { success: true };
    } catch (e) {
      toast.error(e.message || 'Failed to reset password');
      return { success: false, error: e.message };
    }
  };

  // Notifications
  const getNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return [];
      const response = await fetch(`${API_BASE}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch');
      return result.notifications || [];
    } catch (e) {
      return [];
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;
      const response = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.ok;
    } catch (e) { return false; }
  };

  const markAllNotificationsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;
      const response = await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.ok;
    } catch (e) { return false; }
  };

  // Profile update (name, phone, mpin)
  const updateProfile = async ({ name, phone, mpin }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, phone, mpin })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed');
      // Refresh user profile
      await refreshUserData();
      toast.success('Profile updated');
      return { success: true };
    } catch (e) {
      toast.error(e.message || 'Failed to update');
      return { success: false, error: e.message };
    }
  };

  // Add balance
  const addBalance = async (amount) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      const response = await fetch(`${API_BASE}/api/profile/add-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed');
      await refreshUserData();
      toast.success('Balance added');
      return { success: true, newBalance: result.new_balance };
    } catch (e) {
      toast.error(e.message || 'Failed to add balance');
      return { success: false, error: e.message };
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
    resendEmailVerification,
    forgotPassword,
    resetPassword,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    updateProfile,
    addBalance,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
