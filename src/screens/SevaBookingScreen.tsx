import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Voice from "@react-native-voice/voice";
import { useLanguage } from "../context/LanguageContext";
import { t, translations } from "../utils/translations";

type SevaItem = {
  id: number;
  name: string;
  price: number;
};

export default function SevaBookingScreen() {
  const { language } = useLanguage();
  const [searchText, setSearchText] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [selectedSevas, setSelectedSevas] = useState<number[]>([]);
  const canUseVoice = !!Voice && typeof (Voice as any).start === "function";
  const sevaList = translations[language].sevaBooking.sevaList as SevaItem[];

  const filteredSevas = useMemo(() => {
    if (!searchText.trim()) return sevaList;
    const query = searchText.trim().toLowerCase();
    return sevaList.filter((seva) => seva.name.toLowerCase().includes(query));
  }, [searchText, sevaList]);

  const toggleSeva = (id: number) => {
    setSelectedSevas((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

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
      setVoiceError(event.error?.message || t("sevaBooking.voiceError", language));
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
        setVoiceError(t("sevaBooking.voiceUnavailable", language));
        return;
      }
      await Voice.cancel();
      setListening(true);
      const locale = language === "kn" ? "kn-IN" : "en-IN";
      await Voice.start(locale);
    } catch (error: any) {
      setListening(false);
      setVoiceError(error?.message || t("sevaBooking.voiceStartFailed", language));
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
        <Text style={styles.subtitle}>{t("sevaBooking.subtitle", language)}</Text>
      </View>

      <View style={styles.searchRow}>
        <Icon name="search" size={18} color="#7A5A45" />
        <TextInput
          style={styles.searchInput}
          placeholder={t("sevaBooking.searchPlaceholder", language)}
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

      {listening ? <Text style={styles.voiceHint}>{t("sevaBooking.listening", language)}</Text> : null}
      {voiceError ? <Text style={styles.voiceError}>{voiceError}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("sevaBooking.currentStatusTitle", language)}</Text>
        <Text style={styles.bodyText}>
          {t("sevaBooking.currentStatusBody", language)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("sevaBooking.selectSevaTitle", language)}</Text>
        {filteredSevas.length === 0 ? (
          <Text style={styles.bodyText}>{t("sevaBooking.noSevasFound", language)}</Text>
        ) : (
          filteredSevas.map((seva) => {
            const isSelected = selectedSevas.includes(seva.id);
            return (
              <TouchableOpacity
                key={seva.id}
                style={[styles.sevaRow, isSelected && styles.sevaRowSelected]}
                onPress={() => toggleSeva(seva.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                  {isSelected ? <Text style={styles.checkboxTick}>✓</Text> : null}
                </View>
                <View style={styles.sevaDetails}>
                  <Text style={styles.sevaName}>{seva.name}</Text>
                  <Text style={styles.sevaPrice}>₹ {seva.price}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <TouchableOpacity style={styles.submitBtn}>
        <Text style={styles.submitText}>{t("sevaBooking.requestButton", language)}</Text>
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
  sevaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2C3A4",
    backgroundColor: "#FFF8F0",
    marginTop: 8,
    gap: 10,
  },
  sevaRowSelected: {
    borderColor: "#C96A2B",
    backgroundColor: "#FCE6D2",
  },
  sevaDetails: {
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A56A46",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#C96A2B", borderColor: "#C96A2B" },
  checkboxTick: { color: "#fff", fontWeight: "800" },
  sevaName: {
    fontSize: 13,
    color: "#3B2416",
    fontWeight: "600",
  },
  sevaPrice: {
    marginTop: 4,
    fontSize: 12,
    color: "#7A5A45",
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
