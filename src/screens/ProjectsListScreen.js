import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ProjectCard from "../components/ProjectCard";
import SearchFilterBar from "../components/SearchFilterBar";
import colors from "../constants/colors";
import { adminService } from "../services/adminService";

export default function ProjectsListScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);

  const loadProjects = useCallback(async () => {
    const data = await adminService.getProjects();
    setProjects(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const filteredProjects = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        (project.name || "").toLowerCase().includes(query) ||
        (project.description || "").toLowerCase().includes(query);
      const matchesCategory =
        !selectedCategory || project.category === selectedCategory;
      const matchesCampus = !selectedCampus || project.campus === selectedCampus;

      return matchesSearch && matchesCategory && matchesCampus;
    });
  }, [projects, searchText, selectedCategory, selectedCampus]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <Text style={styles.subtitle}>{filteredProjects.length} available</Text>
      </View>

      <SearchFilterBar
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedCampus={selectedCampus}
        onCampusChange={setSelectedCampus}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>Loading projects...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
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
            <View style={styles.emptyBox}>
              <Feather name="folder" size={38} color={colors.border} />
              <Text style={styles.emptyTitle}>No projects found</Text>
              <Text style={styles.emptyText}>
                Try changing your search or filters.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: colors.foreground },
  subtitle: { marginTop: 2, fontSize: 13, color: colors.mutedForeground },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  centerText: { color: colors.mutedForeground, fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 36 },
  emptyBox: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.foreground },
  emptyText: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
  },
});
