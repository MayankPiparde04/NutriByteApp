import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HealthCheckButton } from "../../components/HealthCheckButton";
import { useAuth } from "../../contexts/AuthContext";
import { findWorkingBaseUrl } from "../../utils/healthCheck";

export default function Profile() {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();

  // User data state
  const [name, setName] = useState(user?.fullname || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [height, setHeight] = useState(user?.height?.toString() || "");
  const [weight, setWeight] = useState(user?.weight?.toString() || "");
  const [editing, setEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setName(user.fullname || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAge(user.age?.toString() || "");
      setHeight(user.height?.toString() || "");
      setWeight(user.weight?.toString() || "");
    }
  }, [user]);

  const toggleEdit = () => setEditing(!editing);

  const handleSave = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const updates: any = {};
      
      // Only include fields that have values and are different from current user data
      if (name.trim() && name !== user.fullname) updates.fullname = name.trim();
      if (phone.trim() && phone !== user.phone) updates.phone = phone.trim();
      if (age.trim()) {
        const ageNum = parseInt(age);
        if (!isNaN(ageNum) && ageNum > 0 && ageNum <= 120) {
          updates.age = ageNum;
        }
      }
      if (height.trim()) {
        const heightNum = parseFloat(height);
        if (!isNaN(heightNum) && heightNum > 0 && heightNum <= 300) {
          updates.height = heightNum;
        }
      }
      if (weight.trim()) {
        const weightNum = parseFloat(weight);
        if (!isNaN(weightNum) && weightNum > 0 && weightNum <= 1000) {
          updates.weight = weightNum;
        }
      }

      if (Object.keys(updates).length === 0) {
        Alert.alert("No Changes", "No changes detected to update.");
        setEditing(false);
        return;
      }

      const result = await updateUser(updates);
      
      if (result.success) {
        Alert.alert("Success", "Profile updated successfully!");
        setEditing(false);
      } else {
        Alert.alert("Error", result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/login");
            } catch (err) {
              console.error("Logout error:", err);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigateToHistory = () => {
    router.push("/userhistory");
  };

  const validateAge = (text: string) => {
    const num = parseInt(text);
    return text === "" || (!isNaN(num) && num > 0 && num <= 120);
  };

  const validateHeight = (text: string) => {
    const num = parseFloat(text);
    return text === "" || (!isNaN(num) && num > 0 && num <= 300);
  };

  const validateWeight = (text: string) => {
    const num = parseFloat(text);
    return text === "" || (!isNaN(num) && num > 0 && num <= 1000);
  };

  const getEditButtonStyle = () => {
    if (editing) {
      return isDark ? "bg-red-600" : "bg-red-500";
    }
    return isDark ? "bg-blue-600" : "bg-blue-500";
  };

  const getInputStyle = (isEditing: boolean) => {
    if (isEditing) {
      return isDark
        ? "bg-gray-700 border-purple-500 text-white"
        : "bg-gray-50 border-blue-500 text-gray-900";
    }
    return isDark
      ? "bg-gray-700 border-gray-600 text-gray-300"
      : "bg-gray-100 border-gray-300 text-gray-600";
  };

  const getSaveButtonStyle = () => {
    if (isUpdating) {
      return isDark ? "bg-gray-600" : "bg-gray-400";
    }
    return isDark ? "bg-green-600" : "bg-green-500";
  };

  const testBackendConnection = async () => {
    try {
      console.log("🔍 Testing backend connection...");
      const result = await findWorkingBaseUrl();
      
      if (result.success) {
        Alert.alert(
          "✅ Backend Connected", 
          `Connected to: ${result.url}\nResponse time: ${result.responseTime}ms\nStatus: ${JSON.stringify(result.data)}`
        );
      } else {
        Alert.alert(
          "❌ Backend Connection Failed", 
          `Failed to connect to backend.\nError: ${result.error}\nTried URL: ${result.url}`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to test backend connection");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
        contentContainerStyle={{ paddingTop: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className={`px-6 py-8 ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm`}>
          <View className="flex-row items-center justify-between mb-6">
            <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Profile
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={testBackendConnection}
                className={`px-4 py-2 rounded-xl flex-row items-center gap-2 ${
                  isDark ? "bg-green-600" : "bg-green-500"
                }`}
              >
                <Ionicons name="pulse-outline" size={16} color="white" />
                <Text className="text-white font-medium">Test API</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={navigateToHistory}
                className={`px-4 py-2 rounded-xl flex-row items-center gap-2 ${
                  isDark ? "bg-purple-600" : "bg-purple-500"
                }`}
              >
                <Ionicons name="time-outline" size={16} color="white" />
                <Text className="text-white font-medium">History</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleEdit}
                className={`px-4 py-2 rounded-xl flex-row items-center gap-2 ${getEditButtonStyle()}`}
              >
                <Ionicons 
                  name={editing ? "close-outline" : "create-outline"} 
                  size={16} 
                  color="white" 
                />
                <Text className="text-white font-medium">
                  {editing ? "Cancel" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Avatar & Basic Info */}
          <View className="items-center mb-6">
            <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
              isDark ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-gradient-to-br from-blue-500 to-purple-500"
            }`}>
              <Text className="text-white text-2xl font-bold">
                {getInitials(name)}
              </Text>
            </View>
            <Text className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {name || "User"}
            </Text>
            <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {email}
            </Text>
          </View>
        </View>

        {/* Profile Form */}
        <View className="px-6 py-6 space-y-6">
          {/* Personal Information Section */}
          <View className={`p-6 rounded-2xl ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm`}>
            <Text className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Personal Information
            </Text>
            
            {/* Name Field */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Full Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                editable={editing}
                className={`p-4 rounded-xl border text-base ${getInputStyle(editing)}`}
                placeholder="Enter your full name"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
            </View>

            {/* Email Field (Read-only) */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Email Address
              </Text>
              <TextInput
                value={email}
                editable={false}
                className={`p-4 rounded-xl border text-base ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-400"
                    : "bg-gray-100 border-gray-300 text-gray-500"
                }`}
                placeholder="Email address"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Text className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Email cannot be changed
              </Text>
            </View>

            {/* Phone Field */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Phone Number
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                editable={editing}
                className={`p-4 rounded-xl border text-base ${getInputStyle(editing)}`}
                placeholder="Enter your phone number"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Health Metrics Section */}
          <View className={`p-6 rounded-2xl ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm`}>
            <Text className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Health Metrics
            </Text>

            <View className="flex-row gap-4">
              {/* Age Field */}
              <View className="flex-1">
                <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Age (years)
                </Text>
                <TextInput
                  value={age}
                  onChangeText={(text) => {
                    if (validateAge(text)) {
                      setAge(text);
                    }
                  }}
                  editable={editing}
                  className={`p-4 rounded-xl border text-base ${getInputStyle(editing)}`}
                  placeholder="Age"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  keyboardType="numeric"
                />
              </View>

              {/* Height Field */}
              <View className="flex-1">
                <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Height (cm)
                </Text>
                <TextInput
                  value={height}
                  onChangeText={(text) => {
                    if (validateHeight(text)) {
                      setHeight(text);
                    }
                  }}
                  editable={editing}
                  className={`p-4 rounded-xl border text-base ${getInputStyle(editing)}`}
                  placeholder="Height"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  keyboardType="numeric"
                />
              </View>

              {/* Weight Field */}
              <View className="flex-1">
                <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Weight (kg)
                </Text>
                <TextInput
                  value={weight}
                  onChangeText={(text) => {
                    if (validateWeight(text)) {
                      setWeight(text);
                    }
                  }}
                  editable={editing}
                  className={`p-4 rounded-xl border text-base ${getInputStyle(editing)}`}
                  placeholder="Weight"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {editing && (
              <Text className={`text-xs mt-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                💡 Age: 1-120 years, Height: 1-300 cm, Weight: 1-1000 kg
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          {editing && (
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleSave}
                disabled={isUpdating}
                className={`p-4 rounded-xl flex-row items-center justify-center gap-2 ${getSaveButtonStyle()} shadow-sm`}
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="checkmark-outline" size={20} color="white" />
                )}
                <Text className="text-white font-semibold text-base">
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Network Health Check Section */}
          <View className={`p-6 rounded-2xl ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm`}>
            <Text className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Network Diagnostics
            </Text>
            <HealthCheckButton 
              isDark={isDark} 
              onResult={(result) => {
                console.log('Health check result from Profile:', result);
              }}
            />
          </View>

          {/* Logout Section */}
          <View className={`p-6 rounded-2xl ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm`}>
            <TouchableOpacity
              onPress={handleLogout}
              className={`p-4 rounded-xl flex-row items-center justify-center gap-2 ${
                isDark ? "bg-red-600" : "bg-red-500"
              } shadow-sm`}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text className="text-white font-semibold text-base">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
