import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../utils/translations";
import { HOME_CACHE_KEYS, serializeTimestamp } from "../utils/cache";

type NewsItem = {
  id: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  contentUrl?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp | number;
};

type Announcement = {
  id: string;
  text: string;
  imageUrl?: string;
  priority?: number;
  createdAt?: FirebaseFirestoreTypes.Timestamp | number;
  contentUrl?: string;
};

const { width } = Dimensions.get("window");

const ASSETS = {
  logo: require("../../assets/logo.png"),
  vishwothama: require("../../assets/Vishwothama.png"),
  vishwavallabha: require("../../assets/Vishwavallabha.png"),
};

const PROFILE_STORAGE_KEY = "devotee_profile";

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

const getProfileKeyForPhone = (phone?: string | null) => {
  if (!phone) return PROFILE_STORAGE_KEY;
  return `${PROFILE_STORAGE_KEY}_${normalizeDigits(phone)}`;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState("");
  const { language } = useLanguage();

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<FlatList<Announcement>>(null);

  useEffect(() => {
    let active = true;
    const loadCache = async () => {
      try {
        const entries = await AsyncStorage.multiGet([
          HOME_CACHE_KEYS.news,
          HOME_CACHE_KEYS.announcements,
        ]);
        if (!active) return;
        const cachedNewsRaw = entries.find(([key]) => key === HOME_CACHE_KEYS.news)?.[1];
        const cachedAnnouncementsRaw = entries.find(([key]) => key === HOME_CACHE_KEYS.announcements)?.[1];

        if (cachedNewsRaw) {
          const parsed = JSON.parse(cachedNewsRaw) as NewsItem[];
          setNews(parsed);
        }

        if (cachedAnnouncementsRaw) {
          const parsed = JSON.parse(cachedAnnouncementsRaw) as Announcement[];
          setAnnouncements(parsed);
        }
      } catch (error) {
        console.log("Home cache load error:", error);
      }
    };

    loadCache();
    console.log('Fetching news from Firestore...');
    const unsubNews = firestore()
      .collection("news")
      .orderBy("createdAt", "desc")
      .limit(5)
      .onSnapshot(
        (snap) => {
          console.log('News snapshot received:', snap.size, 'documents');
          const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
          console.log('News items:', items);
          setNews(items);
          AsyncStorage.setItem(
            HOME_CACHE_KEYS.news,
            JSON.stringify(
              items.map((item) => ({
                ...item,
                createdAt: serializeTimestamp(item.createdAt),
              }))
            )
          ).catch((error) => console.log("Home cache save error:", error));
        },
        (err) => console.log("news snapshot error", err)
      );

    console.log('Fetching announcements from Firestore...');
    const unsubAnnouncements = firestore()
      .collection("announcements")
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .limit(10)
      .onSnapshot(
        (snap) => {
          console.log('Announcements snapshot received:', snap.size, 'documents');
          const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
          console.log('Announcement items:', items);
          setAnnouncements(items);
          AsyncStorage.setItem(
            HOME_CACHE_KEYS.announcements,
            JSON.stringify(
              items.map((item) => ({
                ...item,
                createdAt: serializeTimestamp(item.createdAt),
              }))
            )
          ).catch((error) => console.log("Home cache save error:", error));
        },
        (err) => console.log("announcements snapshot error", err)
      );

    const t = setTimeout(() => setLoading(false), 400);
    return () => {
      active = false;
      unsubNews();
      unsubAnnouncements();
      clearTimeout(t);
    };
  }, []);

  const loadProfileName = useCallback(async () => {
    try {
      const phone = auth().currentUser?.phoneNumber || "";
      const profileKey = getProfileKeyForPhone(phone);
      const raw = await AsyncStorage.getItem(profileKey);
      if (!raw) {
        setProfileName("");
        return;
      }
      const parsed = JSON.parse(raw) as { fullName?: string };
      setProfileName(parsed?.fullName?.trim() || "");
    } catch (error) {
      console.log("Profile name load error:", error);
      setProfileName("");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileName();
    }, [loadProfileName])
  );

  // Auto-advance carousel
  useEffect(() => {
    if (!announcements.length) return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => {
        const next = (prev + 1) % announcements.length;
        carouselRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const openUrl = async (url?: string) => {
    if (!url) return;
    console.log('Opening URL:', url);
    try {
      await Linking.openURL(url);
      console.log('URL opened successfully');
    } catch (err) {
      console.error('Error opening URL:', err);
    }
  };

  const socialLinks = useMemo(
    () => [	
      { label: "Instagram", url: "https://www.instagram.com/sodematha/?hl=en" },
      { label: "Facebook", url: "https://www.facebook.com/SodeMatha/" },
      { label: "Twitter", url: "https://x.com/sodematha?lang=en" },
    ],
    []
  );


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const formatDate = (value?: FirebaseFirestoreTypes.Timestamp | number) => {
    if (!value) return "";
    if (typeof value === "number") return new Date(value).toLocaleDateString();
    return new Date(value.toDate()).toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header: Logo + Swamiji photos */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.logoBox}>
            {ASSETS.logo ? (
              <Image source={ASSETS.logo} style={styles.logo} resizeMode="contain" />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>{t("home.logoPlaceholder", language)}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerTextBox}>
            <Text style={styles.title}>{t('home.title', language)}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle', language)}</Text>
          </View>
        </View>

        <View style={styles.swamijiRow}>
          <View style={styles.swamijiCard}>
            {ASSETS.vishwothama ? (
              <Image source={ASSETS.vishwothama} style={styles.swamijiImg} />
            ) : (
              <View style={[styles.placeholder, { height: 110 }]}>
                <Text style={styles.placeholderText}>{t("home.vishwothamaSwamiji", language)}</Text>
              </View>
            )}
            <Text style={styles.swamijiName}>{t('home.vishwothamaSwamiji', language)}</Text>
          </View>

          <View style={styles.swamijiCard}>
            {ASSETS.vishwavallabha ? (
              <Image source={ASSETS.vishwavallabha} style={styles.swamijiImg} />
            ) : (
              <View style={[styles.placeholder, { height: 110 }]}>
                <Text style={styles.placeholderText}>{t("home.vishwavallabhaSwamiji", language)}</Text>
              </View>
            )}
            <Text style={styles.swamijiName}>{t('home.vishwavallabhaSwamiji', language)}</Text>
          </View>
        </View>
      </View>

      {profileName ? (
        <View style={styles.welcomeRow}>
          <Text style={styles.welcomeText}>
            {t("home.welcomeUser", language, { name: profileName })}
          </Text>
        </View>
      ) : null}

      {/* Flash updates carousel */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.flashUpdates', language)}</Text>

        {announcements.length ? (
          <FlatList
            ref={carouselRef}
            data={announcements}
            keyExtractor={(i) => i.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.carouselItem, { width: width - 40 }]}>
                <Text style={styles.carouselText}>{item.text}</Text>
                {!!item.imageUrl && (
                  <Image 
                    source={{ uri: item.imageUrl }} 
                    style={styles.carouselImage}
                    onError={(e) => console.log('Image load error:', e.nativeEvent.error, 'URL:', item.imageUrl)}
                    onLoad={() => console.log('Image loaded:', item.imageUrl)}
                  />
                )}
                {!!item.contentUrl && (
                  <TouchableOpacity onPress={() => openUrl(item.contentUrl)} style={styles.readMoreBtn}>
                    <Text style={styles.readMoreText}>{t("common.readMore", language)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        ) : (
          <Text style={styles.muted}>{t('home.noAnnouncements', language)}</Text>
        )}
      </View>

      {/* Top 5 news tiles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.topNews', language)}</Text>

        {news.length ? (
          <View style={{ gap: 12 }}>
            {news.map((n) => (
              <View key={n.id} style={styles.newsTile}>
                <TouchableOpacity
                  style={styles.newsTileContent}
                  onPress={() => n.contentUrl && openUrl(n.contentUrl)}
                  activeOpacity={n.contentUrl ? 0.85 : 1}
                  disabled={!n.contentUrl}
                >
                  {n.imageUrl ? (
                    <Image source={{ uri: n.imageUrl }} style={styles.newsImg} />
                  ) : (
                    <View style={[styles.placeholder, styles.newsImg]}>
                      <Text style={styles.placeholderText}>{t("home.newsImagePlaceholder", language)}</Text>
                    </View>
                  )}
                  <View style={styles.newsTextBox}>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                      {n.title}
                    </Text>
                    {!!n.createdAt && (
                      <Text style={styles.newsDate}>
                        {formatDate(n.createdAt)}
                      </Text>
                    )}
                    {!!n.summary && (
                      <Text style={styles.newsSummary} numberOfLines={2}>
                        {n.summary}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                {!!n.contentUrl && (
                  <TouchableOpacity onPress={() => openUrl(n.contentUrl)} style={styles.newsReadMoreBtn}>
                    <Text style={styles.readMoreText}>{t("common.readMore", language)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>{t('home.noNews', language)}</Text>
        )}
      </View>

      {/* Darshana / Prasada timings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.darshanaTimings', language)}</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, styles.cellHeader]}>{t('home.location', language)}</Text>
            <Text style={[styles.cell, styles.cellHeader]}>{t('home.darshana', language)}</Text>
            <Text style={[styles.cell, styles.cellHeader]}>{t('home.prasada', language)}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cell}>{t('home.sode', language)}</Text>
            <Text style={styles.cell}>{t('home.morning', language)}</Text>
            <Text style={styles.cell}>{t('home.noon', language)}</Text>
          </View>
		  <View style={styles.tableRow}>
            <Text style={styles.cell}></Text>
            <Text style={styles.cell}>{t('home.evening', language)}</Text>
            <Text style={styles.cell}>{t('home.eveningPrasada', language)}</Text>
          </View>
        </View>
      </View>

      {/* Social links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.followUs', language)}</Text>

        <View style={styles.socialRow}>
			<TouchableOpacity
				style={styles.instagramBtn}
				onPress={() => openUrl("https://www.instagram.com/sodematha/?hl=en")}
			>
				<Icon name="logo-instagram" size={24} color="#fff" />
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.facebookBtn}
				onPress={() => openUrl("https://www.facebook.com/SodeMatha/")}
			>
				<Icon name="logo-facebook" size={24} color="#fff" />
			</TouchableOpacity>
		</View>

      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("contact.title", language)}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("Contact Us")}>
          <Text style={styles.btnText}>{t("common.openContactPage", language)}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5E3CE" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerCard: {
    borderWidth: 1,
    borderColor: "#E2C3A4",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    backgroundColor: "#FFF4E6",
  },
  headerTop: { flexDirection: "row", alignItems: "center" },
  logoBox: { width: 72, height: 72, marginRight: 12 },
  logo: { width: "100%", height: "100%" },
  headerTextBox: { flex: 1 },
  title: { fontSize: 22, fontWeight: "800", color: "#3B2416" },
  subtitle: { fontSize: 13, color: "#7A5A45", marginTop: 2 },

  swamijiRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  swamijiCard: { flex: 1 },
  swamijiImg: { width: "100%", height: 110, borderRadius: 12 },
  swamijiName: { fontSize: 12, fontWeight: "700", marginTop: 8, lineHeight: 16, color: "#3B2416" },

  welcomeRow: {
    marginTop: 2,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  welcomeText: { fontSize: 14, fontWeight: "700", color: "#3B2416" },

  section: { marginTop: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10, color: "#3B2416" },

  muted: { color: "#7A5A45", fontSize: 13 },

  carouselItem: {
    borderWidth: 1,
    borderColor: "#E2C3A4",
    borderRadius: 16,
    padding: 14,
    marginRight: 10,
    backgroundColor: "#FFF4E6",
  },
  carouselText: { fontSize: 14, fontWeight: "700", lineHeight: 20, color: "#3B2416" },
  carouselImage: { width: "100%", height: 140, borderRadius: 12, marginTop: 10 },

  newsTile: {
    borderWidth: 1,
    borderColor: "#E2C3A4",
    borderRadius: 16,
    overflow: "hidden",
  },
  newsTileContent: {
    flexDirection: "row",
    backgroundColor: "#FFF4E6",
  },
  newsImg: { width: 110, height: 96 },
  newsTextBox: { flex: 1, padding: 12 },
  newsTitle: { fontSize: 14, fontWeight: "800", color: "#3B2416" },
  newsDate: { fontSize: 11, color: "#7A5A45", marginTop: 4 },
  newsSummary: { fontSize: 12, color: "#7A5A45", marginTop: 6, lineHeight: 16 },

  table: {
    borderWidth: 1,
    borderColor: "#E2C3A4",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableRow: { flexDirection: "row" },
  tableHeader: { backgroundColor: "#F1D2B4" },
  cell: { flex: 1, padding: 10, fontSize: 12, color: "#3B2416" },
  cellHeader: { fontWeight: "800" },

  socialRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  socialBtn: {
    borderWidth: 1,
    borderColor: "#C96A2B",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  socialBtnText: { fontWeight: "800" },

  placeholder: {
    backgroundColor: "#F3DFC8",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { color: "#7A5A45", fontWeight: "800", fontSize: 12 },
  
  btn: {
    marginTop: 20,
    backgroundColor: "#C96A2B",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "800" },
  
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E2C3A4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#FFF4E6",
  },
  instagramBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#E4405F",
  },
  facebookBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1877F2",
  },
  readMoreBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  readMoreText: {
    color: "#007AFF",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  newsReadMoreBtn: {
    padding: 12,
    alignItems: "flex-end",
  },

});
