import React from "react";
import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const headerShown = useClientOnlyValue(false, true);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Browse",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={
                Platform.select({
                  ios: "book.pages",
                  android: "book",
                  default: "book",
                }) ?? "book"
              }
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={
                Platform.select({
                  ios: "person.crop.circle",
                  android: "person",
                  default: "person",
                }) ?? "person"
              }
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
    </Tabs>
  );
}
