import { ThemedText } from "@/components/themed-text";
import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/context/ThemeContext";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { authService } from "@/services/api/apiServices";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

// type Language = "en" | "es" | "fr" | "de" | "pt";

interface LanguageOption {
  code: string;
  name: string;
  flag?: string;
}

// const languages: LanguageOption[] = [
//   { code: "en", name: "English", flag: "🇺🇸" },
//   { code: "es", name: "Español", flag: "🇪🇸" },
//   { code: "fr", name: "Français", flag: "🇫🇷" },
//   { code: "de", name: "Deutsch", flag: "🇩🇪" },
//   { code: "pt", name: "Português", flag: "🇵🇹" },
// ];

export default function LanguageSelectionScreen() {
  const { setSelectedLanguage, setHasCompletedLanguageSelection, hasCompletedLanguageSelection } = useOnboarding();
  const router = useRouter();
  
  const [apiLanguages, setApiLanguages] = useState<LanguageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string>("en");

  const colors = useThemedColors();
  const { setThemeMode } = useTheme();

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await authService.getLanguages();
        // Assuming response is an array or object containing the array
        const languagesData = Array.isArray(response) ? response : response.languages || [];
        setApiLanguages(languagesData);
        if (languagesData.length > 0) {
          setSelectedLang(languagesData[0].code);
        }
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  if (hasCompletedLanguageSelection) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleSelectLanguage = (language: string) => {
    setSelectedLang(language);
  };

  const handleContinue = () => {
    setSelectedLanguage(selectedLang as any);
    setHasCompletedLanguageSelection(true);
    router.push("/(auth)/login");
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View className="pt-12 pb-8 px-6 mt-12">
        <ThemedText
          className="text-3xl font-bold text-black"
          style={{ fontSize: 24 }}
        >
          Preferred Language 🏳️
        </ThemedText>
        <ThemedText
          className="text-sm text-gray-700 mt-2"
          style={{ fontSize: 14, color: colors.gray700 }}
        >
          Select your preferred language.
        </ThemedText>
      </View>

      {/* <Pressable onPress={() => setThemeMode("dark")}>
        <ThemedText>🌙 Dark</ThemedText>
      </Pressable>

      <Pressable onPress={() => setThemeMode("light")}>
        <ThemedText>☀️ Light</ThemedText>
      </Pressable> */}

      {/* Language List */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="gap-3 pb-8">
          {loading ? (
            <View className="py-20">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            apiLanguages.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => handleSelectLanguage(lang.code)}
                className={`flex-row items-center p-4 rounded-lg border ${
                  selectedLang === lang.code
                    ? "bg-splash border-splash"
                    : "bg-white border-gray-300"
                }`}
              >
                <ThemedText className="text-2xl mr-4">{lang.flag || "🌐"}</ThemedText>
                <ThemedText
                  style={{
                    color: selectedLang === lang.code ? "white" : "black",
                  }}
                  className={`text-base font-semibold flex-1 flex-wrap ${
                    selectedLang === lang.code ? "text-white" : "text-[#8C8C8C]!"
                  }`}
                >
                  {lang.name}
                </ThemedText>
                {selectedLang === lang.code && (
                  <ThemedText
                    className="text-white text-xl"
                    style={{ color: "white" }}
                  >
                    ✓
                  </ThemedText>
                )}
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="pb-12 px-6">
        <Pressable
          onPress={handleContinue}
          className="bg-splash rounded-lg py-4 items-center"
        >
          <ThemedText
            className="text-white font-semibold text-base"
            style={{ color: "white" }}
          >
            Continue
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
