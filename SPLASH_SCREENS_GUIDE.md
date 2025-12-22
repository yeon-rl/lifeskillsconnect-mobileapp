# Custom Splash Screens Implementation

This implementation provides two different custom splash screens for normal and premium users in your Life Skills Connect app.

## Files Created

### 1. **Context**
- `context/UserContext.tsx` - React Context for managing user premium status globally

### 2. **Splash Screen Components**
- `components/splash-screens/NormalUserSplash.tsx` - Splash screen for normal users
- `components/splash-screens/PremiumUserSplash.tsx` - Splash screen for premium users
- `components/splash-screens/SplashScreenWrapper.tsx` - Wrapper component that displays appropriate splash based on user type
- `components/splash-screens/index.tsx` - Barrel export for splash components

### 3. **Utilities**
- `utils/premium.ts` - Helper functions for managing user premium status (integrate with your backend)

## How to Use

### 1. Setting User Premium Status

In your authentication or user profile screen:

```tsx
import { useUser } from '@/context/UserContext';
import { upgradeUserToPremium } from '@/utils/premium';

export function YourComponent() {
  const { setIsPremium } = useUser();

  const handleUpgrade = async () => {
    const success = await upgradeUserToPremium(userId);
    if (success) {
      setIsPremium(true);
    }
  };

  return (
    <button onPress={handleUpgrade}>
      Upgrade to Premium
    </button>
  );
}
```

### 2. Checking User Premium Status

```tsx
import { useUser } from '@/context/UserContext';

export function YourComponent() {
  const { isPremium } = useUser();

  return (
    <View>
      {isPremium ? (
        <Text>Premium user features</Text>
      ) : (
        <Text>Regular user features</Text>
      )}
    </View>
  );
}
```

## Customization

### Splash Screen Duration
Modify the `splashDuration` prop in `app/_layout.tsx`:

```tsx
<SplashScreenWrapper
  onSplashHide={() => setSplashComplete(true)}
  splashDuration={3000} // 3 seconds
/>
```

### Styling
Edit the style sheets in each splash screen component:
- `components/splash-screens/NormalUserSplash.tsx` - Normal user styles
- `components/splash-screens/PremiumUserSplash.tsx` - Premium user styles

### Colors and Assets
- Normal splash uses white background with dark text
- Premium splash uses dark background (#0F0F1E) with gold accents (#FFD700)
- Icons use your app's icon.png from assets

## Backend Integration

Update the functions in `utils/premium.ts` to connect with your actual backend:

```tsx
export async function upgradeUserToPremium(userId: string): Promise<boolean> {
  const response = await fetch(`/api/users/${userId}/upgrade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.ok;
}
```

## Features

- ✅ Conditional splash screen rendering based on user type
- ✅ Smooth animations using react-native-reanimated
- ✅ Global state management with Context API
- ✅ TypeScript support
- ✅ Easy to customize colors and content
- ✅ Ready for backend integration

## Next Steps

1. Design and add custom splash images for both user types (optional)
2. Integrate your authentication system
3. Connect premium status checks to your backend
4. Test splash screen transitions between user types
5. Customize colors and text to match your brand
