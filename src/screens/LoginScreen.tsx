import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  ScrollView,
  FlatList,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getAuth, signInWithPhoneNumber, FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { COUNTRIES } from "../utils/countries";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../utils/translations";

type FormValues = {
  countryCode: string;
  phone: string;
};

const CELL_COUNT = 6;

export default function LoginScreen() {
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const [otp, setOtp] = useState("");
  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });
  const [codeFieldProps, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  const [consentChecked, setConsentChecked] = useState(false);

  const [docModal, setDocModal] = useState<{
    visible: boolean;
    titleKey: "login.privacyPolicy" | "login.termsConditions" | null;
  }>({ visible: false, titleKey: null });

  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { language, setLanguage } = useLanguage();

  const schema = useMemo(
    () =>
      yup.object({
        countryCode: yup.string().required(),
        phone: yup.string().required(t("login.mobileRequired", language)),
      }),
    [language]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { countryCode: "+91", phone: "" },
    mode: "onTouched",
  });

  const selectedCountry = COUNTRIES.find(c => c.code === watch("countryCode")) || COUNTRIES[0];

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return COUNTRIES;
    const query = searchQuery.toLowerCase();
    return COUNTRIES.filter(
      c => c.name.toLowerCase().includes(query) || c.code.includes(query)
    );
  }, [searchQuery]);

  // Resend timer countdown
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const e164Phone = useMemo(() => {
    const raw = getValues("phone")?.trim() ?? "";
    const code = getValues("countryCode") || "+91";
    if (raw.length >= 8) return `${code}${raw}`;
    return "";
  }, [getValues]);

  const openUrl = async (url: string) => {
    const can = await Linking.canOpenURL(url);
    if (can) Linking.openURL(url);
  };

  const openDoc = (titleKey: "login.privacyPolicy" | "login.termsConditions") => {
    setDocModal({ visible: true, titleKey });
  };

  const closeDoc = () => {
    setDocModal({ visible: false, titleKey: null });
  };

  const sendOtp = async (values: FormValues, skipConsent = false) => {
    console.log('sendOtp called with:', values);
    
    if (!skipConsent && !consentChecked) {
      console.log('Consent not checked');
      Alert.alert(
        t('login.confirmationRequired', language),
        t('login.confirmationMessage', language)
      );
      return;
    }

    const country = COUNTRIES.find(c => c.code === values.countryCode) || COUNTRIES[0];
    const phone = values.phone.trim();
    console.log('Phone validation:', { phone, phoneLength: phone.length, countryLength: country.length });
    
    if (!phone || phone.length < 6) {
      console.log('Phone validation failed - too short');
      Alert.alert(t('login.invalidNumber', language), t('login.invalidNumberMessage', language, { digits: country.length }));
      return;
    }

    const phoneE164 = `${values.countryCode}${phone}`;
    console.log('Sending OTP to:', phoneE164);

    try {
      setIsSendingOtp(true);
      console.log('Calling Firebase signInWithPhoneNumber...');
      const confirmation = await signInWithPhoneNumber(getAuth(), phoneE164);
      console.log('Firebase response received:', confirmation);
      console.log('OTP sent successfully');
      setConfirm(confirmation);
      setResendTimer(60);
      console.log('About to show alert');
      Alert.alert(t('login.otpSent', language), t('login.otpSentMessage', language, { phone: phoneE164 }));
      console.log('Alert shown');
    } catch (err: any) {
      console.error('OTP send error:', err);
      console.error('Error message:', err?.message);
      console.error('Error code:', err?.code);
      Alert.alert(t('login.failedToSendOTP', language), err?.message ?? t("common.unknownError", language));
    } finally {
      console.log('Finally block - setting isSendingOtp to false');
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirm) return;

    if (otp.length !== CELL_COUNT) {
      Alert.alert(t('login.invalidOTP', language), t('login.invalidOTPMessage', language));
      return;
    }

    try {
      setIsVerifying(true);
      await confirm.confirm(otp);
      // Signed in. Auth gate switches to app flow.
    } catch (err: any) {
      Alert.alert(t('login.otpVerificationFailed', language), err?.message ?? t("common.unknownError", language));
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtp = async () => {
    const phone = getValues("phone")?.trim();
    const countryCode = getValues("countryCode");
    if (!phone || phone.length < 8) {
      Alert.alert(
        t('login.enterMobileNumber', language),
        t('login.enterValidMobileNumber', language)
      );
      return;
    }
    await sendOtp({ countryCode, phone }, true);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.languageToggle}>
        <TouchableOpacity
          style={[styles.langBtn, language === "en" && styles.langBtnActive]}
          onPress={() => setLanguage("en")}
        >
          <Text style={[styles.langText, language === "en" && styles.langTextActive]}>
            {t("common.languageEnglish", language)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langBtn, language === "kn" && styles.langBtnActive]}
          onPress={() => setLanguage("kn")}
        >
          <Text style={[styles.langText, language === "kn" && styles.langTextActive]}>
            {t("common.languageKannada", language)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Image
          source={require("../../assets/Vadiraja Theertharu.jpg")}
          style={styles.headerImage}
          resizeMode="contain"
        />
        <Text style={styles.mathaTitle}>{t('login.title', language)}</Text>
        <Text style={styles.welcomeText}>{t('login.welcome', language)}</Text>
      </View>

      {!confirm ? (
        <>
          <Text style={styles.label}>{t('login.mobileNumber', language)}</Text>

          <View style={styles.phoneRow}>
            <Controller
              control={control}
              name="countryCode"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={styles.countryCodeBox}
                  onPress={() => setCountryPickerVisible(true)}
                >
                  <Text style={styles.countryCodeText}>{value}</Text>
                  <Icon name="chevron-down" size={18} color="#666" />
                </TouchableOpacity>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder={t('login.enterDigits', language, { digits: selectedCountry.length })}
                  keyboardType="number-pad"
                  maxLength={selectedCountry.length}
                  onBlur={onBlur}
                  onChangeText={(t) => onChange(t.replace(/\D/g, ""))}
                  value={value}
                />
              )}
            />
          </View>

          {!!errors.phone?.message && (
            <Text style={styles.error}>{errors.phone.message}</Text>
          )}

          <View style={styles.consentRow}>
            <TouchableOpacity
              onPress={() => setConsentChecked((v) => !v)}
              style={[styles.checkbox, consentChecked && styles.checkboxChecked]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: consentChecked }}
            >
              {consentChecked ? <Text style={styles.checkboxTick}>✓</Text> : null}
            </TouchableOpacity>

            <Text style={styles.consentText}>
              {t('login.consent', language)}{" "}
              <Text style={styles.link} onPress={() => openDoc("login.privacyPolicy")}>
                {t('login.privacyPolicy', language)}
              </Text>{" "}
              {t('login.and', language)}{" "}
              <Text
                style={styles.link}
                onPress={() => openDoc("login.termsConditions")}
              >
                {t('login.termsConditions', language)}
              </Text>
              .
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, (isSendingOtp || !consentChecked) && styles.buttonDisabled]}
            onPress={handleSubmit(sendOtp)}
            disabled={isSendingOtp || !consentChecked}
          >
            {isSendingOtp ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.buttonText}>{t('login.sendOTP', language)}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('login.copyright', language)}</Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>{t('login.enterOTP', language)}</Text>
          <Text style={styles.helper}>
            {t('login.sentTo', language, { phone: e164Phone || t("login.yourNumber", language) })}
          </Text>

          <CodeField
            value={otp}
            ref={ref}
            onChangeText={setOtp}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            {...codeFieldProps}
            renderCell={({ index, symbol, isFocused }) => (
              <View
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                <Text style={styles.cellText}>
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.button, isVerifying && styles.buttonDisabled]}
            onPress={verifyOtp}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.buttonText}>{t('login.verify', language)}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryBtn, resendTimer > 0 && styles.disabledBtn]} 
            onPress={resendOtp}
            disabled={resendTimer > 0}
          >
            <Text style={[styles.secondaryBtnText, resendTimer > 0 && styles.disabledText]}>
              {resendTimer > 0 ? `${t('login.resendOTP', language)} (${resendTimer}s)` : t('login.resendOTP', language)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              setConfirm(null);
              setOtp("");
            }}
          >
            <Text style={styles.secondaryBtnText}>{t('login.changeNumber', language)}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>

    <Modal
        visible={docModal.visible}
        animationType="slide"
        onRequestClose={closeDoc}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {docModal.titleKey ? t(docModal.titleKey, language) : ""}
          </Text>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalText}>
              {t("login.policyPlaceholder", language, {
                title: docModal.titleKey ? t(docModal.titleKey, language) : "",
              })}
              {"\n\n"}
              {t("login.policyTip", language)}
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.modalCloseBtn} onPress={closeDoc}>
            <Text style={styles.modalCloseText}>{t("common.close", language)}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={countryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setCountryPickerVisible(false);
          setSearchQuery("");
        }}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => {
            setCountryPickerVisible(false);
            setSearchQuery("");
          }}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>{t('login.selectCountry', language)}</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={t('login.searchCountry', language)}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code + item.name}
              renderItem={({ item: country }) => (
                <Controller
                  control={control}
                  name="countryCode"
                  render={({ field: { onChange } }) => (
                    <TouchableOpacity
                      style={styles.pickerItem}
                      onPress={() => {
                        onChange(country.code);
                        setCountryPickerVisible(false);
                        setSearchQuery("");
                      }}
                    >
                      <Text style={styles.pickerItemText}>
                        {country.code} - {country.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F5E3CE",
  },
  languageToggle: {
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2C3A4",
    overflow: "hidden",
  },
  langBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FFF4E6",
  },
  langBtnActive: {
    backgroundColor: "#C96A2B",
  },
  langText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7A5A45",
  },
  langTextActive: {
    color: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerImage: {
    width: 140,
    height: 140,
    marginBottom: 16,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "#E2C3A4",
  },
  mathaTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
    color: "#3B2416",
  },
  welcomeText: {
    fontSize: 15,
    color: "#7A5A45",
    textAlign: "center",
  },
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24, textAlign: "center" },
  subtitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  helper: { fontSize: 14, opacity: 0.7, marginBottom: 16 },
  label: { fontSize: 15, marginBottom: 10, fontWeight: "700", color: "#3B2416" },

  phoneRow: { flexDirection: "row", alignItems: "center" },
  countryCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#D8B08C",
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#FFF8F0",
  },
  countryCodeText: { fontSize: 16, fontWeight: "600" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D8B08C",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#FFF8F0",
    color: "#3B2416",
  },

  error: { marginTop: 8, color: "#A4461D" },

  consentRow: { flexDirection: "row", marginTop: 16, alignItems: "flex-start" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A56A46",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: "#C96A2B", borderColor: "#C96A2B" },
  checkboxTick: { color: "#fff", fontWeight: "800" },

  consentText: { flex: 1, fontSize: 13, lineHeight: 18 },
  link: { textDecorationLine: "underline", fontWeight: "700" },

  button: {
    marginTop: 18,
    backgroundColor: "#C96A2B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  secondaryBtn: { marginTop: 12, alignItems: "center" },
  secondaryBtnText: { fontSize: 14, textDecorationLine: "underline" },
  disabledBtn: { opacity: 0.5 },
  disabledText: { color: "#999" },

  codeFieldRoot: {
    marginTop: 10,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  cell: {
    width: 46,
    height: 52,
    lineHeight: 52,
    borderWidth: 1,
    borderColor: "#D8B08C",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  focusCell: { borderColor: "#C96A2B" },
  cellText: { fontSize: 18, fontWeight: "700" },

  modalContainer: { flex: 1, padding: 16, paddingTop: 50 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  modalBody: { flex: 1 },
  modalText: { fontSize: 14, lineHeight: 20 },
  modalCloseBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#C96A2B",
    alignItems: "center",
    marginTop: 12,
  },
  modalCloseText: { color: "#fff", fontWeight: "700" },

  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "#FFF4E6",
    borderRadius: 12,
    padding: 16,
    width: "85%",
    maxHeight: "70%",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#D8B08C",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#FFF8F0",
    color: "#3B2416",
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2C3A4",
  },
  pickerItemText: {
    fontSize: 15,
  },

  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2C3A4",
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#7A5A45",
  },
  footerLink: {
    fontSize: 13,
    color: "#8A4B2B",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
