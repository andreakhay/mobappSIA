// src/screens/MoreScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

export default function MoreScreen() {
  const { language, t } = useLanguage();

  const contactItems = [
    {
      icon: "call-outline",
      label: t("curia.chanceryPhone"),
      value: "(054) 571-4000",
      action: () => Linking.openURL("tel:0545714000"),
    },
    {
      icon: "mail-outline",
      label: t("curia.email"),
      value: "chancery@dioceseofdaet.ph",
      action: () => Linking.openURL("mailto:chancery@dioceseofdaet.ph"),
    },
    {
      icon: "globe-outline",
      label: t("curia.website"),
      value: "https://dioceseofdaet.ph",
      action: () => Linking.openURL("https://dioceseofdaet.ph"),
    },
    {
      icon: "location-outline",
      label: t("curia.officeLocation"),
      value: t("curia.officeAddressVal"),
    },
  ];

  const ministries = [
    {
      title: language === "tl" ? "Komisyon sa Katesismo at Edukasyon" : "Commission on Catechesis & Education",
      desc: language === "tl" ? "Paghuhubog sa pananampalataya at edukasyong panrelihiyon sa mga parokya" : "Faith formation and parish religious education across all vicariates",
    },
    {
      title: language === "tl" ? "Komisyon sa Liturhiya" : "Commission on Liturgy",
      desc: language === "tl" ? "Pamamahala sa banal na liturhiya at mga sagradong pagdiriwang (Pinamumunuan ni Fr. Noel Domingo)" : "Oversight of sacred liturgy and diocesan celebrations (Chaired by Fr. Noel Domingo)",
    },
    {
      title: language === "tl" ? "Diyosesanong Ministri sa Kabataan (DYM)" : "Diocesan Youth Ministry (DYM)",
      desc: language === "tl" ? "Pagpapalakas sa kabataan sa mga parokya at pamayanang pang-kampus" : "Empowering young Catholics in parishes and campus communities",
    },
    {
      title: language === "tl" ? "Social Action Center (SAC)" : "Social Action Center (SAC)",
      desc: language === "tl" ? "Gawaing pangkawanggawa, tulong sa sakuna, at pag-unlad ng pamayanan" : "Charitable works, relief missions, and community integral human development",
    },
    {
      title: language === "tl" ? "Ministri sa Pamilya at Buhay" : "Family and Life Ministry",
      desc: language === "tl" ? "Suporta, pagpapalago sa kasal, at pagtataguyod sa pamilyang Katoliko" : "Marriage enrichment and pastoral support for Christian families",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header with Language Toggle */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="information-circle" size={24} color={COLORS.gold} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t("header.curiaTitle")}</Text>
            <Text style={styles.subtitle}>{t("header.curiaSub")}</Text>
          </View>
          <LanguageToggle compact />
        </View>
      </View>

      <View style={styles.contentWrap}>
        {/* Bishop Profile Card */}
        <View style={styles.bishopCard}>
          <View style={styles.bishopAvatar}>
            <Ionicons name="person" size={36} color={COLORS.crimson} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.bishopRole}>{t("curia.bishopRole")}</Text>
            <Text style={styles.bishopName}>{t("curia.bishopName")}</Text>
            <Text style={styles.bishopSub}>{t("curia.bishopCathedral")}</Text>
          </View>
        </View>

        {/* Chancery Contacts */}
        <Text style={styles.sectionHeader}>{t("curia.chanceryHeader")}</Text>
        <View style={styles.card}>
          {contactItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.contactRow, idx < contactItems.length - 1 && styles.borderBottom]}
              onPress={item.action}
              disabled={!item.action}
            >
              <Ionicons name={item.icon} size={20} color={COLORS.crimson} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>{item.label}</Text>
                <Text style={styles.contactValue}>{item.value}</Text>
              </View>
              {item.action ? <Ionicons name="chevron-forward" size={16} color="#aaa" /> : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* Diocesan Ministries */}
        <Text style={styles.sectionHeader}>{t("curia.ministriesHeader")}</Text>
        <View style={styles.card}>
          {ministries.map((min, idx) => (
            <View key={idx} style={[styles.ministryRow, idx < ministries.length - 1 && styles.borderBottom]}>
              <Text style={styles.ministryTitle}>{min.title}</Text>
              <Text style={styles.ministryDesc}>{min.desc}</Text>
            </View>
          ))}
        </View>

        {/* App Version Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("curia.versionInfo")}</Text>
          <Text style={styles.footerSub}>{t("curia.poweredBy")}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    maxWidth: 600,
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
  bishopCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bishopAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  bishopRole: { fontSize: 12, textTransform: "uppercase", color: COLORS.crimson, fontWeight: "700" },
  bishopName: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginTop: 2 },
  bishopSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  sectionHeader: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  contactLabel: { fontSize: 12, color: COLORS.textMuted },
  contactValue: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginTop: 1 },
  ministryRow: {
    padding: 14,
  },
  ministryTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  ministryDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 3 },
  footer: { alignItems: "center", marginVertical: 10 },
  footerText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  footerSub: { fontSize: 12, color: "#aaa", marginTop: 2 },
});
