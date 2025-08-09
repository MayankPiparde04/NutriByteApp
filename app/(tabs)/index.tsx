import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const dummyData = {
  todayCalories: 1850,
  dailyCaloriesIntake: [
    { day: "Mon", calories: 1800 },
    { day: "Tue", calories: 1900 },
    { day: "Wed", calories: 1750 },
    { day: "Thu", calories: 2000 },
    { day: "Fri", calories: 1850 },
    { day: "Sat", calories: 2100 },
    { day: "Sun", calories: 1950 },
  ],
  bmiStats: {
    bmi: 22.4,
    bmiStatus: "Normal Weight",
    bodyFat: 18.7,
    bodyFatStatus: "Healthy Range",
  },
};

export default function Home() {
  const formatCalories = (cal) =>
    cal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const chartData = {
    labels: dummyData.dailyCaloriesIntake.map((d) => d.day),
    datasets: [
      {
        data: dummyData.dailyCaloriesIntake.map((d) => d.calories),
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red-600
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fef2f2", // red-50
    backgroundGradientTo: "#fee2e2", // red-200
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`, // red-700
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // gray-500
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#b91c1c", // red-800
    },
  };

  return (
    <View className="flex-1 pt-12 bg-white dark:bg-gray-900 px-6">
      {/* Header - Today's Calories and Add Button */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-1">
            Today's Calories
          </Text>
          <Text className="text-4xl font-bold text-red-600 dark:text-red-400">
            {formatCalories(dummyData.todayCalories)} kcal
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center bg-red-600 px-4 py-2 rounded-md shadow-md"
          activeOpacity={0.7}
          onPress={() => alert("Add Calories clicked")}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text className="text-white text-lg font-semibold ml-2">
            Add Calories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Line Chart for Daily Calories Intake */}
      <LineChart
        data={chartData}
        width={screenWidth - 48} // padding accounted
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          borderRadius: 16,
          marginBottom: 24,
          alignSelf: "center",
        }}
      />

      {/* BMI KPIs */}
      <View className="flex-row justify-between">
        {/* BMI */}
        <View className="flex-1 bg-indigo-100 dark:bg-indigo-900 rounded-lg p-4 mr-3 items-center shadow">
          <FontAwesome5
            name="weight"
            size={28}
            color="#4F46E5" // Indigo-600
            style={{ marginBottom: 8 }}
          />
          <Text className="text-indigo-700 dark:text-indigo-300 font-semibold text-lg">
            BMI
          </Text>
          <Text className="text-indigo-900 dark:text-indigo-100 text-3xl font-bold mt-2">
            {dummyData.bmiStats.bmi}
          </Text>
          <Text className="text-indigo-600 dark:text-indigo-300 mt-1 text-sm">
            {dummyData.bmiStats.bmiStatus}
          </Text>
        </View>

        {/* Body Fat % */}
        <View className="flex-1 bg-green-100 dark:bg-green-900 rounded-lg p-4 ml-3 items-center shadow">
          <MaterialIcons
            name="fitness-center"
            size={28}
            color="#16A34A" // Green-600
            style={{ marginBottom: 8 }}
          />
          <Text className="text-green-700 dark:text-green-300 font-semibold text-lg">
            Body Fat %
          </Text>
          <Text className="text-green-900 dark:text-green-100 text-3xl font-bold mt-2">
            {dummyData.bmiStats.bodyFat}%
          </Text>
          <Text className="text-green-600 dark:text-green-300 mt-1 text-sm">
            {dummyData.bmiStats.bodyFatStatus}
          </Text>
        </View>
      </View>
    </View>
  );
}
