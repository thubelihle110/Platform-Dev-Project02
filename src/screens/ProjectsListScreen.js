import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { adminService } from "../services/adminService";

export default function ProjectsListScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await adminService.getProjects();
      setProjects(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const renderProject = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ProjectDetail", {
          projectId: item.id,
        })
      }
    >
      <Text style={styles.name}>
        {item.name || "Untitled Project"}
      </Text>

      <Text style={styles.meta}>
        Category: {item.category || "Not assigned"}
      </Text>

      <Text style={styles.meta}>
        Status: {item.status || "Unknown"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <Text style={styles.title}>Projects</Text>

        {loading ? (
          <Text style={styles.infoText}>Loading projects...</Text>
        ) : projects.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              No projects available yet
            </Text>
            <Text style={styles.emptyText}>
              Please check back later for sustainability projects.
            </Text>
          </View>
        ) : (
          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={renderProject}
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
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight
      ? StatusBar.currentHeight + 12
      : 24,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  name: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },

  meta: {
    fontSize: 14,
    color: "gray",
  },

  infoText: {
    color: "gray",
    fontStyle: "italic",
  },

  emptyBox: {
    marginTop: 40,
    alignItems: "center",
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