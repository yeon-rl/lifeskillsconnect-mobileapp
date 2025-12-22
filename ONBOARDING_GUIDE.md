# Onboarding & Language Selection Implementation

## Overview
Complete onboarding flow with 3 screens, language selection, and conditional navigation based on first-time user status.

## File Structure

### Context
- `context/OnboardingContext.tsx` - Manages onboarding state and language selection globally

### Onboarding Screens
- `components/onboarding/OnboardingStep1.tsx` - First onboarding screen with "Let's Go" button
- `components/onboarding/OnboardingStep2.tsx` - Second onboarding screen with "Next" button
- `components/onboarding/OnboardingStep3.tsx` - Third onboarding screen with "Get Started" button
- `components/onboarding/OnboardingScreen.tsx` - Base onboarding screen component
- `app/(onboarding)/index.tsx` - Onboarding flow container
- `app/(onboarding)/_layout.tsx` - Onboarding stack layout

### Auth Flow
- `app/(auth)/language-selection.tsx` - Language selection screen (5 languages supported)
- `app/(auth)/login.tsx` - Login screen
- `app/(auth)/_layout.tsx` - Auth stack layout

### Updated Files
- `app/_layout.tsx` - Updated root layout with conditional navigation

## Navigation Flow

### First Time User (No Onboarding Completed)
```
Splash Screen (2.5s)
    ↓
Onboarding Step 1 (Let's Go)
    ↓
Onboarding Step 2 (Next)
    ↓
Onboarding Step 3 (Get Started)
    ↓
Language Selection Screen
    ↓
Login Screen
```

### Returning User (Onboarding Already Completed)
```
Splash Screen (2.5s)
    ↓
Login Screen
```

## Features

### Each Onboarding Screen
- ✅ Skip button at top-right to skip onboarding
- ✅ Different button text for each step
  - Step 1: "Let's Go"
  - Step 2: "Next"
  - Step 3: "Get Started"
- ✅ NativeWind CSS styling with #5A7C65 background
- ✅ Smooth animations with react-native-reanimated

### Language Selection
- ✅ 5 language options: English, Spanish, French, German, Portuguese
- ✅ Visual flag indicators for each language
- ✅ Selected language highlight
- ✅ Stores selected language in context

### Persistent State
- ✅ Tracks if user has completed onboarding
- ✅ Stores selected language preference
- ✅ Conditional navigation based on completion status
- ✅ Ready for AsyncStorage/backend integration

## Usage

### Checking Onboarding Status
```tsx
import { useOnboarding } from '@/context/OnboardingContext';

export function MyComponent() {
  const { hasCompletedOnboarding, selectedLanguage } = useOnboarding();
  
  return (
    <View>
      {hasCompletedOnboarding && <Text>Welcome back!</Text>}
      <Text>Language: {selectedLanguage}</Text>
    </View>
  );
}
```

### Setting Language
```tsx
const { setSelectedLanguage } = useOnboarding();
setSelectedLanguage('es'); // Set to Spanish
```

## Persistence Integration (TODO)

The context is currently set up for easy integration with AsyncStorage or your backend:

1. **For AsyncStorage** (React Native):
```tsx
// In OnboardingContext.tsx useEffect
const storedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
if (storedOnboarding) {
  setHasCompletedOnboarding(JSON.parse(storedOnboarding));
}
```

2. **For Backend**:
```tsx
// Fetch from your API
const response = await fetch('/api/user/onboarding-status');
const data = await response.json();
setHasCompletedOnboarding(data.completed);
```

## Customization

### Button Colors
Edit the Tailwind classes in each step file (currently `bg-black`)

### Languages Offered
Edit the `languages` array in `app/(auth)/language-selection.tsx`

### Onboarding Screen Content
Edit title and description text in each step component

### Background Color
Currently using `bg-splash` (#5A7C65) - defined in `tailwind.config.js`

## Notes
- Skip button on any onboarding screen bypasses to language selection
- After language selection, user goes to login screen
- Next time app opens, user goes directly to login (if onboarding completed)
- All screens use NativeWind CSS classes (no StyleSheet)
- Animations use react-native-reanimated for smooth transitions
