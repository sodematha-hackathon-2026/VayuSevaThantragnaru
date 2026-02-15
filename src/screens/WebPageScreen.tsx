import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

type WebPageScreenProps = {
  route: {
    params?: {
      url?: string;
    };
  };
};

export default function WebPageScreen({ route }: WebPageScreenProps) {
  const url = route?.params?.url || "https://www.sodematha.in/";

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        startInLoadingState
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5E3CE" },
});
