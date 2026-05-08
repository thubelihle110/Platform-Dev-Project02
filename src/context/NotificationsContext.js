import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getUserNotifications,
  markAllAsRead,
  setNotificationReadState,
  subscribeToNotifications,
} from "../services/notificationFirestoreService";
import {
  isNotificationAvailable,
  sortNotificationsNewestFirst,
} from "../utils/notificationSchedule";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ userId, children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const unsubscribe = subscribeToNotifications(userId, (nextNotifications) => {
      setNotifications(sortNotificationsNewestFirst(nextNotifications));
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const visibleNotifications = useMemo(
    () =>
      sortNotificationsNewestFirst(
        notifications.filter((notification) =>
          isNotificationAvailable(notification, now)
        )
      ),
    [notifications, now]
  );

  const unreadCount = useMemo(
    () =>
      visibleNotifications.filter((notification) => !notification.read).length,
    [visibleNotifications]
  );

  const refreshNotifications = useCallback(async () => {
    if (!userId) {
      return;
    }

    setRefreshing(true);

    try {
      const nextNotifications = await getUserNotifications(userId);
      setNotifications(sortNotificationsNewestFirst(nextNotifications));
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  const markNotificationRead = useCallback(
    async (notificationId) => {
      if (!userId || !notificationId) {
        return;
      }

      await setNotificationReadState(userId, notificationId, true);
    },
    [userId]
  );

  const toggleNotificationReadState = useCallback(
    async (notificationId, read) => {
      if (!userId || !notificationId) {
        return;
      }

      await setNotificationReadState(userId, notificationId, read);
    },
    [userId]
  );

  const markAllNotificationsRead = useCallback(async () => {
    if (!userId) {
      return 0;
    }

    return markAllAsRead(userId);
  }, [userId]);

  const value = useMemo(
    () => ({
      notifications: visibleNotifications,
      unreadCount,
      loading,
      refreshing,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      toggleNotificationReadState,
    }),
    [
      loading,
      markAllNotificationsRead,
      markNotificationRead,
      refreshNotifications,
      refreshing,
      toggleNotificationReadState,
      unreadCount,
      visibleNotifications,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }

  return context;
}
