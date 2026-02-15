import { useTheme } from '@/context/ThemeContext';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { userService } from '@/services/api/apiServices';
import { useUserStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPassword() {
  const colors = useThemedColors();
  const router = useRouter();
  const { themeMode } = useTheme();

  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser } = useUserStore();
  
  useEffect(() => {
    if (currentUser) {
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.phone) {
          setPhone(currentUser.phone);
          // If phone exists but email doesn't, switch to phone tab
          if (!currentUser.email) setActiveTab('phone');
      }
    }
  }, [currentUser]);

  const handleBack = () => {
    router.back();
  };

  const handleVerify = async () => {
    if (activeTab === 'email' && !email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (activeTab === 'phone' && !phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const data = activeTab === 'email' ? { email } : { phone };
      await userService.requestPasswordOTP(data);
      
      router.push({
        pathname: '/otp-verification',
        params: { 
          email: activeTab === 'email' ? email : undefined,
          phone: activeTab === 'phone' ? phone : undefined
        }
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to request OTP. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
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

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'email' && { borderBottomColor: '#526D65', borderBottomWidth: 2 }]} 
            onPress={() => setActiveTab('email')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'email' ? '#526D65' : colors.textSecondary }]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'phone' && { borderBottomColor: '#526D65', borderBottomWidth: 2 }]} 
            onPress={() => setActiveTab('phone')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'phone' ? '#526D65' : colors.textSecondary }]}>Phone Number</Text>
          </TouchableOpacity>
        </View>

        {/* Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{activeTab === 'email' ? 'Email' : 'Phone Number'}</Text>
          {activeTab === 'email' ? (
            <TextInput
              style={[
                styles.input, 
                { 
                    backgroundColor: themeMode === 'dark' ? colors.inputBg : '#F9FAFB', 
                    color: colors.text,
                    opacity: currentUser?.email ? 0.6 : 1
                }
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Enter Email"
              placeholderTextColor={colors.gray300}
              autoCapitalize="none"
              editable={!currentUser?.email}
            />
          ) : (
            <TextInput
              style={[
                styles.input, 
                { 
                    backgroundColor: themeMode === 'dark' ? colors.inputBg : '#F9FAFB', 
                    color: colors.text,
                    opacity: currentUser?.phone ? 0.6 : 1
                }
              ]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Enter Phone Number"
              placeholderTextColor={colors.gray300}
              editable={!currentUser?.phone}
            />
          )}
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingVertical: 10,
    marginRight: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
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
