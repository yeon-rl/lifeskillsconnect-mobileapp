import { ThemedText } from "@/components/themed-text";
import ThemedView from "@/components/themedView";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Modal, Pressable, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | null>(null);
  const [modalMessage, setModalMessage] = useState("");
  const colors = useThemedColors();

  const router = useRouter();

  // Email validation regex
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const buttonBackgroundColor = isFormValid ? "#5A7C65" : "#5A7C651A";

  const showModal = (type: "success" | "error", message: string) => {
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSignIn = () => {
    // Validate email
    if (!isEmailValid) {
      showModal("error", "Please enter a valid email address");
      return;
    }

    // Validate password
    if (!isPasswordValid) {
      showModal("error", "Password must be at least 6 characters");
      return;
    }

    // Simulate successful login (replace with actual API call)
    showModal("success", "Login successful!");
    // Navigate after successful login
    setTimeout(() => {
      setModalVisible(false);
      router.push("/(tabs)");
    }, 1500);
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
        <View className="flex items-end mt-2">
          <ThemedText type="small14">Forgot Password?</ThemedText>
        </View>
      </View>

      {/* Login Button */}
      <Pressable
        style={{ backgroundColor: buttonBackgroundColor }}
        className="rounded-lg py-4 items-center mb-4"
        disabled={!isFormValid}
        onPress={handleSignIn}
      >
        <ThemedText
          className="font-semibold text-base"
          style={{ color: isFormValid ? "#fff" : "#5A7C65" }}
        >
          Sign In
        </ThemedText>
      </Pressable>

      <View className="flex-row items-center gap-3 my-6">
        <View className="border-b border-slate-300 w-[45%]"></View>
        <ThemedText type="small14">Or</ThemedText>
        <View className="border-b border-slate-300 w-[45%]"></View>
      </View>

      {/* Google Sign Up Button */}
      <Pressable
        className="flex-row items-center justify-center rounded-lg py-4 mb-4"
        style={{ backgroundColor: colors.text }}
      >
        <Svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          //   xmlns="http://www.w3.org/2000/svg"
        >
          <Path
            d="M22.501 12.2331C22.501 11.3698 22.4296 10.7398 22.2748 10.0864H12.2153V13.983H18.12C18.001 14.9514 17.3582 16.4097 15.9296 17.3897L15.9096 17.5202L19.0902 19.9349L19.3106 19.9564C21.3343 18.1247 22.501 15.4297 22.501 12.2331Z"
            fill="#4285F4"
          />
          <Path
            d="M12.214 22.5001C15.1068 22.5001 17.5353 21.5667 19.3092 19.9567L15.9282 17.39C15.0235 18.0083 13.8092 18.44 12.214 18.44C9.38069 18.44 6.97596 16.6083 6.11874 14.0767L5.99309 14.0871L2.68583 16.5955L2.64258 16.7133C4.40446 20.1433 8.0235 22.5001 12.214 22.5001Z"
            fill="#34A853"
          />
          <Path
            d="M6.12046 14.0765C5.89428 13.4232 5.76337 12.7231 5.76337 11.9998C5.76337 11.2764 5.89428 10.5765 6.10856 9.92313L6.10257 9.78398L2.75386 7.23535L2.64429 7.28642C1.91814 8.70977 1.50146 10.3081 1.50146 11.9998C1.50146 13.6915 1.91814 15.2897 2.64429 16.7131L6.12046 14.0765Z"
            fill="#FBBC05"
          />
          <Path
            d="M12.2141 5.55997C14.2259 5.55997 15.583 6.41163 16.3569 7.12335L19.3807 4.23C17.5236 2.53834 15.1069 1.5 12.2141 1.5C8.02353 1.5 4.40447 3.85665 2.64258 7.28662L6.10686 9.92332C6.97598 7.39166 9.38073 5.55997 12.2141 5.55997Z"
            fill="#EB4335"
          />
        </Svg>

        <ThemedText
          type="small14"
          className=" font-semibold text-base ml-2"
          style={{ color: colors.background }}
        >
          Sign up with Google
        </ThemedText>
      </Pressable>

      {/* Apple Sign Up Button */}
      <Pressable className="flex-row items-center justify-center bg-[#5A7C651A] rounded-lg py-4 mb-6">
        <Svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          //   xmlns="http://www.w3.org/2000/svg"
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
          //   style={{ color: colors.background }}
        >
          Sign up with Apple
        </ThemedText>
      </Pressable>

      {/* Sign Up Link */}
      <View className="flex-row justify-center">
        <ThemedText className="text-gray-700">
          Haven&apos;t registered yet?{" "}
        </ThemedText>
        <Pressable onPress={() => router.push("/(auth)/signup")}>
          <ThemedText className="text-black font-semibold">Register</ThemedText>
        </Pressable>
      </View>

      {/* Success/Error Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View
            className="w-80 rounded-lg p-6 items-center"
            style={{ backgroundColor: colors.background }}
          >
            {/* Icon */}
            <Ionicons
              name={
                modalType === "success" ? "checkmark-circle" : "close-circle"
              }
              size={60}
              color={modalType === "success" ? "#10b981" : "#ef4444"}
            />

            {/* Message */}
            <ThemedText
              className="text-center font-semibold text-lg mt-4"
              style={{ color: colors.text }}
            >
              {modalType === "success" ? "Success" : "Error"}
            </ThemedText>

            <ThemedText
              className="text-center mt-2 text-sm"
              style={{ color: colors.gray700 }}
            >
              {modalMessage}
            </ThemedText>

            {/* Close Button */}
            <Pressable
              onPress={() => setModalVisible(false)}
              className="mt-6 px-8 py-2 rounded-lg"
              style={{
                backgroundColor:
                  modalType === "success" ? "#10b981" : "#ef4444",
              }}
            >
              <ThemedText className="text-white font-semibold">
                {modalType === "success" ? "Continue" : "Try Again"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
