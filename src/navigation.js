// src/navigation.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "./theme";
import { useLanguage } from "./i18n/LanguageContext";

import HomeScreen from "./screens/HomeScreen";
import ChurchesScreen from "./screens/ChurchesScreen";
import ScheduleScreen from "./screens/ScheduleScreen";
import MapScreen from "./screens/MapScreen";
import MoreScreen from "./screens/MoreScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { t } = useLanguage();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Churches") {
              iconName = focused ? "business" : "business-outline";
            } else if (route.name === "Schedules") {
              iconName = focused ? "time" : "time-outline";
            } else if (route.name === "Map") {
              iconName = focused ? "map" : "map-outline";
            } else if (route.name === "More") {
              iconName = focused ? "ellipsis-horizontal" : "ellipsis-horizontal-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.crimson,
          tabBarInactiveTintColor: "#8a8175",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: t("nav.home") }} />
        <Tab.Screen
          name="Churches"
          component={ChurchesScreen}
          options={{ title: t("nav.parishes") }}
        />
        <Tab.Screen
          name="Schedules"
          component={ScheduleScreen}
          options={{ title: t("nav.schedules") }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{ title: t("nav.locator") }}
        />
        <Tab.Screen
          name="More"
          component={MoreScreen}
          options={{ title: t("nav.curia") }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
