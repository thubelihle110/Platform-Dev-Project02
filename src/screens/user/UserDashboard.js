<<<<<<< HEAD
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
=======
import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "../../../firebaseConfig";
import ProjectCard from "../../components/ProjectCard";
import colors from "../../constants/colors";
>>>>>>> 83e6629 (Add my feature)
import { adminService } from "../../services/adminService";

export default function UserDashboard({ navigation }) {
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD

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
=======
  const [refreshing, setRefreshing] = useState(false);

  const currentUser = auth.currentUser;

  const loadMyProjects = useCallback(async () => {
    const allProjects = await adminService.getProjects();
    const joined = allProjects.filter((project) =>
      (project.members || []).some((member) => member.id === currentUser?.uid)
    );

    setMyProjects(joined);
    setLoading(false);
  }, [currentUser?.uid]);

  useEffect(() => {
    loadMyProjects();
  }, [loadMyProjects]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyProjects();
    setRefreshing(false);
>>>>>>> 83e6629 (Add my feature)
  };

  return (
    <SafeAreaView style={styles.safe}>
<<<<<<< HEAD
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
=======
      <FlatList
        data={myProjects}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>Welcome back</Text>
                <Text style={styles.title}>{currentUser?.displayName || currentUser?.email || "GreenTrack"}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.primaryAction} onPress={() => navigation.navigate("Projects")}>
                <Feather name="folder" size={18} color="#fff" />
                <Text style={styles.primaryActionText}>Browse Projects</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryAction} onPress={() => navigation.navigate("CreateProject")}>
                <Feather name="plus" size={18} color={colors.primary} />
                <Text style={styles.secondaryActionText}>Create</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{myProjects.length}</Text>
                <Text style={styles.summaryLabel}>Joined Projects</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>
                  {myProjects.reduce((count, project) => count + (project.tasks || []).length, 0)}
                </Text>
                <Text style={styles.summaryLabel}>Available Tasks</Text>
              </View>
            </View>

            <Text style={styles.section}>My Projects</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => navigation.navigate("ProjectDetail", { projectId: item.id, projectName: item.name })}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.emptyText}>Loading your projects...</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Feather name="folder" size={36} color={colors.border} />
              <Text style={styles.emptyTitle}>No joined projects yet</Text>
              <Text style={styles.emptyText}>Use the Projects tab to join or create a campus project.</Text>
            </View>
          )
        }
      />
>>>>>>> 83e6629 (Add my feature)
    </SafeAreaView>
  );
}

<<<<<<< HEAD
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
=======
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 96 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  eyebrow: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground },
  title: { marginTop: 2, fontSize: 25, fontWeight: "800", color: colors.foreground },
  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  primaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: colors.primary,
  },
  primaryActionText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    backgroundColor: colors.secondary,
  },
  secondaryActionText: { color: colors.primary, fontSize: 15, fontWeight: "800" },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
  },
  summaryNumber: { fontSize: 24, fontWeight: "800", color: colors.primary },
  summaryLabel: { marginTop: 2, fontSize: 12, color: colors.mutedForeground },
  section: { fontSize: 18, fontWeight: "800", color: colors.foreground, marginBottom: 12 },
  centerBox: { alignItems: "center", paddingVertical: 38, gap: 10 },
  emptyBox: { alignItems: "center", paddingVertical: 46, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: colors.foreground },
  emptyText: { fontSize: 14, color: colors.mutedForeground, textAlign: "center" },
});
>>>>>>> 83e6629 (Add my feature)
