// app/components/ProjectSelector.tsx
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ProjectSelectorProps {
  visible: boolean;
  projects: any[];
  onClose: () => void;
  onSelectProject: (project: any) => void;
}

export default function ProjectSelector({
  visible,
  projects,
  onClose,
  onSelectProject,
}: ProjectSelectorProps) {
  const renderProject = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.projectItem}
      onPress={() => {
        onSelectProject(item);
        onClose();
      }}
    >
      <View>
        <Text style={styles.projectName}>{item.name}</Text>
        <Text style={styles.projectDetails}>
          {item.category} • {item.progress}% complete • {item.co2Saved || 0} kg
          CO₂
        </Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📋 Select Existing Project</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {projects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No saved projects yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first project below
              </Text>
            </View>
          ) : (
            <FlatList
              data={projects}
              renderItem={renderProject}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
            />
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  closeButton: { fontSize: 20, color: "#999", padding: 5 },
  list: { paddingBottom: 10 },
  projectItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  projectName: { fontSize: 16, fontWeight: "600", color: "#333" },
  projectDetails: { fontSize: 12, color: "#666", marginTop: 4 },
  arrow: { fontSize: 18, color: "#2e7d32" },
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 16, color: "#666" },
  emptySubtext: { fontSize: 13, color: "#999", marginTop: 5 },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  cancelButtonText: { fontSize: 16, color: "#666" },
});
