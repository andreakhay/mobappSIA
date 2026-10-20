// src/context/FavoritesContext.js
// Lightweight, client-side local bookmarking for view-only use
import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";

const STORAGE_KEY = "diocese_favorite_parishes";

const FavoritesContext = createContext({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
});

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    // Default bookmark: Paracale (Parish of Our Lady of the Candle)
    return [1];
  });

  const toggleFavorite = (parishId) => {
    setFavorites((prev) => {
      let updated;
      if (prev.includes(parishId)) {
        updated = prev.filter((id) => id !== parishId);
      } else {
        updated = [...prev, parishId];
      }
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (_) {}
      }
      return updated;
    });
  };

  const isFavorite = (parishId) => favorites.includes(parishId);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}

export default FavoritesContext;
