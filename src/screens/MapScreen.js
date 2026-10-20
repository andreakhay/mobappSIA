// src/screens/MapScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { COLORS } from "../theme";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";
import { PARISHES_DATA } from "../data/parishesData";
import { getParishes } from "../services/parishService";

const TOWN_CENTERS = [
  { name: "Daet Centro / Provincial Capitol", lat: 14.1147, lng: 122.9553 },
  { name: "Labo Poblacion", lat: 14.1561, lng: 122.8294 },
  { name: "Basud Poblacion", lat: 14.0664, lng: 122.9642 },
  { name: "Mercedes Centro / Fish Port", lat: 14.1114, lng: 123.0125 },
  { name: "Vinzons Poblacion", lat: 14.1806, lng: 122.9333 },
  { name: "Jose Panganiban Centro", lat: 14.2889, lng: 122.6933 },
  { name: "Paracale Poblacion", lat: 14.2794, lng: 122.7881 },
  { name: "Talisay Poblacion", lat: 14.1378, lng: 122.9236 },
  { name: "Capalonga Poblacion", lat: 14.3167, lng: 122.5833 },
  { name: "Santa Elena Poblacion", lat: 14.1681, lng: 122.4289 },
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.25 * 10) / 10;
}

export default function MapScreen() {
  const { language, t } = useLanguage();
  const [parishes, setParishes] = useState(PARISHES_DATA);
  const [selectedParish, setSelectedParish] = useState(PARISHES_DATA[0]);
  const [origin, setOrigin] = useState(null);
  const [travelMode, setTravelMode] = useState("driving"); // "driving", "walking", "transit"
  const [isLocating, setIsLocating] = useState(false);
  const [showTownList, setShowTownList] = useState(false);
  const [showParishPicker, setShowParishPicker] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getParishes();
        if (data && data.length > 0) {
          setParishes(data);
          setSelectedParish((prev) => data.find((p) => p.id === prev.id) || data[0]);
        }
      } catch (err) {
        console.warn("MapScreen load error:", err);
      }
    }
    load();
  }, []);

  // Compute route estimates
  let routeStats = null;
  if (origin) {
    const dist = calculateDistanceKm(origin.lat, origin.lng, selectedParish.lat, selectedParish.lng);
    let speed = 40; // km/h
    if (travelMode === "walking") speed = 4.5;
    if (travelMode === "transit") speed = 28;

    let mins = Math.round((dist / speed) * 60);
    if (travelMode === "transit") mins += 12;
    if (mins < 3 && dist < 1) mins = 3;

    routeStats = {
      distKm: dist,
      durationMins: mins,
      fromName: origin.name,
    };
  }

  const handleUseGps = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Please enable location permissions or choose a town center below.");
        setIsLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setOrigin({
        name: language === "tl" ? "Aking Kasalukuyang Lokasyon" : "My Current Location",
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
      setShowTownList(false);
    } catch (err) {
      alert("Could not fetch location: " + err.message);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectTown = (town) => {
    setOrigin({
      name: town.name,
      lat: town.lat,
      lng: town.lng,
    });
    setShowTownList(false);
  };

  const openInGoogleMaps = () => {
    let url;
    if (Platform.OS === "ios") {
      url = `maps://maps.apple.com/?daddr=${selectedParish.lat},${selectedParish.lng}`;
      if (origin) url += `&saddr=${origin.lat},${origin.lng}`;
    } else if (Platform.OS === "android") {
      url = `google.navigation:q=${selectedParish.lat},${selectedParish.lng}&mode=${travelMode === "walking" ? "w" : travelMode === "transit" ? "b" : "d"}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${selectedParish.lat},${selectedParish.lng}`;
      if (origin) url += `&origin=${origin.lat},${origin.lng}`;
      url += `&travelmode=${travelMode}`;
    }
    Linking.openURL(url).catch(() => {
      // Fallback to web Google Maps URL if app scheme is not supported
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${selectedParish.lat},${selectedParish.lng}`);
    });
  };

  const embedMapUrl = `https://maps.google.com/maps?q=${selectedParish.lat},${selectedParish.lng}&hl=en&z=16&output=embed`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header with Language Toggle */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="location" size={24} color={COLORS.gold} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>{t("header.locatorTitle")}</Text>
            <Text style={styles.pageSubtitle}>{t("header.locatorSub")}</Text>
          </View>
          <LanguageToggle compact />
        </View>
      </View>

      <View style={styles.innerContainer}>
        {/* STEP 1: Select Church */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <Text style={styles.cardTitle}>{t("locator.step1Title")}</Text>
          </View>

          {/* Selected Church Display / Picker Button */}
          <TouchableOpacity
            style={styles.churchSelectorBtn}
            onPress={() => setShowParishPicker(!showParishPicker)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedChurchName}>{selectedParish.name}</Text>
              <Text style={styles.selectedChurchSub}>
                📍 {selectedParish.address} ({selectedParish.vicariate})
              </Text>
            </View>
            <View style={styles.changeBadge}>
              <Text style={styles.changeBadgeText}>{showParishPicker ? "Close" : "Change"}</Text>
              <Ionicons
                name={showParishPicker ? "chevron-up" : "chevron-down"}
                size={14}
                color={COLORS.crimson}
                style={{ marginLeft: 3 }}
              />
            </View>
          </TouchableOpacity>

          {/* Parish Dropdown List */}
          {showParishPicker && (
            <View style={styles.parishListDropdown}>
              {parishes.map((p) => {
                const isSelected = p.id === selectedParish.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.parishListItem, isSelected && styles.parishListItemActive]}
                    onPress={() => {
                      setSelectedParish(p);
                      setShowParishPicker(false);
                    }}
                  >
                    <Ionicons
                      name="business"
                      size={18}
                      color={isSelected ? COLORS.crimson : "#666"}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.parishItemTitle, isSelected && { color: COLORS.crimson }]}>
                        {p.name}
                      </Text>
                      <Text style={styles.parishItemSub}>{p.municipality} • {p.vicariate}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark" size={18} color={COLORS.crimson} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* STEP 2: Choose Starting Point */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <Text style={styles.cardTitle}>{t("locator.step2Title")}</Text>
          </View>

          {/* GPS Button & Town Center Button */}
          <View style={styles.startOptionsRow}>
            <TouchableOpacity
              style={[
                styles.startOptionBtn,
                origin && styles.startOptionBtnActive,
              ]}
              onPress={handleUseGps}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />
              ) : (
                <Ionicons
                  name="navigate"
                  size={16}
                  color={origin ? "#fff" : COLORS.crimson}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={[
                  styles.startOptionBtnText,
                  origin && { color: "#fff" },
                ]}
              >
                {isLocating ? "Getting GPS..." : t("locator.useGps")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.startOptionBtn,
                showTownList && styles.startOptionBtnActive,
              ]}
              onPress={() => setShowTownList(!showTownList)}
            >
              <Ionicons
                name="location-outline"
                size={16}
                color={showTownList ? "#fff" : COLORS.text}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.startOptionBtnText,
                  showTownList && { color: "#fff" },
                ]}
              >
                {language === "tl" ? "Pumili ng Bayan" : "Pick a Town Center"}
              </Text>
              <Ionicons
                name={showTownList ? "chevron-up" : "chevron-down"}
                size={14}
                color={showTownList ? "#fff" : "#666"}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>

          {/* Town Centers List */}
          {showTownList && (
            <View style={styles.townsDropdown}>
              <Text style={styles.townsDropdownTitle}>
                {language === "tl" ? "Piliin ang pinanggalingang bayan:" : "Choose your starting town:"}
              </Text>
              <View style={styles.townsGrid}>
                {TOWN_CENTERS.map((town, idx) => {
                  const isCurrent = origin?.name === town.name;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.townChip, isCurrent && styles.townChipActive]}
                      onPress={() => handleSelectTown(town)}
                    >
                      <Text style={[styles.townChipText, isCurrent && styles.townChipTextActive]}>
                        {town.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Selected Starting Point & Route Result Card */}
          {routeStats && (
            <View style={styles.routeSummaryBox}>
              <View style={styles.routeSummaryHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeFromText}>{t("locator.startingFrom")}: <Text style={{ fontWeight: "700" }}>{routeStats.fromName}</Text></Text>
                  <Text style={styles.routeToText}>{t("locator.targetParish")}: <Text style={{ fontWeight: "700" }}>{selectedParish.name}</Text></Text>
                </View>

                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => setOrigin(null)}
                >
                  <Ionicons name="close-circle" size={16} color="#777" style={{ marginRight: 4 }} />
                  <Text style={styles.clearBtnText}>{language === "tl" ? "Ulitin" : "Reset"}</Text>
                </TouchableOpacity>
              </View>

              {/* Distance & Time Chips */}
              <View style={styles.statsPillRow}>
                <View style={styles.statChip}>
                  <Ionicons name="car" size={16} color={COLORS.crimson} style={{ marginRight: 6 }} />
                  <Text style={styles.statChipText}>{routeStats.distKm} km</Text>
                </View>

                <View style={styles.statChip}>
                  <Ionicons name="time" size={16} color={COLORS.goldHover} style={{ marginRight: 6 }} />
                  <Text style={styles.statChipText}>~{routeStats.durationMins} mins ({travelMode})</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* STEP 3: Travel Mode & Direct Navigation */}
        <View style={styles.actionCard}>
          {/* Mode Selector */}
          <View style={styles.travelModeRow}>
            <Text style={styles.travelModeLabel}>{t("locator.step3Title")}</Text>
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, travelMode === "driving" && styles.modeTabActive]}
                onPress={() => setTravelMode("driving")}
              >
                <Ionicons name="car" size={14} color={travelMode === "driving" ? "#fff" : "#555"} />
                <Text style={[styles.modeTabText, travelMode === "driving" && styles.modeTabTextActive]}>
                  {t("locator.drive")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeTab, travelMode === "walking" && styles.modeTabActive]}
                onPress={() => setTravelMode("walking")}
              >
                <Ionicons name="walk" size={14} color={travelMode === "walking" ? "#fff" : "#555"} />
                <Text style={[styles.modeTabText, travelMode === "walking" && styles.modeTabTextActive]}>
                  {t("locator.walk")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeTab, travelMode === "transit" && styles.modeTabActive]}
                onPress={() => setTravelMode("transit")}
              >
                <Ionicons name="bus" size={14} color={travelMode === "transit" ? "#fff" : "#555"} />
                <Text style={[styles.modeTabText, travelMode === "transit" && styles.modeTabTextActive]}>
                  {t("locator.transit")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity style={styles.navigatePrimaryBtn} onPress={openInGoogleMaps}>
            <Ionicons name="navigate-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.navigatePrimaryText}>{t("locator.openInMaps")}</Text>
          </TouchableOpacity>
        </View>

        {/* STEP 4: Clean Embedded Map */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeaderBar}>
            <Ionicons name="map-outline" size={16} color={COLORS.crimson} style={{ marginRight: 6 }} />
            <Text style={styles.mapHeaderText}>{t("locator.interactiveMap")}</Text>
          </View>

          <View style={styles.mapFrame}>
            {Platform.OS === "web" ? (
              <iframe
                title="Google Map Locator"
                src={embedMapUrl}
                width="100%"
                height="380"
                style={{ border: 0 }}
                loading="lazy"
              />
            ) : (
              <View style={styles.mobileMapFallback}>
                <Ionicons name="map" size={40} color={COLORS.crimson} />
                <Text style={{ marginTop: 8, fontWeight: "600" }}>{selectedParish.name}</Text>
                <TouchableOpacity style={styles.navigatePrimaryBtn} onPress={openInGoogleMaps}>
                  <Text style={styles.navigatePrimaryText}>{t("locator.openInMaps")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  topDioceseBar: {
    backgroundColor: COLORS.crimson,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.goldBorder,
  },
  topDioceseText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  innerContainer: {
    maxWidth: 620,
    width: "100%",
    alignSelf: "center",
    padding: 16,
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
  pageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: "#f0d9d9",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.crimson,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  stepBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  churchSelectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
  },
  selectedChurchName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  selectedChurchSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginLeft: 8,
  },
  changeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.crimson,
  },
  parishListDropdown: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  parishListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  parishListItemActive: {
    backgroundColor: "#fff5f5",
  },
  parishItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  parishItemSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  startOptionsRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  startOptionBtn: {
    flex: 1,
    minWidth: 140,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: COLORS.crimson,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  startOptionBtnActive: {
    backgroundColor: COLORS.crimson,
    borderColor: COLORS.crimson,
  },
  startOptionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.crimson,
  },
  townsDropdown: {
    marginTop: 12,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  townsDropdownTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  townsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  townChip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  townChipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.goldBorder,
  },
  townChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  townChipTextActive: {
    color: COLORS.dark,
    fontWeight: "700",
  },
  routeSummaryBox: {
    marginTop: 12,
    backgroundColor: "#fff8e6",
    borderWidth: 1,
    borderColor: "#ffe082",
    borderRadius: 8,
    padding: 12,
  },
  routeSummaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  routeFromText: {
    fontSize: 13,
    color: "#5d4037",
  },
  routeToText: {
    fontSize: 13,
    color: "#5d4037",
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  clearBtnText: {
    fontSize: 12,
    color: "#777",
    fontWeight: "600",
  },
  statsPillRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ffe58f",
    paddingTop: 8,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ffd54f",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3e2723",
  },
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  travelModeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  travelModeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 6,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    gap: 4,
  },
  modeTabActive: {
    backgroundColor: COLORS.crimson,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },
  modeTabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  navigatePrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.crimson,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: COLORS.crimson,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  navigatePrimaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  mapCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  mapHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "#fff",
  },
  mapHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  mapFrame: {
    width: "100%",
    height: 380,
    backgroundColor: "#e5e7eb",
  },
  mobileMapFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
