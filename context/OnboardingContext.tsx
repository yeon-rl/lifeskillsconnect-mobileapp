import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type Language = "en" | "es" | "fr" | "de" | "pt";

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  hasCompletedLanguageSelection: boolean;
  selectedLanguage: Language | null;
  setHasCompletedOnboarding: (value: boolean) => void;
  setHasCompletedLanguageSelection: (value: boolean) => void;
  setSelectedLanguage: (language: Language) => void;
  isHydrated: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] =
    useState<boolean>(false);
  const [hasCompletedLanguageSelection, setHasCompletedLanguageSelection] =
    useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null
  );
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Initialize from storage on app start
  useEffect(() => {
    const initializeOnboarding = async () => {
      try {
        const keys = [
          "hasCompletedOnboarding",
          "selectedLanguage",
          "hasCompletedLanguageSelection",
        ];
        const stores = await AsyncStorage.multiGet(keys);
        const map = Object.fromEntries(stores);

        const savedOnboarding = map["hasCompletedOnboarding"];
        const savedLanguage = map["selectedLanguage"];
        const savedLanguageSelection = map["hasCompletedLanguageSelection"];

        console.log("[OnboardingContext] Loaded values:", {
          savedOnboarding,
          savedLanguage,
          savedLanguageSelection,
        });

        if (savedOnboarding === "true") {
          setHasCompletedOnboarding(true);
        }
        
        if (savedLanguageSelection === "true") {
          setHasCompletedLanguageSelection(true);
        }

        if (savedLanguage) {
          setSelectedLanguage(savedLanguage as Language);
        } else {
          setSelectedLanguage("en");
        }
      } catch (error) {
        console.error("[OnboardingContext] Failed to load onboarding status:", error);
      } finally {
        setIsHydrated(true);
      }
    };

    initializeOnboarding();
  }, []);


  const handleSetHasCompletedOnboarding = async (value: boolean) => {
    try {
      setHasCompletedOnboarding(value);
      await AsyncStorage.setItem("hasCompletedOnboarding", String(value));
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
    }
  };

  const handleSetHasCompletedLanguageSelection = async (value: boolean) => {
    try {
      setHasCompletedLanguageSelection(value);
      await AsyncStorage.setItem("hasCompletedLanguageSelection", String(value));
    } catch (error) {
      console.error("Failed to save language selection status:", error);
    }
  };

  const handleSetSelectedLanguage = async (language: Language) => {
    try {
      setSelectedLanguage(language);
      await AsyncStorage.setItem("selectedLanguage", language);
    } catch (error) {
      console.error("Failed to save language choice:", error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        hasCompletedLanguageSelection,
        selectedLanguage,
        setHasCompletedOnboarding: handleSetHasCompletedOnboarding,
        setHasCompletedLanguageSelection: handleSetHasCompletedLanguageSelection,
        setSelectedLanguage: handleSetSelectedLanguage,
        isHydrated,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
