import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import auth from "@react-native-firebase/auth";
import HomeScreen from "../screens/HomeScreen";
import SevaBookingScreen from "../screens/SevaBookingScreen";
import RoomBookingScreen from "../screens/RoomBookingScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PanchangaScreen from "../screens/PanchangaScreen";
import EventCalendarScreen from "../screens/EventCalendarScreen";
import HistoryParamparaScreen from "../screens/HistoryParamparaScreen";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../utils/translations";

const Tab = createBottomTabNavigator();

type AppDrawerProps = {
  initialRouteName?: string;
};

export default function AppDrawer({ initialRouteName }: AppDrawerProps) {
  const { language } = useLanguage();
  
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#999",
        headerRight: () => (
          <TouchableOpacity onPress={() => auth().signOut()} style={{ marginRight: 15 }}>
            <Icon name="log-out-outline" size={28} color="#d32f2f" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen 
        name="HomePage" 
        component={HomeScreen}
        options={{
          tabBarLabel: t('tabs.home', language),
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Seva Booking" 
        component={SevaBookingScreen}
        options={{
          tabBarLabel: t('tabs.sevaBooking', language),
          tabBarIcon: ({ color, size }) => <Icon name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Event Calendar"
        component={EventCalendarScreen}
        options={{
          tabBarLabel: t('tabs.eventCalendar', language),
          tabBarIcon: ({ color, size }) => <Icon name="calendar-number-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryParamparaScreen}
        options={{
          tabBarLabel: t('tabs.history', language),
          tabBarIcon: ({ color, size }) => <Icon name="library-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Room Booking" 
        component={RoomBookingScreen}
        options={{
          tabBarLabel: t('tabs.roomBooking', language),
          tabBarIcon: ({ color, size }) => <Icon name="bed-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Panchanga" 
        component={PanchangaScreen}
        options={{
          tabBarLabel: t('tabs.panchanga', language),
          tabBarIcon: ({ color, size }) => <Icon name="book-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile', language),
          tabBarIcon: ({ color, size }) => <Icon name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
