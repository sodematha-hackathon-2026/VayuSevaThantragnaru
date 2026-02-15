import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useLanguage } from "../context/LanguageContext";
import { t, translations } from "../utils/translations";

type EventType = "Aradhana" | "Paryaya" | "Festival" | "Other";

type EventItem = {
  id: string;
  title: string;
  date: string;
  weekday: string;
  tithi: string;
  type: EventType;
  location: string;
  description?: string;
};

const typeLabelKey: Record<EventType, string> = {
  Aradhana: "eventCalendar.filterAradhana",
  Paryaya: "eventCalendar.filterParyaya",
  Festival: "eventCalendar.filterFestival",
  Other: "eventCalendar.filterOther",
};

const FILTERS: Array<{ key: "All" | EventType; labelKey: string }> = [
  { key: "All", labelKey: "eventCalendar.filterAll" },
  { key: "Aradhana", labelKey: "eventCalendar.filterAradhana" },
  { key: "Paryaya", labelKey: "eventCalendar.filterParyaya" },
  { key: "Festival", labelKey: "eventCalendar.filterFestival" },
  { key: "Other", labelKey: "eventCalendar.filterOther" },
];

export default function EventCalendarScreen() {
  const { language } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | EventType>("All");
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const events = useMemo<EventItem[]>(
    () => translations[language].eventCalendar.events,
    [language]
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesFilter = filter === "All" || event.type === filter;
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.tithi.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [events, filter, search]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("eventCalendar.title", language)}</Text>
        <Text style={styles.subtitle}>{t("eventCalendar.subtitle", language)}</Text>
      </View>

      <View style={styles.searchRow}>
        <Icon name="search" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder={t("eventCalendar.searchPlaceholder", language)}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.micBtn} accessibilityRole="button">
          <Icon name="mic" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {t(f.labelKey, language)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.notificationRow}>
        <Text style={styles.notificationLabel}>{t("eventCalendar.enableNotifications", language)}</Text>
        <Switch value={notifyEnabled} onValueChange={setNotifyEnabled} />
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.muted}>{t("eventCalendar.noEvents", language)}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.typePill}>
                <Text style={styles.typeText}>{t(typeLabelKey[item.type], language)}</Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>
              {item.weekday} • {item.date}
            </Text>
            <Text style={styles.cardMeta}>
              {t("eventCalendar.tithi", language)}: {item.tithi}
            </Text>
            <Text style={styles.cardMeta}>
              {t("eventCalendar.location", language)}: {item.location}
            </Text>
            {!!item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5E3CE" },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#3B2416" },
  subtitle: { fontSize: 13, color: "#7A5A45", marginTop: 4 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: "#FFF4E6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2C3A4",
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 4, color: "#3B2416" },
  micBtn: {
    backgroundColor: "#C96A2B",
    padding: 8,
    borderRadius: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    marginHorizontal: 20,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D8B08C",
    backgroundColor: "#FFF4E6",
  },
  filterChipActive: {
    backgroundColor: "#C96A2B",
    borderColor: "#C96A2B",
  },
  filterText: { color: "#3B2416", fontSize: 12, fontWeight: "600" },
  filterTextActive: { color: "#fff" },
  notificationRow: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF4E6",
    borderWidth: 1,
    borderColor: "#E2C3A4",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationLabel: { fontSize: 13, color: "#3B2416", fontWeight: "600" },
  listContent: { padding: 20, paddingTop: 12, gap: 12 },
  card: {
    backgroundColor: "#FFF4E6",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2C3A4",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#3B2416" },
  typePill: {
    backgroundColor: "#F3DFC8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  typeText: { fontSize: 11, color: "#7A5A45", fontWeight: "700" },
  cardMeta: { fontSize: 12, color: "#7A5A45", marginTop: 2 },
  cardDesc: { marginTop: 8, fontSize: 12, color: "#7A5A45" },
  muted: { textAlign: "center", color: "#7A5A45", paddingVertical: 20 },
});
