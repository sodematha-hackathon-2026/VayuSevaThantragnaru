import React from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { t, translations } from "../utils/translations";

const MAIN_EMAIL = "office@sodematha.in";

export default function ContactUsScreen() {
  const { language } = useLanguage();
  const contacts = translations[language].contact.locations;

  const callNumber = (phone: string) => {
    const clean = phone.replace(/\s+/g, "");
    Linking.openURL(`tel:${clean}`);
  };

  const emailOffice = () => {
    Linking.openURL(`mailto:${MAIN_EMAIL}`);
  };

  const openMap = () => {
    const query = encodeURIComponent(t("contact.mapQuery", language));
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("contact.title", language)}</Text>
        <Text style={styles.subtitle}>{t("contact.subtitle", language)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("contact.officeEmailTitle", language)}</Text>
        <Text style={styles.bodyText}>{MAIN_EMAIL}</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={emailOffice}>
          <Text style={styles.actionText}>{t("common.sendEmail", language)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("contact.mainLocationsTitle", language)}</Text>
        {contacts.map((item) => (
          <View key={item.title} style={styles.contactBlock}>
            <Text style={styles.contactTitle}>{item.title}</Text>
            {item.phones.map((phone) => (
              <TouchableOpacity key={phone} onPress={() => callNumber(phone)}>
                <Text style={styles.phoneText}>{phone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <TouchableOpacity style={styles.actionBtn} onPress={openMap}>
          <Text style={styles.actionText}>{t("common.openMap", language)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("contact.proTitle", language)}</Text>
        <Text style={styles.bodyText}>{t("contact.proText", language)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5E3CE" },
  content: { paddingBottom: 40 },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#3B2416" },
  subtitle: { fontSize: 13, color: "#7A5A45", marginTop: 4 },
  card: {
    backgroundColor: "#FFF4E6",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2C3A4",
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#3B2416", marginBottom: 6 },
  bodyText: { fontSize: 13, color: "#7A5A45", marginTop: 4, lineHeight: 18 },
  contactBlock: { marginTop: 10 },
  contactTitle: { fontSize: 13, fontWeight: "700", color: "#3B2416" },
  phoneText: { fontSize: 13, color: "#8A4B2B", marginTop: 4 },
  actionBtn: {
    marginTop: 12,
    backgroundColor: "#C96A2B",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
