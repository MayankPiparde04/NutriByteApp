import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Register() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  // Validation helpers
  const validateFullName = (text: string) => text.trim().length >= 3;

  const validateEmail = (text: string) => {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(text);
  };

  const validatePassword = (text: string) => text.length >= 6;

  const validatePhone = (text: string) => {
    const regex = /^[0-9]{10,15}$/;
    return regex.test(text);
  };

  // Handlers update state & validation
  const handleFullNameChange = (text: string) => {
    setFullName(text);
    setErrors((prev) => ({
      ...prev,
      fullName: validateFullName(text)
        ? ""
        : "Full name must be at least 3 characters",
    }));
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(text) ? "" : "Please enter a valid email address",
    }));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(text)
        ? ""
        : "Password must be at least 6 characters",
    }));
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    setErrors((prev) => ({
      ...prev,
      phone: validatePhone(text)
        ? ""
        : "Enter a valid phone number (10-15 digits)",
    }));
  };

  const isFormValid =
    !errors.fullName &&
    !errors.email &&
    !errors.password &&
    !errors.phone &&
    fullName &&
    email &&
    password &&
    phone;

  const handleRegister = () => {
    if (!isFormValid) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors before submitting."
      );
      return;
    }
    Alert.alert("Success", "Registered successfully!");
    // Connect with backend API here
  };

  return (
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
            Create Account
          </Text>

          {/* Full Name */}
          <View className="mb-6">
            <Text
              className={`text-sm font-semibold mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Full Name
            </Text>
            <TextInput
              value={fullName}
              onChangeText={handleFullNameChange}
              placeholder="John Doe"
              placeholderTextColor={isDark ? "#a1a1aa" : "#6b7280"}
              autoCapitalize="words"
              className={`border rounded-md px-4 py-3 text-base ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } ${errors.fullName ? "border-red-600" : "focus:border-blue-500"}`}
            />
            {!!errors.fullName && (
              <Text className="text-red-600 mt-1 font-semibold">
                {errors.fullName}
              </Text>
            )}
          </View>

          {/* Email */}
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
              } ${errors.email ? "border-red-600" : "focus:border-blue-500"}`}
            />
            {!!errors.email && (
              <Text className="text-red-600 mt-1 font-semibold">
                {errors.email}
              </Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-6 relative">
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
              } ${errors.password ? "border-red-600" : "focus:border-blue-500"}`}
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
            {!!errors.password && (
              <Text className="text-red-600 mt-1 font-semibold">
                {errors.password}
              </Text>
            )}
          </View>

          {/* Phone Number */}
          <View className="mb-8">
            <Text
              className={`text-sm font-semibold mb-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Phone Number
            </Text>
            <TextInput
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="1234567890"
              placeholderTextColor={isDark ? "#a1a1aa" : "#6b7280"}
              keyboardType="phone-pad"
              autoCapitalize="none"
              className={`border rounded-md px-4 py-3 text-base ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              } ${errors.phone ? "border-red-600" : "focus:border-blue-500"}`}
            />
            {!!errors.phone && (
              <Text className="text-red-600 mt-1 font-semibold">
                {errors.phone}
              </Text>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            disabled={!isFormValid}
            onPress={handleRegister}
            className={`rounded-md py-4 ${
              isFormValid ? "bg-green-700" : "bg-green-300"
            } mb-4`}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Register
            </Text>
          </TouchableOpacity>

          {/* Already have account button */}
          <View className="flex-row justify-center items-center mt-4 space-x-1">
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-700"} text-sm`}
            >
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => {
                router.push("/login");
              }}
              accessibilityRole="button"
            >
              <Text
                className={`text-sm font-medium ${
                  isDark ? "text-blue-400" : "text-blue-600"
                } underline`}
              >
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
