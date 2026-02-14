import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, Text } from "react-native";
import auth from "@react-native-firebase/auth";
import HomeScreen from "../screens/HomeScreen";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => auth().signOut()}
              style={{ marginRight: 14 }}
            >
              <Text style={{ fontWeight: "800" }}>Sign Out</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
