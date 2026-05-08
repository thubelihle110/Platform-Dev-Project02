import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { auth, db } from "../../firebaseConfig";
import RegisterLoginScreen from "../../RegisterLoginScreen";
import AdminDashboard from "../screens/admin/AdminDashboard";
import ProjectDetailAdmin from "../screens/admin/ProjectDetailAdmin";
import CreateProjectScreen from "../screens/CreateProjectScreen";
import UserDashboard from "../screens/user/UserDashboard";
import UserProfileScreen from "../screens/user/UserProfileScreen";
import ProjectsListScreen from "../screens/ProjectsListScreen";
import ProjectDetailScreen from "../screens/ProjectDetailScreen";
import colors from "../constants/colors";
import {
  clearProjectDeadlineRemindersAsync,
  registerUserForPushNotificationsAsync,
  syncProjectDeadlineRemindersAsync,
} from "../services/notificationService";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminDashboard} />
      <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
      <Stack.Screen
        name="ProjectDetailAdmin"
        component={ProjectDetailAdmin}
      />
    </Stack.Navigator>
  );
}

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
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
}

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
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          setRole(snapshot.data().role);
        } else {
          setRole("student");
        }

        setUser(currentUser);
      } catch (error) {
        console.log("AuthGate error:", error);
        setUser(currentUser);
        setRole("student");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      clearProjectDeadlineRemindersAsync().catch((error) => {
        console.log("Failed to clear reminders:", error);
      });
      return undefined;
    }

    registerUserForPushNotificationsAsync(user.uid).then((result) => {
      if (result?.error) {
        console.log("Push registration skipped:", result.error);
      }
    });

    const unsubscribeProjects = onSnapshot(
      collection(db, "projects"),
      async (snapshot) => {
        const joinedProjects = snapshot.docs
          .map((projectDoc) => ({ id: projectDoc.id, ...projectDoc.data() }))
          .filter((project) =>
            (project.members || []).some((member) => member.id === user.uid)
          );

        try {
          await syncProjectDeadlineRemindersAsync(joinedProjects);
        } catch (error) {
          console.log("Deadline reminder sync error:", error);
        }
      },
      (error) => {
        console.log("Project reminder listener error:", error);
      }
    );

    return unsubscribeProjects;
  }, [user?.uid]);

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
