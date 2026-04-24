import { useTheme } from '@/context/ThemeContext';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { authService, userService } from '@/services/api/apiServices';
import { useUserStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { toast } from 'sonner-native';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada",
  "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia",
  "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe",
];

const FALLBACK_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

export default function EditProfile() {
  const colors = useThemedColors();
  const router = useRouter();
  const { themeMode } = useTheme();

  const { currentUser, updateUser, authToken } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState(currentUser?.username ?? '');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [languages, setLanguages] = useState<any[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);

  const [name, setName] = useState(currentUser?.fullname ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [mobile, setMobile] = useState(currentUser?.phone ?? '');
  const [location, setLocation] = useState(currentUser?.nationality ?? '');
  const [paramLanguage, setParamLanguage] = useState(currentUser?.preferred_language ?? '');
  const [image, setImage] = useState<string | null>(currentUser?.userImage ?? null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [city, setCity] = useState(currentUser?.city ?? '');

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoadingLanguages(true);
        const data = await authService.getLanguages();
        const languagesList = data.languages || data.data || data || [];
        setLanguages(Array.isArray(languagesList) && languagesList.length > 0 ? languagesList : FALLBACK_LANGUAGES);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      } finally {
        setLoadingLanguages(false);
      }
    };
    fetchLanguages();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageFile(result.assets[0]);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      let imageUrl = currentUser?.userImage || "";

      if (imageFile) {
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
          uri: imageFile.uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
        formData.append('upload_preset', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (!cloudinaryResponse.ok) {
          throw new Error("Failed to upload image to Cloudinary");
        }

        const cloudinaryData = await cloudinaryResponse.json();
        imageUrl = cloudinaryData.secure_url;
      }

      const updateData = {
        userId: currentUser?.userId ? String(currentUser.userId) : "",
        fullname: name,
        username: username,
        phoneNumber: mobile,
        userImage: imageUrl,
        nationality: location,
        city: city,
        preferred_language: paramLanguage,
      };

      const response = await userService.updateUserProfile(updateData, authToken || "");
      
      if (response && response.user) {
        updateUser(response.user);
      } else {
        // Fallback update if response doesn't return full user
        updateUser({
          fullname: name,
          phone: mobile,
          nationality: location,
          city: city,
          preferred_language: paramLanguage,
          userImage: imageUrl,
        });
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error saving changes:", error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to save profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
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

        {/* Username */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Username</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB', color: colors.text }]}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor={colors.gray300}
            autoCapitalize="none"
          />
          <View style={styles.hintContainer}>
            <Ionicons name="information-circle-outline" size={14} color={colors.gray300} />
            <Text style={[styles.hint, { color: colors.gray300 }]}>
              You can only change your username once a month.
            </Text>
          </View>
        </View>

        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Name</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB', 
                color: colors.text,
                opacity: 0.7 
              }
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={colors.gray300}
            editable={false}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB', 
                color: colors.text,
                opacity: currentUser?.email ? 0.7 : 1 
              }
            ]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={colors.gray300}
            editable={!currentUser?.email}
          />
        </View>

        {/* Mobile Number */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Mobile Number</Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB', 
                color: colors.text,
                opacity: currentUser?.phone ? 0.7 : 1 
              }
            ]}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            placeholder="Mobile Number"
            placeholderTextColor={colors.gray300}
            editable={!currentUser?.phone}
          />
        </View>

        {/* City */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>City</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB', color: colors.text }]}
            value={city}
            onChangeText={setCity}
            placeholder="City (e.g. Port Harcourt)"
            placeholderTextColor={colors.gray300}
          />
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Location</Text>
          <TouchableOpacity 
            onPress={() => setShowCountryDropdown(!showCountryDropdown)}
            disabled={!!currentUser?.nationality}
            style={[
              styles.input, 
              styles.dropdown, 
              { 
                backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB',
                opacity: currentUser?.nationality ? 0.7 : 1
              }
            ]}
          >
             <Text style={{ color: colors.text }}>{location || 'Select Country'}</Text>
             <Ionicons name={showCountryDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.gray300} />
          </TouchableOpacity>

          {showCountryDropdown && (
            <View style={[styles.inlineDropdown, { backgroundColor: colors.background, borderColor: colors.primary }]}>
              <View style={[styles.searchContainer, { backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F3F4F6', margin: 10 }]}>
                <Ionicons name="search" size={20} color={colors.gray300} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search country..."
                  placeholderTextColor={colors.gray300}
                  value={countrySearch}
                  onChangeText={setCountrySearch}
                />
              </View>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
                {COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.languageItem,
                      location === item && { backgroundColor: themeMode === 'dark' ? colors.bglight10 : '#F3F4F6' }
                    ]}
                    onPress={() => {
                      setLocation(item);
                      setShowCountryDropdown(false);
                      setCountrySearch('');
                    }}
                  >
                    <Text style={[styles.languageText, { color: colors.text }]}>{item}</Text>
                    {location === item && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

         {/* Preferred Language */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Preferred Language</Text>
          <TouchableOpacity 
            onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            style={[styles.input, styles.dropdown, { backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F9FAFB' }]}
          >
             <Text style={{ color: colors.text }}>{paramLanguage || 'Select Language'}</Text>
             <Ionicons name={showLanguageDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.gray300} />
          </TouchableOpacity>

          {showLanguageDropdown && (
            <View style={[styles.inlineDropdown, { backgroundColor: colors.background, borderColor: colors.primary }]}>
              <View style={[styles.searchContainer, { backgroundColor: themeMode === 'dark' ? colors.bglight01 : '#F3F4F6', margin: 10 }]}>
                <Ionicons name="search" size={20} color={colors.gray300} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search language..."
                  placeholderTextColor={colors.gray300}
                  value={languageSearch}
                  onChangeText={setLanguageSearch}
                />
              </View>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
                {languages.filter(l => l.name.toLowerCase().includes(languageSearch.toLowerCase())).map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.languageItem,
                      paramLanguage === item.name && { backgroundColor: themeMode === 'dark' ? colors.bglight10 : '#F3F4F6' }
                    ]}
                    onPress={() => {
                      setParamLanguage(item.name);
                      setShowLanguageDropdown(false);
                      setLanguageSearch('');
                    }}
                  >
                    <Text style={[styles.languageText, { color: colors.text }]}>{item.flag || "🌐"} {item.name}</Text>
                    {paramLanguage === item.name && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.bottomSaveButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bottomSaveText}>Save Changes</Text>
          )}
        </TouchableOpacity>

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
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  hint: {
    fontSize: 12,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  inlineDropdown: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  languageText: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  bottomSaveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  bottomSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
