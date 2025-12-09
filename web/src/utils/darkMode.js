// Dark Mode Utility
// Auto-switch: 6am-8pm light, 8pm-6am dark
// Always dark during navigation

export const isDarkModeTime = () => {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 6; // 8pm to 6am is dark mode
};

export const shouldUseDarkMode = (isNavigating = false) => {
  if (isNavigating) {
    return true; // Always dark during navigation
  }
  return isDarkModeTime();
};

export const initializeDarkMode = (isNavigating = false) => {
  const useDarkMode = shouldUseDarkMode(isNavigating);
  
  if (useDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return useDarkMode;
};

export const toggleDarkMode = (force = null) => {
  if (force !== null) {
    if (force) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return force;
  }
  
  const isDark = document.documentElement.classList.toggle('dark');
  return isDark;
};

export default {
  isDarkModeTime,
  shouldUseDarkMode,
  initializeDarkMode,
  toggleDarkMode,
};
