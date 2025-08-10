import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function Login() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (text: string) => {
    const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(text);
  };

  const validatePassword = (text: string) => text.length >= 6;

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(
      validateEmail(text) ? "" : "Please enter a valid email address"
    );
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(
      validatePassword(text) ? "" : "Password must be at least 6 characters"
    );
  };

  const handleLogin = async () => {
    if (emailError || passwordError || !email || !password) {
      Alert.alert("Validation Error", "Please correct the errors to continue.");
      return;
    }
    
    try {
      const result = await login(email, password);
      if (result.success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", result.error || "An error occurred during login");
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Login Failed", "An unexpected error occurred");
    }
  };

  const isFormValid = !emailError && !passwordError && email && password;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={
          isDark ? { backgroundColor: "#030712" } : { backgroundColor: "#fff" }
        }
      >
      <View className="flex-1 px-8">
        <View className="flex-1 justify-center">
          <Text
            className={`text-4xl font-extrabold mb-12 text-center ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Welcome Back
          </Text>

          {/* Email Field */}
          <View className="mb-6">
            <Text
              className={`text-sm font-semibold mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={handleEmailChange}
              placeholder="you@example.com"
              placeholderTextColor={isDark ? "#a1a1aa" : "#6b7280"}
              keyboardType="email-address"
              autoCapitalize="none"
              className={`border rounded-md px-4 py-3 text-base ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } ${emailError ? "border-red-600" : "focus:border-blue-500"}`}
            />
            <Text
              className={`text-xs mt-1 ${
                emailError
                  ? "text-red-600"
                  : isDark
                    ? "text-gray-400"
                    : "text-gray-500"
              }`}
            >
              Enter your valid email address
            </Text>
            {!!emailError && (
              <Text className="text-red-600 mt-1 font-semibold">
                {emailError}
              </Text>
            )}
          </View>

          {/* Password Field */}
          <View className="mb-8 relative">
            <Text
              className={`text-sm font-semibold mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="••••••••"
              placeholderTextColor={isDark ? "#a1a1aa" : "#6b7280"}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className={`border rounded-md px-4 py-3 text-base ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } ${passwordError ? "border-red-600" : "focus:border-blue-500"}`}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
              accessibilityRole="button"
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color={isDark ? "#9CA3AF" : "#4B5563"}
              />
            </TouchableOpacity>
            <Text
              className={`text-xs mt-1 ${
                passwordError
                  ? "text-red-600"
                  : isDark
                    ? "text-gray-400"
                    : "text-gray-500"
              }`}
            >
              Must be at least 6 characters
            </Text>
            {!!passwordError && (
              <Text className="text-red-600 mt-1 font-semibold">
                {passwordError}
              </Text>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            disabled={!isFormValid || isLoading}
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityLabel="Login"
            className={`rounded-md py-4 ${
              isFormValid && !isLoading ? "bg-blue-700" : "bg-blue-300"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Login
              </Text>
            )}
          </TouchableOpacity>

          {/* New to NutriByte Button */}
          <View className="flex-row justify-center items-center mt-6 space-x-1">
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-700"} text-sm`}
            >
              New to NutriByte?
            </Text>
            <TouchableOpacity
              onPress={() => {
                router.push("/register");
              }}
              accessibilityRole="button"
              accessibilityLabel="Go to Register"
            >
              <Text
                className={`text-sm font-medium ${
                  isDark ? "text-green-400" : "text-green-600"
                } underline`}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
