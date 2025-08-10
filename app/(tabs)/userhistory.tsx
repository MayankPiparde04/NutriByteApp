import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";

export default function UserHistory() {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserHistory();
  }, []);

  const loadUserHistory = async () => {
    if (!user || !token) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use the same backend server IP as your Expo frontend
      const apiUrl = "http://10.171.201.130:5000/api/chats/recent";
      
      console.log("==========================");
      console.log("Loading chats from backend for authenticated user...");
      console.log("API Request: GET", apiUrl);
      console.log("Token available:", !!token);
      console.log("Token preview:", token ? token.substring(0, 20) + "..." : "No token");
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, JSON.stringify(errorText));
        
        if (response.status === 401) {
          console.warn("Backend returned unsuccessful response, falling back to local storage");
          setError("Session expired. Please login again.");
        } else {
          setError(`Server error: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      setChats(data || []);
      console.log("Loaded", data?.length || 0, "chats from backend");
      
    } catch (error) {
      console.error("Error loading history:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRetry = () => {
    loadUserHistory();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View className={`p-8 rounded-2xl ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm items-center`}>
          <ActivityIndicator size="large" color={isDark ? "#9CA3AF" : "#6B7280"} />
          <Text className={`text-lg font-medium mt-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Loading History...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className={`p-8 rounded-2xl ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm items-center`}>
          <Ionicons 
            name="warning-outline" 
            size={64} 
            color={isDark ? "#EF4444" : "#DC2626"} 
          />
          <Text className={`text-xl font-semibold mt-4 mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            Error Loading History
          </Text>
          <Text className={`text-center mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={handleRetry}
            className={`px-6 py-3 rounded-xl ${isDark ? "bg-blue-600" : "bg-blue-500"}`}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!chats || chats.length === 0) {
      return (
        <View className={`p-8 rounded-2xl ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm items-center`}>
          <Ionicons 
            name="time-outline" 
            size={64} 
            color={isDark ? "#9CA3AF" : "#6B7280"} 
          />
          <Text className={`text-xl font-semibold mt-4 mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            No History Yet
          </Text>
          <Text className={`text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Your nutrition tracking history will appear here once you start logging your meals and nutrients.
          </Text>
        </View>
      );
    }

    return (
      <View className="space-y-4">
        {chats.map((chat: any, index: number) => (
          <View key={chat.chatId || index} className={`p-4 rounded-2xl ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm`}>
            <Text className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              {chat.title || `Chat ${index + 1}`}
            </Text>
            <Text className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm mb-2`}>
              {new Date(chat.firstMessageTime || chat.lastUpdated).toLocaleDateString()}
            </Text>
            {chat.firstMessage && (
              <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} text-sm`} numberOfLines={2}>
                {chat.firstMessage.text}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      contentContainerStyle={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className={`px-6 py-8 ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm`}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={handleGoBack}
            className="flex-row items-center gap-2"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isDark ? "#fff" : "#000"} 
            />
            <Text className={`text-lg font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
              Back
            </Text>
          </TouchableOpacity>
          {!loading && !error && (
            <TouchableOpacity
              onPress={handleRetry}
              className="flex-row items-center gap-2"
            >
              <Ionicons 
                name="refresh-outline" 
                size={20} 
                color={isDark ? "#fff" : "#000"} 
              />
            </TouchableOpacity>
          )}
        </View>
        <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Nutrition History
        </Text>
      </View>

      {/* Content */}
      <View className="px-6 py-6">
        {renderContent()}
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: insets.bottom + 20 }} />
    </ScrollView>
  );
}