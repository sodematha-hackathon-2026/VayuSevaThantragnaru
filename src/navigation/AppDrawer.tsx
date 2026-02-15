import React from "react";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import auth from "@react-native-firebase/auth";
import HomeScreen from "../screens/HomeScreen";
import SevaBookingScreen from "../screens/SevaBookingScreen";
import RoomBookingScreen from "../screens/RoomBookingScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PanchangaScreen from "../screens/PanchangaScreen";
import EventCalendarScreen from "../screens/EventCalendarScreen";
import HistoryParamparaScreen from "../screens/HistoryParamparaScreen";
import QuizScreen from "../screens/QuizScreen";
import ContactUsScreen from "../screens/ContactUsScreen";
import BranchesScreen from "../screens/BranchesScreen";
import GalleryScreen from "../screens/GalleryScreen";
import ResourcesScreen from "../screens/ResourcesScreen";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../utils/translations";

const Drawer = createDrawerNavigator();

type AppDrawerProps = {
  initialRouteName?: string;
};

export default function AppDrawer({ initialRouteName }: AppDrawerProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <Drawer.Navigator
      initialRouteName={initialRouteName || "HomePage"}
      drawerContent={(props) => (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
          {props.state.routes.map((route, index) => {
            const focused = props.state.index === index;
            const descriptor = props.descriptors[route.key];
            const options = descriptor?.options || {};
            const labelText =
              typeof options.drawerLabel === "string"
                ? options.drawerLabel
                : typeof options.title === "string"
                  ? options.title
                  : route.name;
            const tintColor = focused ? "#C96A2B" : "#3B2416";

            return (
              <TouchableOpacity
                key={route.key}
                style={[styles.drawerItem, focused && styles.drawerItemActive]}
                onPress={() => props.navigation.navigate(route.name)}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
              >
                <View style={styles.drawerIcon}>
                  {options.drawerIcon?.({ color: tintColor, size: 22, focused })}
                </View>
                <Text style={[styles.drawerLabel, { color: tintColor }]}>{labelText}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              auth().signOut();
            }}
            accessibilityRole="button"
          >
            <View style={styles.drawerIcon}>
              <Icon name="log-out-outline" size={22} color="#d32f2f" />
            </View>
            <Text style={[styles.drawerLabel, { color: "#d32f2f" }]}>
              {t("common.logout", language)}
            </Text>
          </TouchableOpacity>
        </DrawerContentScrollView>
      )}
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 15 }}>
            <Icon name="menu" size={26} color="#8A4B2B" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => setLanguage(language === "en" ? "kn" : "en")}
            style={{ marginRight: 15 }}
            accessibilityRole="button"
            accessibilityLabel={t("common.languageSwitchLabel", language)}
          >
            <Text style={styles.langToggleText}>
              {language === "en"
                ? t("common.languageKannada", language)
                : t("common.languageEnglish", language)}
            </Text>
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="HomePage"
        component={HomeScreen}
        options={{ title: t("tabs.home", language), drawerIcon: ({ color, size }) => <Icon name="home" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t("tabs.profile", language), drawerIcon: ({ color, size }) => <Icon name="person-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Seva Booking"
        component={SevaBookingScreen}
        options={{ title: t("tabs.sevaBooking", language), drawerIcon: ({ color, size }) => <Icon name="calendar-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Event Calendar"
        component={EventCalendarScreen}
        options={{ title: t("tabs.eventCalendar", language), drawerIcon: ({ color, size }) => <Icon name="calendar-number-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Room Booking"
        component={RoomBookingScreen}
        options={{ title: t("tabs.roomBooking", language), drawerIcon: ({ color, size }) => <Icon name="bed-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Panchanga"
        component={PanchangaScreen}
        options={{ title: t("tabs.panchanga", language), drawerIcon: ({ color, size }) => <Icon name="book-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{ title: t("tabs.gallery", language), drawerIcon: ({ color, size }) => <Icon name="images-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Resources"
        component={ResourcesScreen}
        options={{ title: t("tabs.resources", language), drawerIcon: ({ color, size }) => <Icon name="bookmarks-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="History"
        component={HistoryParamparaScreen}
        options={{ title: t("tabs.history", language), drawerIcon: ({ color, size }) => <Icon name="library-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Quiz"
        component={QuizScreen}
        options={{ title: t("tabs.quiz", language), drawerIcon: ({ color, size }) => <Icon name="help-circle-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Our Branches"
        component={BranchesScreen}
        options={{ title: t("tabs.branches", language), drawerIcon: ({ color, size }) => <Icon name="map-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Contact Us"
        component={ContactUsScreen}
        options={{ title: t("tabs.contactUs", language), drawerIcon: ({ color, size }) => <Icon name="call-outline" size={size} color={color} /> }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    paddingVertical: 8,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 2,
  },
  drawerItemActive: {
    backgroundColor: "#FCE6D2",
  },
  drawerIcon: {
    width: 26,
    alignItems: "center",
    marginRight: 12,
  },
  drawerLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  langToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8A4B2B",
  },
});
