// contexts/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { User } from "../lib/api";
import { performDetailedHealthCheck } from "../utils/networkDetection";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    fullname: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (
    updates: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("http://localhost:5000/api");

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // First, find the working base URL
      console.log("🔍 Detecting backend connectivity...");
      const healthResult = await performDetailedHealthCheck();
      
      if (healthResult.success) {
        console.log("✅ Backend health check passed:", healthResult.data);
        console.log("🌐 Network info:", healthResult.networkInfo);
        setApiBaseUrl(healthResult.url);
      } else {
        console.warn("⚠️ Backend health check failed, using default URL");
        // Use default based on platform
        const defaultUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
        setApiBaseUrl(defaultUrl);
      }
      
      // Then check auth status
      await checkAuthStatus();
    } catch (error) {
      console.error("Error initializing app:", error);
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("@auth_token");
      const userData = await AsyncStorage.getItem("@user_data");

      console.log("stored user data:", userData ? "exists" : "not found");

      if (storedToken && userData) {
        setToken(storedToken);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("API Request: POST", `${apiBaseUrl}/auth/login`);
      console.log("Using API Base URL:", apiBaseUrl);
      console.log("Token available:", !!token);
      
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Login API Error:", response.status, errorData);

        let errorMessage;
        try {
          const jsonError = JSON.parse(errorData);
          errorMessage = jsonError.error || jsonError.message || "Login failed";
        } catch {
          errorMessage = errorData || "Login failed";
        }

        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      console.log("Login successful for user:", data.user?.email);

      // Store token and user data
      await AsyncStorage.setItem("@auth_token", data.accessToken);
      await AsyncStorage.setItem("@user_data", JSON.stringify(data.user));

      setToken(data.accessToken);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Network error occurred" 
      };
    }
  };

  const register = async (userData: {
    fullname: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    // Prevent multiple simultaneous registration attempts
    if (isLoading) {
      console.log("Registration already in progress, skipping...");
      return { success: false, error: "Registration already in progress" };
    }

    try {
      setIsLoading(true);
      
      console.log("Attempting registration with data:", {
        fullname: userData.fullname,
        email: userData.email,
        phone: userData.phone,
        // Don't log password for security
      });

      console.log("API Request: POST", `${apiBaseUrl}/auth/register`);
      console.log("Using API Base URL:", apiBaseUrl);
      console.log("Token available:", !!token);

      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      console.log("Registration response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Registration API Error:", response.status, errorData);

        // Try to parse as JSON, fallback to text
        let errorMessage;
        try {
          const jsonError = JSON.parse(errorData);
          errorMessage = jsonError.error || jsonError.message || "Registration failed";
        } catch {
          errorMessage = errorData || "Registration failed";
        }

        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      console.log("Registration successful:", data.user?.email);

      // Store token and user data with consistent keys
      await AsyncStorage.setItem("@auth_token", data.accessToken);
      await AsyncStorage.setItem("@user_data", JSON.stringify(data.user));

      setToken(data.accessToken);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Network error occurred" 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await AsyncStorage.removeItem("@auth_token");
      await AsyncStorage.removeItem("@user_data");
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user || !token) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      console.log("API Request: PUT", `${apiBaseUrl}/users/${user.id}`);
      console.log("Using API Base URL:", apiBaseUrl);
      console.log("Updating user with:", updates);

      const response = await fetch(`${apiBaseUrl}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Update user API Error:", response.status, errorData);

        let errorMessage;
        try {
          const jsonError = JSON.parse(errorData);
          errorMessage = jsonError.error || jsonError.message || "Update failed";
        } catch {
          errorMessage = errorData || "Update failed";
        }

        return { success: false, error: errorMessage };
      }

      const updatedUser = await response.json();
      console.log("User updated successfully");

      // Update stored user data
      await AsyncStorage.setItem("@user_data", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      console.error("Update user error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Network error occurred" 
      };
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
