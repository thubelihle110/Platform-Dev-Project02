import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { auth, db } from "../../firebaseConfig";
import RegisterLoginScreen from "../../RegisterLoginScreen";

/* ========= ADMIN SCREENS ========= */
import AdminDashboard from "../screens/admin/AdminDashboard";
import ProjectDetailAdmin from "../screens/admin/ProjectDetailAdmin";

/* ========= USER SCREENS ========= */
import UserDashboard from "../screens/user/UserDashboard";
import ProjectsListScreen from "../screens/ProjectsListScreen";
import ProjectDetailScreen from "../screens/ProjectDetailScreen";

const Stack = createNativeStackNavigator();

/* ========= ADMIN STACK ========= */
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminDashboard} />
      <Stack.Screen
        name="ProjectDetailAdmin"
        component={ProjectDetailAdmin}
      />
    </Stack.Navigator>
  );
}

/* ========= USER STACK ========= */
function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserHome" component={UserDashboard} />
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
}

/* ========= AUTH GATE ========= */
export default function AuthGate() {
  const [user, setUser] = useState(undefined);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setRole(snap.data().role);
        } else {
          setRole("student");
        }

        setUser(currentUser);
      } catch (err) {
        console.log("AuthGate error:", err);
        setUser(currentUser);
        setRole("student");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading || user === undefined) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <RegisterLoginScreen />
      ) : role === "admin" ? (
        <AdminStack />
      ) : (
        <UserStack />
      )}
    </NavigationContainer>
  );
}