// src/screens/ParishDetailScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme";
import { useLanguage } from "../i18n/LanguageContext";
import { useFavorites } from "../context/FavoritesContext";
import LanguageToggle from "../components/LanguageToggle";
import { SACRAMENTS_DATA } from "../data/parishesData";

const PARISH_DATA = {
  name: "Parish of Our Lady of the Candle",
  altName: "(Nuestra Señora de Candelaria)",
  tagline: "“Illumined by faith in one of Camarines Norte's oldest gold-mining towns.”",
  patron: "Our Lady of the Candle (Nuestra Señora de Candelaria)",
  feastDay: "February 2 (Feast of the Presentation)",
  vicariate: "Vicariate of Our Lady of Candelaria",
  established: "Est. 1869",
  address: "Poblacion, Paracale, Camarines Norte",
  phone: "(054) 571-4100",
  lat: 14.2811,
  lng: 122.7876,
  heroImage: "https://dytzqwmkfjymocvwixwy.supabase.co/storage/v1/object/public/diocese-system/uploads/1789998590054-Paracale.JPG",
  logoImage: "https://dytzqwmkfjymocvwixwy.supabase.co/storage/v1/object/public/diocese-system/uploads/1789998593016-ParacaleLogo.jpg",
  priest: {
    name: "Rev. Fr. Noel Domingo",
    role: "Parish Priest",
    photo: "https://dytzqwmkfjymocvwixwy.supabase.co/storage/v1/object/public/diocese-system/uploads/1789998638924-image_2026-09-21_215036630.png",
  },
  masses: {
    sunday: ["6:00 AM", "8:00 AM", "10:00 AM", "5:00 PM"],
    saturdayVigil: ["5:30 PM (Anticipated Mass)"],
    weekdays: ["6:00 AM (Monday to Friday)"],
  },
  reconciliation: "Saturday: 4:00 PM – 5:00 PM; Sunday: 30 minutes before each Mass",
  adoration: "Holy Hour every Wednesday, 7:00 PM",
  stewardship: "Donations may be placed in the Poor Box of the church or through direct bank transfer via the parish office.",
  sacraments: [
    { title: "Binyag (Baptism)", desc: "Ika-2 Sabado ng buwan, 10:00 AM. Magdala ng birth certificate sa tanggapan." },
    { title: "Kasal (Matrimony)", desc: "Makipag-ugnayan sa pari nang hindi bababa sa 6 na buwan bago ang kasal." },
    { title: "Pagpapahid ng Langis", desc: "Available ang pagdalaw sa mga pasyente sa bahay o ospital kapag hinihingi." },
  ],
};

export default function ParishDetailScreen({ onBack, customParish }) {
  const { language, t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState("mass"); // "mass", "sacraments", "clergy"
  const parish = customParish || PARISH_DATA;
  const priest = parish.priest || PARISH_DATA.priest;
  const isFav = isFavorite(parish.id);

  const priestRoleText = language === "tl" && priest.roleTl
    ? priest.roleTl.toUpperCase()
    : (priest.role || t("parishDetail.clergyRole")).toUpperCase();

  const parishTagline = typeof parish.tagline === "object"
    ? (parish.tagline[language] || parish.tagline.en || "")
    : (parish.tagline || PARISH_DATA.tagline);

  const openDirections = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${parish.lat || 14.2811},${parish.lng || 122.7876}(${encodeURIComponent(parish.name)})`,
      android: `geo:0,0?q=${parish.lat || 14.2811},${parish.lng || 122.7876}(${encodeURIComponent(parish.name)})`,
      default: `https://www.google.com/maps/search/?api=1&query=${parish.lat || 14.2811},${parish.lng || 122.7876}`,
    });
    Linking.openURL(url);
  };

  const callOffice = () => {
    Linking.openURL(`tel:${(parish.phone || "0545714100").replace(/[^0-9]/g, "")}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Top Bar with Back Button, Favorite Toggle & Language Toggle */}
      <View style={styles.topDioceseBar}>
        {onBack ? (
          <TouchableOpacity style={styles.backRow} onPress={onBack}>
            <Ionicons name="arrow-back" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.backRowText}>{t("parishDetail.backToDirectory")}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backRow}>
            <Ionicons name="shield" size={16} color={COLORS.gold} style={{ marginRight: 6 }} />
            <Text style={styles.backRowText}>{t("header.dioceseName")}</Text>
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            style={styles.headerFavBtn}
            onPress={() => toggleFavorite(parish.id)}
            accessibilityLabel="Bookmark Parish"
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={20}
              color={isFav ? COLORS.gold : "#ffffff"}
            />
          </TouchableOpacity>
          <LanguageToggle compact />
        </View>
      </View>

      {/* Hero Section with Church Image & Dark Gradient */}
      <View style={styles.heroContainer}>
        <Image source={{ uri: parish.heroImage || PARISH_DATA.heroImage }} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroOverlay} />

        {/* Parish Logo in Top Right */}
        <Image source={{ uri: parish.logoImage || PARISH_DATA.logoImage }} style={styles.parishLogo} resizeMode="contain" />

        {/* Hero Content */}
        <View style={styles.heroContent}>
          {/* Patron Badge */}
          <View style={styles.patronRow}>
            <Ionicons name="sparkles" size={14} color={COLORS.gold} />
            <Text style={styles.patronText}>
              {t("parishDetail.patronPrefix")} {(parish.patron || PARISH_DATA.patron).toUpperCase()} • {t("parishDetail.feastDayPrefix")} {(parish.feastDay || "FEBRUARY 2").toUpperCase()}
            </Text>
          </View>

          {/* Parish Title */}
          <Text style={styles.parishTitle}>{parish.name}</Text>
          <Text style={styles.parishAltTitle}>{parish.altName || ""}</Text>

          {/* Tagline */}
          {parishTagline ? <Text style={styles.tagline}>{parishTagline}</Text> : null}

          {/* Priest Pill Card */}
          <View style={styles.priestPill}>
            <Image source={{ uri: priest.photo || PARISH_DATA.priest.photo }} style={styles.priestAvatar} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.priestRole}>{priestRoleText}</Text>
              <Text style={styles.priestName} numberOfLines={1}>{priest.name}</Text>
            </View>
          </View>

          {/* Location & Quick Action Bar */}
          <View style={styles.heroMetaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-sharp" size={14} color="#fff" style={{ opacity: 0.9 }} />
              <Text style={styles.metaText}>{parish.address || "Camarines Norte"}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.directionsBtn} onPress={() => setActiveTab("location")}>
              <Ionicons name="compass" size={16} color={COLORS.dark} style={{ marginRight: 6 }} />
              <Text style={styles.directionsBtnText}>{t("parishDetail.howToGetThere")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.callBtn} onPress={callOffice}>
              <Ionicons name="call" size={15} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.callBtnText}>{t("parishDetail.callOffice")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Vicariate & Establishment Badges */}
      <View style={styles.badgesBar}>
        <View style={styles.vicariateBadge}>
          <Text style={styles.vicariateBadgeText}>{parish.vicariate || "Diocese of Daet"}</Text>
        </View>
        <View style={styles.estBadge}>
          <Text style={styles.estBadgeText}>{parish.established || "Est. 1869"}</Text>
        </View>
      </View>

      {/* Segmented Navigation Tabs */}
      <View style={styles.segmentedTabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "mass" && styles.tabButtonActive]}
          onPress={() => setActiveTab("mass")}
        >
          <Text style={[styles.tabButtonText, activeTab === "mass" && styles.tabButtonTextActive]}>
            {t("parishDetail.tabMass")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "location" && styles.tabButtonActive]}
          onPress={() => setActiveTab("location")}
        >
          <Text style={[styles.tabButtonText, activeTab === "location" && styles.tabButtonTextActive]}>
            {t("parishDetail.tabMap")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "sacraments" && styles.tabButtonActive]}
          onPress={() => setActiveTab("sacraments")}
        >
          <Text style={[styles.tabButtonText, activeTab === "sacraments" && styles.tabButtonTextActive]}>
            {t("parishDetail.tabGuidelines")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "clergy" && styles.tabButtonActive]}
          onPress={() => setActiveTab("clergy")}
        >
          <Text style={[styles.tabButtonText, activeTab === "clergy" && styles.tabButtonTextActive]}>
            {t("parishDetail.tabClergy")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: MASS & LITURGICAL CALENDAR */}
      {activeTab === "mass" && (
        <View style={styles.tabContentContainer}>
          <Text style={styles.sectionHeaderTitle}>{t("parishDetail.massCalendarTitle")}</Text>

          {/* Sunday Masses */}
          <View style={styles.calendarCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconCircle, { backgroundColor: "#fff5f5" }]}>
                <Ionicons name="sunny" size={18} color={COLORS.crimson} />
              </View>
              <Text style={styles.cardHeaderTitle}>{t("parishDetail.sundayMasses")}</Text>
            </View>
            <View style={styles.timeChipsWrap}>
              {((parish.masses && parish.masses.sunday) || PARISH_DATA.masses.sunday).map((timeStr, idx) => (
                <View key={idx} style={styles.timeChip}>
                  <Ionicons name="time-outline" size={14} color={COLORS.crimson} style={{ marginRight: 4 }} />
                  <Text style={styles.timeChipText}>{timeStr}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Saturday Anticipated Mass */}
          {((parish.masses && parish.masses.saturdayVigil) || PARISH_DATA.masses.saturdayVigil)?.length > 0 && (
            <View style={styles.calendarCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconCircle, { backgroundColor: "#fdf8e6" }]}>
                  <Ionicons name="moon" size={18} color={COLORS.goldHover} />
                </View>
                <Text style={styles.cardHeaderTitle}>{t("parishDetail.saturdayAnticipated")}</Text>
              </View>
              <View style={styles.timeChipsWrap}>
                {((parish.masses && parish.masses.saturdayVigil) || PARISH_DATA.masses.saturdayVigil).map((timeStr, idx) => (
                  <View key={idx} style={styles.timeChip}>
                    <Ionicons name="time-outline" size={14} color={COLORS.crimson} style={{ marginRight: 4 }} />
                    <Text style={styles.timeChipText}>{timeStr}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Daily Weekday Masses */}
          {((parish.masses && parish.masses.weekdays) || PARISH_DATA.masses.weekdays)?.length > 0 && (
            <View style={styles.calendarCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconCircle, { backgroundColor: "#eef4ff" }]}>
                  <Ionicons name="calendar-outline" size={18} color="#1565c0" />
                </View>
                <Text style={styles.cardHeaderTitle}>{t("parishDetail.weekdayMasses")}</Text>
              </View>
              <View style={styles.timeChipsWrap}>
                {((parish.masses && parish.masses.weekdays) || PARISH_DATA.masses.weekdays).map((timeStr, idx) => (
                  <View key={idx} style={styles.timeChip}>
                    <Ionicons name="time-outline" size={14} color="#1565c0" style={{ marginRight: 4 }} />
                    <Text style={styles.timeChipText}>{timeStr}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sacrament of Reconciliation */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="heart-half-outline" size={20} color={COLORS.crimson} style={{ marginRight: 8 }} />
              <Text style={styles.infoCardTitle}>{t("parishDetail.confessionTitle")}</Text>
            </View>
            <Text style={styles.infoCardBody}>
              {typeof parish.reconciliation === "object"
                ? (parish.reconciliation[language] || parish.reconciliation.en)
                : (parish.reconciliation || PARISH_DATA.reconciliation)}
            </Text>
          </View>

          {/* Eucharistic Adoration */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="flame-outline" size={20} color={COLORS.goldHover} style={{ marginRight: 8 }} />
              <Text style={styles.infoCardTitle}>{t("parishDetail.adorationTitle")}</Text>
            </View>
            <Text style={styles.infoCardBody}>
              {typeof parish.adoration === "object"
                ? (parish.adoration[language] || parish.adoration.en)
                : (parish.adoration || PARISH_DATA.adoration)}
            </Text>
          </View>

          {/* Parish Stewardship */}
          <View style={[styles.infoCard, { borderLeftColor: COLORS.gold }]}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="gift-outline" size={20} color={COLORS.goldHover} style={{ marginRight: 8 }} />
              <Text style={styles.infoCardTitle}>{t("parishDetail.stewardshipTitle")}</Text>
            </View>
            <Text style={styles.infoCardBody}>{PARISH_DATA.stewardship}</Text>
          </View>
        </View>
      )}

      {/* TAB: LOCATION & DIRECTIONS */}
      {activeTab === "location" && (
        <View style={styles.tabContentContainer}>
          <Text style={styles.sectionHeaderTitle}>{t("locator.step4Title")}</Text>
          <Text style={styles.subtitle}>
            {parish.name} · {parish.municipality || "Camarines Norte"}
          </Text>

          {/* Guide Card */}
          <View style={[styles.infoCard, { borderLeftColor: COLORS.crimson, marginTop: 12 }]}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="compass" size={20} color={COLORS.crimson} style={{ marginRight: 8 }} />
              <Text style={styles.infoCardTitle}>{t("locator.interactiveMap")}</Text>
            </View>
            <Text style={styles.infoCardBody}>
              📍 {parish.address || "Camarines Norte, Philippines"}
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.inquireButton, { flex: 1, marginTop: 0 }]}
                onPress={openDirections}
              >
                <Ionicons name="navigate" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.inquireButtonText}>{t("locator.openInMaps")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Embedded Google Map */}
          <View style={{ height: 420, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border, marginTop: 12 }}>
            {Platform.OS === "web" ? (
              <iframe
                title="Google Map Parish View"
                src={`https://maps.google.com/maps?q=${parish.lat || 14.2811},${parish.lng || 122.7876}&hl=en&z=16&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              />
            ) : (
              <TouchableOpacity style={[styles.inquireButton, { margin: 20 }]} onPress={openDirections}>
                <Text style={styles.inquireButtonText}>{t("locator.openInMaps")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* TAB 2: SACRAMENTAL SERVICES & GUIDELINES */}
      {activeTab === "sacraments" && (
        <View style={styles.tabContentContainer}>
          <Text style={styles.sectionHeaderTitle}>{t("parishDetail.guidelinesTitle")}</Text>
          {SACRAMENTS_DATA.map((item, idx) => (
            <View key={idx} style={styles.guidelineCard}>
              <View style={styles.guidelineTitleRow}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.crimson} style={{ marginRight: 8 }} />
                <Text style={styles.guidelineTitle}>
                  {item.title[language] || item.title.en}
                </Text>
              </View>
              <Text style={styles.guidelineDesc}>
                {item.desc[language] || item.desc.en}
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.inquireButton} onPress={callOffice}>
            <Ionicons name="call" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.inquireButtonText}>{t("parishDetail.inquireBtn")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TAB 3: CLERGY & OFFICE */}
      {activeTab === "clergy" && (
        <View style={styles.tabContentContainer}>
          <Text style={styles.sectionHeaderTitle}>{t("parishDetail.clergyTitle")}</Text>
          
          <View style={styles.clergyCard}>
            <Image source={{ uri: priest.photo || PARISH_DATA.priest.photo }} style={styles.clergyPhoto} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.clergyRoleBadge}>{priestRoleText}</Text>
              <Text style={styles.clergyMainName}>{priest.name}</Text>
              <Text style={styles.clergyParishName}>{parish.name}</Text>
            </View>
          </View>

          <Text style={[styles.sectionHeaderTitle, { marginTop: 24 }]}>{t("parishDetail.officeTitle")}</Text>
          <View style={styles.officeDetailsCard}>
            <View style={styles.officeDetailRow}>
              <Ionicons name="location-outline" size={20} color={COLORS.crimson} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.officeLabel}>{t("parishDetail.officeAddress")}</Text>
                <Text style={styles.officeVal}>{parish.address || "Poblacion, Camarines Norte"}</Text>
              </View>
            </View>
            <View style={styles.separator} />
            <View style={styles.officeDetailRow}>
              <Ionicons name="call-outline" size={20} color={COLORS.crimson} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.officeLabel}>{t("parishDetail.officeContact")}</Text>
                <Text style={styles.officeVal}>{parish.phone || "(054) 571-4000"}</Text>
              </View>
            </View>
            <View style={styles.separator} />
            <View style={styles.officeDetailRow}>
              <Ionicons name="time-outline" size={20} color={COLORS.crimson} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.officeLabel}>{t("parishDetail.officeHours")}</Text>
                <Text style={styles.officeVal}>{t("parishDetail.officeHoursVal")}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerMotto}>“Rogate ergo Dominum messis”</Text>
        <Text style={styles.footerSub}>
          Diocese of Camarines Norte · Chancery Office & Diocesan Curia, Daet
        </Text>
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
  topDioceseBar: {
    backgroundColor: COLORS.crimson,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.goldBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  backRowText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  headerFavBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(242, 194, 0, 0.4)",
  },
  topDioceseText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  heroContainer: {
    position: "relative",
    width: "100%",
    minHeight: 460,
    overflow: "hidden",
    borderBottomWidth: 3,
    borderBottomColor: COLORS.crimson,
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10, 2, 2, 0.72)",
  },
  parishLogo: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 68,
    height: 68,
    zIndex: 10,
  },
  heroContent: {
    marginTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  patronRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  patronText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  parishTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    lineHeight: 28,
  },
  parishAltTitle: {
    color: "#f0d9d9",
    fontSize: 16,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    marginBottom: 6,
  },
  tagline: {
    color: "#f0d9d9",
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
    marginBottom: 14,
  },
  priestPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 4, 4, 0.75)",
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
    alignSelf: "flex-start",
    marginBottom: 14,
    maxWidth: "95%",
  },
  priestPillUnverified: {
    borderColor: "#e5b800",
    backgroundColor: "rgba(45, 20, 0, 0.8)",
  },
  unverifiedMiniTag: {
    backgroundColor: "#b45309",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 6,
  },
  unverifiedMiniTagText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  priestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  priestRole: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  priestName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    paddingTop: 10,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: "#f0d9d9",
    fontSize: 12,
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gold,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  directionsBtnText: {
    color: COLORS.dark,
    fontWeight: "700",
    fontSize: 13,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  callBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
  },
  badgesBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  vicariateBadge: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  vicariateBadgeText: {
    color: COLORS.crimson,
    fontSize: 12,
    fontWeight: "700",
  },
  estBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  estBadgeText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "700",
  },
  segmentedTabRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.crimson,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: COLORS.crimson,
    borderBottomColor: COLORS.crimson,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.crimson,
    textAlign: "center",
  },
  tabButtonTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  tabContentContainer: {
    padding: 16,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.crimson,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    marginBottom: 14,
  },
  calendarCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  timeChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.crimson,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  infoCardBody: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
  },
  guidelineCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  guidelineTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  guidelineTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.crimson,
  },
  guidelineDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  inquireButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.crimson,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  inquireButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  clergyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clergyCardUnverified: {
    borderColor: "#e5b800",
    backgroundColor: "#fffdf5",
  },
  clergyBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803d",
  },
  unverifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  unverifiedTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#b45309",
  },
  clergyStatusNote: {
    fontSize: 11,
    color: "#854d0e",
    backgroundColor: "#fef9c3",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
  },
  clergyPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  clergyRoleBadge: {
    fontSize: 11,
    color: COLORS.crimson,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  clergyMainName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
  },
  clergyParishName: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  officeDetailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  officeDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 6,
  },
  officeLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  officeVal: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  footerContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerMotto: {
    fontSize: 14,
    fontStyle: "italic",
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
    color: COLORS.crimson,
    fontWeight: "700",
  },
  footerSub: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 4,
  },
});
