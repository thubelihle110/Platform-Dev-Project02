export function toNotificationDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function buildDeadlineReminderDate(deadlineValue, daysBefore) {
  const deadlineDate = toNotificationDate(deadlineValue);

  if (!deadlineDate) {
    return null;
  }

  const reminderDate = new Date(deadlineDate);
  reminderDate.setHours(9, 0, 0, 0);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);

  return reminderDate;
}

export function getNotificationAvailabilityDate(notification) {
  return (
    toNotificationDate(notification?.data?.scheduledFor) ||
    toNotificationDate(notification?.createdAt)
  );
}

export function isNotificationAvailable(notification, now = new Date()) {
  const availableAt = getNotificationAvailabilityDate(notification);

  if (!availableAt) {
    return true;
  }

  return availableAt.getTime() <= now.getTime();
}

export function sortNotificationsNewestFirst(notifications = []) {
  return [...notifications].sort((firstNotification, secondNotification) => {
    const firstDate = getNotificationAvailabilityDate(firstNotification);
    const secondDate = getNotificationAvailabilityDate(secondNotification);
    const firstTime = firstDate ? firstDate.getTime() : 0;
    const secondTime = secondDate ? secondDate.getTime() : 0;

    return secondTime - firstTime;
  });
}
