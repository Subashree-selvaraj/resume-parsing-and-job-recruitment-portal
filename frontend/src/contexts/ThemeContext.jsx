import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme configuration
const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#0f172a',
        secondary: '#64748b',
        muted: '#94a3b8',
      },
      border: '#e2e8f0',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      background: '#0f172a',
      surface: '#1e293b',
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        muted: '#64748b',
      },
      border: '#334155',
    },
  },
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [systemTheme, setSystemTheme] = useState('light');

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setSystemTheme(prefersDark ? 'dark' : 'light');
    
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setCurrentTheme(savedTheme);
    } else {
      setCurrentTheme('system');
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = currentTheme === 'system' ? systemTheme : currentTheme;
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(effectiveTheme);
    
    // Set data attribute for CSS
    root.setAttribute('data-theme', effectiveTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = themes[effectiveTheme].colors.primary;
    }
  }, [currentTheme, systemTheme]);

  // Change theme function
  const setTheme = (theme) => {
    if (['light', 'dark', 'system'].includes(theme)) {
      setCurrentTheme(theme);
      localStorage.setItem('theme', theme);
    }
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const effectiveTheme = currentTheme === 'system' ? systemTheme : currentTheme;
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Get current effective theme
  const getEffectiveTheme = () => {
    return currentTheme === 'system' ? systemTheme : currentTheme;
  };

  // Check if current theme is dark
  const isDark = () => {
    return getEffectiveTheme() === 'dark';
  };

  // Get theme colors
  const getThemeColors = () => {
    return themes[getEffectiveTheme()].colors;
  };

  // Get CSS custom properties for current theme
  const getCSSProperties = () => {
    const colors = getThemeColors();
    return {
      '--color-primary': colors.primary,
      '--color-secondary': colors.secondary,
      '--color-success': colors.success,
      '--color-warning': colors.warning,
      '--color-error': colors.error,
      '--color-background': colors.background,
      '--color-surface': colors.surface,
      '--color-text-primary': colors.text.primary,
      '--color-text-secondary': colors.text.secondary,
      '--color-text-muted': colors.text.muted,
      '--color-border': colors.border,
    };
  };

  // Theme variants for different UI states
  const getVariant = (variant) => {
    const colors = getThemeColors();
    
    const variants = {
      primary: {
        background: colors.primary,
        color: '#ffffff',
        border: colors.primary,
      },
      secondary: {
        background: colors.secondary,
        color: '#ffffff',
        border: colors.secondary,
      },
      success: {
        background: colors.success,
        color: '#ffffff',
        border: colors.success,
      },
      warning: {
        background: colors.warning,
        color: '#ffffff',
        border: colors.warning,
      },
      error: {
        background: colors.error,
        color: '#ffffff',
        border: colors.error,
      },
      outline: {
        background: 'transparent',
        color: colors.text.primary,
        border: colors.border,
      },
      ghost: {
        background: 'transparent',
        color: colors.text.primary,
        border: 'transparent',
      },
    };

    return variants[variant] || variants.primary;
  };

  // Accessibility helpers
  const getContrastColor = (backgroundColor) => {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  // Animation preferences
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Font size preferences
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize && ['small', 'medium', 'large'].includes(savedFontSize)) {
      setFontSize(savedFontSize);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    
    root.style.fontSize = fontSizeMap[fontSize];
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  // High contrast mode
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    setHighContrast(savedHighContrast);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    localStorage.setItem('highContrast', highContrast.toString());
  }, [highContrast]);

  // Context value
  const value = {
    // Current theme state
    currentTheme,
    systemTheme,
    effectiveTheme: getEffectiveTheme(),
    
    // Theme functions
    setTheme,
    toggleTheme,
    isDark,
    
    // Theme data
    themes,
    colors: getThemeColors(),
    cssProperties: getCSSProperties(),
    
    // Utilities
    getVariant,
    getContrastColor,
    
    // Accessibility
    prefersReducedMotion,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;