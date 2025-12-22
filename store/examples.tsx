import { useUserStore } from '@/store';
import { loginUser } from '@/utils/api';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

/**
 * Example Login Screen using Zustand User Store
 * 
 * This is a complete example showing how to:
 * 1. Use the user store for authentication
 * 2. Handle loading and error states
 * 3. Make API calls and update the store
 * 4. Navigate after successful login
 */
export default function LoginExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Get actions from the user store
  const { login, setLoading, setError, clearError } = useUserStore();
  
  // Get state from the user store
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Clear any previous errors
    clearError();
    setLoading(true);

    try {
      // Call API
      const response = await loginUser(email, password);
      
      // Update store with user data and token
      login(response.user, response.token);

      // Success! Navigation will happen automatically
      // because the store's isAuthenticated state changed
      Alert.alert('Success', 'Logged in successfully!');
    } catch (err: any) {
      // Handle error
      const errorMessage = 
        err.response?.data?.message || 
        'Login failed. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold mb-8 text-center">
        Welcome Back
      </Text>

      {/* Email Input */}
      <View className="mb-4">
        <Text className="text-sm font-medium mb-2">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
      </View>

      {/* Password Input */}
      <View className="mb-6">
        <Text className="text-sm font-medium mb-2">Password</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />
      </View>

      {/* Error Message */}
      {error && (
        <View className="mb-4 p-3 bg-red-100 rounded-lg">
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      )}

      {/* Login Button */}
      <TouchableOpacity
        className={`py-4 rounded-lg ${
          isLoading ? 'bg-gray-400' : 'bg-blue-600'
        }`}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {/* Debug Info (Remove in production) */}
      <View className="mt-8 p-4 bg-gray-100 rounded-lg">
        <Text className="text-xs font-mono">
          Store State:{'\n'}
          Loading: {isLoading.toString()}{'\n'}
          Error: {error || 'none'}
        </Text>
      </View>
    </View>
  );
}

/**
 * Example: Using the store in a Profile Screen
 */
export function ProfileExample() {
  const currentUser = useUserStore((state) => state.currentUser);
  const logout = useUserStore((state) => state.logout);

  if (!currentUser) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No user logged in</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-6">
      <Text className="text-2xl font-bold mb-4">Profile</Text>
      
      <View className="mb-4">
        <Text className="text-gray-600">Name</Text>
        <Text className="text-lg">
          {currentUser.first_name} {currentUser.last_name}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-600">Email</Text>
        <Text className="text-lg">{currentUser.email}</Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-600">Premium Status</Text>
        <Text className="text-lg">
          {currentUser.is_premium ? 'Premium User' : 'Free User'}
        </Text>
      </View>

      <TouchableOpacity
        className="mt-8 py-4 bg-red-600 rounded-lg"
        onPress={logout}
      >
        <Text className="text-white text-center font-semibold">
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Example: Using the store to protect routes
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl mb-4">Please log in to continue</Text>
      </View>
    );
  }

  return <>{children}</>;
}
