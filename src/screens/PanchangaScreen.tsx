import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { t, translations } from "../utils/translations";

export default function PanchangaScreen() {
  const { language } = useLanguage();
  const data = translations[language].panchanga.sample;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("panchanga.title", language)}</Text>
        <Text style={styles.subtitle}>{t("panchanga.subtitle", language)}</Text>
      </View>

      <View style={styles.headerBlock}>
        <Text style={styles.dateText}>{data.date}</Text>
        <Text style={styles.weekdayText}>{data.weekday}</Text>
      </View>

      <View style={styles.cardRowSingle}>
        <View style={styles.cardWide}>
          <Text style={styles.cardLabel}>{t("panchanga.labels.samvatsara", language)}</Text>
          <Text style={styles.cardValue}>{data.samvatsara}</Text>
        </View>
      </View>

      <View style={styles.splitRow}>
        <View style={styles.clockCard}>
          <Image
            source={{
              uri: "https://raw.githubusercontent.com/github/explore/main/topics/clock/clock.png",
            }}
            style={styles.clockImage}
          />
        </View>
        <View style={styles.stackCol}>
          <View style={styles.cardSmall}>
            <Text style={styles.cardLabel}>{t("panchanga.labels.ayana", language)}</Text>
            <Text style={styles.cardValue}>{data.ayana}</Text>
          </View>
          <View style={styles.cardSmall}>
            <Text style={styles.cardLabel}>{t("panchanga.labels.rithu", language)}</Text>
            <Text style={styles.cardValue}>{data.rithu}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tripleRow}>
        <View style={styles.cardSmall}>
          <Text style={styles.cardLabel}>{t("panchanga.labels.sauraMasa", language)}</Text>
          <Text style={styles.cardValue}>{data.sauraMasa}</Text>
        </View>
        <View style={styles.cardSmall}>
          <Text style={styles.cardLabel}>{t("panchanga.labels.chandraMasa", language)}</Text>
          <Text style={styles.cardValue}>{data.chandraMasa}</Text>
        </View>
        <View style={styles.cardSmall}>
          <Text style={styles.cardLabel}>{t("panchanga.labels.paksha", language)}</Text>
          <Text style={styles.cardValue}>{data.paksha}</Text>
        </View>
      </View>

      <View style={styles.cardWide}>
        <View style={styles.twoCol}>
          <View style={styles.metricCol}>
            <Text style={styles.cardLabel}>{t("panchanga.labels.tithi", language)}</Text>
            <Text style={styles.cardValue}>{data.tithi}</Text>
            <Text style={styles.metricTime}>{data.tithiTime}</Text>
          </View>
          <View style={styles.metricCol}>
            <Text style={styles.cardLabel}>{t("panchanga.labels.nakshatra", language)}</Text>
            <Text style={styles.cardValue}>{data.nakshatra}</Text>
            <Text style={styles.metricTime}>{data.nakshatraTime}</Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.metricCol}>
            <Text style={styles.cardLabel}>{t("panchanga.labels.yoga", language)}</Text>
            <Text style={styles.cardValue}>{data.yoga}</Text>
          </View>
          <View style={styles.metricCol}>
            <Text style={styles.cardLabel}>{t("panchanga.labels.karana", language)}</Text>
            <Text style={styles.cardValue}>{data.karana}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sunRow}>
        <Text style={styles.sunText}>
          {t("panchanga.labels.sunrise", language)} - {data.sunrise}
        </Text>
        <Text style={styles.sunText}>
          {t("panchanga.labels.sunset", language)} - {data.sunset}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5E3CE" },
  content: { paddingBottom: 30 },
  header: { padding: 20, paddingBottom: 6 },
  title: { fontSize: 22, fontWeight: "800", color: "#3B2416" },
  subtitle: { fontSize: 13, color: "#7A5A45", marginTop: 4 },
  headerBlock: { alignItems: "center", paddingVertical: 14 },
  dateText: { fontSize: 26, fontWeight: "800", color: "#8A5E3D" },
  weekdayText: { fontSize: 14, fontWeight: "700", color: "#3B2416", marginTop: 4 },
  cardRowSingle: { paddingHorizontal: 16 },
  cardWide: {
    backgroundColor: "#FFF4E6",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2C3A4",
    marginTop: 10,
  },
  cardLabel: { fontSize: 12, color: "#7A5A45", fontWeight: "700" },
  cardValue: { fontSize: 14, color: "#3B2416", fontWeight: "800", marginTop: 4 },
  splitRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  clockCard: {
    flex: 1,
    backgroundColor: "#FFF4E6",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2C3A4",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  clockImage: { width: 120, height: 120, tintColor: "#9C6F4F" },
  stackCol: { flex: 1, gap: 10 },
  cardSmall: {
    backgroundColor: "#FFF4E6",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2C3A4",
  },
  tripleRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  twoCol: { flexDirection: "row", gap: 12, marginTop: 10 },
  metricCol: { flex: 1 },
  metricTime: { fontSize: 12, color: "#7A5A45", marginTop: 4 },
  sunRow: {
    backgroundColor: "#FFF4E6",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2C3A4",
    marginTop: 12,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sunText: { fontSize: 12, color: "#7A5A45", fontWeight: "700" },
});
