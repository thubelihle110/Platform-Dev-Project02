import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../../firebaseConfig";
import { adminService } from "../../services/adminService";

export default function ProjectDetailAdmin({ route }) {
  const projectId = route?.params?.projectId;
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      if (!projectId) {
        Alert.alert("Error", "Project ID missing");
        return;
      }

      const projectSnapshot = await getDoc(doc(db, "projects", projectId));
      const updatesData = await adminService.getProjectUpdates(projectId);

      if (projectSnapshot.exists()) {
        const projectData = projectSnapshot.data();
        setProject({ id: projectSnapshot.id, ...projectData });
        setMembers(projectData.members || []);
      } else {
        setProject(null);
        setMembers([]);
      }

      setUpdates(updatesData || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const confirmStatusChange = (nextAction) => {
    const isStopping = nextAction === "stop";

    Alert.alert(
      isStopping ? "Stop Project" : "Resume Project",
      isStopping
        ? "Are you sure you want to stop this project?"
        : "Are you sure you want to resume this project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isStopping ? "Stop" : "Resume",
          style: isStopping ? "destructive" : "default",
          onPress: async () => {
            try {
              setActionLoading(true);

              if (isStopping) {
                await adminService.stopProject(projectId, "Stopped by admin");
              } else {
                await adminService.resumeProject(projectId);
              }

              await loadData();
            } catch (error) {
              Alert.alert(
                "Error",
                error.message || "Failed to update project status"
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
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
        <Text>Project not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{project.name || "Untitled Project"}</Text>

        <Text style={styles.meta}>
          Category: {project.category || "Not assigned"}
        </Text>
        <Text style={styles.meta}>Status: {project.status || "Unknown"}</Text>

        {project.status === "active" ? (
          <TouchableOpacity
            style={[styles.stopBtn, actionLoading && styles.disabledBtn]}
            onPress={() => confirmStatusChange("stop")}
            disabled={actionLoading}
          >
            <Text style={styles.stopText}>
              {actionLoading ? "Updating..." : "Stop Project"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.resumeBtn, actionLoading && styles.disabledBtn]}
            onPress={() => confirmStatusChange("resume")}
            disabled={actionLoading}
          >
            <Text style={styles.resumeText}>
              {actionLoading ? "Updating..." : "Resume Project"}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.section}>Participants</Text>

        {members.length === 0 ? (
          <Text style={styles.empty}>
            No participants have joined this project yet.
          </Text>
        ) : (
          members.map((member, index) => (
            <View key={`${member.id}_${index}`} style={styles.card}>
              <Text style={styles.bold}>{member.fullName || member.email}</Text>
              <Text style={styles.subText}>{member.email}</Text>
            </View>
          ))
        )}

        <Text style={styles.section}>Updates</Text>

        {updates.length === 0 ? (
          <Text style={styles.empty}>No updates have been posted for this project.</Text>
        ) : (
          updates.map((update) => (
            <View key={update.id} style={styles.updateCard}>
              <Text>{update.message || "Update"}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 24,
    paddingBottom: 40,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold" },
  meta: { color: "gray", marginTop: 4 },
  section: { marginTop: 22, fontSize: 18, fontWeight: "bold" },
  empty: { marginTop: 6, color: "gray", fontStyle: "italic" },
  card: {
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginTop: 8,
  },
  updateCard: {
    padding: 10,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    marginTop: 8,
  },
  bold: { fontWeight: "bold" },
  subText: { fontSize: 12, color: "gray" },
  stopBtn: {
    marginTop: 10,
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
  },
  stopText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  resumeBtn: {
    marginTop: 10,
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 8,
  },
  resumeText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  disabledBtn: { opacity: 0.7 },
});
