// app/(tabs)/projects.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// This interface must match the project objects saved in index.tsx
interface Project {
  id: string;
  name: string; // project name
  type: string; // Green_Spaces, Energy_Conservation, etc.
  category: string; // Biodiversity, Energy, Water, Waste, Community, Education
  progress: number;
  co2Saved: number;
  details?: any; // detailed metrics (treesPlanted, kwhSaved, etc.)
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = "@sustainable_projects";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load projects from AsyncStorage
  const loadProjects = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProjects(JSON.parse(stored));
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      Alert.alert("Error", "Could not load your projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const deleteProject = async (projectId: string) => {
    try {
      const updated = projects.filter((p) => p.id !== projectId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setProjects(updated);
      return true;
    } catch (error) {
      console.error("Delete failed:", error);
      return false;
    }
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    Alert.alert("Delete Project", `Delete "${projectName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const ok = await deleteProject(projectId);
          if (ok) {
            Alert.alert("Success", "Project deleted");
          } else {
            Alert.alert("Error", "Could not delete project");
          }
        },
      },
    ]);
  };

  // Store the full project object for re‑analysis
  const handleReanalyze = async (project: Project) => {
    try {
      await AsyncStorage.setItem("@reanalyze_project", JSON.stringify(project));
      router.push("/");
      Alert.alert(
        "Ready",
        `"${project.name}" loaded for re‑analysis on the Dashboard`,
      );
    } catch (error) {
      console.error("Re‑analysis error:", error);
      Alert.alert("Error", "Could not prepare project for re‑analysis");
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <View style={styles.projectCard}>
      <View style={styles.projectInfo}>
        <Text style={styles.projectName}>{item.name}</Text>
        <Text style={styles.projectType}>{item.category}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressBar, { width: `${item.progress}%` }]}
            />
          </View>
          <Text style={styles.projectProgress}>{item.progress}% Complete</Text>
        </View>
        <Text style={styles.co2Text}>🌿 {item.co2Saved} kg CO₂ saved</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.reanalyzeButton}
          onPress={() => handleReanalyze(item)}
        >
          <Text style={styles.reanalyzeButtonText}>🔄</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 My Projects</Text>
        <Text style={styles.headerSubtitle}>
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyText}>No projects yet</Text>
          <Text style={styles.emptySubtext}>
            Add your first project from the Dashboard
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#2e7d32",
    padding: 25,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  headerSubtitle: { fontSize: 14, color: "#c8e6c9", marginTop: 5 },
  list: { padding: 15, paddingBottom: 30 },
  projectCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectInfo: { flex: 1, marginRight: 10 },
  projectName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  projectType: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    textTransform: "capitalize",
  },
  progressContainer: { marginTop: 8 },
  progressTrack: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#2e7d32",
    borderRadius: 3,
  },
  projectProgress: { fontSize: 12, color: "#2e7d32", fontWeight: "600" },
  co2Text: { fontSize: 11, color: "#666", marginTop: 4 },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  reanalyzeButton: {
    padding: 8,
    backgroundColor: "#e8f5e9",
    borderRadius: 20,
  },
  reanalyzeButtonText: { fontSize: 16 },
  deleteButton: { padding: 8 },
  deleteButtonText: { fontSize: 20 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { marginTop: 10, color: "#666" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyEmoji: { fontSize: 48, marginBottom: 10 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#666" },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
});
