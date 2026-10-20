// App.js – entry point for the Expo app
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider } from "./src/i18n/LanguageContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import AppNavigator from "./src/navigation";

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <AppNavigator />
        </FavoritesProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
