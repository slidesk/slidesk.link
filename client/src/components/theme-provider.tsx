import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "slidesk-theme";

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => null,
});

const systemPrefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system",
  );

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark =
        theme === "dark" || (theme === "system" && systemPrefersDark());
      root.classList.toggle("dark", dark);
    };
    apply();
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  const setTheme = (next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeProviderContext);
