import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Voice from "@react-native-voice/voice";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../utils/translations";

export default function SevaBookingScreen() {
  const { language } = useLanguage();
  const [searchText, setSearchText] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const canUseVoice = !!Voice && typeof (Voice as any).start === "function";

  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      const text = event.value?.[0] || "";
      setSearchText(text);
    };

    Voice.onSpeechPartialResults = (event) => {
      const text = event.value?.[0] || "";
      if (text) setSearchText(text);
    };

    Voice.onSpeechStart = () => {
      setVoiceError("");
    };

    Voice.onSpeechEnd = () => {
      setListening(false);
    };

    Voice.onSpeechError = (event) => {
      setListening(false);
      setVoiceError(event.error?.message || "Voice recognition failed");
    };

    return () => {
      Voice.destroy().catch(() => null);
      Voice.removeAllListeners();
    };
  }, []);

  const startListening = async () => {
    try {
      setVoiceError("");
      if (!canUseVoice) {
        setVoiceError("Voice module is not available. Rebuild the app.");
        return;
      }
      await Voice.cancel();
      setListening(true);
      const locale = language === "kn" ? "kn-IN" : "en-IN";
      await Voice.start(locale);
    } catch (error: any) {
      setListening(false);
      setVoiceError(error?.message || "Unable to start voice input");
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setListening(false);
    } catch {
      setListening(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("tabs.sevaBooking", language)}</Text>
        <Text style={styles.subtitle}>Seva booking requests will be enabled here.</Text>
      </View>

      <View style={styles.searchRow}>
        <Icon name="search" size={18} color="#7A5A45" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search seva..."
          placeholderTextColor="#9B7A62"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          style={[styles.micBtn, listening && styles.micBtnActive]}
          onPress={listening ? stopListening : startListening}
          accessibilityRole="button"
        >
          <Icon name={listening ? "mic" : "mic-outline"} size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {listening ? <Text style={styles.voiceHint}>Listening…</Text> : null}
      {voiceError ? <Text style={styles.voiceError}>{voiceError}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current status</Text>
        <Text style={styles.bodyText}>
          Please contact the office to confirm seva availability and timing.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What to prepare</Text>
        <Text style={styles.bodyText}>- Seva name and preferred date</Text>
        <Text style={styles.bodyText}>- Your contact details</Text>
        <Text style={styles.bodyText}>- Any special instructions</Text>
      </View>

      <TouchableOpacity style={styles.submitBtn}>
        <Text style={styles.submitText}>Request Seva Booking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5E3CE" },
  content: { paddingBottom: 40 },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#3B2416" },
  subtitle: { fontSize: 13, color: "#7A5A45", marginTop: 4 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
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
  micBtnActive: { backgroundColor: "#A85A24" },
  voiceHint: {
    marginHorizontal: 20,
    marginTop: 8,
    fontSize: 12,
    color: "#7A5A45",
  },
  voiceError: {
    marginHorizontal: 20,
    marginTop: 6,
    fontSize: 12,
    color: "#A4461D",
  },
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
  bodyText: { fontSize: 13, color: "#7A5A45", marginTop: 4 },
  submitBtn: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: "#C96A2B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
