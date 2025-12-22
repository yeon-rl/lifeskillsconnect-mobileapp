# Migration Guide: Context API → Zustand

This guide will help you migrate from React Context API to Zustand stores.

## 📋 Migration Checklist

- [ ] Update `_layout.tsx` to remove Context Providers
- [ ] Update components using `useUser()` to use `useUserStore()`
- [ ] Update components using `useOnboarding()` to use `useOnboardingStore()`
- [ ] Update components using `useTheme()` to use `useThemeStore()` and `useIsDark()`
- [ ] Test all authentication flows
- [ ] Test onboarding flow
- [ ] Test theme switching
- [ ] Verify data persistence

## 🔄 Step-by-Step Migration

### Step 1: Update `_layout.tsx`

**Before:**
```tsx
export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <UserProvider>
        <OnboardingProvider>
          <GluestackUIProvider mode="dark">
            <RootLayoutNav />
          </GluestackUIProvider>
        </OnboardingProvider>
      </UserProvider>
    </CustomThemeProvider>
  );
}
```

**After:**
```tsx
export default function RootLayout() {
  return (
    <GluestackUIProvider mode="dark">
      <RootLayoutNav />
    </GluestackUIProvider>
  );
}
```

**Also update `RootLayoutNav`:**

**Before:**
```tsx
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboarding();
  // ...
}
```

**After:**
```tsx
import { useOnboardingStore } from '@/store';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const hasCompletedOnboarding = useOnboardingStore(
    (state) => state.hasCompletedOnboarding
  );
  const onboardingLoading = useOnboardingStore((state) => state.isLoading);
  // ...
}
```

---

### Step 2: Update User Context Usage

**Before:**
```tsx
import { useUser } from '@/context/UserContext';

function Component() {
  const { isPremium, setIsPremium } = useUser();
  
  return (
    <View>
      <Text>{isPremium ? 'Premium' : 'Free'}</Text>
      <Button onPress={() => setIsPremium(true)}>Upgrade</Button>
    </View>
  );
}
```

**After:**
```tsx
import { useUserStore } from '@/store';

function Component() {
  const isPremium = useUserStore((state) => state.currentUser?.is_premium ?? false);
  const updateUser = useUserStore((state) => state.updateUser);
  
  return (
    <View>
      <Text>{isPremium ? 'Premium' : 'Free'}</Text>
      <Button onPress={() => updateUser({ is_premium: true })}>Upgrade</Button>
    </View>
  );
}
```

**Or use the custom hook:**
```tsx
import { usePremiumStatus } from '@/hooks/useStores';

function Component() {
  const { isPremium, setPremiumStatus } = usePremiumStatus();
  
  return (
    <View>
      <Text>{isPremium ? 'Premium' : 'Free'}</Text>
      <Button onPress={() => setPremiumStatus(true)}>Upgrade</Button>
    </View>
  );
}
```

---

### Step 3: Update Onboarding Context Usage

**Before:**
```tsx
import { useOnboarding } from '@/context/OnboardingContext';

function OnboardingScreen() {
  const { 
    hasCompletedOnboarding, 
    selectedLanguage,
    setHasCompletedOnboarding,
    setSelectedLanguage 
  } = useOnboarding();
  
  const completeOnboarding = () => {
    setSelectedLanguage('en');
    setHasCompletedOnboarding(true);
  };
}
```

**After:**
```tsx
import { useOnboardingStore } from '@/store';

function OnboardingScreen() {
  const { 
    hasCompletedOnboarding, 
    selectedLanguage,
    setHasCompletedOnboarding,
    setSelectedLanguage 
  } = useOnboardingStore();
  
  const completeOnboarding = () => {
    setSelectedLanguage('en');
    setHasCompletedOnboarding(true);
  };
}
```

---

### Step 4: Update Theme Context Usage

**Before:**
```tsx
import { useTheme } from '@/context/ThemeContext';

function SettingsScreen() {
  const { themeMode, setThemeMode, isDark } = useTheme();
  
  return (
    <View style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
      <Button onPress={() => setThemeMode('dark')}>Dark Mode</Button>
    </View>
  );
}
```

**After:**
```tsx
import { useThemeStore, useIsDark } from '@/store';

function SettingsScreen() {
  const { themeMode, setThemeMode } = useThemeStore();
  const isDark = useIsDark();
  
  return (
    <View style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
      <Button onPress={() => setThemeMode('dark')}>Dark Mode</Button>
    </View>
  );
}
```

---

### Step 5: Add Authentication Logic

The new user store supports full authentication. Here's how to use it:

```tsx
import { useAuth } from '@/hooks/useStores';

function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  
  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      // Navigate to home screen
    }
  };
  
  return (
    <View>
      {error && <Text>{error}</Text>}
      <Button onPress={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </View>
  );
}
```

---

### Step 6: Add Notification Support

```tsx
import { useNotifications } from '@/hooks/useStores';

function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  return (
    <View>
      <Badge count={unreadCount} />
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onPress={() => markAsRead(notification.id)}
        />
      ))}
      <Button onPress={markAllAsRead}>Mark All Read</Button>
    </View>
  );
}
```

---

## 🧪 Testing Your Migration

### 1. Test Authentication
- [ ] Login works and persists after app restart
- [ ] Logout clears all user data
- [ ] Protected routes redirect to login when not authenticated

### 2. Test Onboarding
- [ ] Onboarding shows for new users
- [ ] Language selection persists
- [ ] Completed onboarding state persists after app restart

### 3. Test Theme
- [ ] Theme changes apply immediately
- [ ] Theme preference persists after app restart
- [ ] System theme mode works correctly

### 4. Test Notifications
- [ ] Notifications load on app start
- [ ] Unread count updates correctly
- [ ] Mark as read works
- [ ] Notifications clear on logout

---

## 🐛 Common Issues

### Issue: "Cannot read property 'currentUser' of null"
**Solution:** Check if user is authenticated before accessing user data:
```tsx
const currentUser = useUserStore((state) => state.currentUser);
if (!currentUser) return null;
```

### Issue: Store not persisting
**Solution:** Make sure AsyncStorage is properly installed:
```bash
npm install @react-native-async-storage/async-storage
```

### Issue: Too many re-renders
**Solution:** Use selectors to subscribe to specific state:
```tsx
// ❌ Bad - subscribes to entire store
const store = useUserStore();

// ✅ Good - subscribes only to currentUser
const currentUser = useUserStore((state) => state.currentUser);
```

---

## 📚 Additional Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Store README](./README.md)
- [Example Components](./examples.tsx)
- [Custom Hooks](../hooks/useStores.ts)

---

## 🎉 After Migration

Once migration is complete:
1. ✅ Remove old Context files (optional, keep as backup initially)
2. ✅ Update imports across the codebase
3. ✅ Test thoroughly on both iOS and Android
4. ✅ Verify persistence works correctly
5. ✅ Update team documentation

Happy migrating! 🚀
