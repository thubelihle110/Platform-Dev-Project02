import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../firebaseConfig";
import { notificationMessages } from "../utils/notificationMessages";
import { sendPushNotificationsAsync } from "./notificationService";

function extractPushTokens(users) {
  return users.flatMap((user) =>
    Array.isArray(user?.expoPushTokens) ? user.expoPushTokens : []
  );
}

async function getStudentPushTokensAsync() {
  const studentsQuery = query(
    collection(db, "users"),
    where("role", "==", "student")
  );
  const snapshot = await getDocs(studentsQuery);

  return extractPushTokens(snapshot.docs.map((userDoc) => userDoc.data()));
}

async function getProjectMemberPushTokensAsync(members = []) {
  const memberIds = [...new Set(members.map((member) => member?.id).filter(Boolean))];

  if (!memberIds.length) {
    return [];
  }

  const memberDocs = await Promise.all(
    memberIds.map((memberId) => getDoc(doc(db, "users", memberId)))
  );

  return extractPushTokens(
    memberDocs
      .filter((memberDoc) => memberDoc.exists())
      .map((memberDoc) => memberDoc.data())
  );
}

async function notifyAsync(tokens, message, data) {
  if (!tokens.length) {
    return [];
  }

  return sendPushNotificationsAsync(tokens, message, data);
}

export async function sendNewProjectAlertToStudentsAsync(project) {
  const tokens = await getStudentPushTokensAsync();

  return notifyAsync(tokens, notificationMessages.newProject(project?.name), {
    type: "new_project",
    projectId: project?.id || null,
  });
}

export async function sendProjectStoppedAlertAsync(project) {
  const tokens = await getProjectMemberPushTokensAsync(project?.members);

  return notifyAsync(tokens, notificationMessages.projectStopped(project?.name), {
    type: "project_status",
    status: "stopped",
    projectId: project?.id || null,
  });
}

export async function sendProjectResumedAlertAsync(project) {
  const tokens = await getProjectMemberPushTokensAsync(project?.members);

  return notifyAsync(tokens, notificationMessages.projectResumed(project?.name), {
    type: "project_status",
    status: "active",
    projectId: project?.id || null,
  });
}
