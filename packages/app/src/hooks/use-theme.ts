import { useState, useEffect, useCallback } from 'react';

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

const KEY = 'simple-upload-theme';

export const useTheme = (defaultTheme: Theme = Theme.LIGHT) => {
  const isBrowser = globalThis.window !== undefined;
  const [theme, setTheme] = useState<Theme>(() => {
    if (!isBrowser) return defaultTheme;

    const saved = localStorage.getItem(KEY) as Theme | null;
    if (saved) return saved;

    return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches
      ? Theme.DARK
      : Theme.LIGHT;
  });

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = theme;

    try {
      localStorage.setItem(KEY, theme);
    } catch (error) {
      console.error(error);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === Theme.DARK ? Theme.LIGHT : Theme.DARK));
  }, []);

  return { theme, toggleTheme };
};
