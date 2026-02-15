import { ThemedText } from "@/components/themed-text";
import ThemedView from "@/components/themedView";
import { useThemedColors } from "@/hooks/use-themed-colors";
import { authService } from "@/services/api/apiServices";
import { useUserStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { toast } from "sonner-native";

type SignupStep = "email" | "otp" | "account" | "interests" | "success";

interface AccountData {
  fullName: string;
  username: string;
  countryCode: string;
  phoneNumber: string;
  dateOfBirth: Date | null;
  hearAbout: string;
  nationality: string;
}

const COUNTRY_CODES = [
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+234", country: "NG" },
  { code: "+255", country: "TZ" },
  { code: "+256", country: "UG" },
  { code: "+27", country: "ZA" },
  { code: "+33", country: "FR" },
  { code: "+49", country: "DE" },
  { code: "+39", country: "IT" },
];

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

interface Interest {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const INTERESTS: Interest[] = [
  {
    id: "1",
    name: "Financial literacy and budgeting",
    description:
      "Explore career paths, job opportunities, and professional development strategies.",
    icon: "🎯",
  },
  {
    id: "2",
    name: "Nutrition and meal planning",
    description:
      "Learn about educational resources, skill development, and academic growth.",
    icon: "📚",
  },
  {
    id: "3",
    name: "Tenancy sustainment and housing rights",
    description:
      "Master budgeting, saving, and financial literacy for a secure future.",
    icon: "💰",
  },
  {
    id: "4",
    name: "Personal hygiene and health management",
    description:
      "Discover wellness tips, mental health resources, and healthy lifestyle practices.",
    icon: "❤️",
  },
  {
    id: "5",
    name: "Digital safety and screen time management",
    description:
      "Get guidance on finding housing, tenant rights, and housing assistance.",
    icon: "🏠",
  },
  {
    id: "6",
    name: "Prompts and reminder systems",
    description:
      "Get guidance on finding housing, tenant rights, and housing assistance.",
    icon: "🏠",
  },
  {
    id: "7",
    name: "Critical thinking and decision-making",
    description: "Learn about legal rights, resources, and support services.",
    icon: "⚖️",
  },
  {
    id: "8",
    name: "Relationship building and communication",
    description: "Learn about legal rights, resources, and support services.",
    icon: "⚖️",
  },
  {
    id: "9",
    name: "Goal setting and achievement",
    description: "Learn about legal rights, resources, and support services.",
    icon: "⚖️",
  },
  {
    id: "10",
    name: "Resilience and mental health awareness",
    description: "Learn about legal rights, resources, and support services.",
    icon: "⚖️",
  },
  {
    id: "11",
    name: "Boundary setting and self-advocacy",
    description: "Learn about legal rights, resources, and support services.",
    icon: "⚖️",
  },
  {
    id: "12",
    name: "Confidence building and self-esteem",
    description: "Learn about legal rights, resources, and support services.",
    icon: "⚖️",
  },
];

export default function SignupScreen() {
  const [currentStep, setCurrentStep] = useState<SignupStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [accountData, setAccountData] = useState<AccountData>({
    fullName: "",
    username: "",
    countryCode: "+1",
    phoneNumber: "",
    dateOfBirth: null,
    hearAbout: "",
    nationality: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedInterestDetail, setSelectedInterestDetail] =
    useState<Interest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState("");
  const [nationalitySearch, setNationalitySearch] = useState("");
  const [interestSearch, setInterestSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP input refs for auto-advance
  const otpRef1 = useRef<TextInput>(null);
  const otpRef2 = useRef<TextInput>(null);
  const otpRef3 = useRef<TextInput>(null);
  const otpRef4 = useRef<TextInput>(null);
  const otpRefs = [otpRef1, otpRef2, otpRef3, otpRef4];

  const colors = useThemedColors();
  const router = useRouter();
  const { currentUser, setUser, setAuthToken, setAuthenticated, updateUser } = useUserStore();

  // Email validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const isPasswordsMatch = password === confirmPassword && password.length > 0;
  const isEmailStepValid = isEmailValid && isPasswordValid && isPasswordsMatch;

  // OTP validation
  const isOtpValid = otp.length === 4 && /^\d+$/.test(otp);

  // Account step validation
  const isAccountStepValid =
    accountData.fullName.trim() &&
    accountData.username.trim() &&
    accountData.phoneNumber.trim() &&
    accountData.dateOfBirth &&
    accountData.hearAbout.trim() &&
    accountData.nationality.trim();

  const handleDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      setAccountData({ ...accountData, dateOfBirth: selectedDate });
    }
    setShowDatePicker(false);
  };

  const handleInterestSelect = (interestId: string) => {
    const interest = INTERESTS.find((i) => i.id === interestId);
    setSelectedInterestDetail(interest || null);
    setModalVisible(true);
  };

  const handleConfirmInterest = () => {
    if (
      selectedInterestDetail &&
      !selectedInterests.includes(selectedInterestDetail.id)
    ) {
      const newInterests = [...selectedInterests, selectedInterestDetail.id];
      setSelectedInterests(newInterests);
      setModalVisible(false);
    }
  };

  const handleSkipInterests = () => {
    setCurrentStep("success");
  };

  const handleDoneSuccess = () => {
    setAuthenticated(true);
    router.push("/(tabs)");
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      const response = await authService.signup({
        email,
        password,
      });

      // If signup returns user/token, store it
      if (response.user && response.token) {
        setAuthToken(response.token);
        setUser(response.user, false);
      } else if (response.user) {
        setUser(response.user, false);
      }

      setCurrentStep("otp");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "An error occurred during signup";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const response = await authService.verifyOTP({ email, otp });

      // Store user/token returned from verification
      if (response.user && response.token) {
        setAuthToken(response.token);
        setUser(response.user, false);
      } else if (response.user) {
        setUser(response.user, false);
      }

      setCurrentStep("account");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Invalid OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await authService.resendOTP({ email });
      toast.success("OTP resent to your email");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to resend OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!currentUser?.userId && !currentUser?.id) {
      toast.error("User session not found. Please try signing up again.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        userId: currentUser.userId || parseInt(currentUser.id),
        fullname: accountData.fullName,
        username: accountData.username,
        phone: accountData.countryCode + accountData.phoneNumber,
        nationality: accountData.nationality,
        date_of_birth: accountData.dateOfBirth?.toISOString().split("T")[0] || "",
        heardAboutUs: accountData.hearAbout,
      };

      const response = await authService.completeProfile(payload);
      
      // Update store with new profile data
      updateUser(response.user || response);
      
      setCurrentStep("interests");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to complete profile";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterests = async () => {
    const userId = currentUser?.userId || (currentUser?.id ? parseInt(currentUser.id) : null);
    
    if (!userId) {
      toast.error("User session not found.");
      return;
    }

    if (selectedInterests.length < 3) {
      toast.error("Please select at least 3 skills to get started.");
      return;
    }

    try {
      setLoading(true);
      
      // Map interest IDs to names as the API likely expects names based on the example
      const interestNames = selectedInterests.map(id => INTERESTS.find(i => i.id === id)?.name || id);

      await authService.updateInterests({
        userId: userId,
        interests: interestNames,
      });

      setCurrentStep("success");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to update interests";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Screen: Email & Password
  if (currentStep === "email") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView
          style={{ backgroundColor: colors.background }}
          className="flex-1 px-6 justify-center"
        >
          {/* Header */}
          <View className="mb-8">
            <View className="flex-row items-center gap-2 mb-2">
              <ThemedText
                type="subtitle"
                className="text-3xl font-bold text-black"
              >
                Create an Account
              </ThemedText>
              <Image
                source={require("../../assets/images/thumbs.gif")}
                className="w-[31px] h-[31px] rounded-2xl"
                resizeMode="contain"
              />
            </View>
            <ThemedText
              style={{ color: colors.gray700 }}
              className="text-sm"
              type="small"
            >
              Start Your Journey to Real-World Confidence.
            </ThemedText>
          </View>

          {/* Email Input */}
          <View className="mb-6">
            <ThemedText
              style={{ color: colors.text }}
              type="small"
              className="mb-2"
            >
              Email
            </ThemedText>
            <View
              style={{
                borderColor:
                  email.length > 0
                    ? isEmailValid
                      ? "#5A7C65"
                      : "#ef4444"
                    : "transparent",
                borderWidth: email.length > 0 ? 2 : 0,
                backgroundColor: colors.input,
              }}
              className="rounded-lg px-4 py-4"
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
              <ThemedText
                className="text-red-500 text-xs mt-1"
                type="small"
                style={{ color: colors.error }}
              >
                Invalid email format
              </ThemedText>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <ThemedText
              style={{ color: colors.text }}
              type="small"
              className="mb-2"
            >
              Password
            </ThemedText>
            <View
              style={{
                borderColor:
                  password.length > 0
                    ? isPasswordValid
                      ? "#5A7C65"
                      : "#ef4444"
                    : "transparent",
                borderWidth: password.length > 0 ? 2 : 0,
                backgroundColor: colors.input,
              }}
              className="flex-row items-center rounded-lg px-4"
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
              <ThemedText
                className="text-red-500 text-xs mt-1"
                type="small"
                style={{ color: colors.error }}
              >
                Password must be at least 6 characters
              </ThemedText>
            )}
          </View>

          {/* Confirm Password Input */}
          <View className="mb-8">
            <ThemedText
              style={{ color: colors.text }}
              type="small"
              className="mb-2"
            >
              Confirm Password
            </ThemedText>
            <View
              style={{
                borderColor:
                  confirmPassword.length > 0
                    ? isPasswordsMatch
                      ? "#5A7C65"
                      : "#ef4444"
                    : "transparent",
                borderWidth: confirmPassword.length > 0 ? 2 : 0,
                backgroundColor: colors.input,
              }}
              className="flex-row items-center rounded-lg px-4"
            >
              <TextInput
                className="flex-1 py-4 text-base"
                style={{ color: colors.text }}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="pl-2"
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.text}
                />
              </Pressable>
            </View>
            {confirmPassword && !isPasswordsMatch && (
              <ThemedText
                className="text-red-500 text-xs mt-1"
                type="small"
                style={{ color: colors.error }}
              >
                Passwords do not match
              </ThemedText>
            )}
          </View>

          {/* Next Button */}
          <Pressable
            style={{
              backgroundColor: isEmailStepValid ? "#5A7C65" : "#5A7C651A",
            }}
            className="rounded-lg py-4 items-center mb-4"
            disabled={!isEmailStepValid || loading}
            onPress={handleSignup}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText
                className="font-semibold text-base"
                style={{ color: isEmailStepValid ? "#fff" : "#5A7C65" }}
              >
                Next
              </ThemedText>
            )}
          </Pressable>

          {/* Social Signup */}
          <View className="flex-row items-center gap-3 my-6">
            <View
              className="border-b flex-1"
              style={{ borderColor: colors.gray300 }}
            ></View>
            <ThemedText style={{ color: colors.gray700 }} type="small">
              Or
            </ThemedText>
            <View
              className="border-b flex-1"
              style={{ borderColor: colors.gray300 }}
            ></View>
          </View>

          {/* Google Button */}
          <Pressable
            className="flex-row items-center justify-center rounded-lg py-4 mb-4"
            style={{ backgroundColor: colors.text }}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
              type="small"
              className="font-semibold text-base ml-2"
              style={{ color: colors.background }}
            >
              Sign up with Google
            </ThemedText>
          </Pressable>

          {/* Apple Button */}
          <Pressable
            className="flex-row items-center justify-center rounded-lg py-4"
            style={{ backgroundColor: "#5A7C651A" }}
          >
            <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <Path
                d="M30 16C30 23.728 23.735 30 16 30C8.265 30 2 23.728 2 16C2 8.265 8.265 2 16 2C23.735 2 30 8.265 30 16Z"
                fill="#333333"
              />
              <Path
                d="M22.5621 12.4574C22.4857 12.502 20.6671 13.4425 20.6671 15.5279C20.7528 17.9061 22.9621 18.7401 23 18.7401C22.9621 18.7847 22.6665 19.8763 21.7907 21.0205C21.0956 22.0062 20.3242 23 19.1528 23C18.0385 23 17.6385 22.3431 16.3528 22.3431C14.972 22.3431 14.5813 23 13.5242 23C12.3528 23 11.5242 21.953 10.7913 20.9766C9.8391 19.6986 9.02978 17.6931 9.00121 15.7675C8.98195 14.7471 9.19189 13.744 9.72481 12.8921C10.477 11.7026 11.8198 10.8952 13.2863 10.8686C14.4099 10.8333 15.4099 11.5875 16.0956 11.5875C16.7528 11.5875 17.9814 10.8686 19.3714 10.8686C19.9714 10.8692 21.5714 11.0376 22.5621 12.4574ZM16.0006 10.6649C15.8006 9.73303 16.3528 8.80119 16.8671 8.20677C17.5242 7.48792 18.5621 7 19.4571 7C19.5143 7.93185 19.1522 8.84575 18.505 9.51136C17.9242 10.2302 16.9242 10.7714 16.0006 10.6649Z"
                fill="white"
              />
            </Svg>
            <ThemedText type="small" className="font-semibold text-base ml-2">
              Sign up with Apple
            </ThemedText>
          </Pressable>

          <View className="flex-row justify-center mt-5">
            <ThemedText className="text-gray-700" type="small">
              Already have an account?{" "}
            </ThemedText>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <ThemedText className="text-black font-semibold" type="small">
                sign in
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Screen: OTP Verification
  if (currentStep === "otp") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView
          style={{ backgroundColor: colors.background }}
          className="flex-1 px-6 pt-8"
        >
          {/* Back Button */}
          <Pressable
            onPress={() => setCurrentStep("email")}
            className="mb-8 p-2 mt-10"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              // xmlns="http://www.w3.org/2000/svg"
            >
              <Rect
                width="40"
                height="40"
                rx="20"
                fill="#5A7C65"
                fillOpacity="0.1"
              />
              <Path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.1088 20.4817C15.9811 20.3539 15.9094 20.1806 15.9094 19.9999C15.9094 19.8192 15.9811 19.6459 16.1088 19.5181L22.927 12.6999C22.9894 12.6329 23.0647 12.5792 23.1483 12.5419C23.232 12.5047 23.3223 12.4846 23.4138 12.483C23.5054 12.4814 23.5963 12.4982 23.6812 12.5325C23.7661 12.5668 23.8432 12.6179 23.9079 12.6826C23.9727 12.7474 24.0237 12.8245 24.058 12.9094C24.0923 12.9943 24.1092 13.0852 24.1075 13.1768C24.1059 13.2683 24.0859 13.3586 24.0486 13.4422C24.0114 13.5259 23.9576 13.6011 23.8906 13.6636L17.5543 19.9999L23.8906 26.3363C23.9576 26.3987 24.0114 26.474 24.0486 26.5576C24.0859 26.6412 24.1059 26.7315 24.1075 26.8231C24.1092 26.9146 24.0923 27.0056 24.058 27.0905C24.0237 27.1754 23.9727 27.2525 23.9079 27.3172C23.8432 27.382 23.7661 27.433 23.6812 27.4673C23.5963 27.5016 23.5054 27.5184 23.4138 27.5168C23.3223 27.5152 23.232 27.4952 23.1483 27.4579C23.0647 27.4206 22.9894 27.3669 22.927 27.2999L16.1088 20.4817Z"
                fill="#5A7C65"
                fill-opacity="0.5"
              />
            </Svg>
          </Pressable>

          {/* Header */}
          <View className="mb-10">
            <View className="flex-row items-center gap-2 mb-2">
              <ThemedText
                type="subtitle"
                className="text-3xl font-bold text-black"
              >
                OTP Verification
              </ThemedText>
              <Image
                source={require("../../assets/images/thinking.gif")}
                className="w-[31px] h-[31px] rounded-2xl"
                resizeMode="contain"
              />
            </View>
            <ThemedText
              style={{ color: colors.gray700 }}
              className="text-sm"
              type="small"
            >
              We’ve sent you a confirmation code to your email
              Okok*********n@gmail.com
            </ThemedText>
          </View>

          {/* OTP Input - 4 Boxes */}
          <View className="mb-4">
            <View className="flex-row justify-between gap-4 mb-6">
              {[0, 1, 2, 3].map((index) => (
                <TextInput
                  key={index}
                  ref={otpRefs[index]}
                  className="flex-1 text-3xl font-bold text-center rounded-2xl py-6"
                  style={{
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: otp[index]
                      ? isOtpValid
                        ? "#5A7C65"
                        : "#ef4444"
                      : colors.gray300,
                  }}
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={otp[index] || ""}
                  onChangeText={(text) => {
                    // Only allow single digit
                    if (text.length <= 1 && /^\d*$/.test(text)) {
                      // Update OTP state
                      const otpArray = otp.split("");
                      otpArray[index] = text;
                      const newOtp = otpArray.join("");
                      setOtp(newOtp);

                      // Auto-advance to next input if digit entered
                      if (text && index < 3) {
                        setTimeout(() => {
                          otpRefs[index + 1]?.current?.focus();
                        }, 50);
                      }
                    }
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    // Handle backspace to go to previous input
                    if (
                      nativeEvent.key === "Backspace" &&
                      !otp[index] &&
                      index > 0
                    ) {
                      setTimeout(() => {
                        otpRefs[index - 1]?.current?.focus();
                      }, 0);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={1}
                />
              ))}
            </View>
            {otp.length === 4 && !isOtpValid && (
              <ThemedText className="text-red-500 text-xs">
                OTP must be 4 digits
              </ThemedText>
            )}
          </View>

          <Pressable onPress={handleResendOTP} disabled={loading}>
            <ThemedText
              style={{ color: colors.primary }}
              type="small"
              className="mb-6 text-center font-semibold"
            >
              Resend code
            </ThemedText>
          </Pressable>

          {/* Verify Button */}
          <Pressable
            style={{
              backgroundColor: isOtpValid ? "#5A7C65" : "#5A7C651A",
            }}
            className="rounded-lg py-4 items-center"
            disabled={!isOtpValid || loading}
            onPress={handleVerifyOTP}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText
                className="font-semibold text-base"
                style={{ color: isOtpValid ? "#fff" : "#5A7C65" }}
              >
                Verify
              </ThemedText>
            )}
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Screen: Account Setup
  if (currentStep === "account") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView
          style={{ backgroundColor: colors.background }}
          className="flex-1 px-6"
        >
          <ScrollView showsVerticalScrollIndicator={false} className="pt-8">
            {/* Back Button */}
            <Pressable
              onPress={() => setCurrentStep("otp")}
              className="mb-4 px-2 "
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                // xmlns="http://www.w3.org/2000/svg"
              >
                <Rect
                  width="40"
                  height="40"
                  rx="20"
                  fill="#5A7C65"
                  fillOpacity="0.1"
                />
                <Path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M16.1088 20.4817C15.9811 20.3539 15.9094 20.1806 15.9094 19.9999C15.9094 19.8192 15.9811 19.6459 16.1088 19.5181L22.927 12.6999C22.9894 12.6329 23.0647 12.5792 23.1483 12.5419C23.232 12.5047 23.3223 12.4846 23.4138 12.483C23.5054 12.4814 23.5963 12.4982 23.6812 12.5325C23.7661 12.5668 23.8432 12.6179 23.9079 12.6826C23.9727 12.7474 24.0237 12.8245 24.058 12.9094C24.0923 12.9943 24.1092 13.0852 24.1075 13.1768C24.1059 13.2683 24.0859 13.3586 24.0486 13.4422C24.0114 13.5259 23.9576 13.6011 23.8906 13.6636L17.5543 19.9999L23.8906 26.3363C23.9576 26.3987 24.0114 26.474 24.0486 26.5576C24.0859 26.6412 24.1059 26.7315 24.1075 26.8231C24.1092 26.9146 24.0923 27.0056 24.058 27.0905C24.0237 27.1754 23.9727 27.2525 23.9079 27.3172C23.8432 27.382 23.7661 27.433 23.6812 27.4673C23.5963 27.5016 23.5054 27.5184 23.4138 27.5168C23.3223 27.5152 23.232 27.4952 23.1483 27.4579C23.0647 27.4206 22.9894 27.3669 22.927 27.2999L16.1088 20.4817Z"
                  fill="#5A7C65"
                  fill-opacity="0.5"
                />
              </Svg>
            </Pressable>

            {/* Header */}
            <View className="mb-8">
              <View className="flex-row items-center gap-2 mb-2">
                <ThemedText
                  type="subtitle"
                  className="text-3xl font-bold text-black"
                >
                  Account set up
                </ThemedText>
                <Image
                  source={require("../../assets/images/thumbs.gif")}
                  className="w-[31px] h-[31px] rounded-2xl"
                  resizeMode="contain"
                />
              </View>
              <ThemedText
                style={{ color: colors.gray700 }}
                className="text-sm"
                type="small"
              >
                Let’s complete your account.
              </ThemedText>
            </View>

            {/* Full Name */}
            <View className="mb-6">
              <ThemedText
                style={{ color: colors.text }}
                type="small"
                className="mb-2"
              >
                Full Name
              </ThemedText>
              <TextInput
                className="rounded-lg px-4 py-4 text-base"
                style={{
                  color: colors.text,
                  backgroundColor: colors.input,
                }}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={accountData.fullName}
                onChangeText={(text) =>
                  setAccountData({ ...accountData, fullName: text })
                }
              />
            </View>

            {/* Username */}
            <View className="mb-6">
              <ThemedText
                style={{ color: colors.text }}
                type="small"
                className="mb-2"
              >
                Username
              </ThemedText>
              <TextInput
                className="rounded-lg px-4 py-4 text-base"
                style={{
                  color: colors.text,
                  backgroundColor: colors.input,
                }}
                placeholder="Choose a username"
                placeholderTextColor="#999"
                value={accountData.username}
                onChangeText={(text) =>
                  setAccountData({ ...accountData, username: text })
                }
              />
            </View>

            {/* Phone Number */}
            <View className="mb-6">
              <ThemedText
                style={{ color: colors.text }}
                type="small"
                className="mb-2"
              >
                Phone Number
              </ThemedText>
              <View className="flex-row gap-2">
                {/* Country Code Dropdown */}
                <Pressable
                  className="rounded-lg px-4 py-4 flex-row items-center justify-between w-1/4"
                  style={{ backgroundColor: colors.input }}
                  onPress={() =>
                    setShowCountryCodeDropdown(!showCountryCodeDropdown)
                  }
                >
                  <ThemedText
                    style={{ color: colors.text }}
                    className="text-base"
                  >
                    {accountData.countryCode}
                  </ThemedText>
                  <Ionicons name="chevron-down" size={16} color={colors.text} />
                </Pressable>

                {/* Phone Number Input */}
                <TextInput
                  className="rounded-lg px-4 py-4 text-base flex-1"
                  style={{
                    color: colors.text,
                    backgroundColor: colors.input,
                  }}
                  placeholder="Phone number"
                  placeholderTextColor="#999"
                  value={accountData.phoneNumber}
                  onChangeText={(text) =>
                    setAccountData({ ...accountData, phoneNumber: text })
                  }
                  keyboardType="phone-pad"
                />
              </View>

              {/* Country Code Dropdown Menu */}
              {showCountryCodeDropdown && (
                <View
                  className="mt-2 rounded-lg overflow-hidden max-h-60"
                  style={{
                    backgroundColor: colors.input,
                    borderWidth: 1,
                    borderColor: colors.primary,
                  }}
                >
                  <TextInput
                    className="px-4 py-2 text-base"
                    style={{
                      color: colors.text,
                      backgroundColor: colors.input,
                    }}
                    placeholder="Search code..."
                    placeholderTextColor="#999"
                    value={countryCodeSearch}
                    onChangeText={setCountryCodeSearch}
                  />
                  <ScrollView nestedScrollEnabled={true}>
                    {COUNTRY_CODES.filter(
                      (cc) =>
                        cc.code.includes(countryCodeSearch) ||
                        cc.country.includes(countryCodeSearch.toUpperCase())
                    ).map((cc) => (
                      <Pressable
                        key={cc.code}
                        className="px-4 py-3 border-b"
                        style={{ borderColor: colors.gray300 }}
                        onPress={() => {
                          setAccountData({
                            ...accountData,
                            countryCode: cc.code,
                          });
                          setShowCountryCodeDropdown(false);
                          setCountryCodeSearch("");
                        }}
                      >
                        <ThemedText style={{ color: colors.text }}>
                          {cc.country} {cc.code}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Date of Birth */}
            <View className="mb-6">
              <ThemedText
                style={{ color: colors.text }}
                type="small"
                className="mb-2"
              >
                Date of Birth
              </ThemedText>
              <Pressable
                className="rounded-lg px-4 py-4 flex-row items-center justify-between"
                style={{ backgroundColor: colors.input }}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText
                  style={{
                    color: accountData.dateOfBirth ? colors.text : "#999",
                  }}
                >
                  {accountData.dateOfBirth
                    ? accountData.dateOfBirth.toLocaleDateString()
                    : "Select date of birth"}
                </ThemedText>
                <Ionicons name="calendar" size={20} color={colors.text} />
              </Pressable>

              {showDatePicker && (
                <View
                  className="mt-4 mb-4 border rounded-lg"
                  style={{ borderColor: colors.primary }}
                >
                  <DateTimePicker
                    value={accountData.dateOfBirth || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    textColor={colors.text}
                  />
                </View>
              )}
            </View>

            {/* How did you hear about us */}
            <View className="mb-6">
              <ThemedText
                style={{ color: colors.text }}
                type="small"
                className="mb-2"
              >
                How did you hear about us?
              </ThemedText>
              <TextInput
                className="rounded-lg px-4 py-4 text-base"
                style={{
                  color: colors.text,
                  backgroundColor: colors.input,
                }}
                placeholder="e.g., Social Media, Friend, Search Engine"
                placeholderTextColor="#999"
                value={accountData.hearAbout}
                onChangeText={(text) =>
                  setAccountData({ ...accountData, hearAbout: text })
                }
              />
            </View>

            {/* Nationality */}
            <View className="mb-8">
              <ThemedText
                style={{ color: colors.text }}
                type="small"
                className="mb-2"
              >
                Nationality
              </ThemedText>
              <Pressable
                className="rounded-lg px-4 py-4 flex-row items-center justify-between"
                style={{ backgroundColor: colors.input }}
                onPress={() =>
                  setShowNationalityDropdown(!showNationalityDropdown)
                }
              >
                <ThemedText
                  style={{
                    color: accountData.nationality ? colors.text : "#999",
                  }}
                >
                  {accountData.nationality || "Select your nationality"}
                </ThemedText>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
              </Pressable>

              {/* Nationality Dropdown Menu */}
              {showNationalityDropdown && (
                <View
                  className="mt-2 rounded-lg overflow-hidden max-h-60"
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.primary,
                  }}
                >
                  <TextInput
                    className="px-4 py-2 text-base"
                    style={{
                      color: colors.text,
                      backgroundColor: colors.background,
                    }}
                    placeholder="Search country..."
                    placeholderTextColor="#999"
                    value={nationalitySearch}
                    onChangeText={setNationalitySearch}
                  />
                  <ScrollView nestedScrollEnabled={true}>
                    {COUNTRIES.filter((country) =>
                      country
                        .toLowerCase()
                        .includes(nationalitySearch.toLowerCase())
                    ).map((country, index) => (
                      <Pressable
                        key={index}
                        className="px-4 py-3 border-b"
                        style={{ borderColor: colors.gray300 }}
                        onPress={() => {
                          setAccountData({
                            ...accountData,
                            nationality: country,
                          });
                          setShowNationalityDropdown(false);
                          setNationalitySearch("");
                        }}
                      >
                        <ThemedText style={{ color: colors.text }}>
                          {country}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Next Button */}
            <Pressable
              style={{
                backgroundColor: isAccountStepValid ? "#5A7C65" : "#5A7C651A",
              }}
              className="rounded-lg py-4 items-center mb-8"
              disabled={!isAccountStepValid || loading}
              onPress={handleCompleteProfile}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText
                  className="font-semibold text-base"
                  style={{ color: isAccountStepValid ? "#fff" : "#5A7C65" }}
                >
                  Next
                </ThemedText>
              )}
            </Pressable>
          </ScrollView>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Screen: Interests Selection
  if (currentStep === "interests") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView
          style={{ backgroundColor: colors.background }}
          className="flex-1 px-6"
        >
          {/* Back Button */}
          <View className="flex-row justify-between">
            <Pressable
              onPress={() => setCurrentStep("account")}
              className="mb-4 px-2 "
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                // xmlns="http://www.w3.org/2000/svg"
              >
                <Rect
                  width="40"
                  height="40"
                  rx="20"
                  fill="#5A7C65"
                  fillOpacity="0.1"
                />
                <Path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M16.1088 20.4817C15.9811 20.3539 15.9094 20.1806 15.9094 19.9999C15.9094 19.8192 15.9811 19.6459 16.1088 19.5181L22.927 12.6999C22.9894 12.6329 23.0647 12.5792 23.1483 12.5419C23.232 12.5047 23.3223 12.4846 23.4138 12.483C23.5054 12.4814 23.5963 12.4982 23.6812 12.5325C23.7661 12.5668 23.8432 12.6179 23.9079 12.6826C23.9727 12.7474 24.0237 12.8245 24.058 12.9094C24.0923 12.9943 24.1092 13.0852 24.1075 13.1768C24.1059 13.2683 24.0859 13.3586 24.0486 13.4422C24.0114 13.5259 23.9576 13.6011 23.8906 13.6636L17.5543 19.9999L23.8906 26.3363C23.9576 26.3987 24.0114 26.474 24.0486 26.5576C24.0859 26.6412 24.1059 26.7315 24.1075 26.8231C24.1092 26.9146 24.0923 27.0056 24.058 27.0905C24.0237 27.1754 23.9727 27.2525 23.9079 27.3172C23.8432 27.382 23.7661 27.433 23.6812 27.4673C23.5963 27.5016 23.5054 27.5184 23.4138 27.5168C23.3223 27.5152 23.232 27.4952 23.1483 27.4579C23.0647 27.4206 22.9894 27.3669 22.927 27.2999L16.1088 20.4817Z"
                  fill="#5A7C65"
                  fill-opacity="0.5"
                />
              </Svg>
            </Pressable>
            <Pressable onPress={handleSkipInterests}>
              <ThemedText
                style={{ color: colors.primary }}
                className="font-semibold"
              >
                Skip
              </ThemedText>
            </Pressable>
          </View>

          {/* Header */}
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <ThemedText
                type="subtitle"
                className="text-3xl font-bold text-black"
              >
                Select your Modules
              </ThemedText>
              <Image
                source={require("../../assets/images/thumbs.gif")}
                className="w-[31px] h-[31px] rounded-2xl"
                resizeMode="contain"
              />
            </View>
            <ThemedText
              style={{ color: colors.gray700 }}
              className="text-sm"
              type="small"
            >
              Select at least 3 skills to get started.
            </ThemedText>
          </View>

          {/* Selected Count */}
          {/* <View className="mb-4 flex-row items-center justify-between">
            <ThemedText style={{ color: colors.text }} className="text-sm">
              Selected: {selectedInterests.length}/3
            </ThemedText>
            {selectedInterests.length >= 3 && (
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            )}
          </View> */}

          {/* Search Input */}
          <View
            className="mb-6 rounded-lg px-4 py-3 flex-row items-center"
            style={{
              backgroundColor: colors.input,
              borderWidth: 1,
              borderColor: colors.input,
            }}
          >
            <Ionicons name="search" size={20} color={colors.text} />
            <TextInput
              className="flex-1 ml-2 text-base"
              style={{ color: colors.text }}
              placeholder="Search modules..."
              placeholderTextColor="#999"
              value={interestSearch}
              onChangeText={setInterestSearch}
            />
          </View>

          {/* Interests Grid */}
          <FlatList
            data={INTERESTS.filter((interest) =>
              interest.name.toLowerCase().includes(interestSearch.toLowerCase())
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            numColumns={2}
            columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleInterestSelect(item.id)}
                style={{
                  flex: 1,
                  backgroundColor: selectedInterests.includes(item.id)
                    ? colors.input50
                    : colors.input,
                  borderColor: selectedInterests.includes(item.id)
                    ? colors.primary
                    : colors.input,
                  borderWidth: 1,
                }}
                className="rounded-lg p-4 items-center justify-center"
              >
                {/* <ThemedText className="text-3xl mb-2">{item.icon}</ThemedText> */}
                <ThemedText
                  style={{
                    color: selectedInterests.includes(item.id)
                      ? colors.green
                      : colors.textSecondary,
                  }}
                  className="font-semibold text-sm text-center"
                  type="small"
                >
                  {item.name}
                </ThemedText>
              </Pressable>
            )}
            scrollIndicatorInsets={{ right: 1 }}
          />

          {/* Next Button */}
          <Pressable
            style={{
              backgroundColor:
                selectedInterests.length >= 3 ? "#5A7C65" : "#5A7C651A",
            }}
            className="rounded-lg py-4 items-center mb-8"
            disabled={selectedInterests.length < 3 || loading}
            onPress={handleUpdateInterests}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText
                className="font-semibold text-base"
                style={{
                  color: selectedInterests.length >= 3 ? "#fff" : "#5A7C65",
                }}
              >
                Next
              </ThemedText>
            )}
          </Pressable>

          {/* Interest Detail Modal */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <Pressable
              className="flex-1 justify-center items-center px-6"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
              onPress={() => setModalVisible(false)}
            >
              <Pressable
                className="rounded-2xl p-6 w-full"
                style={{ backgroundColor: colors.background, maxWidth: 400 }}
                onPress={(e) => e.stopPropagation()}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View
                    className="flex-row items-center gap-3 flex-1 rouded-2xl"
                    style={{ backgroundColor: colors.green, borderRadius: 8 }}
                  >
                    {/* <ThemedText className="text-3xl">
                      {selectedInterestDetail?.icon}
                    </ThemedText> */}
                    <ThemedText
                      style={{ color: colors.white }}
                      className="flex-1 p-3 font-semibold"
                    >
                      {selectedInterestDetail?.name}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText
                  className="w-fit font-medium"
                  type="small"
                  style={{
                    color: colors.tag,
                    backgroundColor: colors.tagBg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    marginBottom: 12,
                    alignSelf: "flex-start",
                    width: "auto",
                  }}
                >
                  Free
                </ThemedText>

                <ThemedText
                  type="small"
                  style={{ color: colors.textSecondary }}
                  className=" mb-2"
                >
                  23 total hours - Subtitle Available
                </ThemedText>

                <ThemedText
                  style={{ color: colors.textSecondary }}
                  className="text-base mb-6 leading-6 font-semibold"
                >
                  {selectedInterestDetail?.description}
                </ThemedText>

                <View className="flex-row gap-2 mb-5">
                  <View>
                    <Svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      // xmlns="http://www.w3.org/2000/svg"
                    >
                      <Circle cx="10" cy="10" r="10" fill="#5A7C65" />
                      <Path
                        d="M5.5 9.5L9 13L14.5 7.5"
                        stroke="white"
                        stroke-width="1.5"
                      />
                    </Svg>
                  </View>
                  <View>
                    <ThemedText
                      style={{ color: colors.text }}
                      className=""
                      type="small"
                    >
                      Financial Literacy: Get hands on knowledge on how finances
                      should be handled.
                    </ThemedText>
                  </View>
                </View>

                {selectedInterests.includes(
                  selectedInterestDetail?.id || ""
                ) ? (
                  <Pressable
                    className="rounded-lg py-4 items-center"
                    style={{ backgroundColor: "#10b981" }}
                    disabled
                  >
                    <ThemedText className="text-white font-semibold">
                      Selected
                    </ThemedText>
                  </Pressable>
                ) : (
                  <Pressable
                    className="rounded-lg py-3 items-center"
                    style={{ backgroundColor: colors.primary }}
                    onPress={handleConfirmInterest}
                  >
                    <ThemedText
                      className="text-white font-semibold"
                      style={{ color: colors.background }}
                    >
                      Select
                    </ThemedText>
                  </Pressable>
                )}
              </Pressable>
            </Pressable>
          </Modal>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Screen: Success
  if (currentStep === "success") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView
          style={{ backgroundColor: colors.background }}
          className="flex-1 justify-center items-center px-6"
        >
          <Ionicons name="checkmark-circle" size={100} color="#10b981" />
          <ThemedText
            style={{ color: colors.text }}
            className="text-3xl font-bold mt-6 text-center"
          >
            Welcome!
          </ThemedText>
          <ThemedText
            style={{ color: colors.gray700 }}
            className="text-base text-center mt-4"
          >
            You have successfully Signed into your account!
          </ThemedText>

          <Pressable
            className="rounded-lg py-4 px-8 items-center mt-8 w-full"
            style={{ backgroundColor: colors.primary, width: "100%" }}
            onPress={handleDoneSuccess}
          >
            <ThemedText
              className="text-white font-semibold text-base"
              style={{ color: colors.background }}
            >
              Done
            </ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return null;
}
