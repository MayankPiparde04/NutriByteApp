import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router"; // for navigation
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllChatSummaries } from "../../lib/chatStorage";

export default function Profile() {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const [recentChats, setRecentChats] = useState<
    {
      chatId: string;
      title?: string;
      lastMessage?: any;
      lastUpdated?: number;
    }[]
  >([]);

  const handleDeleteChat = async (chatId: string) => {
    try {
      const storedChats = await getAllChatSummaries();
      const updated = storedChats.filter((c) => c.chatId !== chatId);

      await AsyncStorage.setItem("chat_summaries", JSON.stringify(updated));
      setRecentChats(updated);

      // Also remove the actual chat history file
      await AsyncStorage.removeItem(`chat_${chatId}`);
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        if (!mounted) return;
        const recents = await getAllChatSummaries();
        setRecentChats(recents);
      })();
      return () => {
        mounted = false;
      };
    }, [])
  );

  // Sample user data state
  const [name, setName] = useState("Mayank Piparde");
  const [email, setEmail] = useState("mayank@example.com");
  const [phone, setPhone] = useState("9876543210");
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadChats = async () => {
      const chats = await getAllChatSummaries();
      setRecentChats(chats);
    };
    loadChats();
  }, []);

  const openChat = (chatId: string) => {
    // adjust route to your app — example:
    // router.push(`/ree/${chatId}`);
  };
  const formatPreview = (m?: any) => {
    if (!m) return "No messages yet";
    if (m.text)
      return m.text.length > 80 ? m.text.slice(0, 77) + "..." : m.text;
    if (m.imageUri) return "📷 Image";
    return "";
  };

  const formatTime = (ts?: number) => (ts ? new Date(ts).toLocaleString() : "");

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
      className={isDark ? "bg-gray-950" : "bg-gray-50"}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center px-6 py-8">
          <View
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isDark ? "bg-blue-600" : "bg-blue-500"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Text className="text-2xl font-bold text-white">
              {getInitials(name)}
            </Text>
          </View>

          <View className="mt-6 items-center">
            {editing ? (
              <TextInput
                value={name}
                onChangeText={setName}
                className={`text-3xl font-bold text-center border-b-2 px-4 py-2 ${
                  isDark
                    ? "border-blue-400 text-white"
                    : "border-blue-500 text-gray-900"
                }`}
                style={{ minWidth: 200 }}
              />
            ) : (
              <Text className={`text-3xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                {name}
              </Text>
            )}
          </View>
        </View>

        {/* Settings Card */}
        <View className="px-6 mb-8">
          <View
            className={`rounded-2xl p-6 ${
              isDark ? "bg-gray-900" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Personal Info
              </Text>
              <TouchableOpacity
                onPress={editing ? handleSave : toggleEdit}
                className={`px-6 py-3 rounded-full ${
                  editing
                    ? isDark ? "bg-green-600" : "bg-green-500"
                    : isDark ? "bg-blue-600" : "bg-blue-500"
                }`}
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
                <Text className={`ml-2 text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  Email Address
                </Text>
              </View>
              {editing ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`px-4 py-3 rounded-xl border text-base ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                />
              ) : (
                <View className={`px-4 py-3 rounded-xl ${
                  isDark ? "bg-gray-800" : "bg-gray-50"
                }`}>
                  <Text className={`text-base ${
                    isDark ? "text-gray-200" : "text-gray-900"
                  }`}>
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
                <Text className={`ml-2 text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  Phone Number
                </Text>
              </View>
              {editing ? (
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className={`px-4 py-3 rounded-xl border text-base ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                />
              ) : (
                <View className={`px-4 py-3 rounded-xl ${
                  isDark ? "bg-gray-800" : "bg-gray-50"
                }`}>
                  <Text className={`text-base ${
                    isDark ? "text-gray-200" : "text-gray-900"
                  }`}>
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
                <Text className={`ml-2 text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  Age (years)
                </Text>
              </View>
              {editing ? (
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  className={`px-4 py-3 rounded-xl border text-base ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                />
              ) : (
                <View className={`px-4 py-3 rounded-xl ${
                  isDark ? "bg-gray-800" : "bg-gray-50"
                }`}>
                  <Text className={`text-base ${
                    isDark ? "text-gray-200" : "text-gray-900"
                  }`}>
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
                <Text className={`ml-2 text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  Height (cm)
                </Text>
              </View>
              {editing ? (
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  className={`px-4 py-3 rounded-xl border text-base ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                />
              ) : (
                <View className={`px-4 py-3 rounded-xl ${
                  isDark ? "bg-gray-800" : "bg-gray-50"
                }`}>
                  <Text className={`text-base ${
                    isDark ? "text-gray-200" : "text-gray-900"
                  }`}>
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
                <Text className={`ml-2 text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  Weight (kg)
                </Text>
              </View>
              {editing ? (
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  className={`px-4 py-3 rounded-xl border text-base ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                />
              ) : (
                <View className={`px-4 py-3 rounded-xl ${
                  isDark ? "bg-gray-800" : "bg-gray-50"
                }`}>
                  <Text className={`text-base ${
                    isDark ? "text-gray-200" : "text-gray-900"
                  }`}>
                    {weight} kg
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Activity History Card */}
        <View className="space-y-3 px-6 mb-8">
          {recentChats.length > 0 ? (
            recentChats.map((chat) => {
              const firstMsg = chat.firstMessage;
              const titleWord = firstMsg?.text
                ? firstMsg.text.split(" ")[0]
                : "Untitled";

              const timeLabel = chat.firstMessageTime
                ? new Date(chat.firstMessageTime).toLocaleString()
                : "";

              return (
                <TouchableOpacity
                  key={chat.chatId}
                  onPress={() => openChat(chat.chatId)}
                  activeOpacity={0.7}
                  className={`flex-row items-center justify-between rounded-xl p-4 ${
                    isDark ? "bg-gray-900" : "bg-white"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0.3 : 0.05,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  {/* Left: Title */}
                  <Text className={`text-base font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {titleWord}
                  </Text>

                  {/* Right: Time + Delete */}
                  <View style={{ alignItems: "flex-end" }}>
                    <Text className={`text-xs mb-1 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {timeLabel}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteChat(chat.chatId)}
                      className="bg-red-500 rounded-full p-1"
                    >
                      <Ionicons name="trash" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text className={`text-sm ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}>
              No recent activity
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
