import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged, FirebaseAuthTypes } from "@react-native-firebase/auth";
import AuthStack from "./AuthStack";
import AppDrawer from "./AppDrawer";

const PROFILE_STORAGE_KEY = "devotee_profile";

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

const getProfileKeyForPhone = (phone?: string | null) => {
  if (!phone) return PROFILE_STORAGE_KEY;
  return `${PROFILE_STORAGE_KEY}_${normalizeDigits(phone)}`;
};

export default function RootNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!user) {
        if (active) {
          setHasProfile(false);
          setProfileLoading(false);
        }
        return;
      }

      try {
        setProfileLoading(true);
        const phone = user.phoneNumber || "";
        const profileKey = getProfileKeyForPhone(phone);
        const raw = await AsyncStorage.getItem(profileKey);
        if (!active) return;
        if (raw) {
          const parsed = JSON.parse(raw) as { fullName?: string };
          setHasProfile(!!parsed?.fullName?.trim());
          return;
        }

        const legacyRaw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (!active) return;
        if (legacyRaw) {
          const parsed = JSON.parse(legacyRaw) as { fullName?: string; mobile?: string; mobileNumber?: string; mobileCountryCode?: string };
          const legacyMobile = parsed.mobileNumber
            ? `${parsed.mobileCountryCode || ""}${parsed.mobileNumber}`
            : parsed.mobile || "";
          const legacyDigits = normalizeDigits(legacyMobile);
          const phoneDigits = normalizeDigits(phone);

          if (legacyDigits && phoneDigits && legacyDigits === phoneDigits) {
            await AsyncStorage.setItem(profileKey, legacyRaw);
            setHasProfile(!!parsed?.fullName?.trim());
            return;
          }
        }

        setHasProfile(false);
      } catch (error) {
        console.log("Profile gate load error:", error);
        if (active) setHasProfile(false);
      } finally {
        if (active) setProfileLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [user]);

  if (initializing || (user && profileLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // ✅ Not logged in → show Login
  // ✅ Logged in → show Home (drawer)
  return user ? (
    <AppDrawer initialRouteName={hasProfile ? "HomePage" : "Profile"} />
  ) : (
    <AuthStack />
  );
}
