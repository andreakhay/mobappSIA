// src/i18n/LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import { translations } from "./translations";

const STORAGE_KEY = "diocese_app_language_preference";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "tl") return saved;
    }
    return "en";
  });

  const setLanguage = (lang) => {
    if (lang === "en" || lang === "tl") {
      setLanguageState(lang);
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_KEY, lang);
        } catch (_) {}
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tl" : "en");
  };

  // Helper function to resolve dot-notated translation keys (e.g. "nav.home")
  const t = (path) => {
    if (!path) return "";
    const keys = path.split(".");
    
    // Check in current language dictionary
    let result = translations[language];
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        result = null;
        break;
      }
    }

    if (result !== null && result !== undefined) {
      return result;
    }

    // Fallback to English dictionary
    let fallback = translations.en;
    for (const key of keys) {
      if (fallback && fallback[key] !== undefined) {
        fallback = fallback[key];
      } else {
        return path; // Fallback to raw key if not found
      }
    }

    return fallback !== null && fallback !== undefined ? fallback : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export default LanguageContext;
