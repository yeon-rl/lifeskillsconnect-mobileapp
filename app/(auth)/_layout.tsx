import { useOnboarding } from "@/context/OnboardingContext";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const { hasCompletedLanguageSelection } = useOnboarding();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={
        hasCompletedLanguageSelection ? "login" : "language-selection"
      }
    >
      <Stack.Screen name="language-selection" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
