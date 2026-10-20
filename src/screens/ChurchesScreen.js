// src/screens/ChurchesScreen.js
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { COLORS } from "../theme";
import { useLanguage } from "../i18n/LanguageContext";
import { useFavorites } from "../context/FavoritesContext";
import LanguageToggle from "../components/LanguageToggle";
import { PARISHES_DATA } from "../data/parishesData";
import { getParishes } from "../services/parishService";
import ParishDetailScreen from "./ParishDetailScreen";

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function ChurchesScreen({ route }) {
  const { language, t } = useLanguage();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [selectedParish, setSelectedParish] = useState(null);
  const [parishes, setParishes] = useState(PARISHES_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // "all", "favorites", "nearest", or vicariate name
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (route?.params?.parish) {
      setSelectedParish(route.params.parish);
    }
  }, [route?.params]);

  const loadParishes = useCallback(async (force = false) => {
    try {
      const data = await getParishes(force);
      if (data && data.length > 0) {
        setParishes(data);
      }
    } catch (err) {
      console.warn("Failed to load parishes from API, keeping fallback:", err);
    }
  }, []);

  useEffect(() => {
    loadParishes(false);
  }, [loadParishes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadParishes(true);
    setRefreshing(false);
  };

  // Request user GPS when "nearest" is chosen
  const handleNearestFilter = async () => {
    if (userLocation) {
      setSelectedFilter("nearest");
      return;
    }
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert(language === "tl" ? "Mangyaring pahintulutan ang lokasyon sa iyong browser/telepono." : "Please allow location permission to find nearest churches.");
        setIsLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      setSelectedFilter("nearest");
    } catch (err) {
      alert("Could not get GPS location: " + err.message);
    } finally {
      setIsLocating(false);
    }
  };

  // Distinct list of vicariates
  const vicariates = useMemo(() => {
    return Array.from(new Set(parishes.map((p) => p.vicariate).filter(Boolean)));
  }, [parishes]);

  // Filtered & sorted parishes
  const filteredParishes = useMemo(() => {
    let list = parishes.map((p) => {
      const dist = userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng) : null;
      return { ...p, distanceKm: dist };
    });

    // Search filter
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.municipality && item.municipality.toLowerCase().includes(q)) ||
          (item.patron && item.patron.toLowerCase().includes(q)) ||
          (item.priest && item.priest.name && item.priest.name.toLowerCase().includes(q))
      );
    }

    // Vicariate / Quick Filter
    if (selectedFilter === "favorites") {
      list = list.filter((p) => isFavorite(p.id));
    } else if (selectedFilter === "nearest") {
      list.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    } else if (selectedFilter !== "all") {
      list = list.filter((p) => p.vicariate === selectedFilter);
    }

    return list;
  }, [parishes, searchQuery, selectedFilter, userLocation, isFavorite]);

  // If a parish is selected, display its full detail profile
  if (selectedParish) {
    return (
      <ParishDetailScreen
        customParish={selectedParish}
        onBack={() => setSelectedParish(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Title Header with Language Toggle */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="business" size={24} color={COLORS.gold} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t("header.directoryTitle")}</Text>
            <Text style={styles.subtitle}>{t("header.directorySub")}</Text>
          </View>
          <LanguageToggle compact />
        </View>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("directory.searchPlaceholder")}
            placeholderTextColor="#8a8175"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Quick Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.vicariateScroll}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {/* All */}
          <TouchableOpacity
            style={[styles.vicariatePill, selectedFilter === "all" && styles.vicariatePillActive]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text style={[styles.vicariatePillText, selectedFilter === "all" && styles.vicariatePillTextActive]}>
              {t("directory.allVicariates")}
            </Text>
          </TouchableOpacity>

          {/* Bookmarked / Favorites */}
          <TouchableOpacity
            style={[styles.vicariatePill, selectedFilter === "favorites" && styles.vicariatePillActive]}
            onPress={() => setSelectedFilter(selectedFilter === "favorites" ? "all" : "favorites")}
          >
            <Ionicons
              name={selectedFilter === "favorites" ? "heart" : "heart-outline"}
              size={13}
              color={selectedFilter === "favorites" ? "#fff" : COLORS.crimson}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.vicariatePillText, selectedFilter === "favorites" && styles.vicariatePillTextActive]}>
              {t("directory.favoritesFilter")} ({favorites.length})
            </Text>
          </TouchableOpacity>

          {/* Nearest (GPS) */}
          <TouchableOpacity
            style={[styles.vicariatePill, selectedFilter === "nearest" && styles.vicariatePillActive]}
            onPress={handleNearestFilter}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={selectedFilter === "nearest" ? "#fff" : COLORS.crimson} style={{ marginRight: 4 }} />
            ) : (
              <Ionicons
                name="navigate"
                size={13}
                color={selectedFilter === "nearest" ? "#fff" : COLORS.crimson}
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={[styles.vicariatePillText, selectedFilter === "nearest" && styles.vicariatePillTextActive]}>
              {t("directory.sortNearest")}
            </Text>
          </TouchableOpacity>

          {/* Vicariates */}
          {vicariates.map((vic, idx) => {
            const isSelected = selectedFilter === vic;
            const label = vic.replace("Vicariate of ", "");
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.vicariatePill, isSelected && styles.vicariatePillActive]}
                onPress={() => setSelectedFilter(vic)}
              >
                <Text style={[styles.vicariatePillText, isSelected && styles.vicariatePillTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Parishes List */}
      <FlatList
        data={filteredParishes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.crimson]}
            tintColor={COLORS.crimson}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={36} color={COLORS.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>{t("directory.noResults")}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const priest = item.priest || {};
          const isFav = isFavorite(item.id);

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => setSelectedParish(item)}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.vicariateTag}>
                  <Text style={styles.vicariateTagText}>{item.vicariate || "Diocese of Daet"}</Text>
                </View>

                {/* Bookmark Heart Button */}
                <TouchableOpacity
                  style={styles.favIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  accessibilityLabel="Toggle Favorite"
                >
                  <Ionicons
                    name={isFav ? "heart" : "heart-outline"}
                    size={20}
                    color={isFav ? COLORS.crimson : "#999"}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.cardTitle}>{item.name}</Text>

              {/* Assigned Priest Row */}
              <View style={styles.priestRow}>
                <Ionicons name="person" size={14} color={COLORS.crimson} style={{ marginRight: 6 }} />
                <Text style={styles.priestLabel}>{t("directory.assignedPriest")}</Text>
                <Text style={styles.priestName} numberOfLines={1}>
                  {priest.name}
                </Text>
              </View>

              <View style={styles.cardMetaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color={COLORS.crimson} style={{ marginRight: 4 }} />
                  <Text style={styles.metaText}>{item.municipality}</Text>
                </View>

                {item.distanceKm ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="navigate-outline" size={13} color={COLORS.success} style={{ marginRight: 4 }} />
                    <Text style={[styles.metaText, { color: COLORS.success, fontWeight: "700" }]}>
                      {item.distanceKm} {t("directory.kmAway")}
                    </Text>
                  </View>
                ) : null}

                {item.established ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.goldHover} style={{ marginRight: 4 }} />
                    <Text style={styles.metaText}>{item.established}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.viewLink}>{t("directory.viewProfile")}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.crimson} />
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
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
  filterSection: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    outlineStyle: "none",
  },
  vicariateScroll: {
    paddingBottom: 4,
  },
  vicariatePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  vicariatePillActive: {
    backgroundColor: COLORS.crimson,
    borderColor: COLORS.crimson,
  },
  vicariatePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  vicariatePillTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  vicariateTag: {
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#ffcdd2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  vicariateTagText: {
    fontSize: 11,
    color: COLORS.crimson,
    fontWeight: "700",
  },
  favIconBtn: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    lineHeight: 22,
    marginBottom: 8,
  },
  priestRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priestLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginRight: 4,
  },
  priestName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.crimson,
    flex: 1,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
    paddingTop: 10,
  },
  viewLink: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.crimson,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
