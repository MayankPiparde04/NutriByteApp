import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useColorScheme } from "nativewind";

export default function TabLayout() {
  const { colorScheme } = useColorScheme(); // from nativewind

  const homeIconName = Platform.OS === "ios" ? "home" : "home-outline";
  const cameraIconName = Platform.OS === "ios" ? "camera" : "camera-outline";
  const reeIconName =
    Platform.OS === "ios" ? "chatbox-ellipses" : "chatbox-ellipses-outline";
  const profileIconName =
    Platform.OS === "ios" ? "person-circle" : "person-circle-outline";

  const tabBackground = colorScheme === "dark" ? "#1f2937" : "#ffffff"; // bg-gray-800 / white
  const tabBorderColor = colorScheme === "dark" ? "#374151" : "#e5e7eb"; // border-gray-700 / border-gray-200

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colorScheme === "dark" ? "#fff" : "#000",
        tabBarInactiveTintColor: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
        tabBarStyle: {
          backgroundColor: tabBackground,
          borderTopColor: tabBorderColor,
          ...Platform.select({
            ios: { position: "absolute" },
            android: {},
            default: {},
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name={homeIconName} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ree"
        options={{
          title: "REE",
          tabBarStyle: { display: "none" }, // Hide tab bar in REE
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name={reeIconName} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name={profileIconName} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
