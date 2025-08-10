// lib/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getOptimalBackendUrl } from '../utils/networkDetection';

// Dynamic API URL based on platform and environment
const getApiBaseUrl = () => {
  const envBase = Constants.expoConfig?.extra?.API_BASE || process.env.API_BASE;
  
  if (envBase) {
    return `${envBase}/api`;
  }
  
  // Fallback to platform-specific defaults
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api'; // Android emulator
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:5000/api'; // iOS simulator
  } else {
    return 'http://localhost:5000/api'; // Web
  }
};

export const API_BASE_URL = getApiBaseUrl();

export interface User {
  _id?: string;
  id: string;
  fullname: string;
  email: string;
  phone: string;
  age?: number;
  height?: number;
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ChatMessage {
  _id: string;
  senderId: string | null;
  text?: string;
  imageUri?: string;
  fromAI: boolean;
  timestamp: string;
}

export interface Chat {
  _id: string;
  chatId: string;
  roomId: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  firstMessage?: ChatMessage;
  firstMessageTime?: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecentChat {
  chatId: string;
  roomId: string;
  title: string;
  firstMessage: ChatMessage;
  firstMessageTime: string;
  lastUpdated: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      console.log(`🔑 Token retrieval: ${token ? 'Found' : 'Not found'}`);
      if (token) {
        // Check if token looks like a JWT
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            console.log(`Token exp: ${payload.exp}, Current time: ${now}, Expired: ${payload.exp < now}`);
          } catch {
            console.log('Could not decode token payload');
          }
        }
      }
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const url = `${this.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };
      
      const response = await fetch(url, config);
      
      // Handle different response types
      if (response.status === 204) {
        // No content response (e.g., DELETE success)
        return { success: true, data: null as T };
      }

      const data = await response.json();

      if (!response.ok) {
        console.error(`API Error: ${response.status}`, data);
        
        // If 401 and this is not already a refresh request, try to refresh token
        if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
          console.log('🔄 Token expired, attempting refresh...');
          const refreshResult = await this.refreshToken();
          if (refreshResult.success && refreshResult.data) {
            console.log('✅ Token refreshed successfully');
            // Update token in storage
            await AsyncStorage.setItem('@auth_token', refreshResult.data.accessToken);
            
            // Retry the original request with new token
            const newConfig = {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${refreshResult.data.accessToken}`,
              },
            };
            
            console.log(`🔄 Retrying request with new token: ${config.method || 'GET'} ${url}`);
            const retryResponse = await fetch(url, newConfig);
            
            if (retryResponse.status === 204) {
              return { success: true, data: null as T };
            }
            
            const retryData = await retryResponse.json();
            
            if (!retryResponse.ok) {
              console.error(`Retry API Error: ${retryResponse.status}`, retryData);
              return {
                success: false,
                error: retryData.error || retryData.message || `HTTP ${retryResponse.status}`,
              };
            }
            
            return { success: true, data: retryData };
          } else {
            console.log('❌ Token refresh failed, user needs to login again');
          }
        }
        
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
        };
      }

      // Backend returns data directly, so wrap it in our response format
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Auth endpoints
  async register(userData: {
    fullname: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    return this.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Chat endpoints
  async getRecentChats(): Promise<ApiResponse<RecentChat[]>> {
    return this.request<RecentChat[]>('/chats/recent');
  }

  async createChat(chatData: {
    title?: string;
    roomId?: string;
  }): Promise<ApiResponse<Chat>> {
    return this.request<Chat>('/chats', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  }

  async addMessage(messageData: {
    chatId?: string;
    senderId?: string | null;
    text?: string;
    imageUri?: string;
    fromAI: boolean;
  }): Promise<ApiResponse<Chat>> {
    return this.request<Chat>('/chats/message', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getChatMessages(chatId: string): Promise<ApiResponse<{
    chatId: string;
    roomId: string;
    title: string;
    messages: ChatMessage[];
  }>> {
    return this.request<{
      chatId: string;
      roomId: string;
      title: string;
      messages: ChatMessage[];
    }>(`/chats/${chatId}/messages`);
  }

  async deleteChat(chatId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/chats/${chatId}`, {
      method: 'DELETE',
    });
  }

  // Gemini AI endpoints
  async generateText(prompt: string): Promise<ApiResponse<{ text: string }>> {
    return this.request<{ text: string }>('/gemini/text', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async analyzeImage(imageData: string): Promise<ApiResponse<{ text: string }>> {
    return this.request<{ text: string }>('/gemini/analyze-image', {
      method: 'POST',
      body: JSON.stringify({ image: imageData }),
    });
  }

  // Health check - doesn't require authentication
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string; version: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (err) {
      console.warn('Backend health check failed:', err);
      return { success: false, error: 'Backend not available' };
    }
  }

  // Check if backend is available
  async isBackendAvailable(): Promise<boolean> {
    const result = await this.healthCheck();
    return result.success;
  }
}

export const api = new ApiClient(API_BASE_URL);