import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import colors from "../constants/colors";
import { useNotifications } from "../context/NotificationsContext";

export default function NotificationBellButton({ onPress }) {
  const { unreadCount } = useNotifications();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      hitSlop={8}
    >
      <Feather name="bell" size={20} color={colors.foreground} />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPressed: { opacity: 0.85 },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
});
