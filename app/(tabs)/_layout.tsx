import { Tabs } from "expo-router";
import React from "react";
import { Platform, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Choose icons based on platform
  const homeIconName = Platform.OS === "ios" ? "home" : "home-outline";
  const profileIconName =
    Platform.OS === "ios" ? "paper-plane" : "paper-plane-outline";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            // you can add blur or translucent styles here if desired
          },
          android: {},
          default: {},
        }),
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
