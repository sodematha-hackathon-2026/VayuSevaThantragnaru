import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { getAuth, onAuthStateChanged, FirebaseAuthTypes } from "@react-native-firebase/auth";
import AuthStack from "./AuthStack";
import AppDrawer from "./AppDrawer";
import { HOME_CACHE_KEYS, serializeTimestamp } from "../utils/cache";

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
    if (!user) return;

    const preloadHomeCache = async () => {
      try {
        const [newsSnap, announcementsSnap] = await Promise.all([
          firestore().collection("news").orderBy("createdAt", "desc").limit(5).get(),
          firestore()
            .collection("announcements")
            .where("isActive", "==", true)
            .orderBy("createdAt", "desc")
            .limit(10)
            .get(),
        ]);

        const newsItems = newsSnap.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            ...data,
            createdAt: serializeTimestamp(data.createdAt),
          };
        });

        const announcementItems = announcementsSnap.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            ...data,
            createdAt: serializeTimestamp(data.createdAt),
          };
        });

        await AsyncStorage.multiSet([
          [HOME_CACHE_KEYS.news, JSON.stringify(newsItems)],
          [HOME_CACHE_KEYS.announcements, JSON.stringify(announcementItems)],
        ]);
      } catch (error) {
        console.log("Home cache preload error:", error);
      }
    };

    preloadHomeCache();
  }, [user]);

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
