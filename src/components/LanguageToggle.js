// src/components/LanguageToggle.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLanguage } from "../i18n/LanguageContext";
import { COLORS } from "../theme";

export default function LanguageToggle({ compact = false }) {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <TouchableOpacity
        style={[styles.segment, language === "en" && styles.segmentActive]}
        onPress={() => setLanguage("en")}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Switch language to English"
      >
        <Text style={[styles.text, language === "en" && styles.textActive]}>
          {compact ? "EN" : "English"}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={[styles.segment, language === "tl" && styles.segmentActive]}
        onPress={() => setLanguage("tl")}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Lumipat sa wikang Tagalog"
      >
        <Text style={[styles.text, language === "tl" && styles.textActive]}>
          {compact ? "TL" : "Tagalog"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(242, 194, 0, 0.6)", // Liturgical gold border
    padding: 2,
  },
  containerCompact: {
    padding: 1,
    borderRadius: 16,
  },
  segment: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    minWidth: 32,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: COLORS.gold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f0d9d9",
    letterSpacing: 0.3,
  },
  textActive: {
    color: "#5c0000", // Deep crimson for high contrast on gold
    fontWeight: "800",
  },
});
