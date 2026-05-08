import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ==================== AI FUNCTIONS ====================
function analyzeProgress(completedTasks: number, totalTasks: number) {
  const percentComplete = (completedTasks / totalTasks) * 100;
  if (percentComplete >= 100) {
    return {
      status: "🎉 Complete!",
      message: "Great work!",
      color: "#4caf50",
      percent: 100,
    };
  } else if (percentComplete >= 75) {
    return {
      status: "🚀 Almost There!",
      message: "Just a few tasks left!",
      color: "#4caf50",
      percent: percentComplete,
    };
  } else if (percentComplete >= 50) {
    return {
      status: "📈 Halfway!",
      message: "Keep the momentum!",
      color: "#2196f3",
      percent: percentComplete,
    };
  } else if (percentComplete >= 25) {
    return {
      status: "🌱 Growing",
      message: "Good start!",
      color: "#ff9800",
      percent: percentComplete,
    };
  } else {
    return {
      status: "🌱 Just Started",
      message: "Time to take action!",
      color: "#9e9e9e",
      percent: percentComplete,
    };
  }
}

function predictImpact(
  projectType: string,
  resourcesUsed: number,
  percentComplete: number,
) {
  let impactScore = 0,
    co2Reduction = 0;
  switch (projectType) {
    case "Green_Spaces":
      impactScore = resourcesUsed * 0.5 * (percentComplete / 100);
      co2Reduction = resourcesUsed * 22 * (percentComplete / 100);
      break;
    case "Energy_Conservation":
      impactScore = resourcesUsed * 0.8 * (percentComplete / 100);
      co2Reduction = resourcesUsed * 0.5 * (percentComplete / 100);
      break;
    case "Water_Conservation":
      impactScore = resourcesUsed * 0.6 * (percentComplete / 100);
      co2Reduction = resourcesUsed * 0.3 * (percentComplete / 100);
      break;
    default:
      impactScore = resourcesUsed * 0.4 * (percentComplete / 100);
      co2Reduction = resourcesUsed * 0.2 * (percentComplete / 100);
  }
  if (impactScore > 50)
    return {
      rating: "🌟 High Impact",
      co2: Math.round(co2Reduction),
      score: Math.round(impactScore),
    };
  if (impactScore > 20)
    return {
      rating: "📈 Medium Impact",
      co2: Math.round(co2Reduction),
      score: Math.round(impactScore),
    };
  return {
    rating: "🌱 Growing Impact",
    co2: Math.round(co2Reduction),
    score: Math.round(impactScore),
  };
}

function analyzeRecycling(
  kgPaper: number,
  kgPlastic: number,
  kgGlass: number,
  kgMetal: number,
) {
  const total = kgPaper + kgPlastic + kgGlass + kgMetal;
  const co2Saved = total * 0.9;
  const treesSaved = kgPaper * 0.02;
  let badge =
    total > 500
      ? "🏭 Industrial Recycler"
      : total > 100
        ? "♻️ Champion"
        : "🌱 Starter";
  return {
    totalRecycled: `${total} kg`,
    co2Saved: `${Math.round(co2Saved)} kg CO2`,
    treesSaved: `${treesSaved.toFixed(1)} trees`,
    badge,
    co2Value: Math.round(co2Saved),
  };
}

function analyzeVolunteer(
  volunteers: number,
  bagsCollected: number,
  areaCovered: number,
  hours: number,
) {
  const kgEstimate = bagsCollected * 5;
  const co2Offset = kgEstimate * 0.2;
  let badge =
    bagsCollected > 50
      ? "🏆 Hero"
      : bagsCollected > 20
        ? "🧹 Leader"
        : "🌿 Starter";
  return {
    volunteers: `${volunteers} people`,
    wasteCollected: `${kgEstimate} kg`,
    co2Offset: `${Math.round(co2Offset)} kg`,
    totalHours: `${hours} hours`,
    badge,
    co2Value: Math.round(co2Offset),
  };
}

function analyzeAwareness(attendees: number, postsShared: number) {
  const reach = attendees + postsShared * 100;
  let badge =
    attendees > 200
      ? "📣 Influencer"
      : attendees > 50
        ? "🗣️ Changemaker"
        : "📖 Starter";
  return {
    attendees: `${attendees} people`,
    reach: `${reach} people`,
    badge,
    co2Value: Math.round(attendees * 0.5),
  };
}

// Storage
const STORAGE_KEY = "@sustainable_projects";
const typeToCategory: Record<string, string> = {
  Green_Spaces: "Biodiversity",
  Energy_Conservation: "Energy",
  Water_Conservation: "Water",
  Recycling: "Waste",
  Volunteer_Efforts: "Community",
  awareness_campaign: "Education",
};
const categories = [
  "Energy",
  "Water",
  "Waste",
  "Biodiversity",
  "Education",
  "Community",
];

export default function HomeScreen() {
  const router = useRouter();

  // UI states
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("Green_Spaces");
  const [aiResult, setAiResult] = useState<any>(null);
  const [impactResult, setImpactResult] = useState<any>(null);
  const [dynamicResult, setDynamicResult] = useState<any>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Green Spaces fields
  const [treesPlanted, setTreesPlanted] = useState("");
  const [greenArea, setGreenArea] = useState("");
  const [nativeSpecies, setNativeSpecies] = useState("");
  const [irrigationSystem, setIrrigationSystem] = useState("");

  // Energy fields
  const [kwhSaved, setKwhSaved] = useState("");
  const [solarPanels, setSolarPanels] = useState("");
  const [ledBulbs, setLedBulbs] = useState("");
  const [energyAudits, setEnergyAudits] = useState("");

  // Water fields
  const [waterSaved, setWaterSaved] = useState("");
  const [tapsFixed, setTapsFixed] = useState("");
  const [rainwaterHarvest, setRainwaterHarvest] = useState("");
  const [dripSystems, setDripSystems] = useState("");

  // Recycling fields
  const [kgPaper, setKgPaper] = useState("");
  const [kgPlastic, setKgPlastic] = useState("");
  const [kgGlass, setKgGlass] = useState("");
  const [kgMetal, setKgMetal] = useState("");

  // Volunteer fields
  const [volunteers, setVolunteers] = useState("");
  const [bagsCollected, setBagsCollected] = useState("");
  const [areaCovered, setAreaCovered] = useState("");
  const [volunteerHours, setVolunteerHours] = useState("");

  // Awareness fields
  const [attendees, setAttendees] = useState("");
  const [postsShared, setPostsShared] = useState("");

  // Saved projects
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // =========== LOAD SAVED PROJECTS ===========
  const loadProjects = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setAllProjects(JSON.parse(stored));
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========== SAVE NEW PROJECT ===========
  const saveProject = async (project: any) => {
    try {
      const newProjects = [
        ...allProjects,
        {
          ...project,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
      setAllProjects(newProjects);
      return true;
    } catch (error) {
      console.error("Failed to save project:", error);
      return false;
    }
  };

  // =========== UPDATE EXISTING PROJECT ===========
  const updateProject = async (projectId: string, updatedData: any) => {
    try {
      const updatedProjects = allProjects.map((p) =>
        p.id === projectId
          ? { ...p, ...updatedData, updatedAt: new Date().toISOString() }
          : p,
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
      setAllProjects(updatedProjects);
      return true;
    } catch (error) {
      console.error("Failed to update project:", error);
      return false;
    }
  };

  // =========== LOAD RE-ANALYSIS PROJECT (from projects.tsx) ===========
  useEffect(() => {
    const loadReanalyzeProject = async () => {
      try {
        const stored = await AsyncStorage.getItem("@reanalyze_project");
        if (stored) {
          const project = JSON.parse(stored);
          setIsUpdateMode(true);
          setEditingProjectId(project.id);
          setProjectName(project.name);
          setProjectType(project.type || "Green_Spaces");
          if (project.details) {
            const d = project.details;
            if (project.type === "Green_Spaces") {
              setTreesPlanted(d.treesPlanted?.toString() || "");
              setGreenArea(d.greenArea?.toString() || "");
              setNativeSpecies(d.nativeSpecies?.toString() || "");
              setIrrigationSystem(d.irrigationSystem || "");
            } else if (project.type === "Energy_Conservation") {
              setKwhSaved(d.kwhSaved?.toString() || "");
              setSolarPanels(d.solarPanels?.toString() || "");
              setLedBulbs(d.ledBulbs?.toString() || "");
              setEnergyAudits(d.energyAudits?.toString() || "");
            } else if (project.type === "Water_Conservation") {
              setWaterSaved(d.waterSaved?.toString() || "");
              setTapsFixed(d.tapsFixed?.toString() || "");
              setRainwaterHarvest(d.rainwaterHarvest?.toString() || "");
              setDripSystems(d.dripSystems?.toString() || "");
            } else if (project.type === "Recycling") {
              const match = d.totalRecycled?.match(/(\d+)/);
              if (match) setKgPaper(match[1]);
            } else if (project.type === "Volunteer_Efforts") {
              const match = d.volunteers?.match(/(\d+)/);
              if (match) setVolunteers(match[1]);
            } else if (project.type === "awareness_campaign") {
              const match = d.attendees?.match(/(\d+)/);
              if (match) setAttendees(match[1]);
            }
          }
          await AsyncStorage.removeItem("@reanalyze_project");
          setShowForm(true);
          Alert.alert(
            "Re-analysis Mode",
            `Loaded "${project.name}" for editing. Update values and save.`,
          );
        }
      } catch (error) {
        console.error("Failed to load reanalysis project:", error);
      }
    };
    loadReanalyzeProject();
  }, []);

  useEffect(() => {
    loadProjects();
  }, []);

  const resetForm = () => {
    setProjectName("");
    setProjectType("Green_Spaces");
    setTreesPlanted("");
    setGreenArea("");
    setNativeSpecies("");
    setIrrigationSystem("");
    setKwhSaved("");
    setSolarPanels("");
    setLedBulbs("");
    setEnergyAudits("");
    setWaterSaved("");
    setTapsFixed("");
    setRainwaterHarvest("");
    setDripSystems("");
    setKgPaper("");
    setKgPlastic("");
    setKgGlass("");
    setKgMetal("");
    setVolunteers("");
    setBagsCollected("");
    setAreaCovered("");
    setVolunteerHours("");
    setAttendees("");
    setPostsShared("");
    setAiResult(null);
    setImpactResult(null);
    setDynamicResult(null);
    setIsUpdateMode(false);
    setEditingProjectId(null);
    setShowForm(false);
  };

  const runAIAnalysis = async () => {
    if (!projectName.trim()) {
      Alert.alert("Missing Info", "Please enter a project name");
      return;
    }

    let resultToSave: any = null;

    if (projectType === "Green_Spaces") {
      const trees = parseInt(treesPlanted) || 0;
      const area = parseInt(greenArea) || 0;
      const species = parseInt(nativeSpecies) || 0;
      if (trees === 0 && area === 0 && species === 0) {
        Alert.alert(
          "Missing Info",
          "Please enter at least one green space metric",
        );
        return;
      }
      const totalTasks = Math.max(trees, area) || 1;
      const completed = Math.min(totalTasks, (trees + area) / 2);
      const percent = (completed / totalTasks) * 100;
      const progress = analyzeProgress(completed, totalTasks);
      const impact = predictImpact("Green_Spaces", trees + area, percent);
      setAiResult(progress);
      setImpactResult(impact);
      resultToSave = {
        name: projectName,
        type: "Green_Spaces",
        category: "Biodiversity",
        progress: Math.round(percent),
        co2Saved: impact.co2,
        details: {
          treesPlanted: trees,
          greenArea: area,
          nativeSpecies: species,
          irrigationSystem,
        },
      };
    } else if (projectType === "Energy_Conservation") {
      const kwh = parseInt(kwhSaved) || 0;
      const panels = parseInt(solarPanels) || 0;
      const bulbs = parseInt(ledBulbs) || 0;
      if (kwh === 0 && panels === 0 && bulbs === 0) {
        Alert.alert("Missing Info", "Please enter at least one energy metric");
        return;
      }
      const totalTasks = Math.max(kwh, panels + bulbs) || 1;
      const completed = kwh / 100 + panels + bulbs;
      const percent = Math.min(100, (completed / totalTasks) * 100);
      const progress = analyzeProgress(completed, totalTasks);
      const impact = predictImpact("Energy_Conservation", kwh, percent);
      setAiResult(progress);
      setImpactResult(impact);
      resultToSave = {
        name: projectName,
        type: "Energy_Conservation",
        category: "Energy",
        progress: Math.round(percent),
        co2Saved: impact.co2,
        details: {
          kwhSaved: kwh,
          solarPanels: panels,
          ledBulbs: bulbs,
          energyAudits: parseInt(energyAudits) || 0,
        },
      };
    } else if (projectType === "Water_Conservation") {
      const water = parseInt(waterSaved) || 0;
      const taps = parseInt(tapsFixed) || 0;
      const rain = parseInt(rainwaterHarvest) || 0;
      if (water === 0 && taps === 0 && rain === 0) {
        Alert.alert("Missing Info", "Please enter at least one water metric");
        return;
      }
      const totalTasks = Math.max(water, taps + rain) || 1;
      const completed = water / 1000 + taps + rain / 500;
      const percent = Math.min(100, (completed / totalTasks) * 100);
      const progress = analyzeProgress(completed, totalTasks);
      const impact = predictImpact("Water_Conservation", water, percent);
      setAiResult(progress);
      setImpactResult(impact);
      resultToSave = {
        name: projectName,
        type: "Water_Conservation",
        category: "Water",
        progress: Math.round(percent),
        co2Saved: impact.co2,
        details: {
          waterSaved: water,
          tapsFixed: taps,
          rainwaterHarvest: rain,
          dripSystems: parseInt(dripSystems) || 0,
        },
      };
    } else if (projectType === "Recycling") {
      const paper = parseInt(kgPaper) || 0;
      const plastic = parseInt(kgPlastic) || 0;
      const glass = parseInt(kgGlass) || 0;
      const metal = parseInt(kgMetal) || 0;
      if (paper + plastic + glass + metal === 0) {
        Alert.alert("Missing Info", "Enter recycling amounts");
        return;
      }
      const result = analyzeRecycling(paper, plastic, glass, metal);
      setDynamicResult(result);
      resultToSave = {
        name: projectName,
        type: "Recycling",
        category: "Waste",
        progress: Math.min(
          100,
          Math.round((paper + plastic + glass + metal) / 10),
        ),
        co2Saved: result.co2Value,
        details: result,
      };
    } else if (projectType === "Volunteer_Efforts") {
      const vols = parseInt(volunteers) || 0;
      const bags = parseInt(bagsCollected) || 0;
      const area = parseInt(areaCovered) || 0;
      const hours = parseInt(volunteerHours) || 0;
      if (vols === 0 && bags === 0 && area === 0 && hours === 0) {
        Alert.alert("Missing Info", "Enter volunteer data");
        return;
      }
      const result = analyzeVolunteer(vols, bags, area, hours);
      setDynamicResult(result);
      resultToSave = {
        name: projectName,
        type: "Volunteer_Efforts",
        category: "Community",
        progress: Math.min(100, Math.round(bags / 2 + vols / 10)),
        co2Saved: result.co2Value,
        details: result,
      };
    } else if (projectType === "awareness_campaign") {
      const att = parseInt(attendees) || 0;
      const posts = parseInt(postsShared) || 0;
      if (att === 0 && posts === 0) {
        Alert.alert("Missing Info", "Enter awareness data");
        return;
      }
      const result = analyzeAwareness(att, posts);
      setDynamicResult(result);
      resultToSave = {
        name: projectName,
        type: "awareness_campaign",
        category: "Education",
        progress: Math.min(100, Math.round(att / 5 + posts)),
        co2Saved: result.co2Value,
        details: result,
      };
    }

    if (resultToSave) {
      let success;
      if (isUpdateMode && editingProjectId) {
        success = await updateProject(editingProjectId, resultToSave);
        if (success) Alert.alert("Success", "Project updated!");
      } else {
        success = await saveProject(resultToSave);
        if (success) Alert.alert("Success", "New project saved!");
      }
      if (success) {
        resetForm();
      } else {
        Alert.alert("Error", "Failed to save/update project");
      }
    }
  };

  // Dashboard calculations
  const totalProjects = allProjects.length;
  const totalCO2Saved = allProjects.reduce(
    (sum, p) => sum + (p.co2Saved || 0),
    0,
  );
  const avgProgress = totalProjects
    ? Math.round(
        allProjects.reduce((sum, p) => sum + (p.progress || 0), 0) /
          totalProjects,
      )
    : 0;

  const categoryProgress: Record<string, number> = {};
  const categoryCount: Record<string, number> = {};
  categories.forEach((cat) => {
    categoryProgress[cat] = 0;
    categoryCount[cat] = 0;
  });
  allProjects.forEach((p) => {
    const cat = p.category || "Other";
    if (categoryProgress[cat] !== undefined) {
      categoryProgress[cat] += p.progress || 0;
      categoryCount[cat]++;
    }
  });
  categories.forEach((cat) => {
    if (categoryCount[cat] > 0)
      categoryProgress[cat] = Math.round(
        categoryProgress[cat] / categoryCount[cat],
      );
    else categoryProgress[cat] = 0;
  });

  const atRiskProjects = allProjects.filter((p) => (p.progress || 0) < 40);
  const generateNotifications = () => {
    const notifs: any[] = [];
    atRiskProjects.forEach((p) =>
      notifs.push({
        id: `risk-${p.id}`,
        message: `⚠️ "${p.name}" is behind schedule (${p.progress}%)`,
      }),
    );
    allProjects
      .filter((p) => (p.progress || 0) >= 90)
      .forEach((p) =>
        notifs.push({
          id: `high-${p.id}`,
          message: `🎉 "${p.name}" is almost complete! (${p.progress}%)`,
        }),
      );
    [...allProjects]
      .reverse()
      .slice(0, 2)
      .forEach((p) =>
        notifs.push({
          id: `new-${p.id}`,
          message: `📌 New project added: "${p.name}"`,
        }),
      );
    return notifs.slice(0, 5);
  };
  const notifications = generateNotifications();

  const getMonthlyData = () => {
    const monthly: Record<string, number> = {};
    allProjects.forEach((p) => {
      if (p.createdAt) {
        const month = new Date(p.createdAt).toLocaleString("default", {
          month: "short",
        });
        monthly[month] = (monthly[month] || 0) + (p.co2Saved || 0);
      }
    });
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.map((m) => ({ month: m, co2: monthly[m] || 0 }));
  };
  const monthlyData = getMonthlyData();
  const maxCO2 = Math.max(...monthlyData.map((d) => d.co2), 1);

  const renderDynamicForm = () => {
    switch (projectType) {
      case "Green_Spaces":
        return (
          <>
            <Text style={styles.label}>🌳 Trees Planted</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={treesPlanted}
              onChangeText={setTreesPlanted}
              placeholder="0"
            />
            <Text style={styles.label}>📏 Green Area Created (m²)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={greenArea}
              onChangeText={setGreenArea}
              placeholder="0"
            />
            <Text style={styles.label}>🌿 Native Species Used</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={nativeSpecies}
              onChangeText={setNativeSpecies}
              placeholder="0"
            />
            <Text style={styles.label}>💧 Irrigation System Installed?</Text>
            <TextInput
              style={styles.input}
              value={irrigationSystem}
              onChangeText={setIrrigationSystem}
              placeholder="Yes/No"
            />
          </>
        );
      case "Energy_Conservation":
        return (
          <>
            <Text style={styles.label}>☀️ Solar Panels Installed</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={solarPanels}
              onChangeText={setSolarPanels}
              placeholder="0"
            />
            <Text style={styles.label}>💡 LED Bulbs Replaced</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={ledBulbs}
              onChangeText={setLedBulbs}
              placeholder="0"
            />
            <Text style={styles.label}>📋 Energy Audits Conducted</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={energyAudits}
              onChangeText={setEnergyAudits}
              placeholder="0"
            />
          </>
        );
      case "Water_Conservation":
        return (
          <>
            <Text style={styles.label}>💧 Water Saved (liters)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={waterSaved}
              onChangeText={setWaterSaved}
              placeholder="0"
            />
            <Text style={styles.label}>🚰 Leaking Taps Fixed</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={tapsFixed}
              onChangeText={setTapsFixed}
              placeholder="0"
            />
            <Text style={styles.label}>🌧️ Rainwater Harvesting (liters)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={rainwaterHarvest}
              onChangeText={setRainwaterHarvest}
              placeholder="0"
            />
            <Text style={styles.label}>💦 Drip Irrigation Systems</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={dripSystems}
              onChangeText={setDripSystems}
              placeholder="0"
            />
          </>
        );
      case "Recycling":
        return (
          <>
            <Text style={styles.label}>📄 Paper (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={kgPaper}
              onChangeText={setKgPaper}
              placeholder="0"
            />
            <Text style={styles.label}>🧴 Plastic (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={kgPlastic}
              onChangeText={setKgPlastic}
              placeholder="0"
            />
            <Text style={styles.label}>🥤 Glass (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={kgGlass}
              onChangeText={setKgGlass}
              placeholder="0"
            />
            <Text style={styles.label}>🔩 Metal (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={kgMetal}
              onChangeText={setKgMetal}
              placeholder="0"
            />
          </>
        );
      case "Volunteer_Efforts":
        return (
          <>
            <Text style={styles.label}>👥 Number of Volunteers</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={volunteers}
              onChangeText={setVolunteers}
              placeholder="0"
            />
            <Text style={styles.label}>🛍️ Bags of Litter Collected</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={bagsCollected}
              onChangeText={setBagsCollected}
              placeholder="0"
            />
            <Text style={styles.label}>📏 Area Cleaned (m²)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={areaCovered}
              onChangeText={setAreaCovered}
              placeholder="0"
            />
            <Text style={styles.label}>⏱️ Total Volunteer Hours</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={volunteerHours}
              onChangeText={setVolunteerHours}
              placeholder="0"
            />
          </>
        );
      case "awareness_campaign":
        return (
          <>
            <Text style={styles.label}>👥 Attendees / Reach</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={attendees}
              onChangeText={setAttendees}
              placeholder="0"
            />
            <Text style={styles.label}>📱 Social Media Posts</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={postsShared}
              onChangeText={setPostsShared}
              placeholder="0"
            />
          </>
        );
      default:
        return null;
    }
  };

  const ProgressBar = ({
    percent,
    color,
  }: {
    percent: number;
    color: string;
  }) => (
    <View style={progressStyles.barBg}>
      <View
        style={[
          progressStyles.barFill,
          { width: `${Math.min(100, percent)}%`, backgroundColor: color },
        ]}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading your projects...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌱 Green Campus Tracker</Text>
        <Text style={styles.headerSubtitle}>AI-Powered Progress Analysis</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalProjects}</Text>
          <Text style={styles.statLabel}>Active Projects</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCO2Saved}</Text>
          <Text style={styles.statLabel}>kg CO₂ Saved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{avgProgress}%</Text>
          <Text style={styles.statLabel}>Completion Rate</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📊 Monthly CO₂ Impact</Text>
        <View style={styles.chartContainer}>
          {monthlyData.slice(0, 6).map((data) => (
            <View key={data.month} style={styles.chartBarColumn}>
              <View
                style={[
                  styles.chartBar,
                  { height: Math.max(4, (data.co2 / maxCO2) * 80) },
                ]}
              />
              <Text style={styles.chartLabel}>{data.month}</Text>
              <Text style={styles.chartValue}>{data.co2}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📈 Progress by Category</Text>
        {categories
          .filter(
            (cat) =>
              categoryProgress[cat] > 0 ||
              allProjects.some((p) => p.category === cat),
          )
          .map((category) => (
            <View key={category} style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>{category}</Text>
              <View style={styles.categoryBarBg}>
                <View
                  style={[
                    styles.categoryBarFill,
                    {
                      width: `${categoryProgress[category]}%`,
                      backgroundColor:
                        categoryProgress[category] > 70
                          ? "#4caf50"
                          : categoryProgress[category] > 40
                            ? "#ff9800"
                            : "#f44336",
                    },
                  ]}
                />
              </View>
              <Text style={styles.categoryPercent}>
                {categoryProgress[category]}%
              </Text>
            </View>
          ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📋 Active Green Initiatives</Text>
        {allProjects.length === 0 ? (
          <Text style={styles.emptyText}>
            No projects yet. Add your first project below!
          </Text>
        ) : (
          allProjects
            .slice()
            .reverse()
            .map((project) => (
              <View key={project.id} style={styles.initiativeItem}>
                <View style={styles.initiativeInfo}>
                  <Text style={styles.initiativeName}>{project.name}</Text>
                  <Text style={styles.initiativeType}>
                    {project.category || project.type?.replace("_", " ")}
                  </Text>
                </View>
                <View style={styles.initiativeProgress}>
                  <ProgressBar
                    percent={project.progress || 0}
                    color={
                      project.progress > 70
                        ? "#4caf50"
                        : project.progress > 40
                          ? "#ff9800"
                          : "#f44336"
                    }
                  />
                  <Text style={styles.initiativePercent}>
                    {project.progress || 0}%
                  </Text>
                </View>
                <View
                  style={[
                    styles.initiativeStatus,
                    {
                      backgroundColor:
                        (project.progress || 0) < 40 ? "#fff3e0" : "#e8f5e9",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.initiativeStatusText,
                      {
                        color:
                          (project.progress || 0) < 40 ? "#ff9800" : "#4caf50",
                      },
                    ]}
                  >
                    {(project.progress || 0) < 40 ? "at-risk" : "active"}
                  </Text>
                </View>
              </View>
            ))
        )}
      </View>

      <View style={styles.twoColumnRow}>
        <View style={[styles.sectionCard, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.sectionTitle}>🤖 AI Progress Analyst</Text>
          <View style={styles.aiStats}>
            <Text style={styles.aiStatItem}>
              📊 At-risk projects: {atRiskProjects.length}
            </Text>
            <Text style={styles.aiStatItem}>
              📈 Forecasted growth: +{(totalCO2Saved * 0.18).toFixed(0)} kg CO₂
            </Text>
            <Text style={styles.aiStatItem}>
              💡 Tip:{" "}
              {atRiskProjects.length > 0
                ? "Focus on at-risk projects"
                : "Keep up the great work!"}
            </Text>
            <Text style={styles.aiStatItem}>
              🏆 Best category:{" "}
              {Object.entries(categoryProgress).sort(
                (a, b) => b[1] - a[1],
              )[0]?.[0] || "N/A"}
            </Text>
          </View>
        </View>
        <View style={[styles.sectionCard, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          {notifications.length === 0 ? (
            <Text style={styles.emptyNotif}>No notifications yet</Text>
          ) : (
            notifications.map((item) => (
              <Text key={item.id} style={styles.notificationItem}>
                {item.message}
              </Text>
            ))
          )}
        </View>
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewProjectsButton]}
          onPress={() => router.push("/project")}
        >
          <Text style={styles.actionButtonText}>📋 View All Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.reanalyzeButton]}
          onPress={() => router.push("/project")}
        >
          <Text style={styles.actionButtonText}>🔄 Re-analyze Existing</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.addProjectHeader}
        onPress={() => {
          if (!showForm) resetForm();
          setShowForm(!showForm);
        }}
      >
        <Text style={styles.addProjectHeaderText}>
          {showForm ? "▼" : "▶"}{" "}
          {isUpdateMode ? "Editing Project" : "Add New Project"}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.label}>Project Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Campus Tree Planting"
            value={projectName}
            onChangeText={setProjectName}
          />

          <Text style={styles.label}>Project Type</Text>
          <View style={styles.pickerContainer}>
            {[
              { id: "Green_Spaces", label: "🌳 GREEN SPACES" },
              { id: "Energy_Conservation", label: "⚡ ENERGY" },
              { id: "Water_Conservation", label: "💧 WATER" },
              { id: "Recycling", label: "♻️ RECYCLING" },
              { id: "Volunteer_Efforts", label: "👥 VOLUNTEER" },
              { id: "awareness_campaign", label: "📢 AWARENESS" },
            ].map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.pickerOption,
                  projectType === type.id && styles.pickerOptionSelected,
                ]}
                onPress={() => setProjectType(type.id)}
              >
                <Text
                  style={[
                    styles.pickerText,
                    projectType === type.id && styles.pickerTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderDynamicForm()}

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={runAIAnalysis}
          >
            <Text style={styles.analyzeButtonText}>
              🤖 Run AI Analysis & Save
            </Text>
          </TouchableOpacity>

          {aiResult && impactResult && (
            <View style={styles.resultsContainer}>
              <View
                style={[styles.resultCard, { borderLeftColor: aiResult.color }]}
              >
                <Text style={styles.resultTitle}>📊 Progress</Text>
                <Text style={styles.resultStatus}>{aiResult.status}</Text>
                <Text>{aiResult.message}</Text>
              </View>
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>🌍 Impact</Text>
                <Text style={styles.impactRating}>{impactResult.rating}</Text>
                <Text>Score: {impactResult.score}/100</Text>
                <Text>🌿 {impactResult.co2} kg CO₂/year</Text>
              </View>
            </View>
          )}
          {dynamicResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>🤖 AI Results</Text>
              {Object.entries(dynamicResult)
                .filter(([k]) => k !== "co2Value")
                .map(([key, val]) => (
                  <View key={key} style={styles.resultRow}>
                    <Text style={styles.resultLabel}>
                      {key.replace(/([A-Z])/g, " $1").toUpperCase()}:
                    </Text>
                    <Text style={styles.resultValue}>{String(val)}</Text>
                  </View>
                ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#2e7d32",
    padding: 25,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  headerSubtitle: { fontSize: 14, color: "#c8e6c9", marginTop: 5 },
  statsRow: { flexDirection: "row", margin: 15, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  statNumber: { fontSize: 22, fontWeight: "bold", color: "#2e7d32" },
  statLabel: { fontSize: 11, color: "#666", marginTop: 4 },
  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
  },
  chartBarColumn: { alignItems: "center", flex: 1 },
  chartBar: {
    width: 30,
    backgroundColor: "#2e7d32",
    borderRadius: 4,
    marginBottom: 5,
  },
  chartLabel: { fontSize: 10, color: "#666" },
  chartValue: { fontSize: 9, color: "#888", marginTop: 2 },
  categoryRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  categoryLabel: { width: 80, fontSize: 13, color: "#555" },
  categoryBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginHorizontal: 10,
  },
  categoryBarFill: { height: 8, borderRadius: 4 },
  categoryPercent: {
    width: 40,
    fontSize: 12,
    textAlign: "right",
    color: "#666",
  },
  initiativeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  initiativeInfo: { flex: 2 },
  initiativeName: { fontSize: 14, fontWeight: "500", color: "#333" },
  initiativeType: { fontSize: 11, color: "#888", marginTop: 2 },
  initiativeProgress: { flex: 1, marginHorizontal: 10 },
  initiativePercent: {
    fontSize: 12,
    color: "#2e7d32",
    marginTop: 2,
    textAlign: "right",
  },
  initiativeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  initiativeStatusText: { fontSize: 10, fontWeight: "600" },
  twoColumnRow: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 15,
  },
  aiStats: { gap: 8 },
  aiStatItem: { fontSize: 12, color: "#555" },
  notificationItem: {
    fontSize: 11,
    color: "#555",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  emptyNotif: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    paddingVertical: 10,
  },
  emptyText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  }, // ✅ Added missing style
  actionButtonsRow: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#2196f3",
  },
  viewProjectsButton: { backgroundColor: "#2196f3" },
  reanalyzeButton: { backgroundColor: "#ff9800" },
  actionButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  addProjectHeader: {
    backgroundColor: "#e8f5e9",
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
  },
  addProjectHeaderText: { fontSize: 16, fontWeight: "600", color: "#2e7d32" },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 5,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    marginRight: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: { backgroundColor: "#2e7d32" },
  pickerText: { fontSize: 12, color: "#333" },
  pickerTextSelected: { color: "#fff" },
  analyzeButton: {
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  analyzeButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  resultsContainer: { marginTop: 20, gap: 12 },
  resultCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#2e7d32",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  resultStatus: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 5,
  },
  impactRating: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 5,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  resultLabel: { fontSize: 12, fontWeight: "600", color: "#666", flex: 1 },
  resultValue: { fontSize: 12, color: "#333", flex: 2, textAlign: "right" },
});

const progressStyles = StyleSheet.create({
  barBg: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: 6, borderRadius: 3 },
});
