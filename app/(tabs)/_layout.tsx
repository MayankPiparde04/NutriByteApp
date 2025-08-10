import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Platform } from "react-native";

// Icon components
const HomeIcon = ({ color }: { color: string }) => {
  const homeIconName = Platform.OS === "ios" ? "home" : "home-outline";
  return <Ionicons size={28} name={homeIconName} color={color} />;
};

const REEIcon = ({ color }: { color: string }) => {
  const reeIconName =
    Platform.OS === "ios" ? "chatbox-ellipses" : "chatbox-ellipses-outline";
  return <Ionicons size={28} name={reeIconName} color={color} />;
};

const ProfileIcon = ({ color }: { color: string }) => {
  const profileIconName =
    Platform.OS === "ios" ? "person-circle" : "person-circle-outline";
  return <Ionicons size={28} name={profileIconName} color={color} />;
};

const HistoryIcon = ({ color }: { color: string }) => {
  const historyIconName = Platform.OS === "ios" ? "time" : "time-outline";
  return <Ionicons size={28} name={historyIconName} color={color} />;
};

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  const tabBackground = colorScheme === "dark" ? "#1f2937" : "#ffffff";
  const tabBorderColor = colorScheme === "dark" ? "#374151" : "#e5e7eb";

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
      {/* Only override options if needed */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: HomeIcon,
        }}
      />
      <Tabs.Screen
        name="ree"
        options={{
          title: "REE",
          tabBarStyle: { display: "none" }, // Hide tab bar on REE screen
          tabBarIcon: REEIcon,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ProfileIcon,
        }}
      />
      <Tabs.Screen
        name="userhistory"
        options={{
          title: "History",
          tabBarIcon: HistoryIcon,
          href: null, // Hide from tab bar since it's accessed from profile
        }}
      />
    </Tabs>
  );
}
