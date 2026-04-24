import { ThemedText } from "@/components/themed-text";
import ThemedView from "@/components/themedView";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { authService } from "@/services/api/apiServices";
import { useUserStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";

import * as AppleAuthentication from 'expo-apple-authentication';

import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, TextInput, View } from "react-native";
import { toast } from 'sonner-native';


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const colors = useThemedColors();

  const router = useRouter();

  // Email validation regex
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const buttonBackgroundColor = isFormValid ? "#5A7C65" : "#5A7C651A";

  // Removed local modal helper in favor of Sonner toasts

  const { login: storeLogin } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    // Validate email
    if (!isEmailValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate password
    if (!isPasswordValid) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      // Assuming response contains user and token
      // You might need to adjust this based on your API's response structure
      const { user, token } = response.data || response; 
      
      if (token && user) {
        storeLogin(user, token);
        toast.success("Login successful!");
        // Navigation will be handled by navigation guards in _layout.tsx
        // but adding a backup navigation here
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 1500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      // Errors are now handled by the apiClient interceptor
      // We only log here for additional context if needed
      console.error("Login component error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("Apple Sign-In failed: No identity token received");
      }

      const response = await authService.appleAuth({ 
        token: credential.identityToken,
        user: credential.fullName ? {
          firstName: credential.fullName.givenName,
          lastName: credential.fullName.familyName,
          email: credential.email
        } : undefined
      });

      const { user, token, isNewUser } = response.data || response;

      if (token && user) {
        storeLogin(user, token);
        if (isNewUser) {
          toast.success("Welcome! Let's set up your profile.");
          setTimeout(() => {
            router.replace("/(auth)/signup?step=account");
          }, 1500);
        } else {
          toast.success("Logged in with Apple!");
          setTimeout(() => {
            router.replace("/(tabs)");
          }, 1500);
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // user cancelled the login flow
      } else {
        console.error("Apple Sign-In error:", error);
        toast.error(error.message || "Apple Sign-In failed");
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <ThemedView className="flex-1 bg-splash px-6 justify-center">
      {/* Header */}
      <View className="mb-8">
        <View className="flex-row items-center gap-2 mb-2">
          <ThemedText type="subtitle" className="text-3xl font-bold text-black">
            Welcome Back
          </ThemedText>
          <Image
            source={require("../../assets/images/wave.gif")}
            className="w-[31px] h-[31px] rounded-2xl"
            resizeMode="contain"
          />
        </View>

        <ThemedText type="small14" style={{ color: colors.textSecondary }}>
          We are so excited to see you again!
        </ThemedText>
      </View>

      {/* Email Input */}
      <View className="mb-6 mt-5">
        <ThemedText type="small14">Email</ThemedText>
        <View
          style={{
            borderColor:
              email.length > 0
                ? isEmailValid
                  ? "#5A7C65"
                  : "#ef4444"
                : "transparent",
            borderWidth: email.length > 0 ? 2 : 0,
          }}
          className="rounded-lg px-4 py-4 bg-[#5A7C6505]"
        >
          <TextInput
            className="text-base"
            style={{ color: colors.text }}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {email && !isEmailValid && (
          <ThemedText className="text-red-500 text-xs! mt-1">
            Invalid email format
          </ThemedText>
        )}
      </View>

      {/* Password Input */}
      <View className="mb-6">
        <ThemedText type="small14">Password</ThemedText>
        <View
          style={{
            borderColor:
              password.length > 0
                ? isPasswordValid
                  ? "#5A7C65"
                  : "#ef4444"
                : "transparent",
            borderWidth: password.length > 0 ? 2 : 0,
          }}
          className="flex-row items-center rounded-lg px-4 bg-[#5A7C6505]"
        >
          <TextInput
            className="flex-1 py-4 text-base"
            style={{ color: colors.text }}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="pl-2"
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={colors.text}
            />
          </Pressable>
        </View>
        {password && !isPasswordValid && (
          <ThemedText className="text-red-500 text-xs! mt-1">
            Password must be at least 6 characters
          </ThemedText>
        )}
        <Pressable 
          onPress={() => router.push("/reset-password")}
          className="flex items-end mt-2"
        >
          <ThemedText type="small14">Forgot Password?</ThemedText>
        </Pressable>
      </View>

      {/* Login Button */}
      <Pressable
        style={{ backgroundColor: buttonBackgroundColor }}
        className="rounded-lg py-4 items-center mb-4"
        disabled={!isFormValid || isLoading}
        onPress={handleSignIn}
      >
        <ThemedText
          className="font-semibold text-base"
          style={{ color: isFormValid ? "#fff" : "#5A7C65" }}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </ThemedText>
      </Pressable>

      <View className="flex-row items-center gap-3 my-6">
        <View className="border-b border-slate-300 w-[45%]"></View>
        <ThemedText type="small14">Or</ThemedText>
        <View className="border-b border-slate-300 w-[45%]"></View>
      </View>



      {/* Apple Sign Up Button */}
      {/* <Pressable 
        className="flex-row items-center justify-center bg-[#5A7C651A] rounded-lg py-4 mb-6"
        onPress={handleAppleSignIn}
        disabled={isLoading}
      >
        <Svg

          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
        >
          <Path
            d="M30 16C30 23.728 23.735 30 16 30C8.265 30 2 23.728 2 16C2 8.265 8.265 2 16 2C23.735 2 30 8.265 30 16Z"
            fill="#333333"
          />
          <Path
            d="M22.5621 12.4574C22.4857 12.502 20.6671 13.4425 20.6671 15.5279C20.7528 17.9061 22.9621 18.7401 23 18.7401C22.9621 18.7847 22.6665 19.8763 21.7907 21.0205C21.0956 22.0062 20.3242 23 19.1528 23C18.0385 23 17.6385 22.3431 16.3528 22.3431C14.972 22.3431 14.5813 23 13.5242 23C12.3528 23 11.5242 21.953 10.7913 20.9766C9.8391 19.6986 9.02978 17.6931 9.00121 15.7675C8.98195 14.7471 9.19189 13.744 9.72481 12.8921C10.477 11.7026 11.8198 10.8952 13.2863 10.8686C14.4099 10.8333 15.4099 11.5875 16.0956 11.5875C16.7528 11.5875 17.9814 10.8686 19.3714 10.8686C19.9714 10.8692 21.5714 11.0376 22.5621 12.4574ZM16.0006 10.6649C15.8006 9.73303 16.3528 8.80119 16.8671 8.20677C17.5242 7.48792 18.5621 7 19.4571 7C19.5143 7.93185 19.1522 8.84575 18.505 9.51136C17.9242 10.2302 16.9242 10.7714 16.0006 10.6649Z"
            fill="white"
          />
        </Svg>

        <ThemedText
          type="small14"
          className=" font-semibold text-base ml-2"
        >
          Sign up with Apple
        </ThemedText>
      </Pressable> */}

      {/* Sign Up Link */}
      <View className="flex-row justify-center">
        <ThemedText className="text-gray-700">
          Haven&apos;t registered yet?{" "}
        </ThemedText>
        <Pressable onPress={() => router.push("/(auth)/signup")}>
          <ThemedText className="text-black font-semibold">Register</ThemedText>
        </Pressable>
      </View>

    </ThemedView>
  );
}
