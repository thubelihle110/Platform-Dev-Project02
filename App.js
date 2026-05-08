import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AuthGate from "./src/navigation/AuthGate";
import { configureNotificationHandler } from "./src/services/notificationService";

configureNotificationHandler();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthGate />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
