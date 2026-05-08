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
import { adminService } from "../../services/adminService";

export default function UserDashboard({ navigation }) {
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const currentUser = auth.currentUser;

  const loadMyProjects = useCallback(async () => {
    const allProjects = await adminService.getProjects();
    const joinedProjects = allProjects.filter((project) =>
      (project.members || []).some((member) => member.id === currentUser?.uid)
    );

    setMyProjects(joinedProjects);
    setLoading(false);
  }, [currentUser?.uid]);

  useEffect(() => {
    loadMyProjects();
  }, [loadMyProjects]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyProjects();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={myProjects}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>Welcome back</Text>
                <Text style={styles.title}>
                  {currentUser?.displayName || currentUser?.email || "GreenTrack"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => navigation.navigate("Projects")}
            >
              <Text style={styles.primaryActionText}>Browse Projects</Text>
            </TouchableOpacity>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{myProjects.length}</Text>
                <Text style={styles.summaryLabel}>Joined Projects</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>
                  {myProjects.reduce(
                    (count, project) => count + (project.tasks || []).length,
                    0
                  )}
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
            onPress={() =>
              navigation.navigate("ProjectDetail", {
                projectId: item.id,
                projectName: item.name,
              })
            }
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
              <Text style={styles.emptyTitle}>No joined projects yet</Text>
              <Text style={styles.emptyText}>
                Use the Projects tab to join a campus project.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

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
  primaryAction: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.primary,
    marginBottom: 14,
  },
  primaryActionText: { color: "#fff", fontSize: 15, fontWeight: "800" },
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
