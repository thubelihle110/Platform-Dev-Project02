import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";

import { auth } from "../../../firebaseConfig";
import { adminService } from "../../services/adminService";

export default function UserDashboard({ navigation }) {
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const loadMyProjects = async () => {
      const allProjects = await adminService.getProjects();

      const joined = allProjects.filter((p) =>
        (p.members || []).some((m) => m.id === currentUser.uid)
      );

      setMyProjects(joined);
      setLoading(false);
    };

    loadMyProjects();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>My Dashboard</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* VIEW ALL PROJECTS */}
        <TouchableOpacity
          style={styles.mainBtn}
          onPress={() => navigation.navigate("ProjectsList")}
        >
          <Text style={styles.mainBtnText}>View All Projects</Text>
        </TouchableOpacity>

        {/* MY PROJECTS */}
        <Text style={styles.section}>👤 My Projects</Text>

        {loading ? (
          <ActivityIndicator />
        ) : myProjects.length === 0 ? (
          <Text style={styles.empty}>
            You have not joined any projects yet.
          </Text>
        ) : (
          <FlatList
            data={myProjects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate("ProjectDetail", {
                    projectId: item.id,
                  })
                }
              >
                <Text style={styles.bold}>
                  {item.name || "Untitled Project"}
                </Text>
                <Text style={styles.meta}>
                  Status: {item.status}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
  },

  logout: {
    color: "red",
    fontWeight: "bold",
  },

  mainBtn: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  mainBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  empty: {
    color: "gray",
    fontStyle: "italic",
  },

  card: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  bold: {
    fontWeight: "bold",
  },

  meta: {
    color: "gray",
    fontSize: 13,
  },
});