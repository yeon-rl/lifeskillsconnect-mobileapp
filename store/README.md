# Zustand Store Documentation

This project uses [Zustand](https://github.com/pmndrs/zustand) for state management. Zustand is a lightweight, fast, and scalable state management solution that's perfect for React Native applications.

## 📁 Store Structure

```
store/
├── index.ts              # Central export file
├── userStore.ts          # User authentication & profile
├── onboardingStore.ts    # Onboarding flow state
├── themeStore.ts         # Theme preferences
└── notificationStore.ts  # Notifications management
```

## 🎯 Available Stores

### 1. User Store (`useUserStore`)

Manages user authentication, profile data, and auth tokens.

**State:**
- `currentUser`: User object or null
- `authToken`: JWT token or null
- `isAuthenticated`: Boolean
- `isLoading`: Boolean
- `error`: Error message or null

**Actions:**
- `setUser(user)`: Set the current user
- `setAuthToken(token)`: Set the auth token
- `updateUser(updates)`: Update user properties
- `login(user, token)`: Login user with token
- `logout()`: Clear user data and logout
- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error message
- `clearError()`: Clear error message

**Usage Example:**
```tsx
import { useUserStore } from '@/store';

function ProfileScreen() {
  const { currentUser, authToken, login, logout } = useUserStore();

  // Login
  const handleLogin = async () => {
    const user = { id: '1', email: 'user@example.com', ... };
    const token = 'jwt-token';
    login(user, token);
  };

  // Update user
  const updateProfile = useUserStore((state) => state.updateUser);
  updateProfile({ first_name: 'John' });

  // Logout
  const handleLogout = () => {
    logout();
  };

  return (
    <View>
      {currentUser && <Text>{currentUser.email}</Text>}
    </View>
  );
}
```

---

### 2. Onboarding Store (`useOnboardingStore`)

Manages onboarding flow and language preferences.

**State:**
- `hasCompletedOnboarding`: Boolean
- `selectedLanguage`: Language code ('en' | 'es' | 'fr' | 'de' | 'pt')
- `isLoading`: Boolean

**Actions:**
- `setHasCompletedOnboarding(value)`: Mark onboarding as complete
- `setSelectedLanguage(language)`: Set user's preferred language
- `setLoading(loading)`: Set loading state
- `resetOnboarding()`: Reset onboarding state

**Usage Example:**
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

  return (
    <View>
      {!hasCompletedOnboarding && (
        <Button onPress={completeOnboarding}>Complete</Button>
      )}
    </View>
  );
}
```

---

### 3. Theme Store (`useThemeStore`)

Manages theme mode preferences with system theme support.

**State:**
- `themeMode`: 'light' | 'dark' | 'system'

**Actions:**
- `setThemeMode(mode)`: Set theme mode
- `toggleTheme()`: Toggle between light and dark

**Helper Hook:**
- `useIsDark()`: Returns computed boolean for dark mode

**Usage Example:**
```tsx
import { useThemeStore, useIsDark } from '@/store';

function SettingsScreen() {
  const { themeMode, setThemeMode, toggleTheme } = useThemeStore();
  const isDark = useIsDark();

  return (
    <View style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
      <Button onPress={toggleTheme}>Toggle Theme</Button>
      <Button onPress={() => setThemeMode('system')}>Use System</Button>
    </View>
  );
}
```

---

### 4. Notification Store (`useNotificationStore`)

Manages notifications with categories and read status.

**State:**
- `notifications`: Array of notifications
- `unreadCount`: Number of unread notifications
- `isLoading`: Boolean
- `error`: Error message or null

**Actions:**
- `setNotifications(notifications)`: Set all notifications
- `addNotification(notification)`: Add a new notification
- `markAsRead(notificationId)`: Mark single notification as read
- `markAllAsRead()`: Mark all notifications as read
- `removeNotification(notificationId)`: Remove a notification
- `clearNotifications()`: Clear all notifications
- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error message
- `updateUnreadCount()`: Recalculate unread count

**Usage Example:**
```tsx
import { useNotificationStore } from '@/store';

function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = 
    useNotificationStore();

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

## 🔄 Migrating from Context API

If you're currently using Context API, here's how to migrate:

### Before (Context):
```tsx
import { useUser } from '@/context/UserContext';

function Component() {
  const { currentUser, setUser } = useUser();
  // ...
}
```

### After (Zustand):
```tsx
import { useUserStore } from '@/store';

function Component() {
  const { currentUser, setUser } = useUserStore();
  // ...
}
```

### Updating `_layout.tsx`:

You can remove the Context Providers and Zustand will work automatically:

```tsx
// Before
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

// After
export default function RootLayout() {
  return (
    <GluestackUIProvider mode="dark">
      <RootLayoutNav />
    </GluestackUIProvider>
  );
}
```

---

## 💾 Persistence

The following stores are persisted to AsyncStorage:
- ✅ User Store
- ✅ Onboarding Store
- ✅ Theme Store
- ❌ Notification Store (session only)

Data is automatically saved and restored on app restart.

---

## 🎨 Advanced Usage

### Selecting Specific State (Performance Optimization)

Instead of subscribing to the entire store, select only what you need:

```tsx
// ❌ Bad - Re-renders on any state change
const store = useUserStore();

// ✅ Good - Only re-renders when currentUser changes
const currentUser = useUserStore((state) => state.currentUser);
const authToken = useUserStore((state) => state.authToken);
```

### Using Outside React Components

```tsx
import { useUserStore } from '@/store';

// Get current state
const currentUser = useUserStore.getState().currentUser;

// Subscribe to changes
const unsubscribe = useUserStore.subscribe((state) => {
  console.log('User changed:', state.currentUser);
});

// Update state
useUserStore.getState().setUser(newUser);
```

### Combining Multiple Stores

```tsx
function Dashboard() {
  const user = useUserStore((state) => state.currentUser);
  const notifications = useNotificationStore((state) => state.notifications);
  const isDark = useIsDark();

  return (
    <View style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
      <Text>Welcome, {user?.first_name}</Text>
      <Text>You have {notifications.length} notifications</Text>
    </View>
  );
}
```

---

## 🧪 Testing

```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useUserStore } from '@/store';

test('should login user', () => {
  const { result } = renderHook(() => useUserStore());

  act(() => {
    result.current.login(mockUser, mockToken);
  });

  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.currentUser).toEqual(mockUser);
});
```

---

## 📚 Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Persist Middleware](https://github.com/pmndrs/zustand#persist-middleware)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

## 🚀 Next Steps

1. **Replace Context Providers** in `_layout.tsx`
2. **Update Components** to use Zustand stores instead of Context hooks
3. **Test Persistence** by closing and reopening the app
4. **Add API Integration** to fetch and update data from your backend

Happy coding! 🎉
