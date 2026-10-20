// src/services/parishService.js
/**
 * Parish Data Service
 * 
 * Provides dynamic data loading from the Diocese REST API (connected to TiDB Cloud / MySQL)
 * with automatic fallback to verified local data (PARISHES_DATA) for 100% offline uptime.
 * 
 * When the database or API URL changes, simply update EXPO_PUBLIC_API_URL in .env.
 */

import { ENV } from "../config/env.js";
import { PARISHES_DATA } from "../data/parishesData.js";

let cachedParishes = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

/**
 * Normalizes an API parish item from DBdesign.sql / Vercel API
 * into the shape expected by mobile screens.
 */
function normalizeParish(item, index) {
  // Parse mass schedules into quick groups for ScheduleScreen and ParishDetailScreen
  const sunday = [];
  const saturdayVigil = [];
  const weekdays = [];

  if (Array.isArray(item.massSchedules)) {
    item.massSchedules.forEach((ms) => {
      const day = (ms.day || "").toLowerCase();
      const times = Array.isArray(ms.times) ? ms.times : [];
      if (day.includes("sun")) {
        sunday.push(...times);
      } else if (day.includes("sat") || day.includes("vigil") || day.includes("anticipated")) {
        saturdayVigil.push(...times);
      } else {
        weekdays.push(...times);
      }
    });
  }

  // Find local match if exists to keep custom curated translations
  const localMatch = PARISHES_DATA.find(
    (lp) =>
      lp.id === item.id ||
      (lp.name && item.name && lp.name.toLowerCase().trim() === item.name.toLowerCase().trim()) ||
      (lp.municipality && item.city && lp.municipality.toLowerCase() === item.city.toLowerCase())
  );

  const mainClergy = Array.isArray(item.clergy) && item.clergy.length > 0 ? item.clergy[0] : null;

  return {
    id: item.id || (index + 1),
    name: item.name || localMatch?.name || "Parish Church",
    altName: localMatch?.altName || "",
    slug: item.slug || "",
    municipality: item.city || localMatch?.municipality || "Camarines Norte",
    vicariate: item.vicariate || localMatch?.vicariate || "Diocese of Daet",
    established: item.establishedYear ? `Est. ${item.establishedYear}` : (localMatch?.established || ""),
    patron: item.patronSaint || item.patron_saint || localMatch?.patron || "",
    feastDay: item.feastDay || item.feast_day || localMatch?.feastDay || "",
    tagline: item.tagline || localMatch?.tagline || {
      en: "“A Eucharistic community in the Diocese of Daet.”",
      tl: "“Isang pamayanang Eukaristiko sa Diyosesis ng Daet.”",
    },
    address: item.address || localMatch?.address || "Camarines Norte",
    phone: item.phone || localMatch?.phone || "",
    email: item.email || "",
    officeHours: item.officeHours || "",
    lat: typeof item.lat === "number" ? item.lat : (parseFloat(item.lat) || localMatch?.lat || 14.1124),
    lng: typeof item.lng === "number" ? item.lng : (parseFloat(item.lng) || localMatch?.lng || 122.9553),
    heroImage: item.coverPhotoUrl || item.cover_photo_url || localMatch?.heroImage || "https://images.unsplash.com/photo-1548625361-12c8b030b656?w=800",
    logoImage: item.logoUrl || item.logo_url || localMatch?.logoImage || null,
    priest: {
      name: item.pastor || mainClergy?.name || localMatch?.priest?.name || "Rev. Fr. Assigned Pastor",
      role: mainClergy?.role || localMatch?.priest?.role || "Parish Priest",
      roleTl: mainClergy?.role || localMatch?.priest?.roleTl || "Kura Paroko",
      photo: mainClergy?.photoUrl || localMatch?.priest?.photo || "",
      verified: true,
      statusNote: mainClergy?.biography || localMatch?.priest?.statusNote || "",
    },
    clergy: Array.isArray(item.clergy) ? item.clergy : (localMatch?.clergy || []),
    masses: {
      sunday: sunday.length > 0 ? sunday : (localMatch?.masses?.sunday || ["6:00 AM", "8:00 AM", "5:00 PM"]),
      saturdayVigil: saturdayVigil.length > 0 ? saturdayVigil : (localMatch?.masses?.saturdayVigil || ["5:30 PM (Anticipated)"]),
      weekdays: weekdays.length > 0 ? weekdays : (localMatch?.masses?.weekdays || ["6:00 AM"]),
    },
    massSchedules: item.massSchedules || [],
    reconciliation: item.confessionSchedule || localMatch?.reconciliation || {
      en: "Saturday: 4:00 PM – 5:00 PM; Sunday: 30 minutes before Mass",
      tl: "Sabado: 4:00 PM – 5:00 PM; Linggo: 30 minuto bago ang Misa",
    },
    adoration: item.adorationSchedule || localMatch?.adoration || {
      en: "Every First Friday at 6:00 PM",
      tl: "Tuwing Unang Biyernes ng buwan ganap na 6:00 PM",
    },
    aboutHistory: item.aboutHistory || localMatch?.aboutHistory || "",
    givingInfo: item.givingInfo || localMatch?.givingInfo || "",
    announcements: item.announcements || [],
    sacramentsInfo: item.sacramentsInfo || null,
    sacramantalBooks: item.sacramantalBooks || [],
  };
}

/**
 * Fetches all parishes from the live API endpoint.
 * Returns cached data or falls back to PARISHES_DATA on network/API failure.
 */
export async function getParishes(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedParishes && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedParishes;
  }

  try {
    const url = `${ENV.API_BASE_URL}/parishes`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedParishes = data.map((item, idx) => normalizeParish(item, idx));
        lastFetchTime = now;
        return cachedParishes;
      }
    }
  } catch (error) {
    // Network error, timeout, or offline - seamlessly use fallback
    console.warn("Live API unavailable, using offline fallback data:", error?.message || error);
  }

  // Graceful fallback to verified local dataset
  if (!cachedParishes) {
    cachedParishes = PARISHES_DATA;
  }
  return cachedParishes;
}

/**
 * Clear in-memory cache to trigger fresh fetch
 */
export function invalidateParishesCache() {
  cachedParishes = null;
  lastFetchTime = 0;
}
