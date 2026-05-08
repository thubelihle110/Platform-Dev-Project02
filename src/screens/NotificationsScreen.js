import { Feather } from "@expo/vector-icons";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Toast from "../components/Toast";
import colors from "../constants/colors";
import { useNotifications } from "../context/NotificationsContext";
import { getNotificationAvailabilityDate } from "../utils/notificationSchedule";

const NOTIFICATION_ICON_MAP = {
  NEW_PROJECT: "folder-plus",
  DEADLINE: "clock",
  STATUS: "pause-circle",
  SYSTEM: "info",
};

const NOTIFICATION_ICON_COLORS = {
  NEW_PROJECT: { fg: colors.primary, bg: colors.primaryLight },
  DEADLINE: { fg: colors.warning, bg: colors.warningLight },
  STATUS: { fg: colors.info, bg: colors.infoLight },
  SYSTEM: { fg: colors.mutedForeground, bg: colors.secondary },
};

function formatNotificationTime(notification) {
  const notificationDate = getNotificationAvailabilityDate(notification);

  if (!notificationDate) {
    return "Just now";
  }

  return notificationDate.toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationItem({
  notification,
  onPress,
  onToggleReadState,
}) {
  const iconName = NOTIFICATION_ICON_MAP[notification.type] || "bell";
  const iconColors =
    NOTIFICATION_ICON_COLORS[notification.type] ||
    NOTIFICATION_ICON_COLORS.SYSTEM;

  return (
    <Pressable
      onPress={() => onPress(notification)}
      style={({ pressed }) => [
        styles.notificationCard,
        !notification.read && styles.unreadCard,
        pressed && styles.notificationCardPressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconColors.bg }]}>
        <Feather name={iconName} size={18} color={iconColors.fg} />
      </View>

      <View style={styles.notificationBody}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.read ? <View style={styles.unreadDot} /> : null}
        </View>

        <Text style={styles.notificationText}>{notification.body}</Text>
        <Text style={styles.notificationTime}>
          {formatNotificationTime(notification)}
        </Text>

        <Pressable
          onPress={() => onToggleReadState(notification)}
          style={styles.readToggle}
          hitSlop={6}
        >
          <Text style={styles.readToggleText}>
            {notification.read ? "Mark as unread" : "Mark as read"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen({ navigation }) {
  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    toggleNotificationReadState,
  } = useNotifications();
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Notifications",
      headerRight: unreadCount
        ? () => (
            <Pressable
              onPress={async () => {
                await markAllNotificationsRead();
                setToast({
                  visible: true,
                  message: "All notifications marked as read.",
                  type: "success",
                });
              }}
              hitSlop={8}
              style={({ pressed }) =>
                pressed ? styles.headerActionPressed : null
              }
            >
              <Text style={styles.headerAction}>Read all</Text>
            </Pressable>
          )
        : () => null,
    });
  }, [markAllNotificationsRead, navigation, unreadCount]);

  const handleOpenNotification = useCallback(
    async (notification) => {
      if (!notification.read) {
        await markNotificationRead(notification.id);
      }
    },
    [markNotificationRead]
  );

  const handleToggleReadState = useCallback(
    async (notification) => {
      await toggleNotificationReadState(notification.id, !notification.read);
    },
    [toggleNotificationReadState]
  );

  const content = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Loading notifications...</Text>
        </View>
      );
    }

    if (!notifications.length) {
      return (
        <View style={styles.centerState}>
          <View style={styles.emptyIconWrap}>
            <Feather name="bell-off" size={28} color={colors.mutedForeground} />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.stateText}>
            Project alerts, reminders, and status updates will appear here.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshNotifications}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={handleOpenNotification}
            onToggleReadState={handleToggleReadState}
          />
        )}
      />
    );
  }, [
    handleOpenNotification,
    handleToggleReadState,
    loading,
    notifications,
    refreshNotifications,
    refreshing,
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      {content}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((current) => ({ ...current, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, paddingBottom: 40 },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.foreground,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },
  notificationCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 12,
  },
  unreadCard: {
    borderColor: colors.primary,
    backgroundColor: "#F5FBF5",
  },
  notificationCardPressed: { opacity: 0.92 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notificationBody: { flex: 1 },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: colors.foreground,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  notificationText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedForeground,
  },
  notificationTime: {
    marginTop: 10,
    fontSize: 12,
    color: colors.mutedForeground,
  },
  readToggle: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingVertical: 4,
  },
  readToggleText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  headerAction: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  headerActionPressed: { opacity: 0.7 },
});
