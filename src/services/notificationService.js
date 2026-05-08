import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../../firebaseConfig";
import {
  DEADLINE_REMINDER_OFFSETS,
  notificationMessages,
} from "../utils/notificationMessages";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const PROJECT_DEADLINE_SCOPE = "project_deadline";
const MAX_MESSAGES_PER_REQUEST = 100;
const REMINDER_HOUR = 9;

let notificationHandlerConfigured = false;

function getExpoProjectId() {
  return Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
}

function chunkItems(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function isExpoPushToken(token) {
  return typeof token === "string" && /^ExponentPushToken\[[^\]]+\]$/.test(token);
}

function isValidReminderDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function buildReminderDate(deadlineValue, daysBefore) {
  const deadline = new Date(deadlineValue);

  if (Number.isNaN(deadline.getTime())) {
    return null;
  }

  const reminderDate = new Date(deadline);
  reminderDate.setHours(REMINDER_HOUR, 0, 0, 0);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);

  return isValidReminderDate(reminderDate) ? reminderDate : null;
}

async function setAndroidChannelAsync() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#2E7D32",
  });
}

export function configureNotificationHandler() {
  if (notificationHandlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  notificationHandlerConfigured = true;
}

export async function persistUserPushTokenAsync(userId, token) {
  if (!userId || !token) {
    return;
  }

  const usersRef = collection(db, "users");
  const duplicateTokenQuery = query(
    usersRef,
    where("expoPushTokens", "array-contains", token)
  );
  const duplicateTokenSnapshot = await getDocs(duplicateTokenQuery);

  await Promise.all(
    duplicateTokenSnapshot.docs
      .filter((userDoc) => userDoc.id !== userId)
      .map((userDoc) =>
        updateDoc(userDoc.ref, {
          expoPushTokens: arrayRemove(token),
        })
      )
  );

  await setDoc(
    doc(db, "users", userId),
    {
      expoPushTokens: arrayUnion(token),
      notificationsEnabled: true,
      notificationTokenUpdatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function registerUserForPushNotificationsAsync(userId) {
  try {
    if (Platform.OS === "web") {
      return {
        token: null,
        error: "Push notifications are only supported on iOS and Android.",
      };
    }

    await setAndroidChannelAsync();

    if (!Device.isDevice) {
      return {
        token: null,
        error: "Push notifications require a physical device.",
      };
    }

    const permissionState = await Notifications.getPermissionsAsync();
    let finalStatus = permissionState.status;

    if (finalStatus !== "granted") {
      const request = await Notifications.requestPermissionsAsync();
      finalStatus = request.status;
    }

    if (finalStatus !== "granted") {
      return {
        token: null,
        error: "Notification permissions were not granted.",
      };
    }

    const projectId = getExpoProjectId();
    const pushTokenResponse = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();
    const token = pushTokenResponse.data;

    await persistUserPushTokenAsync(userId, token);

    return { token, error: null };
  } catch (error) {
    console.log("Notification registration error:", error);

    return {
      token: null,
      error:
        error?.message ||
        "Notification registration failed. Please try again later.",
    };
  }
}

export async function sendPushNotificationsAsync(tokens, message, data = {}) {
  const dedupedTokens = [...new Set(tokens)].filter(isExpoPushToken);

  if (!dedupedTokens.length) {
    return [];
  }

  const payload = dedupedTokens.map((token) => ({
    to: token,
    sound: "default",
    channelId: "default",
    title: message.title,
    body: message.body,
    data,
  }));

  const chunks = chunkItems(payload, MAX_MESSAGES_PER_REQUEST);
  const responses = [];

  for (const chunk of chunks) {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chunk),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.errors?.[0]?.message || "Push request failed");
    }

    responses.push(json);
  }

  return responses;
}

export async function clearProjectDeadlineRemindersAsync() {
  if (Platform.OS === "web") {
    return 0;
  }

  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();
  const projectNotifications = scheduledNotifications.filter(
    (notification) =>
      notification.content?.data?.scope === PROJECT_DEADLINE_SCOPE
  );

  await Promise.all(
    projectNotifications.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier)
    )
  );

  return projectNotifications.length;
}

export async function syncProjectDeadlineRemindersAsync(projects) {
  if (Platform.OS === "web") {
    return 0;
  }

  await clearProjectDeadlineRemindersAsync();

  const activeProjects = (projects || []).filter(
    (project) => project?.deadline && project?.status !== "stopped"
  );
  const now = Date.now();
  let scheduledCount = 0;

  for (const project of activeProjects) {
    for (const daysBefore of DEADLINE_REMINDER_OFFSETS) {
      const reminderDate = buildReminderDate(project.deadline, daysBefore);

      if (!reminderDate || reminderDate.getTime() <= now) {
        continue;
      }

      const message = notificationMessages.deadlineReminder(
        project.name,
        daysBefore
      );

      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          sound: "default",
          data: {
            scope: PROJECT_DEADLINE_SCOPE,
            type: PROJECT_DEADLINE_SCOPE,
            projectId: project.id,
            daysBefore,
          },
        },
        trigger: reminderDate,
      });

      scheduledCount += 1;
    }
  }

  return scheduledCount;
}
