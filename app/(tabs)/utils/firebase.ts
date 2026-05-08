// app/utils/firebase.ts
import { initializeApp } from "firebase/app";
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";

// ============================================
// REPLACE THESE WITH YOUR REAL FIREBASE CONFIG
// Get from: https://console.firebase.google.com
// Project Settings → Your apps → Web app (</>)
// ============================================
const firebaseConfig = {
  apiKey: "YOUR-API-KEY-HERE",
  authDomain: "YOUR-PROJECT-ID.firebaseapp.com",
  projectId: "YOUR-PROJECT-ID",
  storageBucket: "YOUR-PROJECT-ID.appspot.com",
  messagingSenderId: "YOUR-SENDER-ID",
  appId: "YOUR-APP-ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

// Collection references
export const projectsCollection = collection(db, "projects");
export const usersCollection = collection(db, "users");

// Project type definition
export interface ProjectType {
  projectName: string;
  projectType: string;
  completedTasks: number;
  totalTasks: number;
  resourcesUsed: number;
  progress: number;
  aiStatus?: string;
  aiImpact?: string;
  co2Reduction?: number;
  impactScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ========== 1. ADD PROJECT ==========
export async function addProject(
  projectData: Omit<ProjectType, "createdAt" | "updatedAt">,
) {
  try {
    const docRef = await addDoc(projectsCollection, {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error adding project:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ========== 2. GET ALL PROJECTS ==========
export async function getAllProjects() {
  try {
    const querySnapshot = await getDocs(projectsCollection);
    const projects: (ProjectType & { id: string })[] = [];
    querySnapshot.forEach((document) => {
      projects.push({ id: document.id, ...(document.data() as ProjectType) });
    });
    return { success: true, projects };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error getting projects:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ========== 3. UPDATE PROJECT ==========
export async function updateProject(
  projectId: string,
  updatedData: Partial<ProjectType>,
) {
  try {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error updating project:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ========== 4. DELETE PROJECT ==========
export async function deleteProject(projectId: string) {
  try {
    const projectRef = doc(db, "projects", projectId);
    await deleteDoc(projectRef);
    return { success: true };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error deleting project:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ========== AUTHENTICATION ==========
export async function signUp(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { success: true, user: userCredential.user };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { success: true, user: userCredential.user };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function logOut() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
