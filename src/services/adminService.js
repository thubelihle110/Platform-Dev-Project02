import { auth, db } from "../../firebaseConfig";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  sendNewProjectAlertToStudentsAsync,
  sendProjectResumedAlertAsync,
  sendProjectStoppedAlertAsync,
} from "./projectNotificationService";

async function getProjects() {
  const snapshot = await getDocs(collection(db, "projects"));
  return snapshot.docs.map((projectDoc) => ({
    id: projectDoc.id,
    ...projectDoc.data(),
  }));
}

async function getUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((userDoc) => ({ id: userDoc.id, ...userDoc.data() }));
}

async function assertAdminUser() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be signed in to manage projects.");
  }

  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  const role = userDoc.exists() ? userDoc.data().role : null;

  if (role !== "admin") {
    throw new Error("Only administrators can manage projects.");
  }

  return currentUser;
}

async function safeNotificationDispatch(callback) {
  try {
    await callback();
  } catch (error) {
    console.log("Notification dispatch error:", error);
  }
}

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

export const adminService = {
  getProjects,

  createProject: async (projectData, tasks = [], coverImageUri = null) => {
    await assertAdminUser();

    const payload = {
      name: projectData.name,
      description: projectData.description || "",
      category: projectData.category,
      campus: projectData.campus,
      createdBy: projectData.createdBy || "",
      deadline: projectData.deadline || null,
      gps: projectData.gps || null,
      coverImageUrl: coverImageUri || projectData.coverImageUrl || null,
      status: "active",
      stopReason: null,
      members: [],
      tasks: tasks.map(cleanTask),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "projects"), payload);

    await safeNotificationDispatch(() =>
      sendNewProjectAlertToStudentsAsync({
        id: docRef.id,
        name: payload.name,
      })
    );

    return docRef.id;
  },

  getProjectById: async (id) => {
    const snapshot = await getDoc(doc(db, "projects", id));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  },

  stopProject: async (id, reason) => {
    await assertAdminUser();

    const projectRef = doc(db, "projects", id);
    const snapshot = await getDoc(projectRef);

    if (!snapshot.exists()) {
      throw new Error("Project not found");
    }

    const project = { id: snapshot.id, ...snapshot.data() };

    await updateDoc(projectRef, {
      status: "stopped",
      stopReason: reason || "Stopped by admin",
      updatedAt: serverTimestamp(),
      stoppedAt: serverTimestamp(),
    });

    await safeNotificationDispatch(() =>
      sendProjectStoppedAlertAsync(project)
    );
  },

  resumeProject: async (id) => {
    await assertAdminUser();

    const projectRef = doc(db, "projects", id);
    const snapshot = await getDoc(projectRef);

    if (!snapshot.exists()) {
      throw new Error("Project not found");
    }

    const project = { id: snapshot.id, ...snapshot.data() };

    await updateDoc(projectRef, {
      status: "active",
      stopReason: null,
      updatedAt: serverTimestamp(),
      resumedAt: serverTimestamp(),
    });

    await safeNotificationDispatch(() =>
      sendProjectResumedAlertAsync(project)
    );
  },

  getUsers,

  joinProject: async (projectId, user) => {
    const projectRef = doc(db, "projects", projectId);
    const snapshot = await getDoc(projectRef);

    if (!snapshot.exists()) {
      throw new Error("Project not found");
    }

    const project = snapshot.data();
    const members = project.members || [];

    if (project.status === "stopped") {
      throw new Error("This project is currently stopped.");
    }

    const alreadyJoined = members.find((member) => member.id === user.id);

    if (alreadyJoined) {
      return;
    }

    await updateDoc(projectRef, {
      members: arrayUnion({
        id: user.id,
        fullName: user.fullName || user.email,
        email: user.email,
      }),
      updatedAt: serverTimestamp(),
    });
  },

  getStats: async () => {
    const projects = await getProjects();
    const users = await getUsers();

    return {
      activeProjects: projects.filter((project) => project.status === "active")
        .length,
      totalProjects: projects.length,
      totalUsers: users.length,
    };
  },

  getProjectUsers: async (projectId) => {
    const usersQuery = query(
      collection(db, "projectUsers"),
      where("projectId", "==", projectId)
    );
    const snapshot = await getDocs(usersQuery);

    return snapshot.docs.map((userDoc) => ({ id: userDoc.id, ...userDoc.data() }));
  },

  getProjectUpdates: async (projectId) => {
    const updatesQuery = query(
      collection(db, "updates"),
      where("projectId", "==", projectId)
    );
    const snapshot = await getDocs(updatesQuery);

    return snapshot.docs.map((updateDocItem) => ({
      id: updateDocItem.id,
      ...updateDocItem.data(),
    }));
  },
};
