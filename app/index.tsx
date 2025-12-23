import { useOnboarding } from "@/context/OnboardingContext";
import { useUserStore } from "@/store/userStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { hasCompletedOnboarding, hasCompletedLanguageSelection, isHydrated } = useOnboarding();
  const { isAuthenticated } = useUserStore();

  // Ideally loading state is handled in _layout, but safe checks here
  if (!isHydrated) {
      return null; // Or a loader, but _layout covers this
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (!hasCompletedLanguageSelection) {
    return <Redirect href="/(auth)/language-selection" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
