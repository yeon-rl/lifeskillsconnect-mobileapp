import { useTheme } from '@/context/ThemeContext';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { authService, userService } from '@/services/api/apiServices';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function CreateNewPassword() {
  const colors = useThemedColors();
  const router = useRouter();
  const { themeMode } = useTheme();
  const { token, email } = useLocalSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ password?: string; confirm?: string }>({});

  const handleBack = () => {
    router.back();
  };

  const handleVerify = async () => {
    let newErrors: { password?: string; confirm?: string } = {};

    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirm = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    setError({});
    setLoading(true);
    try {
      if (!email) {
        throw new Error('Email is missing. Please try again from the beginning.');
      }
      await authService.resetPassword({ 
          email: String(email), 
          newPassword: password 
      });
      setModalVisible(true);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to change password. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
      setModalVisible(false);
      router.replace('/(auth)/login'); 
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
            <Text style={[styles.title, { color: colors.text }]}>Create New Password 👍🏻</Text>
            <Text style={[styles.subtitle, { color: colors.gray300 }]}>Enter new password</Text>
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>New password</Text>
          <View style={[styles.inputContainer, { backgroundColor: themeMode === 'dark' ? colors.inputBg : '#F9FAFB' }]}>
            <TextInput
                style={[styles.input, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.gray300}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                 <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.gray300} />
            </TouchableOpacity>
          </View>
          {error.password && <Text style={styles.errorText}>{error.password}</Text>}
        </View>

         {/* Confirm Password */}
         <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
          <View style={[styles.inputContainer, { backgroundColor: themeMode === 'dark' ? colors.inputBg : '#F9FAFB' }]}>
            <TextInput
                style={[styles.input, { color: colors.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="Enter Password"
                placeholderTextColor={colors.gray300}
            />
             <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                 <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.gray300} />
            </TouchableOpacity>
          </View>
          {error.confirm && <Text style={styles.errorText}>{error.confirm}</Text>}
        </View>

        <TouchableOpacity 
            style={[styles.verifyButton, { backgroundColor: '#526D65' }, loading && { opacity: 0.7 }]} 
            onPress={handleVerify}
            disabled={loading}
        >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
        </TouchableOpacity>

      </ScrollView>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                {/* Custom Success Icon/Illustration based on image */}
                <View style={styles.illustrationContainer}>
                     {/* Simplified representation of the confetti + checkmark badge */}
                     <Svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                        {/* Green Badge */}
                        <Circle cx="60" cy="60" r="50" fill="#E8F9F1" />
                        <Circle cx="60" cy="60" r="40" fill="#D1FAE5" />
                        <Path d="M40 60 L55 75 L80 45" stroke="#10B981" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Decorative elements could be added here */}
                     </Svg>
                </View>

                <Text style={styles.modalTitle}>Successful!!</Text>
                <Text style={styles.modalText}>You have successfully reset your password</Text>

                <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: '#526D65' }]}
                    onPress={handleDone}
                >
                    <Text style={styles.modalButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

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
      fontSize: 24,
      fontWeight: 'bold',
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
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  eyeIcon: {
      padding: 8,
  },
  verifyButton: {
      marginTop: 20,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
  },
  verifyButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 25,
  },
  modalContent: {
      backgroundColor: '#fff',
      borderRadius: 24,
      padding: 30,
      width: '100%',
      alignItems: 'center',
  },
  illustrationContainer: {
      marginBottom: 20,
  },
  modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#000',
  },
  modalText: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 20,
  },
  modalButton: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
  },
  modalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  }

});
