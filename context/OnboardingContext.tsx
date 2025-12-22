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
  selectedLanguage: Language | null;
  setHasCompletedOnboarding: (value: boolean) => void;
  setSelectedLanguage: (language: Language) => void;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] =
    useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from storage on app start
  useEffect(() => {
    const initializeOnboarding = async () => {
      try {
        // TODO: Load from AsyncStorage or your backend
        // For now, default to not completed
        setHasCompletedOnboarding(false);
        setSelectedLanguage("en");
      } catch (error) {
        console.error("Failed to load onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeOnboarding();
  }, []);

  const handleSetHasCompletedOnboarding = (value: boolean) => {
    setHasCompletedOnboarding(value);
    // TODO: Persist to storage
  };

  const handleSetSelectedLanguage = (language: Language) => {
    setSelectedLanguage(language);
    // TODO: Persist to storage
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        selectedLanguage,
        setHasCompletedOnboarding: handleSetHasCompletedOnboarding,
        setSelectedLanguage: handleSetSelectedLanguage,
        isLoading,
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
