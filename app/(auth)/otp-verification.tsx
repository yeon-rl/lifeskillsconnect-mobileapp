import { useTheme } from '@/context/ThemeContext';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { authService, userService } from '@/services/api/apiServices';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OtpVerification() {
  const colors = useThemedColors();
  const router = useRouter();
  const { themeMode } = useTheme();
  // We can get email and phone from params
  const { email, phone } = useLocalSearchParams(); 

  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleBack = () => {
    router.back();
  };

  const maskEmail = (emailStr: string) => {
    if (!emailStr || !emailStr.includes('@')) return emailStr;
    const [name, domain] = emailStr.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.substring(0, 2)}***${name.substring(name.length - 1)}@${domain}`;
  };

  const handleNext = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 5) {
      Alert.alert('Error', 'Please enter the 5-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const data: any = { otp: otpString };
      if (email) data.email = email;
      if (phone) data.phone = phone;

      const response = await authService.verifyResetOTP(data);
      // The token might be at the top level, inside a data object, or in a user object
      const token = response.token || response.data?.token || response.user?.token;

      // If we don't have a token but the message says success, we still proceed
      const isSuccess = response.message?.toLowerCase().includes('success') || !!token;

      if (!isSuccess) {
        throw new Error(response.message || 'Verification failed. Please check your OTP.');
      }

      router.push({
        pathname: '/create-new-password',
        params: { token: token || '', email: String(email) }
      });
    } catch (error: any) {
      // Show the actual error message from the response or the error object
      const message = error?.response?.data?.message || error.message || 'Invalid OTP. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
        text = text[text.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 4) {
        inputRefs.current[index + 1]?.focus();
    }
  };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.bglight01 }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>OTP Verification 🧐</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                We’ve sent you a confirmation code to your email
                {"\n"}{maskEmail(String(email || 'your email'))}
            </Text>
        </View>

        <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
                <TextInput
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    style={[
                        styles.otpInput, 
                        { 
                            backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#fff',
                            color: colors.text,
                            borderColor: digit ? '#526D65' : colors.gray300,
                            borderWidth: 1.5
                        }
                    ]}
                    value={digit}
                    keyboardType="number-pad"
                    maxLength={1}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                />
            ))}
        </View>
        
        <Text style={styles.timerText}>Resend in 30s</Text>

        <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: '#526D65' }, loading && { opacity: 0.7 }]} 
            onPress={handleNext}
            disabled={loading}
        >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  titleContainer: {
      marginBottom: 30,
  },
  title: {
      fontSize: 22,
      fontWeight: '500',
      marginBottom: 8,
  },
  subtitle: {
      fontSize: 14,
      lineHeight: 20,
  },
  otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      marginTop: 20,
  },
  otpInput: {
      width: 55,
      height: 60,
      borderRadius: 12,
      textAlign: 'center',
      fontSize: 24,
      fontWeight: '600',
  },
  timerText: {
      textAlign: 'center',
      color: '#666', 
      marginBottom: 40,
      marginTop: 10,
      fontSize: 14,
  },
  nextButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
  },
  nextButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
  }
});
