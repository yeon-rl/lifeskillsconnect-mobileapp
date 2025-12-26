import { useTheme } from '@/context/ThemeContext';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfile() {
  const colors = useThemedColors();
  const router = useRouter();
  const { themeMode } = useTheme();

  const [name, setName] = useState('John Okoro');
  const [email, setEmail] = useState('johnokoro@gmail.com');
  const [mobile, setMobile] = useState('+234 8072219794');
  const [location, setLocation] = useState('London');
  const [paramLanguage, setParamLanguage] = useState('English');
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.bglight01 }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Picker */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
            <Image
              source={image ? { uri: image } : require('@/assets/images/userAvatar.png')}
              style={styles.profileImage}
              contentFit="cover"
            />
            <View style={[styles.cameraIconContainer, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB', color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={colors.gray300}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB', color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
             placeholder="Email"
            placeholderTextColor={colors.gray300}
          />
        </View>

        {/* Mobile Number */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Mobile Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB', color: colors.text }]}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
             placeholder="Mobile Number"
            placeholderTextColor={colors.gray300}
          />
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Location</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB', color: colors.text }]}
            value={location}
            onChangeText={setLocation}
             placeholder="Location"
            placeholderTextColor={colors.gray300}
          />
        </View>

         {/* Preferred Language */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Preferred Language</Text>
          <TouchableOpacity style={[styles.input, styles.dropdown, { backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB' }]}>
             <Text style={{ color: colors.text }}>{paramLanguage}</Text>
             <Ionicons name="chevron-down" size={20} color={colors.gray300} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 20,
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
    paddingVertical: 14,
    fontSize: 16,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
  },
});
