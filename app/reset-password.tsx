import { useTheme } from '@/context/ThemeContext';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPassword() {
  const colors = useThemedColors();
  const router = useRouter();
  const { themeMode } = useTheme();

  const [email, setEmail] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleVerify = () => {
    // In a real app, you would validate and send OTP here
    if (email) {
        router.push({
            pathname: '/otp-verification',
            params: { email: email }
        });
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
          <View className='flex-row items-center gap-2'>
            <Text style={[styles.title, { color: colors.text }]}>Reset Password?</Text>
            <Image
              source={require("../assets/images/thinking.gif")}
              className="w-[31px] h-[31px] rounded-2xl -mt-1"
              resizeMode="contain"
            />
          </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Let’s help you recover your password.</Text>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeMode === 'dark' ? colors.inputBg : '#F9FAFB', color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter Email"
            placeholderTextColor={colors.gray300}
            autoCapitalize="none"
          />
        </View>



        <TouchableOpacity 
            style={[styles.verifyButton, { backgroundColor: '#526D65' }]} // Matching the button color from image
            onPress={handleVerify}
        >
            <Text style={styles.verifyButtonText}>Verify</Text>
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
      fontSize: 20,
      fontWeight: '500',
      marginBottom: 8,
  },
  subtitle: {
      fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16, // Slightly taller as per design
    fontSize: 16,
  },
  verifyButton: {
      marginTop: 20,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
  },
  verifyButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
  }
});
