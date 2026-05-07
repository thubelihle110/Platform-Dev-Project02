import { db } from "../../firebaseConfig";
import {
<<<<<<< HEAD
=======
  addDoc,
  serverTimestamp,
>>>>>>> 83e6629 (Add my feature)
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";

// helper functions
const getProjects = async () => {
  const snap = await getDocs(collection(db, "projects"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const getUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

<<<<<<< HEAD
=======
function cleanTask(task, index) {
  return {
    id: `task_${Date.now()}_${index}`,
    title: task.title || "",
    description: task.description || "",
    deadline: task.deadline || null,
    proofRequired: task.proofRequired || "Camera",
    guidelineUrl: task.guidelineUri || task.guidelineUrl || null,
    status: task.status || "pending",
    order: index,
  };
}

>>>>>>> 83e6629 (Add my feature)
export const adminService = {
  // ---------------- PROJECTS ----------------
  getProjects,

<<<<<<< HEAD
=======
  createProject: async (projectData, tasks = [], coverImageUri = null) => {
    const docRef = await addDoc(collection(db, "projects"), {
      name: projectData.name,
      description: projectData.description || "",
      category: projectData.category,
      campus: projectData.campus,
      createdBy: projectData.createdBy || "",
      deadline: projectData.deadline || null,
      gps: projectData.gps || null,
      coverImageUrl: coverImageUri || projectData.coverImageUrl || null,
      status: "active",
      members: [],
      tasks: tasks.map(cleanTask),
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },

>>>>>>> 83e6629 (Add my feature)
  getProjectById: async (id) => {
    const snap = await getDoc(doc(db, "projects", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  stopProject: async (id, reason) => {
    return await updateDoc(doc(db, "projects", id), {
      status: "stopped",
      stopReason: reason,
    });
  },

  // ---------------- USERS ----------------
  getUsers,

  // ---------------- JOIN PROJECT (🔥 IMPORTANT FIX) ----------------
  joinProject: async (projectId, user) => {
    const projectRef = doc(db, "projects", projectId);
    const snap = await getDoc(projectRef);

    if (!snap.exists()) throw new Error("Project not found");

    const data = snap.data();
    const members = data.members || [];

    const alreadyJoined = members.find((m) => m.id === user.id);
    if (alreadyJoined) return;

    await updateDoc(projectRef, {
      members: arrayUnion({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      }),
    });
  },

  // ---------------- STATS ----------------
  getStats: async () => {
    const projects = await getProjects();
    const users = await getUsers();

    return {
      activeProjects: projects.filter((p) => p.status === "active").length,
      totalProjects: projects.length,
      totalUsers: users.length,
    };
  },

  // ---------------- PROJECT USERS ----------------
  getProjectUsers: async (projectId) => {
    const q = query(
      collection(db, "projectUsers"),
      where("projectId", "==", projectId)
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // ---------------- UPDATES ----------------
  getProjectUpdates: async (projectId) => {
    const q = query(
      collection(db, "updates"),
      where("projectId", "==", projectId)
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
<<<<<<< HEAD
};
=======
};
>>>>>>> 83e6629 (Add my feature)
