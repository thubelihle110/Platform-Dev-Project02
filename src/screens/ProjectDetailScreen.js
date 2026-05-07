<<<<<<< HEAD
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
=======
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import Toast from '../components/Toast';
import colors from '../constants/colors';
import { auth, db } from '../../firebaseConfig';
import { adminService } from '../services/adminService';

const PROOF_ICONS = { Camera: 'camera', GPS: 'map-pin', 'Camera + GPS': 'layers' };

const STATUS_COLORS = {
  pending: { bg: '#FFF9C4', text: '#F9A825' },
  submitted: { bg: '#E3F2FD', text: '#1565C0' },
  approved: { bg: '#E8F5E9', text: '#2E7D32' },
  completed: { bg: '#E8F5E9', text: '#2E7D32' },
};

function TaskCard({ task, index }) {
  const statusColor = STATUS_COLORS[task.status] || STATUS_COLORS.pending;
  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'No deadline';

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskBadge}>
          <Text style={styles.taskBadgeText}>{index + 1}</Text>
        </View>
        <Text style={styles.taskTitle} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={[styles.taskStatus, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.taskStatusText, { color: statusColor.text }]}>{task.status || 'pending'}</Text>
        </View>
      </View>

      {task.description ? <Text style={styles.taskDesc}>{task.description}</Text> : null}

      <View style={styles.taskMeta}>
        <View style={styles.taskMetaItem}>
          <Feather name="calendar" size={12} color={colors.mutedForeground} />
          <Text style={styles.taskMetaText}>{deadline}</Text>
        </View>
        <View style={styles.taskMetaItem}>
          <Feather name={PROOF_ICONS[task.proofRequired] || 'camera'} size={12} color={colors.mutedForeground} />
          <Text style={styles.taskMetaText}>{task.proofRequired || 'Camera'}</Text>
        </View>
      </View>

      {task.guidelineUrl ? <Image source={{ uri: task.guidelineUrl }} style={styles.guidelineImg} /> : null}
    </View>
  );
}

export default function ProjectDetailScreen({ route }) {
  const { projectId } = route.params;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    const ref = doc(db, 'projects', projectId);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setProject(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [projectId]);

  const tasks = useMemo(() => {
    const list = project?.tasks || [];
    return [...list].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }, [project]);

  const handleJoin = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await adminService.joinProject(projectId, {
        id: currentUser.uid,
        fullName: currentUser.displayName || currentUser.email,
        email: currentUser.email,
      });
      setToast({ visible: true, message: 'Joined project successfully.', type: 'success' });
    } catch (error) {
      setToast({ visible: true, message: error.message || 'Failed to join project', type: 'error' });
>>>>>>> 83e6629 (Add my feature)
    }
  };

  if (loading) {
    return (
<<<<<<< HEAD
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
=======
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading project...</Text>
      </SafeAreaView>
>>>>>>> 83e6629 (Add my feature)
    );
  }

  if (!project) {
    return (
<<<<<<< HEAD
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
=======
      <SafeAreaView style={styles.center}>
        <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
        <Text style={styles.notFound}>Project not found</Text>
      </SafeAreaView>
    );
  }

  const completed = tasks.filter((task) => task.status === 'approved' || task.status === 'completed').length;
  const total = tasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const members = project.members || [];
  const userId = auth.currentUser?.uid;
  const hasJoined = userId ? members.some((member) => member.id === userId) : false;

  const deadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'No deadline';

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item, index) => item.id || `${item.title}_${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            {project.coverImageUrl ? (
              <Image source={{ uri: project.coverImageUrl }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Feather name="folder" size={48} color={colors.primary} />
              </View>
            )}

            <View style={styles.body}>
              <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{project.category || 'Not assigned'}</Text>
                </View>
                <View style={styles.campusBadge}>
                  <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                  <Text style={styles.campusBadgeText}>{project.campus || 'No campus'}</Text>
                </View>
              </View>

              <Text style={styles.projectName}>{project.name || 'Untitled Project'}</Text>
              {project.description ? <Text style={styles.description}>{project.description}</Text> : null}

              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Feather name="clock" size={16} color={colors.primary} />
                  <Text style={styles.infoLabel}>Deadline</Text>
                  <Text style={styles.infoValue}>{deadline}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Feather name="user" size={16} color={colors.primary} />
                  <Text style={styles.infoLabel}>Created By</Text>
                  <Text style={styles.infoValue}>{project.createdBy || 'Unknown'}</Text>
                </View>
              </View>

              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Overall Progress</Text>
                  <Text style={styles.progressPct}>{progress}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressCount}>{completed} of {total} tasks completed</Text>
              </View>

              {project.gps ? (
                <View style={styles.gpsCard}>
                  <Feather name="map-pin" size={15} color={colors.primary} />
                  <Text style={styles.gpsText}>
                    {project.gps.latitude.toFixed(5)}, {project.gps.longitude.toFixed(5)}
                  </Text>
                </View>
              ) : null}

              <Pressable
                style={[styles.joinBtn, hasJoined && styles.joinBtnDisabled]}
                onPress={handleJoin}
                disabled={hasJoined}
              >
                <Feather name={hasJoined ? 'check' : 'user-plus'} size={18} color="#fff" />
                <Text style={styles.joinBtnText}>{hasJoined ? 'Joined' : 'Join Project'}</Text>
              </Pressable>

              <Text style={styles.tasksHeading}>Timeline & Tasks</Text>
              <Text style={styles.tasksSubheading}>Sorted by deadline - read-only</Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.taskWrapper}>
            <TaskCard task={item} index={index} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="check-square" size={36} color={colors.border} />
            <Text style={styles.emptyText}>No tasks added yet</Text>
          </View>
        }
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((current) => ({ ...current, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.background,
  },
  loadingText: { color: colors.mutedForeground },
  coverImage: { width: '100%', height: 200, resizeMode: 'cover' },
  coverPlaceholder: {
    height: 140,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 16 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryBadgeText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  campusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  campusBadgeText: { fontSize: 12, color: colors.mutedForeground },
  projectName: { fontSize: 24, fontWeight: '800', color: colors.foreground, marginBottom: 8 },
  description: { fontSize: 15, color: colors.mutedForeground, lineHeight: 22, marginBottom: 16 },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  infoCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.foreground },
  progressCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
    marginBottom: 12,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  progressPct: { fontSize: 14, fontWeight: '700', color: colors.primary },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  progressCount: { fontSize: 12, color: colors.mutedForeground },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10,
    marginBottom: 12,
  },
  gpsText: { fontSize: 13, color: colors.mutedForeground, flex: 1 },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    marginBottom: 20,
  },
  joinBtnDisabled: { backgroundColor: colors.mutedForeground },
  joinBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  tasksHeading: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  tasksSubheading: { fontSize: 12, color: colors.mutedForeground, marginBottom: 12 },
  taskWrapper: { paddingHorizontal: 16 },
  taskCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  taskHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  taskBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  taskBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  taskTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.foreground },
  taskStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  taskStatusText: { fontSize: 11, fontWeight: '600' },
  taskDesc: { fontSize: 13, color: colors.mutedForeground, lineHeight: 18 },
  taskMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  taskMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskMetaText: { fontSize: 12, color: colors.mutedForeground },
  guidelineImg: { width: '100%', height: 100, borderRadius: 8, resizeMode: 'cover' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 15, color: colors.mutedForeground },
  notFound: { fontSize: 16, color: colors.mutedForeground },
});
>>>>>>> 83e6629 (Add my feature)
