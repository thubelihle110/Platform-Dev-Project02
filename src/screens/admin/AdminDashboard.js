import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";

import { auth } from "../../../firebaseConfig";
import { adminService } from "../../services/adminService";

export default function AdminDashboard({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const projectsData = await adminService.getProjects();
    const usersData = await adminService.getUsers();
    const statsData = await adminService.getStats();

    setProjects(projectsData);
    setUsers(usersData);
    setStats(statsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* OVERVIEW */}
        <Text style={styles.section}>📊 Overview</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalProjects}</Text>
            <Text>Total Projects</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeProjects}</Text>
            <Text>Active Projects</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {stats.totalProjects - stats.activeProjects}
            </Text>
            <Text>Stopped Projects</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text>Total Users</Text>
          </View>
        </View>

        {/* PROJECTS */}
        <Text style={styles.section}>📁 Projects</Text>

        {projects.map((p) => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.bold}>{p.name || "Untitled Project"}</Text>
            <Text style={styles.meta}>
              {p.category || "Not assigned"} • {p.status}
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProjectDetailAdmin", {
                  projectId: p.id,
                })
              }
            >
              <Text style={styles.view}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* USERS */}
        <Text style={styles.section}>👥 Users</Text>

        {users.map((u) => (
          <View key={u.id} style={styles.userCard}>
            <Text style={styles.bold}>{u.fullName}</Text>
            <Text style={styles.meta}>{u.email}</Text>
            <Text style={styles.meta}>Role: {u.role}</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },

  container: {
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  logout: {
    color: "red",
    fontWeight: "bold",
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
  },

  statNumber: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  userCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  bold: {
    fontWeight: "bold",
  },

  meta: {
    color: "gray",
    fontSize: 13,
  },

  view: {
    color: "#2E7D32",
    fontWeight: "bold",
    marginTop: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});