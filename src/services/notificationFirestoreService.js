import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../firebaseConfig";
import { notificationMessages, DEADLINE_REMINDER_OFFSETS } from "../utils/notificationMessages";
import {
  buildDeadlineReminderDate,
  getNotificationAvailabilityDate,
  toNotificationDate,
} from "../utils/notificationSchedule";

function getNotificationsCollection(userId) {
  return collection(db, "notifications", userId, "items");
}

function mapNotificationDoc(notificationDoc) {
  return {
    id: notificationDoc.id,
    ...notificationDoc.data(),
  };
}

function buildNotificationDocument(notificationId, payload) {
  return {
    id: notificationId,
    title: payload.title,
    body: payload.body,
    type: payload.type || "SYSTEM",
    read: payload.read ?? false,
    createdAt: serverTimestamp(),
    projectId: payload.projectId || null,
    data: payload.data || {},
  };
}

async function createNotificationsForUser(userId, payloads = []) {
  if (!userId || !payloads.length) {
    return [];
  }

  const batch = writeBatch(db);
  const notificationsCollection = getNotificationsCollection(userId);
  const createdNotifications = [];

  payloads.forEach((payload) => {
    const notificationRef = doc(notificationsCollection);
    batch.set(
      notificationRef,
      buildNotificationDocument(notificationRef.id, payload)
    );
    createdNotifications.push({
      userId,
      notificationId: notificationRef.id,
    });
  });

  await batch.commit();

  return createdNotifications;
}

async function deleteNotifications(userId, notificationIds = []) {
  if (!userId || !notificationIds.length) {
    return;
  }

  const batch = writeBatch(db);

  notificationIds.forEach((notificationId) => {
    batch.delete(doc(db, "notifications", userId, "items", notificationId));
  });

  await batch.commit();
}

export async function createNotification(userId, payload) {
  const [createdNotification] = await createNotificationsForUser(userId, [
    payload,
  ]);

  return createdNotification;
}

export async function createNotificationsForUsers(userIds, payload) {
  const uniqueUserIds = [...new Set((userIds || []).filter(Boolean))];

  if (!uniqueUserIds.length) {
    return [];
  }

  const batch = writeBatch(db);
  const createdNotifications = [];

  uniqueUserIds.forEach((userId) => {
    const notificationRef = doc(getNotificationsCollection(userId));
    batch.set(
      notificationRef,
      buildNotificationDocument(notificationRef.id, payload)
    );
    createdNotifications.push({
      userId,
      notificationId: notificationRef.id,
    });
  });

  await batch.commit();

  return createdNotifications;
}

export async function setNotificationReadState(
  userId,
  notificationId,
  read = true
) {
  if (!userId || !notificationId) {
    return;
  }

  await updateDoc(doc(db, "notifications", userId, "items", notificationId), {
    read,
  });
}

export async function markAsRead(userId, notificationId) {
  return setNotificationReadState(userId, notificationId, true);
}

export async function markAllAsRead(userId) {
  if (!userId) {
    return 0;
  }

  const unreadNotificationsQuery = query(
    getNotificationsCollection(userId),
    where("read", "==", false)
  );
  const unreadNotificationsSnapshot = await getDocs(unreadNotificationsQuery);

  if (unreadNotificationsSnapshot.empty) {
    return 0;
  }

  const batch = writeBatch(db);

  unreadNotificationsSnapshot.docs.forEach((notificationDoc) => {
    batch.update(notificationDoc.ref, { read: true });
  });

  await batch.commit();

  return unreadNotificationsSnapshot.size;
}

export async function getUserNotifications(userId) {
  if (!userId) {
    return [];
  }

  const notificationsQuery = query(
    getNotificationsCollection(userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(notificationsQuery);

  return snapshot.docs.map(mapNotificationDoc);
}

export function subscribeToNotifications(userId, callback) {
  if (!userId) {
    callback?.([]);
    return () => undefined;
  }

  const notificationsQuery = query(
    getNotificationsCollection(userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(notificationsQuery, (snapshot) => {
    callback?.(snapshot.docs.map(mapNotificationDoc));
  });
}

export async function syncProjectDeadlineNotifications(userId, projects = []) {
  if (!userId) {
    return { created: 0, removed: 0 };
  }

  const existingNotifications = await getUserNotifications(userId);
  const existingDeadlineNotifications = existingNotifications.filter(
    (notification) => notification.type === "DEADLINE"
  );
  const existingReminderKeys = new Set(
    existingDeadlineNotifications
      .map((notification) => notification.data?.reminderKey)
      .filter(Boolean)
  );

  const now = new Date();
  const validReminderEntries = [];

  (projects || []).forEach((project) => {
    const deadlineDate = toNotificationDate(project?.deadline);

    if (!project?.id || !deadlineDate) {
      return;
    }

    if (project.status === "stopped" || deadlineDate.getTime() <= now.getTime()) {
      return;
    }

    DEADLINE_REMINDER_OFFSETS.forEach((daysBefore) => {
      const reminderDate = buildDeadlineReminderDate(project.deadline, daysBefore);

      if (!reminderDate) {
        return;
      }

      const reminderKey = `${project.id}:${daysBefore}:${reminderDate.toISOString()}`;
      const message = notificationMessages.deadlineReminder(project.name, daysBefore);

      validReminderEntries.push({
        reminderKey,
        project,
        reminderDate,
        payload: {
          title: message.title,
          body: message.body,
          type: "DEADLINE",
          projectId: project.id,
          data: {
            reminderKey,
            scheduledFor: reminderDate.toISOString(),
            daysBefore,
            deadline: project.deadline,
          },
        },
      });
    });
  });

  const validReminderKeys = new Set(
    validReminderEntries.map((entry) => entry.reminderKey)
  );
  const notificationsToCreate = validReminderEntries
    .filter((entry) => !existingReminderKeys.has(entry.reminderKey))
    .map((entry) => entry.payload);
  const notificationsToRemove = existingDeadlineNotifications
    .filter((notification) => {
      const reminderKey = notification.data?.reminderKey;
      const availableAt = getNotificationAvailabilityDate(notification);

      if (!reminderKey || !availableAt) {
        return false;
      }

      return (
        !validReminderKeys.has(reminderKey) &&
        availableAt.getTime() > now.getTime()
      );
    })
    .map((notification) => notification.id);

  if (notificationsToCreate.length) {
    await createNotificationsForUser(userId, notificationsToCreate);
  }

  if (notificationsToRemove.length) {
    await deleteNotifications(userId, notificationsToRemove);
  }

  return {
    created: notificationsToCreate.length,
    removed: notificationsToRemove.length,
  };
}
