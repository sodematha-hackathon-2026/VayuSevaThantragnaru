import React, { useMemo, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../utils/translations";

type GuruItem = {
  id: string;
  name: string;
  timeline?: string;
  ashramaGuru?: string;
  ashramaShishya?: string;
  poorvashrama?: string;
  aaradhane?: string;
  keyWorks?: string;
  vrindavana?: string;
  address?: string;
  description?: string;
};

const GURUS: GuruItem[] = [
  {
    id: "1",
    name: "Sri Vishnu Teertharu",
    timeline: "TBD",
    description: "Details will be updated by the admin.",
  },
  {
    id: "2",
    name: "Sri Vadiraja Theertharu",
    timeline: "TBD",
    description: "Details will be updated by the admin.",
  },
  {
    id: "3",
    name: "Sri Vishwothama Theertha",
    timeline: "TBD",
    description: "Details will be updated by the admin.",
  },
  {
    id: "4",
    name: "Sri Vishwavallabha Theertha",
    timeline: "TBD",
    description: "Details will be updated by the admin.",
  },
];

export default function HistoryParamparaScreen() {
  const { language } = useLanguage();
  const [search, setSearch] = useState("");

  const filteredGurus = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return GURUS;
    return GURUS.filter((g) => g.name.toLowerCase().includes(query));
  }, [search]);

  const openHistory = async () => {
    const url = "https://www.sodematha.in/index.html";
    const can = await Linking.canOpenURL(url);
    if (can) Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("history.title", language)}</Text>
        <Text style={styles.subtitle}>{t("history.subtitle", language)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("history.historyTitle", language)}</Text>
        <Text style={styles.bodyText}>{t("history.detailsPending", language)}</Text>
        <TouchableOpacity style={styles.linkRow} onPress={openHistory}>
          <Icon name="link" size={16} color="#1b1b1b" />
          <Text style={styles.linkText}>{t("history.historyLink", language)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("history.paramparaTitle", language)}</Text>
        <View style={styles.searchRow}>
          <Icon name="search" size={18} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("history.searchPlaceholder", language)}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.micBtn} accessibilityRole="button">
            <Icon name="mic" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {filteredGurus.map((guru) => (
          <View key={guru.id} style={styles.card}>
            <Text style={styles.cardTitle}>{guru.name}</Text>
            <Text style={styles.cardMeta}>
              {t("history.timeline", language)}: {guru.timeline || t("history.detailsPending", language)}
            </Text>
            <Text style={styles.cardMeta}>
              {t("history.ashramaGuru", language)}: {guru.ashramaGuru || t("history.detailsPending", language)}
            </Text>
            <Text style={styles.cardMeta}>
              {t("history.ashramaShishya", language)}: {guru.ashramaShishya || t("history.detailsPending", language)}
            </Text>
            <Text style={styles.cardMeta}>
              {t("history.poorvashrama", language)}: {guru.poorvashrama || t("history.detailsPending", language)}
            </Text>
            <Text style={styles.cardMeta}>
              {t("history.aaradhane", language)}: {guru.aaradhane || t("history.detailsPending", language)}
            </Text>
            <Text style={styles.cardMeta}>
              {t("history.keyWorks", language)}: {guru.keyWorks || t("history.detailsPending", language)}
            </Text>
            <Text style={styles.cardMeta}>
              {t("history.vrindavana", language)}: {guru.vrindavana || t("history.detailsPending", language)}
            </Text>
            <Text style={styles.cardMeta}>
              {t("history.address", language)}: {guru.address || t("history.detailsPending", language)}
            </Text>
            <Text style={styles.cardDesc}>{guru.description || t("history.detailsPending", language)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("history.bhootarajaruTitle", language)}</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>{t("history.bhootarajaruText", language)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5E3CE" },
  content: { paddingBottom: 30 },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#3B2416" },
  subtitle: { fontSize: 13, color: "#7A5A45", marginTop: 4 },
  section: { paddingHorizontal: 20, paddingTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#3B2416" },
  bodyText: { fontSize: 13, color: "#7A5A45", marginTop: 8, lineHeight: 20 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  linkText: { fontSize: 12, color: "#8A4B2B", textDecorationLine: "underline" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4E6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2C3A4",
    gap: 8,
    marginTop: 12,
  },
  searchInput: { flex: 1, paddingVertical: 4, color: "#3B2416" },
  micBtn: { backgroundColor: "#C96A2B", padding: 8, borderRadius: 8 },
  card: {
    backgroundColor: "#FFF4E6",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2C3A4",
    marginTop: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#3B2416" },
  cardMeta: { fontSize: 12, color: "#7A5A45", marginTop: 4 },
  cardDesc: { fontSize: 12, color: "#7A5A45", marginTop: 8, lineHeight: 18 },
});
