import React, { useMemo, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { LanguageProvider } from "./src/context/LanguageContext";

export default function App() {
  const navRef = useRef<any>(null);
  const [currentRoute, setCurrentRoute] = useState("HomePage");
  const showWatermark = useMemo(() => currentRoute !== "HomePage", [currentRoute]);

  return (
    <LanguageProvider>
      <View style={styles.appContainer}>
        <View style={styles.navContainer}>
          <NavigationContainer
            ref={navRef}
            onReady={() => setCurrentRoute(navRef.current?.getCurrentRoute()?.name || "HomePage")}
            onStateChange={() => setCurrentRoute(navRef.current?.getCurrentRoute()?.name || "HomePage")}
          >
            <RootNavigator />
          </NavigationContainer>
        </View>
        {showWatermark ? (
          <View pointerEvents="none" style={styles.watermarkContainer}>
            <Image
              source={require("./assets/logo.png")}
              style={styles.watermark}
              resizeMode="contain"
            />
          </View>
        ) : null}
      </View>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: "#fff" },
  navContainer: { flex: 1, zIndex: 1 },
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  watermark: {
    width: 280,
    height: 280,
    opacity: 0.1,
  },
});
