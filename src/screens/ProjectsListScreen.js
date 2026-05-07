<<<<<<< HEAD
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
=======
import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ProjectCard from '../components/ProjectCard';
import SearchFilterBar from '../components/SearchFilterBar';
import FAB from '../components/FAB';
import colors from '../constants/colors';
import { adminService } from '../services/adminService';
>>>>>>> 83e6629 (Add my feature)

export default function ProjectsListScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD

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
=======
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
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
        (project.name || '').toLowerCase().includes(query) ||
        (project.description || '').toLowerCase().includes(query);
      const matchesCategory = !selectedCategory || project.category === selectedCategory;
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() =>
                navigation.navigate('ProjectDetail', {
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
              <Text style={styles.emptyText}>Try changing your search or filters.</Text>
            </View>
          }
        />
      )}
      <FAB onPress={() => navigation.navigate('CreateProject')} />
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
=======
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.foreground },
  subtitle: { marginTop: 2, fontSize: 13, color: colors.mutedForeground },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  centerText: { color: colors.mutedForeground, fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 36 },
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.foreground },
  emptyText: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center' },
});
>>>>>>> 83e6629 (Add my feature)
