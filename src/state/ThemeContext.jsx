// src/state/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();
const THEME_KEY = "app:theme-gradient";

// Export preset theme gradients so other components (TopBar, ColorPicker) can import them.
export const PRESET_THEMES = {
  // your current default (deep navy → purple)
  current: "linear-gradient(180deg,#071129 0%, #0b1220 100%)",
    green: "linear-gradient(180deg,#134E5E 0%, #71B280 100%)",
  lightblue: "linear-gradient(180deg,#3a7bd5 0%, #3a6073 100%)",



  // light blue

};

// ThemeProvider: manages current theme, applies CSS var --bg-gradient and persists choice.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || PRESET_THEMES.indigo;
    } catch (e) {
      return PRESET_THEMES.indigo;
    }
  });

  // apply CSS variable and persist to localStorage whenever theme changes
  useEffect(() => {
    try {
      document.documentElement.style.setProperty("--bg-gradient", theme);
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // ignore (e.g. SSR or restricted env)
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, PRESET_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}