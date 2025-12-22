import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

export function useThemedColors() {
  const { isDark } = useTheme();
  return isDark ? Colors.dark : Colors.light;
}

export function useColorScheme() {
  const { isDark } = useTheme();
  return isDark ? "dark" : "light";
}
