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
          <Image
            source={require("./assets/logo.png")}
            style={styles.watermark}
            resizeMode="contain"
            pointerEvents="none"
          />
        ) : null}
      </View>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: "#fff" },
  navContainer: { flex: 1, zIndex: 1 },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 280,
    height: 280,
    opacity: 0.1,
    zIndex: 2,
    transform: [{ translateX: -140 }, { translateY: -140 }],
  },
});
