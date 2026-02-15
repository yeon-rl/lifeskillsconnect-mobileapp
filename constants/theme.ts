/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

// Primary brand colors (same in both modes)
const primaryGreen = "#5A7C65";
const black = "#000000";
const white = "#ffffff";

export const Colors = {
  light: {
    text: "#000",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    textSecondary: "#8C8C8C",
    tabBackground: "#ffffff",
    // App-specific colors
    primary: primaryGreen,
    primaryDark: primaryGreen,
    black: black,
    white: white,
    gray300: "#778497ff",
    gray250: "#7784974a",
    gray700: "#374151",
    transparent: "transparent",
    input: "#5a7c650a",
    input50: "#5A7C6540",
    error: "#FF3B30",
    green: "#5A7C65",
    tagBg: "#4A90E252",
    tag: "#4285F4",
    bglight10: "#5A7C651A",
    bglight01: "#5A7C6505",
    inputBg: "#5a7c6515",
    backgroundBg: "#5A7C6505",
    modalBg: "#ffffff"
  },
  dark: {
    text: "#ECEDEE",
    background: "#010A0F",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    textSecondary: "#8C8C8C",
    tabBackground: "#263238",
    gray250: "#7784974a",
    // App-specific colors (same brand colors in dark mode)
    primary: primaryGreen,
    primaryDark: primaryGreen,
    black: black,
    white: white,
    gray300: "#4b5563",
    gray700: "#a1a9b3",
    input: "#5A7C6505", 
    input50: "#5A7C6540",
    transparent: "transparent",
    error: "#FF3B30",
    green: "#5A7C65",
    tagBg: "#4A90E252",
    tag: "#4285F4",
    bglight10: "#5A7C651A",
    bglight01: "#5A7C6505",
    inputBg: "#5A7C6526",
    backgroundBg: "#5A7C6526",
    modalBg: "#090C0A"
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
