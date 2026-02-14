import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "@react-native-firebase/auth";
import CountryPicker from "react-native-country-picker-modal";
import { COUNTRIES } from "../utils/countries";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../utils/translations";

type ProfileForm = {
  fullName: string;
  mobileCountryIso: string;
  mobileCountryCode: string;
  mobileNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  updatesOptIn: boolean;
  volunteerOptIn: boolean;
  consent: boolean;
};

const STORAGE_KEY = "devotee_profile";
const DEFAULT_MOBILE_ISO = "IN";
const DEFAULT_MOBILE_CODE = "+91";

const CALLING_CODES = COUNTRIES.map((c) => c.code).sort(
  (a, b) => b.length - a.length
);

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

const getProfileKeyForPhone = (phone?: string | null) => {
  if (!phone) return STORAGE_KEY;
  return `${STORAGE_KEY}_${normalizeDigits(phone)}`;
};

const EMPTY_FORM: ProfileForm = {
  fullName: "",
  mobileCountryIso: DEFAULT_MOBILE_ISO,
  mobileCountryCode: DEFAULT_MOBILE_CODE,
  mobileNumber: "",
  email: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  updatesOptIn: true,
  volunteerOptIn: false,
  consent: false,
};

export default function ProfileScreen() {
  const { language } = useLanguage();
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<ProfileForm | null>(null);

  const selectedCountry = useMemo(() => {
    return (
      COUNTRIES.find((c) => c.code === form.mobileCountryCode) ||
      COUNTRIES.find((c) => c.code === DEFAULT_MOBILE_CODE) ||
      COUNTRIES[0]
    );
  }, [form.mobileCountryCode]);

  const splitE164 = (phone: string) => {
    const cleaned = phone.replace(/\s+/g, "");
    if (!cleaned.startsWith("+")) {
      return { code: DEFAULT_MOBILE_CODE, number: cleaned.replace(/\D/g, "") };
    }

    const match = CALLING_CODES.find((code) => cleaned.startsWith(code));
    if (match) {
      return {
        code: match,
        number: cleaned.slice(match.length).replace(/\D/g, ""),
      };
    }

    return { code: DEFAULT_MOBILE_CODE, number: cleaned.replace(/\D/g, "") };
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const authPhone = getAuth().currentUser?.phoneNumber || "";
        const profileKey = getProfileKeyForPhone(authPhone);
        const raw = await AsyncStorage.getItem(profileKey);

        if (raw) {
          const parsed = JSON.parse(raw) as ProfileForm & { mobile?: string };
          const next = { ...EMPTY_FORM, ...parsed } as ProfileForm & { mobile?: string };

          if (!next.mobileNumber) {
            const legacyMobile = parsed.mobile || "";
            const source = legacyMobile || authPhone;
            if (source) {
              const { code, number } = splitE164(source);
              next.mobileCountryCode = code;
              next.mobileNumber = number;
            }
          }

          if (!next.mobileCountryIso) {
            next.mobileCountryIso = DEFAULT_MOBILE_ISO;
          }

          setForm(next);
          setSavedForm(next);
          return;
        }

        const legacyRaw = await AsyncStorage.getItem(STORAGE_KEY);
        if (legacyRaw && authPhone) {
          const parsed = JSON.parse(legacyRaw) as ProfileForm & { mobile?: string };
          const legacyMobile = parsed.mobileNumber
            ? `${parsed.mobileCountryCode || ""}${parsed.mobileNumber}`
            : parsed.mobile || "";
          if (normalizeDigits(legacyMobile) === normalizeDigits(authPhone)) {
            await AsyncStorage.setItem(profileKey, legacyRaw);
            const next = { ...EMPTY_FORM, ...parsed } as ProfileForm & { mobile?: string };
            setForm(next);
            setSavedForm(next);
            return;
          }
        }

        if (authPhone) {
          const { code, number } = splitE164(authPhone);
          setForm((prev) => ({
            ...prev,
            mobileCountryCode: code,
            mobileNumber: number,
          }));
        }
      } catch (error) {
        console.log("Profile load error:", error);
      }
    };
    loadProfile();
  }, []);

  const contactChanged = useMemo(() => {
    if (!savedForm) return false;
    return (
      savedForm.mobileCountryCode !== form.mobileCountryCode ||
      savedForm.mobileNumber !== form.mobileNumber ||
      savedForm.email !== form.email ||
      savedForm.address !== form.address
    );
  }, [form, savedForm]);

  const updateField = (key: keyof ProfileForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    if (!form.fullName || !form.mobileNumber || !form.email || !form.consent) {
      Alert.alert(t("profile.missingFields", language));
      return;
    }

    const persist = async () => {
      try {
        const authPhone = getAuth().currentUser?.phoneNumber || "";
        const profileKey = getProfileKeyForPhone(authPhone);
        await AsyncStorage.setItem(profileKey, JSON.stringify(form));
        setSavedForm(form);
        Alert.alert(t("profile.saved", language));
      } catch (error) {
        console.log("Profile save error:", error);
      }
    };

    if (contactChanged) {
      Alert.alert(
        t("profile.confirmUpdateTitle", language),
        t("profile.confirmUpdateMessage", language),
        [
          { text: t("profile.confirmCancel", language), style: "cancel" },
          { text: t("profile.confirmUpdate", language), onPress: persist },
        ]
      );
      return;
    }

    await persist();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("profile.title", language)}</Text>
        <Text style={styles.subtitle}>{t("profile.subtitle", language)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t("profile.fullName", language)}</Text>
        <TextInput
          style={styles.input}
          value={form.fullName}
          onChangeText={(value) => updateField("fullName", value)}
        />

        <Text style={styles.label}>{t("profile.mobile", language)}</Text>
        <View style={styles.phoneRow}>
          <CountryPicker
            countryCode={form.mobileCountryIso}
            withFilter
            withFlag
            withCallingCode
            withCallingCodeButton
            onSelect={(country) => {
              const calling = country.callingCode?.[0]
                ? `+${country.callingCode[0]}`
                : form.mobileCountryCode;
              updateField("mobileCountryIso", country.cca2);
              updateField("mobileCountryCode", calling);
            }}
            containerButtonStyle={styles.countryCodeBox}
          />
          <TextInput
            style={[styles.input, styles.phoneInput]}
            keyboardType="phone-pad"
            placeholder={t("login.enterDigits", language, { digits: selectedCountry.length })}
            maxLength={selectedCountry.length}
            value={form.mobileNumber}
            onChangeText={(value) => updateField("mobileNumber", value.replace(/\D/g, ""))}
          />
        </View>

        <Text style={styles.label}>{t("profile.email", language)}</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          autoCapitalize="none"
        />

        <Text style={styles.label}>{t("profile.address", language)}</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          multiline
          value={form.address}
          onChangeText={(value) => updateField("address", value)}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>{t("profile.city", language)}</Text>
            <TextInput
              style={styles.input}
              value={form.city}
              onChangeText={(value) => updateField("city", value)}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>{t("profile.state", language)}</Text>
            <TextInput
              style={styles.input}
              value={form.state}
              onChangeText={(value) => updateField("state", value)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>{t("profile.country", language)}</Text>
            <TextInput
              style={styles.input}
              value={form.country}
              onChangeText={(value) => updateField("country", value)}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>{t("profile.pincode", language)}</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={form.pincode}
              onChangeText={(value) => updateField("pincode", value)}
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("profile.unsubscribeTitle", language)}</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t("profile.updatesOptIn", language)}</Text>
          <Switch
            value={form.updatesOptIn}
            onValueChange={(value) => updateField("updatesOptIn", value)}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t("profile.volunteerOptIn", language)}</Text>
          <Switch
            value={form.volunteerOptIn}
            onValueChange={(value) => updateField("volunteerOptIn", value)}
          />
        </View>
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
          <Text style={styles.checkboxText}>{t("profile.consent", language)}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
        <Text style={styles.saveText}>{t("profile.save", language)}</Text>
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
  phoneRow: { flexDirection: "row", alignItems: "center" },
  countryCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#D8B08C",
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#FFF8F0",
  },
  phoneInput: { flex: 1 },
  inputMultiline: { minHeight: 70, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#3B2416" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  switchLabel: { fontSize: 13, color: "#3B2416", flex: 1, marginRight: 10 },
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
  saveBtn: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: "#C96A2B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
