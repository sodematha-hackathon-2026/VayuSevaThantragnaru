import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function PanchangaScreen() {
  const data = {
    date: "30-01-2022",
    weekday: "Sunday",
    samvatsara: "Plava Samvathsara",
    ayana: "Uttarayana",
    rithu: "Hemanta",
    sauraMasa: "Makara",
    chandraMasa: "Pushya",
    paksha: "Krishna",
    tithi: "Trayodashi",
    nakshatra: "Purva Ashadha",
    yoga: "Harshana",
    karana: "Vanije",
    tithiTime: "24.44",
    nakshatraTime: "43.12",
    sunrise: "6.58",
    sunset: "6.29",
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={styles.topIcon}>≡</Text>
        <Text style={styles.topTitle}>Today's Panchanga</Text>
        <Text style={styles.topIcon}>☀</Text>
      </View>

      <View style={styles.headerBlock}>
        <Text style={styles.dateText}>{data.date}</Text>
        <Text style={styles.weekdayText}>{data.weekday}</Text>
      </View>

      <View style={styles.cardRowSingle}>
        <View style={styles.cardWide}>
          <Text style={styles.cardLabel}>Samvatsara</Text>
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
            <Text style={styles.cardLabel}>Ayana</Text>
            <Text style={styles.cardValue}>{data.ayana}</Text>
          </View>
          <View style={styles.cardSmall}>
            <Text style={styles.cardLabel}>Rithu</Text>
            <Text style={styles.cardValue}>{data.rithu}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tripleRow}>
        <View style={styles.cardSmall}>
          <Text style={styles.cardLabel}>SauraMasa</Text>
          <Text style={styles.cardValue}>{data.sauraMasa}</Text>
        </View>
        <View style={styles.cardSmall}>
          <Text style={styles.cardLabel}>ChandraMasa</Text>
          <Text style={styles.cardValue}>{data.chandraMasa}</Text>
        </View>
        <View style={styles.cardSmall}>
          <Text style={styles.cardLabel}>Paksha</Text>
          <Text style={styles.cardValue}>{data.paksha}</Text>
        </View>
      </View>

      <View style={styles.cardWide}>
        <View style={styles.twoCol}>
          <View style={styles.metricCol}>
            <Text style={styles.cardLabel}>Tithi</Text>
            <Text style={styles.cardValue}>{data.tithi}</Text>
            <Text style={styles.metricTime}>{data.tithiTime}</Text>
          </View>
          <View style={styles.metricCol}>
            <Text style={styles.cardLabel}>Nakshatra</Text>
            <Text style={styles.cardValue}>{data.nakshatra}</Text>
            <Text style={styles.metricTime}>{data.nakshatraTime}</Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.metricCol}>
            <Text style={styles.cardLabel}>Yoga</Text>
            <Text style={styles.cardValue}>{data.yoga}</Text>
          </View>
          <View style={styles.metricCol}>
            <Text style={styles.cardLabel}>Karana</Text>
            <Text style={styles.cardValue}>{data.karana}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sunRow}>
        <Text style={styles.sunText}>Sunrise - {data.sunrise}</Text>
        <Text style={styles.sunText}>Sunset - {data.sunset}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5E3CE" },
  content: { paddingBottom: 30 },
  topBar: {
    backgroundColor: "#9C6F4F",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: { color: "#fff", fontWeight: "800", fontSize: 16 },
  topIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
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
