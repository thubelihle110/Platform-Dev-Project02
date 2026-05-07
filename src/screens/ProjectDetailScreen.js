import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, onSnapshot } from "firebase/firestore";

import { db, auth } from "../../firebaseConfig";
import { adminService } from "../services/adminService";

export default function ProjectDetailScreen({ route }) {
  const { projectId } = route.params;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const ref = doc(db, "projects", projectId);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProject({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [projectId]);

  const handleJoin = async () => {
    try {
      if (!currentUser) return;

      await adminService.joinProject(projectId, {
        id: currentUser.uid,
        fullName: currentUser.email,
        email: currentUser.email,
      });

      setJoined(true);

      Alert.alert(
        "Joined Project",
        "You have successfully joined this project."
      );
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to join project");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Project not available</Text>
        <Text style={styles.emptyText}>
          This project may have been removed or is no longer accessible.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* PROJECT HEADER */}
        <Text style={styles.title}>
          {project.name || "Untitled Project"}
        </Text>

        <View style={styles.metaBox}>
          <Text style={styles.meta}>
            Category: {project.category || "Not assigned"}
          </Text>
          <Text style={styles.meta}>
            Campus: {project.campus || "Not specified"}
          </Text>
          <Text style={styles.meta}>
            Status: {project.status || "Unknown"}
          </Text>
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.section}>📝 Description</Text>
        <Text style={styles.description}>
          {project.description || "No description available for this project."}
        </Text>

        {/* JOIN PROJECT */}
        {project.status === "active" && !joined && (
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
            <Text style={styles.joinText}>✅ Join This Project</Text>
          </TouchableOpacity>
        )}

        {joined && (
          <Text style={styles.joinedText}>
            You are already participating in this project.
          </Text>
        )}

        {/* INFO */}
        <Text style={styles.section}>📊 Updates</Text>
        <Text style={styles.hint}>
          Project updates will appear here once activity begins.
        </Text>

      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight
      ? StatusBar.currentHeight + 16
      : 24,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  metaBox: {
    marginTop: 8,
    marginBottom: 12,
  },

  meta: {
    color: "gray",
    fontSize: 14,
  },

  section: {
    marginTop: 22,
    fontSize: 18,
    fontWeight: "bold",
  },

  description: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
  },

  joinBtn: {
    marginTop: 20,
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  joinText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  joinedText: {
    marginTop: 15,
    color: "green",
    fontStyle: "italic",
  },

  hint: {
    marginTop: 6,
    color: "gray",
    fontStyle: "italic",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },

  emptyText: {
    color: "gray",
    textAlign: "center",
  },
});