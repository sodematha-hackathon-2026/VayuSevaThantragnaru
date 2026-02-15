import React, { useState } from "react";
import { createStackNavigator } from "@react-navigation/native-stack";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import HomeScreen from "../screens/HomeScreen";
import SevaBookingScreen from "../screens/SevaBookingScreen";
import RoomBookingScreen from "../screens/RoomBookingScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PanchangaScreen from "../screens/PanchangaScreen";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../utils/translations";

const Stack = createStackNavigator();

function MenuButton({ navigation }: any) {
  const [visible, setVisible] = useState(false);
  const { language } = useLanguage();

  const navigate = (screen: string) => {
    setVisible(false);
    navigation.navigate(screen);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={{ marginRight: 15 }}>
        <Icon name="bars" size={24} color="#111" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.item} onPress={() => navigate("HomePage")}>
              <Icon name="home" size={20} color="#111" />
              <Text style={styles.itemText}>{t("tabs.home", language)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => navigate("Seva Booking")}>
              <Icon name="calendar" size={20} color="#111" />
              <Text style={styles.itemText}>{t("tabs.sevaBooking", language)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => navigate("Room Booking")}>
              <Icon name="bed" size={20} color="#111" />
              <Text style={styles.itemText}>{t("tabs.roomBooking", language)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => navigate("Panchanga")}>
              <Icon name="book" size={20} color="#111" />
              <Text style={styles.itemText}>{t("tabs.panchanga", language)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.item} onPress={() => navigate("Profile")}>
              <Icon name="user" size={20} color="#111" />
              <Text style={styles.itemText}>{t("tabs.profile", language)}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function CustomDrawer() {
  const { language } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerRight: () => <MenuButton navigation={navigation} />,
      })}
    >
      <Stack.Screen name="HomePage" component={HomeScreen} options={{ title: t("tabs.home", language) }} />
      <Stack.Screen name="Seva Booking" component={SevaBookingScreen} />
      <Stack.Screen name="Room Booking" component={RoomBookingScreen} />
      <Stack.Screen name="Panchanga" component={PanchangaScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-start", alignItems: "flex-end" },
  menu: { backgroundColor: "#fff", width: 250, marginTop: 60, marginRight: 10, borderRadius: 12, padding: 10 },
  item: { flexDirection: "row", alignItems: "center", padding: 15, gap: 15 },
  itemText: { fontSize: 16, fontWeight: "600" },
});
