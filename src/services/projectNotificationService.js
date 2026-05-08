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
import { createNotificationsForUsers } from "./notificationFirestoreService";
import { sendPushNotificationsAsync } from "./notificationService";

function mapUserTargets(userDocs) {
  return userDocs.map((userDoc) => ({
    id: userDoc.id,
    ...userDoc.data(),
  }));
}

function extractPushTokens(users) {
  return users.flatMap((user) =>
    Array.isArray(user?.expoPushTokens) ? user.expoPushTokens : []
  );
}

function extractUserIds(users) {
  return [...new Set(users.map((user) => user?.id).filter(Boolean))];
}

async function getStudentTargetsAsync() {
  const studentsQuery = query(
    collection(db, "users"),
    where("role", "==", "student")
  );
  const snapshot = await getDocs(studentsQuery);

  return mapUserTargets(snapshot.docs);
}

async function getProjectMemberTargetsAsync(members = []) {
  const memberIds = [...new Set(members.map((member) => member?.id).filter(Boolean))];

  if (!memberIds.length) {
    return [];
  }

  const memberDocs = await Promise.all(
    memberIds.map((memberId) => getDoc(doc(db, "users", memberId)))
  );

  return memberDocs
    .filter((memberDoc) => memberDoc.exists())
    .map((memberDoc) => ({
      id: memberDoc.id,
      ...memberDoc.data(),
    }));
}

async function notifyAsync(tokens, message, data) {
  if (!tokens.length) {
    return [];
  }

  return sendPushNotificationsAsync(tokens, message, data);
}

async function createInboxAndPushAsync(targets, payload, pushData) {
  const userIds = extractUserIds(targets);

  if (userIds.length) {
    await createNotificationsForUsers(userIds, payload);
  }

  try {
    await notifyAsync(extractPushTokens(targets), payload, pushData);
  } catch (error) {
    console.log("Push delivery error:", error);
  }
}

export async function sendNewProjectAlertToStudentsAsync(project) {
  const targets = await getStudentTargetsAsync();
  const message = notificationMessages.newProject(project?.name);

  return createInboxAndPushAsync(
    targets,
    {
      ...message,
      type: "NEW_PROJECT",
      projectId: project?.id || null,
      data: {
        source: "admin",
      },
    },
    {
    type: "new_project",
    projectId: project?.id || null,
    }
  );
}

export async function sendProjectStoppedAlertAsync(project) {
  const targets = await getProjectMemberTargetsAsync(project?.members);
  const message = notificationMessages.projectStopped(project?.name);

  return createInboxAndPushAsync(
    targets,
    {
      ...message,
      type: "STATUS",
      projectId: project?.id || null,
      data: {
        source: "admin",
        status: "stopped",
      },
    },
    {
    type: "project_status",
    status: "stopped",
    projectId: project?.id || null,
    }
  );
}

export async function sendProjectResumedAlertAsync(project) {
  const targets = await getProjectMemberTargetsAsync(project?.members);
  const message = notificationMessages.projectResumed(project?.name);

  return createInboxAndPushAsync(
    targets,
    {
      ...message,
      type: "STATUS",
      projectId: project?.id || null,
      data: {
        source: "admin",
        status: "active",
      },
    },
    {
    type: "project_status",
    status: "active",
    projectId: project?.id || null,
    }
  );
}
