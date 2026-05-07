<<<<<<< HEAD
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { adminService } from "../services/adminService";

export default function CreateProjectScreen({ navigation }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [campus, setCampus] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  const [tasks, setTasks] = useState([{ title: "", description: "" }]);

  const addTask = () => {
    setTasks([...tasks, { title: "", description: "" }]);
  };

  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleSubmit = async () => {
    if (!name || !category || !campus || !createdBy) {
      Alert.alert("Error", "Fill all required fields");
      return;
    }

    try {
      await adminService.createProject(
        { name, description, category, campus, createdBy },
        tasks,
        null
      );

      Alert.alert("Success", "Project created!");
      navigation.goBack();
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to create project");
=======
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../firebaseConfig';
import LoadingOverlay from '../components/LoadingOverlay';
import TaskItem from '../components/TaskItem';
import colors from '../constants/colors';
import { CAMPUSES, CATEGORIES } from '../constants/projectConstants';
import { adminService } from '../services/adminService';

const emptyTask = {
  title: '',
  description: '',
  deadline: null,
  proofRequired: 'Camera',
  guidelineUri: null,
};

function OptionPicker({ label, value, options, onSelect }) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.select} onPress={() => setVisible(true)}>
        <Text style={[styles.selectText, !value && styles.placeholder]}>{value || `Select ${label.toLowerCase()}`}</Text>
        <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
      </Pressable>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={() => setVisible(false)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.option, value === option && styles.optionActive]}
                onPress={() => {
                  onSelect(option);
                  setVisible(false);
                }}
              >
                <Text style={[styles.optionText, value === option && styles.optionTextActive]}>{option}</Text>
                {value === option ? <Feather name="check" size={16} color={colors.primary} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function CreateProjectScreen({ navigation }) {
  const currentUser = auth.currentUser;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [campus, setCampus] = useState('');
  const [createdBy, setCreatedBy] = useState(currentUser?.displayName || currentUser?.email || '');
  const [deadline, setDeadline] = useState(null);
  const [showDate, setShowDate] = useState(false);
  const [coverImageUri, setCoverImageUri] = useState(null);
  const [gps, setGps] = useState(null);
  const [tasks, setTasks] = useState([{ ...emptyTask }]);
  const [saving, setSaving] = useState(false);

  const updateTask = (index, nextTask) => {
    setTasks((current) => current.map((task, taskIndex) => (taskIndex === index ? nextTask : task)));
  };

  const addTask = () => setTasks((current) => [...current, { ...emptyTask }]);
  const removeTask = (index) => setTasks((current) => current.filter((_, taskIndex) => taskIndex !== index));

  const pickCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo access is needed to upload a project cover image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) setCoverImageUri(result.assets[0].uri);
  };

  const captureLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Location access is needed to tag a project site.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setGps({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const handleSubmit = async () => {
    const validTasks = tasks.filter((task) => task.title.trim());

    if (!name.trim() || !category || !campus || !createdBy.trim()) {
      Alert.alert('Missing details', 'Please fill in the project name, category, campus, and creator.');
      return;
    }

    if (validTasks.length === 0) {
      Alert.alert('Missing tasks', 'Add at least one task title before creating the project.');
      return;
    }

    setSaving(true);
    try {
      const projectId = await adminService.createProject(
        {
          name: name.trim(),
          description: description.trim(),
          category,
          campus,
          createdBy: createdBy.trim(),
          deadline,
          gps,
        },
        validTasks,
        coverImageUri
      );

      const routeNames = navigation.getState()?.routeNames || [];
      const detailRoute = routeNames.includes('ProjectDetailAdmin') ? 'ProjectDetailAdmin' : 'ProjectDetail';
      navigation.replace(detailRoute, { projectId, projectName: name.trim() });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create project');
    } finally {
      setSaving(false);
>>>>>>> 83e6629 (Add my feature)
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
<<<<<<< HEAD
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Create Project</Text>

        <TextInput placeholder="Project Name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
        <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
        <TextInput placeholder="Campus" value={campus} onChangeText={setCampus} style={styles.input} />
        <TextInput placeholder="Your Name" value={createdBy} onChangeText={setCreatedBy} style={styles.input} />

        <Text style={styles.section}>Tasks</Text>

        {tasks.map((task, index) => (
          <View key={index} style={styles.taskBox}>
            <TextInput
              placeholder="Task Title"
              value={task.title}
              onChangeText={(v) => updateTask(index, "title", v)}
              style={styles.input}
            />

            <TextInput
              placeholder="Task Description"
              value={task.description}
              onChangeText={(v) => updateTask(index, "description", v)}
              style={styles.input}
            />
          </View>
        ))}

        <TouchableOpacity onPress={addTask} style={styles.addBtn}>
          <Text style={{ color: "white" }}>+ Add Task</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Create Project
          </Text>
        </TouchableOpacity>

      </ScrollView>
=======
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={styles.title}>Create Project</Text>
          <View style={{ width: 22 }} />
        </View>

        <Pressable style={styles.coverPicker} onPress={pickCoverImage}>
          {coverImageUri ? (
            <Image source={{ uri: coverImageUri }} style={styles.coverImage} />
          ) : (
            <>
              <Feather name="image" size={26} color={colors.primary} />
              <Text style={styles.coverText}>Add project cover</Text>
            </>
          )}
        </Pressable>

        <Text style={styles.label}>Project Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Project name *"
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the project"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, styles.multiline]}
          multiline
        />

        <OptionPicker label="Category" value={category} options={CATEGORIES} onSelect={setCategory} />
        <OptionPicker label="Campus" value={campus} options={CAMPUSES} onSelect={setCampus} />

        <Text style={styles.label}>Created By</Text>
        <TextInput
          value={createdBy}
          onChangeText={setCreatedBy}
          placeholder="Your name *"
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
        />

        <Text style={styles.label}>Project Deadline</Text>
        <TouchableOpacity style={styles.select} onPress={() => setShowDate(true)}>
          <Text style={[styles.selectText, !deadline && styles.placeholder]}>
            {deadline
              ? new Date(deadline).toLocaleDateString('en-ZA', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Set deadline'}
          </Text>
          <Feather name="calendar" size={16} color={colors.primary} />
        </TouchableOpacity>

        {showDate ? (
          <DateTimePicker
            value={deadline ? new Date(deadline) : new Date()}
            mode="date"
            minimumDate={new Date()}
            onChange={(_, date) => {
              setShowDate(Platform.OS === 'ios');
              if (date) setDeadline(date.toISOString());
            }}
          />
        ) : null}

        <TouchableOpacity style={styles.locationBtn} onPress={captureLocation}>
          <Feather name="map-pin" size={16} color={colors.primary} />
          <Text style={styles.locationText}>
            {gps ? `${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)}` : 'Tag current location'}
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          <Pressable style={styles.addTaskBtn} onPress={addTask}>
            <Feather name="plus" size={15} color="#fff" />
            <Text style={styles.addTaskText}>Add</Text>
          </Pressable>
        </View>

        {tasks.map((task, index) => (
          <TaskItem
            key={index}
            task={task}
            index={index}
            onChange={updateTask}
            onRemove={removeTask}
            isOnly={tasks.length === 1}
          />
        ))}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Create Project</Text>
        </TouchableOpacity>
      </ScrollView>
      <LoadingOverlay visible={saving} message="Creating project..." />
>>>>>>> 83e6629 (Add my feature)
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  safe: { flex: 1, backgroundColor: "#fff" },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },

  section: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: "bold",
  },

  taskBox: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },

  addBtn: {
    backgroundColor: "blue",
    padding: 12,
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 8,
  },

  submitBtn: {
    backgroundColor: "green",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
  },
});
=======
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 40, gap: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.foreground },
  coverPicker: {
    height: 150,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverText: { marginTop: 8, fontSize: 14, fontWeight: '600', color: colors.primary },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  selectText: { flex: 1, fontSize: 15, color: colors.foreground },
  placeholder: { color: colors.mutedForeground },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.secondary,
  },
  locationText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.primary },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.foreground },
  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addTaskText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 36,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.foreground },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionActive: { backgroundColor: colors.primaryLight },
  optionText: { flex: 1, fontSize: 15, color: colors.foreground },
  optionTextActive: { color: colors.primary, fontWeight: '700' },
});
>>>>>>> 83e6629 (Add my feature)
