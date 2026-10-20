// src/screens/ScheduleScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme";
import { useLanguage } from "../i18n/LanguageContext";
import { useFavorites } from "../context/FavoritesContext";
import LanguageToggle from "../components/LanguageToggle";
import { PARISHES_DATA } from "../data/parishesData";
import { getParishes } from "../services/parishService";

export default function ScheduleScreen() {
  const { language, t } = useLanguage();
  const { isFavorite } = useFavorites();
  const [parishes, setParishes] = useState(PARISHES_DATA);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getParishes();
        if (data && data.length > 0) {
          setParishes(data);
        }
      } catch (err) {
        console.warn("ScheduleScreen load error:", err);
      }
    }
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getParishes(true);
      if (data && data.length > 0) setParishes(data);
    } catch (_) {}
    setRefreshing(false);
  };

  const current = parishes[selectedIdx] || parishes[0] || PARISHES_DATA[0];

  const sundayMasses = current.masses?.sunday || ["6:00 AM", "8:00 AM", "5:00 PM"];
  const weekdayMasses = current.masses?.weekdays || ["6:00 AM"];
  const confessionText = typeof current.reconciliation === "object"
    ? (current.reconciliation[language] || current.reconciliation.en)
    : (current.reconciliation || t("schedule.noConfessions"));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.crimson]}
          tintColor={COLORS.crimson}
        />
      }
    >
      {/* Header with Language Toggle */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="time" size={24} color={COLORS.gold} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t("header.schedulesTitle")}</Text>
            <Text style={styles.subtitle}>{t("header.schedulesSub")}</Text>
          </View>
          <LanguageToggle compact />
        </View>
      </View>

      <View style={styles.contentWrap}>
        {/* Parish Selector Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
          {parishes.map((item, idx) => {
            const isSelected = idx === selectedIdx;
            const isFav = isFavorite(item.id);
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => setSelectedIdx(idx)}
              >
                {isFav ? (
                  <Ionicons
                    name="heart"
                    size={11}
                    color={isSelected ? "#fff" : COLORS.crimson}
                    style={{ marginRight: 4 }}
                  />
                ) : null}
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {item.municipality || item.name.split(" ")[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Current Parish Header Card */}
        <View style={styles.parishCard}>
          <Ionicons name="business" size={24} color={COLORS.crimson} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.parishCardTitle}>{current.name}</Text>
            <Text style={styles.parishCardSub}>{current.municipality} · {current.vicariate}</Text>
          </View>
        </View>

        {/* Sunday Masses */}
        <View style={styles.scheduleSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="sunny" size={20} color="#e65100" />
            <Text style={styles.sectionHeaderTitle}>{t("schedule.sundayMasses")}</Text>
          </View>
          <View style={styles.timesContainer}>
            {sundayMasses.map((time, i) => (
              <View key={i} style={styles.timeBadge}>
                <Ionicons name="time-outline" size={16} color={COLORS.crimson} style={{ marginRight: 6 }} />
                <Text style={styles.timeBadgeText}>{time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekday Masses */}
        <View style={styles.scheduleSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="calendar-outline" size={20} color="#1565c0" />
            <Text style={styles.sectionHeaderTitle}>{t("schedule.weekdayMasses")}</Text>
          </View>
          <View style={styles.timesContainer}>
            {weekdayMasses.map((time, i) => (
              <View key={i} style={styles.timeBadge}>
                <Ionicons name="time-outline" size={16} color="#1565c0" style={{ marginRight: 6 }} />
                <Text style={styles.timeBadgeText}>{time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Confessions */}
        <View style={styles.scheduleSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="heart-half-outline" size={20} color={COLORS.crimson} />
            <Text style={styles.sectionHeaderTitle}>{t("schedule.confessions")}</Text>
          </View>
          <Text style={styles.confessionText}>{confessionText}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    maxWidth: 620,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    backgroundColor: COLORS.crimson,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: "#f0d9d9",
    marginTop: 2,
  },
  contentWrap: {
    padding: 16,
  },
  pillsScroll: { marginBottom: 16 },
  pill: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillSelected: {
    backgroundColor: COLORS.crimson,
    borderColor: COLORS.crimson,
  },
  pillText: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },
  pillTextSelected: { color: "#fff", fontWeight: "700" },
  parishCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  parishCardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  parishCardSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  scheduleSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionHeaderTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginLeft: 8 },
  timesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeBadgeText: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  confessionText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
});
