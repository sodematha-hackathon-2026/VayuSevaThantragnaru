import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { t, translations } from "../utils/translations";

export default function BranchesScreen() {
  const { language } = useLanguage();
  const branches = translations[language].branches.items;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("branches.title", language)}</Text>
        <Text style={styles.subtitle}>{t("branches.subtitle", language)}</Text>
      </View>

      {branches.map((item) => (
        <View key={item.title} style={styles.card}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          <Text style={styles.bodyText}>{item.detail}</Text>
        </View>
      ))}
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
  bodyText: { fontSize: 13, color: "#7A5A45", lineHeight: 18 },
});
