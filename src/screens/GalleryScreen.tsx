import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { t, translations } from "../utils/translations";

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
};

export default function GalleryScreen() {
  const { language } = useLanguage();
  const items = translations[language].gallery.items as GalleryItem[];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("gallery.title", language)}</Text>
        <Text style={styles.subtitle}>{t("gallery.subtitle", language)}</Text>
      </View>

      {items.length ? (
        items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.photo} resizeMode="cover" />
            <Text style={styles.caption}>{item.title}</Text>
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("gallery.comingSoonTitle", language)}</Text>
          <Text style={styles.bodyText}>{t("gallery.comingSoonBody", language)}</Text>
        </View>
      )}
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
  photo: {
    width: "100%",
    height: 190,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#F3DFC8",
  },
  caption: { fontSize: 13, color: "#3B2416", lineHeight: 18, fontWeight: "600" },
});
