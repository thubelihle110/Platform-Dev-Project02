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

  const loadData = async () => {
    try {
      if (!projectId) {
        Alert.alert("Error", "Project ID missing");
        return;
      }

      const projectSnap = await getDoc(doc(db, "projects", projectId));
      const updatesData = await adminService.getProjectUpdates(projectId);

      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        setProject({ id: projectSnap.id, ...projectData });
        setMembers(projectData.members || []);
      }

      setUpdates(updatesData || []);
    } catch (e) {
      Alert.alert("Error", "Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stopProject = () => {
    Alert.alert(
      "Stop Project",
      "Are you sure you want to stop this project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: async () => {
            await adminService.stopProject(projectId, "Stopped by admin");
            loadData();
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

        {/* HEADER */}
        <Text style={styles.title}>
          {project.name || "Untitled Project"}
        </Text>

        <Text style={styles.meta}>
          Category: {project.category || "Not assigned"}
        </Text>
        <Text style={styles.meta}>
          Status: {project.status || "Unknown"}
        </Text>

        {project.status === "active" && (
          <TouchableOpacity style={styles.stopBtn} onPress={stopProject}>
            <Text style={styles.stopText}>⛔ Stop Project</Text>
          </TouchableOpacity>
        )}

        {/* PARTICIPANTS */}
        <Text style={styles.section}>👥 Participants</Text>

        {members.length === 0 ? (
          <Text style={styles.empty}>
            No participants have joined this project yet.
          </Text>
        ) : (
          members.map((m, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.bold}>
                {m.fullName || m.email}
              </Text>
              <Text style={styles.subText}>{m.email}</Text>
            </View>
          ))
        )}

        {/* UPDATES */}
        <Text style={styles.section}>📊 Updates</Text>

        {updates.length === 0 ? (
          <Text style={styles.empty}>
            No updates have been posted for this project.
          </Text>
        ) : (
          updates.map((u) => (
            <View key={u.id} style={styles.updateCard}>
              <Text>{u.message || "Update"}</Text>
            </View>
          ))
        )}

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
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
  },

  meta: {
    color: "gray",
    marginTop: 4,
  },

  section: {
    marginTop: 22,
    fontSize: 18,
    fontWeight: "bold",
  },

  empty: {
    marginTop: 6,
    color: "gray",
    fontStyle: "italic",
  },

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

  bold: {
    fontWeight: "bold",
  },

  subText: {
    fontSize: 12,
    color: "gray",
  },

  stopBtn: {
    marginTop: 10,
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
  },

  stopText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});