import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { NavigationContainer } from "@react-navigation/native";
<<<<<<< HEAD
import { createNativeStackNavigator } from "@react-navigation/native-stack";
=======
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
>>>>>>> 83e6629 (Add my feature)

import { auth, db } from "../../firebaseConfig";
import RegisterLoginScreen from "../../RegisterLoginScreen";

/* ========= ADMIN SCREENS ========= */
import AdminDashboard from "../screens/admin/AdminDashboard";
import ProjectDetailAdmin from "../screens/admin/ProjectDetailAdmin";
<<<<<<< HEAD

/* ========= USER SCREENS ========= */
import UserDashboard from "../screens/user/UserDashboard";
import ProjectsListScreen from "../screens/ProjectsListScreen";
import ProjectDetailScreen from "../screens/ProjectDetailScreen";

const Stack = createNativeStackNavigator();
=======
import CreateProjectScreen from "../screens/CreateProjectScreen";

/* ========= USER SCREENS ========= */
import UserDashboard from "../screens/user/UserDashboard";
import UserProfileScreen from "../screens/user/UserProfileScreen";
import ProjectsListScreen from "../screens/ProjectsListScreen";
import ProjectDetailScreen from "../screens/ProjectDetailScreen";
import colors from "../constants/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
>>>>>>> 83e6629 (Add my feature)

/* ========= ADMIN STACK ========= */
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminDashboard} />
<<<<<<< HEAD
=======
      <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
>>>>>>> 83e6629 (Add my feature)
      <Stack.Screen
        name="ProjectDetailAdmin"
        component={ProjectDetailAdmin}
      />
    </Stack.Navigator>
  );
}

/* ========= USER STACK ========= */
<<<<<<< HEAD
function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserHome" component={UserDashboard} />
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
=======
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Home: "home",
            Projects: "folder",
            Profile: "user",
          };
          return <Feather name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={UserDashboard} />
      <Tab.Screen name="Projects" component={ProjectsListScreen} />
      <Tab.Screen name="Profile" component={UserProfileScreen} />
    </Tab.Navigator>
  );
}

function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={UserTabs} />
      <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
>>>>>>> 83e6629 (Add my feature)
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 83e6629 (Add my feature)
