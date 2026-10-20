// src/screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme";
import { useLanguage } from "../i18n/LanguageContext";
import { useFavorites } from "../context/FavoritesContext";
import LanguageToggle from "../components/LanguageToggle";
import { PARISHES_DATA } from "../data/parishesData";
import { getParishes } from "../services/parishService";

export default function HomeScreen({ navigation }) {
  const { language, t } = useLanguage();
  const { favorites, isFavorite } = useFavorites();
  const [parishes, setParishes] = useState(PARISHES_DATA);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadParishes = useCallback(async (force = false) => {
    try {
      const data = await getParishes(force);
      if (data && data.length > 0) {
        setParishes(data);
      }
    } catch (err) {
      console.warn("HomeScreen loadParishes error:", err);
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

  const featured = parishes[0] || PARISHES_DATA[0];
  const featuredTagline = typeof featured.tagline === "object"
    ? (featured.tagline[language] || featured.tagline.en)
    : featured.tagline;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.crimson]}
          tintColor={COLORS.crimson}
        />
      }
    >
      {/* Main Diocesan Title Header with Language Toggle */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="shield" size={26} color={COLORS.gold} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.dioceseTitle}>{t("header.dioceseName")}</Text>
            <Text style={styles.dioceseSub}>{t("header.dioceseSub")}</Text>
          </View>
          <LanguageToggle compact />
        </View>
      </View>

      {/* Hero Featured Card: Our Lady of the Candle Paracale */}
      <View style={styles.featuredContainer}>
        <Text style={styles.sectionHeaderLabel}>{t("home.featuredLabel")}</Text>
        <TouchableOpacity
          style={styles.featuredCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Churches", { parish: featured })}
        >
          <Image source={{ uri: featured.heroImage }} style={styles.featuredImage} resizeMode="cover" />
          <View style={styles.featuredOverlay} />

          {featured.logoImage ? (
            <Image source={{ uri: featured.logoImage }} style={styles.featuredLogo} resizeMode="contain" />
          ) : null}

          <View style={styles.featuredBody}>
            <View style={styles.featuredPatronRow}>
              <Ionicons name="sparkles" size={13} color={COLORS.gold} />
              <Text style={styles.featuredPatronText}>{(featured.vicariate || "").toUpperCase()}</Text>
            </View>

            <Text style={styles.featuredName}>{featured.name}</Text>
            {featured.altName ? <Text style={styles.featuredAltName}>{featured.altName}</Text> : null}
            <Text style={styles.featuredTagline}>{featuredTagline}</Text>

            <View style={styles.featuredFooter}>
              <View style={styles.priestBadge}>
                <Ionicons name="person-circle" size={18} color={COLORS.gold} style={{ marginRight: 5 }} />
                <Text style={styles.priestBadgeText}>{featured.priest?.name || "Parish Priest"}</Text>
              </View>

              <View style={styles.viewProfileBtn}>
                <Text style={styles.viewProfileBtnText}>{t("home.viewParish")}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Navigation Cards */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate("Schedules")}>
          <View style={[styles.quickIconCircle, { backgroundColor: "#fff5f5" }]}>
            <Ionicons name="time" size={22} color={COLORS.crimson} />
          </View>
          <Text style={styles.quickCardTitle}>{t("home.massSchedulesTitle")}</Text>
          <Text style={styles.quickCardSub}>{t("home.massSchedulesSub")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate("Map")}>
          <View style={[styles.quickIconCircle, { backgroundColor: "#fdfbf2" }]}>
            <Ionicons name="compass" size={22} color={COLORS.goldHover} />
          </View>
          <Text style={styles.quickCardTitle}>{t("home.locatorCardTitle")}</Text>
          <Text style={styles.quickCardSub}>{t("home.locatorCardSub")}</Text>
        </TouchableOpacity>
      </View>

      {/* Pinned Favorites Strip */}
      {favorites.length > 0 && (
        <View style={styles.favoritesWrap}>
          <View style={styles.favHeaderRow}>
            <Ionicons name="bookmark" size={16} color={COLORS.goldHover} style={{ marginRight: 6 }} />
            <Text style={styles.favSectionTitle}>{t("home.favoritesTitle")}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}>
            {parishes.filter((p) => isFavorite(p.id)).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.favCard}
                onPress={() => navigation.navigate("Churches", { parish: item })}
              >
                <Ionicons name="heart" size={14} color={COLORS.crimson} style={{ marginRight: 6 }} />
                <Text style={styles.favCardText} numberOfLines={1}>{item.name.split(" (")[0]}</Text>
                <Ionicons name="arrow-forward" size={12} color={COLORS.textMuted} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Directory of Parishes Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{t("home.parishesSection")}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Churches")}>
          <Text style={styles.seeAllText}>{t("home.seeAll")}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={parishes}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.churchCard}
            onPress={() => navigation.navigate("Churches", { parish: item })}
          >
            <Image source={{ uri: item.heroImage || item.hero_image_url }} style={styles.churchCardImage} resizeMode="cover" />
            <View style={styles.churchCardContent}>
              <Text style={styles.churchVicariate}>{item.vicariate || "Diocese of Daet"}</Text>
              <Text style={styles.churchCardTitle} numberOfLines={2}>{item.name}</Text>
              <View style={styles.churchLocationRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.crimson} style={{ marginRight: 4 }} />
                <Text style={styles.churchLocationText}>{item.municipality || "Camarines Norte"}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Diocesan Motto / Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerMotto}>{t("home.motto")}</Text>
        <Text style={styles.footerSub}>{t("home.footerSub")}</Text>
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
  topBar: {
    backgroundColor: COLORS.crimson,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.goldBorder,
  },
  topBarText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
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
  dioceseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    letterSpacing: 0.3,
  },
  dioceseSub: {
    fontSize: 12,
    color: "#f0d9d9",
    marginTop: 2,
  },
  featuredContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeaderLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.crimson,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  featuredCard: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 320,
    backgroundColor: COLORS.dark,
    borderWidth: 2,
    borderColor: COLORS.crimson,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(18, 4, 4, 0.76)",
  },
  featuredLogo: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  featuredBody: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  featuredPatronRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  featuredPatronText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  featuredName: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
  },
  featuredAltName: {
    color: "#f0d9d9",
    fontSize: 14,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    marginBottom: 6,
  },
  featuredTagline: {
    color: "#e8d0d0",
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 16,
    marginBottom: 12,
  },
  featuredFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    paddingTop: 10,
  },
  priestBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  priestBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  viewProfileBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  viewProfileBtnText: {
    color: COLORS.dark,
    fontSize: 12,
    fontWeight: "700",
  },
  quickActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  quickCardSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  favoritesWrap: {
    marginTop: 14,
    marginBottom: 4,
  },
  favHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  favSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.crimson,
    letterSpacing: 0.3,
  },
  favCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  favCardText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    maxWidth: 160,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.crimson,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.crimson,
  },
  churchCard: {
    width: 210,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginRight: 12,
  },
  churchCardImage: {
    width: "100%",
    height: 110,
  },
  churchCardContent: {
    padding: 10,
  },
  churchVicariate: {
    fontSize: 10,
    color: COLORS.goldHover,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  churchCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginVertical: 4,
  },
  churchLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  churchLocationText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  footer: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 10,
  },
  footerMotto: {
    fontSize: 13,
    fontStyle: "italic",
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    color: COLORS.crimson,
    fontWeight: "700",
  },
  footerSub: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
