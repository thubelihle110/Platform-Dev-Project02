import React from "react";
<<<<<<< HEAD
=======
import { GestureHandlerRootView } from "react-native-gesture-handler";
>>>>>>> 83e6629 (Add my feature)
import { SafeAreaProvider } from "react-native-safe-area-context";

import AuthGate from "./src/navigation/AuthGate";

export default function App() {
  return (
<<<<<<< HEAD
    <SafeAreaProvider>
      <AuthGate />
    </SafeAreaProvider>
  );
}
=======
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthGate />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
>>>>>>> 83e6629 (Add my feature)
