import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import auth from "@react-native-firebase/auth";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../utils/translations";

type BookingForm = {
  fullName: string;
  mobile: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  consent: boolean;
};

const INITIAL_FORM: BookingForm = {
  fullName: "",
  mobile: "",
  email: "",
  checkIn: "",
  checkOut: "",
  guests: "",
  consent: false,
};

const PROFILE_STORAGE_KEY = "devotee_profile";

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

const getProfileKeyForPhone = (phone?: string | null) => {
  if (!phone) return PROFILE_STORAGE_KEY;
  return `${PROFILE_STORAGE_KEY}_${normalizeDigits(phone)}`;
};

export default function RoomBookingScreen() {
  const { language } = useLanguage();
  const [form, setForm] = useState<BookingForm>(INITIAL_FORM);
  const [activeDateField, setActiveDateField] = useState<"checkIn" | "checkOut" | null>(null);

  const activeDate = useMemo(() => {
    const value = activeDateField ? form[activeDateField] : "";
    if (!value) return new Date();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [activeDateField, form]);

  const loadProfile = useCallback(async () => {
    try {
      const phone = auth().currentUser?.phoneNumber || "";
      const profileKey = getProfileKeyForPhone(phone);
      const raw = await AsyncStorage.getItem(profileKey);
      if (!raw) {
        const legacyRaw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (!legacyRaw) return;
        const parsed = JSON.parse(legacyRaw) as {
          fullName?: string;
          mobile?: string;
          mobileCountryCode?: string;
          mobileNumber?: string;
          email?: string;
        };

        const legacyMobile = parsed.mobileNumber
          ? `${parsed.mobileCountryCode || ""}${parsed.mobileNumber}`
          : parsed.mobile || "";

        if (normalizeDigits(legacyMobile) !== normalizeDigits(phone)) {
          return;
        }

        const combinedMobile = parsed.mobileNumber
          ? `${parsed.mobileCountryCode || ""}${parsed.mobileNumber}`
          : parsed.mobile || "";

        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || parsed.fullName || "",
          mobile: prev.mobile || combinedMobile,
          email: prev.email || parsed.email || "",
        }));
        return;
      }

      const parsed = JSON.parse(raw) as {
        fullName?: string;
        mobile?: string;
        mobileCountryCode?: string;
        mobileNumber?: string;
        email?: string;
      };

      const combinedMobile = parsed.mobileNumber
        ? `${parsed.mobileCountryCode || ""}${parsed.mobileNumber}`
        : parsed.mobile || "";

      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || parsed.fullName || "",
        mobile: prev.mobile || combinedMobile,
        email: prev.email || parsed.email || "",
      }));
      return;
    } catch (error) {
      console.log("Profile prefill error:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const updateField = (key: keyof BookingForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        setActiveDateField(null);
        return;
      }
    }

    if (selected && activeDateField) {
      updateField(activeDateField, formatDate(selected));
    }

    if (Platform.OS === "android") {
      setActiveDateField(null);
    }
  };

  const submitRequest = async () => {
    if (
      !form.fullName ||
      !form.mobile ||
      !form.email ||
      !form.checkIn ||
      !form.checkOut ||
      !form.guests ||
      !form.consent
    ) {
      Alert.alert(t("roomBooking.missingFields", language));
      return;
    }

    const body = `${t("roomBooking.emailBodyTitle", language)}\n\n` +
      `${t("roomBooking.emailLabels.name", language)}: ${form.fullName}\n` +
      `${t("roomBooking.emailLabels.mobile", language)}: ${form.mobile}\n` +
      `${t("roomBooking.emailLabels.email", language)}: ${form.email}\n` +
      `${t("roomBooking.emailLabels.checkIn", language)}: ${form.checkIn}\n` +
      `${t("roomBooking.emailLabels.checkOut", language)}: ${form.checkOut}\n` +
      `${t("roomBooking.emailLabels.guests", language)}: ${form.guests}\n` +
      `${t("roomBooking.emailLabels.consent", language)}: ${form.consent ? t("common.yes", language) : t("common.no", language)}`;

    const mailto = `mailto:office@sodematha.in?subject=${encodeURIComponent(
      t("roomBooking.emailSubject", language)
    )}&body=${encodeURIComponent(body)}`;

    const can = await Linking.canOpenURL(mailto);
    if (can) {
      Linking.openURL(mailto);
      Alert.alert(t("roomBooking.sent", language));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("roomBooking.title", language)}</Text>
        <Text style={styles.subtitle}>{t("roomBooking.subtitle", language)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t("profile.fullName", language)}</Text>
        <TextInput
          style={styles.input}
          value={form.fullName}
          onChangeText={(value) => updateField("fullName", value)}
        />

        <Text style={styles.label}>{t("profile.mobile", language)}</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={form.mobile}
          onChangeText={(value) => updateField("mobile", value)}
        />

        <Text style={styles.label}>{t("profile.email", language)}</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          autoCapitalize="none"
        />

        <Text style={styles.label}>{t("roomBooking.checkIn", language)}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.dateInput}
          onPress={() => setActiveDateField("checkIn")}
        >
          <Text style={form.checkIn ? styles.inputText : styles.placeholderText}>
            {form.checkIn || t("roomBooking.datePlaceholder", language)}
          </Text>
          <Icon name="calendar-outline" size={18} color="#7A5A45" />
        </TouchableOpacity>

        <Text style={styles.label}>{t("roomBooking.checkOut", language)}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.dateInput}
          onPress={() => setActiveDateField("checkOut")}
        >
          <Text style={form.checkOut ? styles.inputText : styles.placeholderText}>
            {form.checkOut || t("roomBooking.datePlaceholder", language)}
          </Text>
          <Icon name="calendar-outline" size={18} color="#7A5A45" />
        </TouchableOpacity>

        <Text style={styles.label}>{t("roomBooking.guests", language)}</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={form.guests}
          onChangeText={(value) => updateField("guests", value)}
        />
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => updateField("consent", !form.consent)}
          style={[styles.checkboxRow, form.consent && styles.checkboxRowActive]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: form.consent }}
        >
          <View style={[styles.checkbox, form.consent && styles.checkboxChecked]}>
            {form.consent ? <Text style={styles.checkboxTick}>✓</Text> : null}
          </View>
          <Text style={styles.checkboxText}>{t("roomBooking.consent", language)}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={submitRequest}>
        <Text style={styles.submitText}>{t("roomBooking.request", language)}</Text>
      </TouchableOpacity>

      {activeDateField ? (
        <DateTimePicker
          value={activeDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          onChange={handleDateChange}
        />
      ) : null}
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
  label: { fontSize: 12, fontWeight: "600", color: "#3B2416", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#D8B08C",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
    color: "#3B2416",
    backgroundColor: "#FFF8F0",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#D8B08C",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
    backgroundColor: "#FFF8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    color: "#3B2416",
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: "#9B7A62",
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D8B08C",
  },
  checkboxRowActive: { borderColor: "#C96A2B" },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#A56A46",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#C96A2B", borderColor: "#C96A2B" },
  checkboxTick: { color: "#fff", fontSize: 12, fontWeight: "800" },
  checkboxText: { fontSize: 12, color: "#3B2416", flex: 1 },
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
