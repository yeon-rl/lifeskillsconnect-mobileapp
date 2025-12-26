import { useTheme } from '@/context/ThemeContext';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OtpVerification() {
  const colors = useThemedColors();
  const router = useRouter();
  const { themeMode } = useTheme();
  // We can get email from params if we want to display it
  const { email } = useLocalSearchParams(); 

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    // Validate OTP here
    if (otp.join('').length === 4) {
        router.push('/create-new-password');
    }
  };

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
        // Handle paste logic if needed, simplify for now to just take last char
        text = text[text.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 3) {
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
                We’ve sent you a confirmation code to your email {email ? String(email) : 'your email'}
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
                            backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#fff', // White explicitly in light mode? Or transparent? Using white/bglight based on image usually white inputs with border
                            color: colors.text,
                            borderColor: digit ? '#526D65' : colors.gray300, // Green border if filled
                            borderWidth: 1.5
                        }
                    ]}
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                />
            ))}
        </View>
        
        <Text style={styles.timerText}>Resend in 30s</Text>

        <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: '#526D65' }]} 
            onPress={handleNext}
        >
            <Text style={styles.nextButtonText}>Next</Text>
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
      width: 60,
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
