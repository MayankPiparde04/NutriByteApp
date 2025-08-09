import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  // Sample user data state
  const [name, setName] = useState("Mayank Piparde");
  const [email, setEmail] = useState("mayank@example.com");
  const [phone, setPhone] = useState("9876543210");
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [editing, setEditing] = useState(false);

  // Sample history data (replace with your real data source)
  const historyData = [
    { id: 1, action: "Logged in", date: "2025-08-07 10:45 AM" },
    { id: 2, action: "Uploaded ingredients", date: "2025-08-06 05:23 PM" },
    { id: 3, action: "Checked nutrition summary", date: "2025-08-05 08:12 AM" },
  ];

  const toggleEdit = () => setEditing(!editing);

  const handleSave = () => {
    // Add validation and save logic here (backend integration)
    Alert.alert("Profile Updated", "Your changes have been saved.");
    setEditing(false);
  };
  const getInitials = (name: string | undefined): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top }}
      className="bg-gray-50 dark:bg-gray-900"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center px-6 py-8">
          <View
            className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600"
            style={{
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 7,
            }}
          >
            <Text className="text-4xl font-extrabold text-white select-none">
              {getInitials(name)}
            </Text>
          </View>

          <View className="mt-6 items-center">
            {editing ? (
              <TextInput
                value={name}
                onChangeText={setName}
                className="text-3xl font-bold text-center border-b-2 border-blue-500 px-4 py-2 text-gray-900 dark:text-white"
                style={{ minWidth: 200 }}
              />
            ) : (
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                {name}
              </Text>
            )}
          </View>
        </View>

        {/* Settings Card */}
        <View className="px-6 mb-8">
          <View
            className="rounded-3xl p-6 bg-white dark:bg-gray-800"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Personal Info
              </Text>
              <TouchableOpacity
                onPress={editing ? handleSave : toggleEdit}
                className={`px-6 py-3 rounded-full ${
                  editing
                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                    : "bg-gradient-to-r from-blue-500 to-purple-600"
                }`}
                style={{
                  shadowColor: editing ? "#10b981" : "#8B5CF6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Text className="text-white font-semibold">
                  {editing ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Field */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="mail"
                  size={20}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Email Address
                </Text>
              </View>
              {editing ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="px-4 py-3 rounded-xl border-2 text-base bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <View className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <Text className="text-base text-gray-900 dark:text-gray-200">
                    {email}
                  </Text>
                </View>
              )}
            </View>

            {/* Phone Field */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="call"
                  size={20}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Phone Number
                </Text>
              </View>
              {editing ? (
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className="px-4 py-3 rounded-xl border-2 text-base bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <View className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <Text className="text-base text-gray-900 dark:text-gray-200">
                    {phone}
                  </Text>
                </View>
              )}
            </View>

            {/* Age Field */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="calendar"
                  size={20}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Age (years)
                </Text>
              </View>
              {editing ? (
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  className="px-4 py-3 rounded-xl border-2 text-base bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <View className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <Text className="text-base text-gray-900 dark:text-gray-200">
                    {age} years
                  </Text>
                </View>
              )}
            </View>

            {/* Height Field */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="resize"
                  size={20}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Height (cm)
                </Text>
              </View>
              {editing ? (
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  className="px-4 py-3 rounded-xl border-2 text-base bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <View className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <Text className="text-base text-gray-900 dark:text-gray-200">
                    {height} cm
                  </Text>
                </View>
              )}
            </View>

            {/* Weight Field */}
            <View>
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="fitness"
                  size={20}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Weight (kg)
                </Text>
              </View>
              {editing ? (
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  className="px-4 py-3 rounded-xl border-2 text-base bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <View className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <Text className="text-base text-gray-900 dark:text-gray-200">
                    {weight} kg
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Activity History Card */}
        <View className="px-6 pb-8">
          <View
            className="rounded-3xl p-6 bg-white dark:bg-gray-800"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center mb-6">
              <Ionicons
                name="time"
                size={24}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
              <Text className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </Text>
            </View>

            <View className="space-y-3">
              {historyData.map((item) => (
                <View
                  key={item.id}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-medium text-base text-gray-900 dark:text-white">
                        {item.action}
                      </Text>
                      <Text className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                        {item.date}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={isDark ? "#6b7280" : "#9ca3af"}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
