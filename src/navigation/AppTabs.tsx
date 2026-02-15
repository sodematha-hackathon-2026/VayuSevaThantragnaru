import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, Text } from "react-native";
import auth from "@react-native-firebase/auth";
import HomeScreen from "../screens/HomeScreen";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../utils/translations";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const { language } = useLanguage();

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
              <Text style={{ fontWeight: "800" }}>{t("common.signOut", language)}</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
