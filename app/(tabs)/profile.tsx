import { SubscriptionModal } from '@/components/SubscriptionModal';
import { useTheme } from '@/context/ThemeContext';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { userService } from '@/services/api/apiServices';
import socketClient from '@/services/socket/socketClient';
import { useCoursesStore } from '@/store/courseStore';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { toast } from 'sonner-native';

const { width } = Dimensions.get('window');

const MenuItem = ({ 
  icon, 
  color, 
  label, 
  rightElement, 
  onPress, 
  isDestructive = false,
  textColor
}: { 
  icon: any, 
  color: string, 
  label: string, 
  rightElement?: React.ReactNode, 
  onPress?: () => void,
  isDestructive?: boolean,
  textColor: string
}) => (
  <TouchableOpacity 
    style={styles.menuItem} 
    onPress={onPress}
    activeOpacity={0.7}
    disabled={!onPress}
  >
    <View style={[styles.menuIconContainer, { backgroundColor: color }]}>
      {icon}
    </View>
    <Text style={[styles.menuLabel, { color: textColor }]}>{label}</Text>
    {rightElement}
  </TouchableOpacity>
);

export default function Profile() {
  const { themeMode, setThemeMode, isDark } = useTheme();
  const colors = useThemedColors();
  const router = useRouter();
  
  // Modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  
  const { logout, currentUser, updateUser, authToken } = useUserStore();
  const { clearCourses } = useCoursesStore();
  
  // Toggles
  // Use a helper to determine initial state from either field name (singular or plural)
  // Some API responses might use 'notification_enabled' while the app uses 'notifications_enabled'
  const getInitialNotificationState = () => {
    if (currentUser?.notifications_enabled !== undefined) return !!currentUser.notifications_enabled;
    // @ts-ignore - Handle possible API field naming discrepancy
    if (currentUser?.notification_enabled !== undefined) return !!currentUser.notification_enabled;
    return true; // Default to true for new users
  };

  const [notificationEnabled, setNotificationEnabled] = useState(getInitialNotificationState());
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync local state when currentUser changes (e.g. after hydration or background refresh)
  useEffect(() => {
    if (currentUser) {
      const isEnabled = getInitialNotificationState();
      console.log('[Profile] Syncing notification state from currentUser:', {
        notifications_enabled: currentUser.notifications_enabled,
        // @ts-ignore
        notification_enabled: currentUser.notification_enabled,
        finalStatus: isEnabled
      });
      setNotificationEnabled(isEnabled);
    }
  }, [currentUser?.notifications_enabled, (currentUser as any)?.notification_enabled]);

  const { openPremium } = useLocalSearchParams();

  useEffect(() => {
    if (openPremium === 'true') {
      setSubscriptionModalVisible(true);
    }
  }, [openPremium]);

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await userService.requestAccountDeletion(authToken || "");
      setDeleteModalVisible(false);
      toast.success("Account deletion request sent. You will be notified by email once processed.");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to send account deletion request. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleThemeToggle = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  /*
  const handleClearCache = () => {
    clearCourses();
    toast.success("Cache cleared successfully!");
  };
  */

  const handleLogout = async () => {
    try {
      // Explicitly disconnect socket on logout
      socketClient.disconnect();
      await logout();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback redirect even if logout errors
      router.replace("/(auth)/login");
    }
  };


  const handleNotificationToggle = async (value: boolean) => {
    try {
      // Optimistically update local state
      setNotificationEnabled(value);
      
      const updateData = {
        userId: currentUser?.userId ? String(currentUser.userId) : "",
        notifications_enabled: value,
      };

      console.log('[Profile] Toggling notifications to:', value);
      const response = await userService.updateUserProfile(updateData, authToken || "");
      console.log('[Profile] Update Response:', JSON.stringify(response, null, 2));
      
      // Update store with response or fallback to intended value
      if (response && response.user) {
        // Ensure the intended notifications_enabled value is preserved even if response is lagging
        updateUser({ ...response.user, notifications_enabled: value });
      } else {
        updateUser({ notifications_enabled: value });
      }

      toast.success(value ? "Notifications turned on" : "Notifications turned off");
    } catch (error: any) {
      console.error("Error toggling notifications:", error);
      // Revert local state on error
      setNotificationEnabled(!value);
      toast.error("Failed to update notification settings");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        {/* <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.bglight01 }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity> */}
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <View style={styles.avatarContainer} className='border-2 border-[#4285F4] rounded-full'>
            <Image 
              source={
                currentUser?.userImage
                  ? { uri: currentUser.userImage }
                  : require("@/assets/images/userAvatar.png")
              }
              style={styles.avatar} 
            />
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: colors.text }]}>{currentUser?.fullname}</Text>
            <Text style={[styles.userEmail, { color: colors.gray300 }]} className='mt-1'>{currentUser?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path d="M13.6874 3.83757L14.5124 3.01258C15.1959 2.32914 16.304 2.32914 16.9874 3.01258C17.6708 3.69603 17.6708 4.80411 16.9874 5.48756L16.1624 6.31255M13.6874 3.83757L8.13794 9.387C7.71502 9.81 7.41499 10.3398 7.26993 10.9201L6.66663 13.3333L9.07988 12.73C9.66013 12.585 10.19 12.2849 10.613 11.862L16.1624 6.31255M13.6874 3.83757L16.1624 6.31255" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
              <Path d="M15.8333 11.2493C15.8333 13.9889 15.8332 15.3587 15.0767 16.2807C14.9382 16.4494 14.7834 16.6042 14.6146 16.7427C13.6927 17.4993 12.3228 17.4993 9.58325 17.4993H9.16667C6.02397 17.4993 4.45263 17.4993 3.47632 16.523C2.50002 15.5468 2.5 13.9753 2.5 10.8327V10.416C2.5 7.67645 2.5 6.30667 3.25662 5.38472C3.39514 5.21593 3.54992 5.06116 3.7187 4.92263C4.64066 4.16602 6.01043 4.16602 8.75 4.16602" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </Svg>

          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

        {/* Premium Banner */}
        <View style={styles.premiumBanner}>
          <View style={styles.premiumContent}>
             <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                <Text style={styles.premiumTitle}>Level Up with Premium</Text>
             </View>
            <Text style={styles.premiumDesc}>
              Unlock pro skills, mentor support, and tools to grow faster.
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={() => setSubscriptionModalVisible(true)}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
          {/* Decorative Circle/Coin - simplified as I don't have the exact asset */}
          <View style={styles.premiumDecoration}>
             <Ionicons name="star" size={60} color="#FCD34D" />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuItem 
            icon={
              <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path d="M2.10831 12.3073C1.9311 13.469 2.72338 14.2753 3.69342 14.6772C7.41238 16.2178 12.5877 16.2178 16.3066 14.6772C17.2767 14.2753 18.069 13.469 17.8918 12.3073C17.7829 11.5934 17.2444 10.9989 16.8454 10.4184C16.3228 9.64877 16.2709 8.80918 16.2708 7.91602C16.2708 4.46423 13.4633 1.66602 10 1.66602C6.53682 1.66602 3.72932 4.46423 3.72932 7.91602C3.72923 8.80918 3.67731 9.64877 3.15472 10.4184C2.75574 10.9989 2.21722 11.5934 2.10831 12.3073Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M6.66663 15.834C7.0487 17.2717 8.39621 18.334 9.99996 18.334C11.6037 18.334 12.9512 17.2717 13.3333 15.834" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            }
            color="#FBBC02" 
            label="Notification" 
            rightElement={
              <Switch 
                value={notificationEnabled} 
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#D1D5DB', true: '#4B5563' }}
                thumbColor={notificationEnabled ? '#10B981' : '#F3F4F6'}
              />
            }
            textColor={colors.text}
          />

          <MenuItem 
            icon={
              <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path fillRule="evenodd" clipRule="evenodd" d="M7.94 1.43092C8.0276 1.5185 8.08721 1.63014 8.11124 1.75165C8.13528 1.87317 8.12266 1.99909 8.075 2.11342C7.69402 3.02777 7.49857 4.00872 7.5 4.99926C7.5 6.98838 8.29018 8.89604 9.6967 10.3026C11.1032 11.7091 13.0109 12.4993 15 12.4993C15.9905 12.5007 16.9715 12.3052 17.8858 11.9243C18.0001 11.8767 18.1259 11.8641 18.2473 11.8881C18.3687 11.9121 18.4803 11.9716 18.5678 12.0591C18.6554 12.1465 18.715 12.258 18.7391 12.3794C18.7633 12.5008 18.7508 12.6266 18.7033 12.7409C18.0384 14.3353 16.9164 15.6972 15.4789 16.6552C14.0414 17.6132 12.3525 18.1243 10.625 18.1243C5.7925 18.1243 1.875 14.2076 1.875 9.37426C1.875 5.73426 4.0975 2.61426 7.25833 1.29592C7.37256 1.24844 7.49831 1.23592 7.61966 1.25995C7.74101 1.28399 7.85249 1.34349 7.94 1.43092Z" fill="white"/>
              </Svg>
            }
            color="#020A26" 
            label="Dark Mode" // Changed label from image which said "Dark Mode" to match context
            rightElement={
              <Switch 
                value={isDark} 
                onValueChange={handleThemeToggle}
                trackColor={{ false: '#D1D5DB', true: '#4B5563' }}
                thumbColor={isDark ? '#10B981' : '#F3F4F6'}
              />
            }
            textColor={colors.text}
          />
          
          <MenuItem 
            icon={
              <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path fillRule="evenodd" clipRule="evenodd" d="M7.7625 6.32C10.1625 3.23583 13.9125 1.25 18.125 1.25C18.2908 1.25 18.4497 1.31585 18.5669 1.43306C18.6842 1.55027 18.75 1.70924 18.75 1.875C18.75 6.08833 16.7642 9.8375 13.68 12.2383C13.8083 13.0419 13.7607 13.8637 13.5405 14.647C13.3203 15.4304 12.9328 16.1566 12.4047 16.7757C11.8766 17.3947 11.2205 17.8918 10.4816 18.2327C9.74274 18.5736 8.93871 18.75 8.125 18.75C7.95924 18.75 7.80027 18.6842 7.68306 18.5669C7.56585 18.4497 7.5 18.2908 7.5 18.125V14.6825C6.68994 14.0428 5.95771 13.3103 5.31833 12.5H1.875C1.70924 12.5 1.55027 12.4342 1.43306 12.3169C1.31585 12.1997 1.25 12.0408 1.25 11.875C1.24993 11.0612 1.42645 10.2571 1.76735 9.51816C2.10826 8.77922 2.60544 8.12304 3.22459 7.59493C3.84374 7.06681 4.57011 6.67932 5.35356 6.45921C6.13702 6.2391 6.9589 6.1916 7.7625 6.32ZM12.5 5.625C12.0027 5.625 11.5258 5.82254 11.1742 6.17417C10.8225 6.52581 10.625 7.00272 10.625 7.5C10.625 7.99728 10.8225 8.47419 11.1742 8.82582C11.5258 9.17746 12.0027 9.375 12.5 9.375C12.9973 9.375 13.4742 9.17746 13.8258 8.82582C14.1775 8.47419 14.375 7.99728 14.375 7.5C14.375 7.00272 14.1775 6.52581 13.8258 6.17417C13.4742 5.82254 12.9973 5.625 12.5 5.625Z" fill="white"/>
                <Path d="M4.38336 14.3687C4.44919 14.3196 4.5047 14.258 4.54673 14.1875C4.58877 14.117 4.61649 14.0388 4.62833 13.9576C4.64017 13.8763 4.63589 13.7936 4.61574 13.714C4.59558 13.6344 4.55995 13.5595 4.51086 13.4937C4.46178 13.4279 4.40022 13.3724 4.32968 13.3303C4.25915 13.2883 4.18102 13.2606 4.09977 13.2487C4.01852 13.2369 3.93573 13.2412 3.85613 13.2613C3.77654 13.2815 3.70169 13.3171 3.63586 13.3662C2.99661 13.8417 2.49954 14.483 2.19843 15.2206C1.89733 15.9582 1.80365 16.7642 1.92753 17.5512C1.94768 17.6823 2.009 17.8036 2.10263 17.8975C2.19626 17.9914 2.31734 18.0531 2.44836 18.0737C3.23547 18.1975 4.04145 18.1037 4.77909 17.8024C5.51673 17.5012 6.15795 17.0039 6.63336 16.3645C6.68403 16.2989 6.72112 16.2238 6.74248 16.1437C6.76384 16.0635 6.76904 15.98 6.75778 15.8978C6.74652 15.8156 6.71902 15.7366 6.67689 15.6651C6.63475 15.5937 6.57883 15.5314 6.51237 15.4818C6.44591 15.4322 6.37024 15.3963 6.28978 15.3763C6.20932 15.3562 6.12567 15.3523 6.0437 15.3649C5.96174 15.3775 5.8831 15.4063 5.81236 15.4496C5.74163 15.4928 5.68021 15.5498 5.6317 15.617C5.34109 16.0079 4.96301 16.3252 4.52773 16.5437C4.09246 16.7622 3.61207 16.8758 3.12503 16.8754C3.12503 15.8504 3.61836 14.9395 4.38336 14.3687Z" fill="white"/>
              </Svg>
            } 
            color="#3C32FF" 
            label="Subscription Plan(Free)" 
            onPress={() => setSubscriptionModalVisible(true)}
            textColor={colors.text}
          />


          <MenuItem 
            icon={
              <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path d="M17 10.8045C17 10.4588 17 10.286 17.052 10.132C17.2032 9.68444 17.6018 9.51076 18.0011 9.32888C18.45 9.12442 18.6744 9.02219 18.8968 9.0042C19.1493 8.98378 19.4022 9.03818 19.618 9.15929C19.9041 9.31984 20.1036 9.62493 20.3079 9.87302C21.2513 11.0188 21.7229 11.5918 21.8955 12.2236C22.0348 12.7334 22.0348 13.2666 21.8955 13.7764C21.6438 14.6979 20.8485 15.4704 20.2598 16.1854C19.9587 16.5511 19.8081 16.734 19.618 16.8407C19.4022 16.9618 19.1493 17.0162 18.8968 16.9958C18.6744 16.9778 18.45 16.8756 18.0011 16.6711C17.6018 16.4892 17.2032 16.3156 17.052 15.868C17 15.714 17 15.5412 17 15.1955V10.8045Z" stroke="white" strokeWidth="1.5"/>
                <Path d="M7 10.8046C7 10.3694 6.98778 9.97821 6.63591 9.6722C6.50793 9.5609 6.33825 9.48361 5.99891 9.32905C5.55001 9.12458 5.32556 9.02235 5.10316 9.00436C4.43591 8.9504 4.07692 9.40581 3.69213 9.87318C2.74875 11.019 2.27706 11.5919 2.10446 12.2237C1.96518 12.7336 1.96518 13.2668 2.10446 13.7766C2.3562 14.6981 3.15152 15.4705 3.74021 16.1856C4.11129 16.6363 4.46577 17.0475 5.10316 16.996C5.32556 16.978 5.55001 16.8757 5.99891 16.6713C6.33825 16.5167 6.50793 16.4394 6.63591 16.3281C6.98778 16.0221 7 15.631 7 15.1957V10.8046Z" stroke="white" strokeWidth="1.5"/>
                <Path d="M5 9C5 5.68629 8.13401 3 12 3C15.866 3 19 5.68629 19 9" stroke="white" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"/>
                <Path d="M19 17V17.8C19 19.5673 17.2091 21 15 21H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            } 
            color="#34A853" 
            label="Support & Help" 
            onPress={() => router.push('/support')}
            textColor={colors.text}
          />
          
          <MenuItem 
            icon={
              <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path fill-rule="evenodd" clip-rule="evenodd" d="M4.30498 2.185V2.9C3.44248 3.02333 2.58915 3.175 1.74582 3.3525C1.58799 3.38594 1.44921 3.47912 1.35851 3.61253C1.2678 3.74595 1.2322 3.90927 1.25915 4.06833C1.46962 5.30502 2.08728 6.43593 3.014 7.28143C3.94073 8.12693 5.1234 8.63854 6.37415 8.735C7.04002 9.2792 7.82212 9.66297 8.65998 9.85667C8.58036 10.8025 8.26116 11.7125 7.73248 12.5008H7.11665C6.25332 12.5008 5.55415 13.2008 5.55415 14.0633V16.2508H4.92915C4.43187 16.2508 3.95496 16.4484 3.60333 16.8C3.25169 17.1516 3.05415 17.6286 3.05415 18.1258C3.05415 18.4708 3.33415 18.7508 3.67915 18.7508H16.1792C16.3449 18.7508 16.5039 18.685 16.6211 18.5678C16.7383 18.4506 16.8042 18.2916 16.8042 18.1258C16.8042 17.6286 16.6066 17.1516 16.255 16.8C15.9033 16.4484 15.4264 16.2508 14.9292 16.2508H14.3042V14.0633C14.3042 13.2 13.6041 12.5008 12.7417 12.5008H12.1258C11.5974 11.7124 11.2785 10.8024 11.1992 9.85667C12.0371 9.66273 12.8192 9.27866 13.485 8.73417C14.7359 8.63788 15.9187 8.12635 16.8456 7.28084C17.7725 6.43532 18.3903 5.30432 18.6008 4.0675C18.6275 3.90845 18.5917 3.74523 18.5008 3.61198C18.41 3.47873 18.2711 3.38576 18.1133 3.3525C17.2658 3.17346 16.4125 3.02255 15.555 2.9V2.18417C15.5549 2.03173 15.4991 1.88458 15.3982 1.77039C15.2972 1.65621 15.1579 1.58287 15.0067 1.56417C13.3223 1.35449 11.6265 1.24956 9.92915 1.25C8.20998 1.25 6.51582 1.35667 4.85165 1.56417C4.70052 1.58305 4.56148 1.65648 4.46067 1.77064C4.35985 1.88481 4.30419 2.03186 4.30415 2.18417L4.30498 2.185ZM4.30498 4.37583C4.30498 5.3725 4.56498 6.30917 5.01915 7.12083C4.45587 6.86824 3.95221 6.49965 3.5411 6.03914C3.12998 5.57862 2.82065 5.03655 2.63332 4.44833C3.18834 4.34063 3.7457 4.24533 4.30498 4.1625V4.37583ZM15.555 4.37583V4.1625C16.1167 4.24583 16.6742 4.34083 17.2267 4.44833C17.0394 5.03657 16.7301 5.57867 16.3189 6.03919C15.9078 6.49971 15.4041 6.86829 14.8408 7.12083C15.3105 6.28228 15.5564 5.33696 15.555 4.37583Z" fill="white"/>
              </Svg>
            } 
            color="#347AA8" 
            label="Achievements" 
            onPress={() => router.push('/achievements')}
            textColor={colors.text}
          />
          
          <MenuItem 
            icon={
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75334 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75334 2.5 12 2.5C15.8956 2.5 19.2436 4.84478 20.7095 8.2M21.5 5.5L21.025 8.675L18 8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <Path d="M10 11V9.5C10 8.39543 10.8954 7.5 12 7.5C13.1046 7.5 14 8.39543 14 9.5V11M11.25 16.5H12.75C13.9228 16.5 14.5092 16.5 14.9131 16.19C15.0171 16.1102 15.1102 16.0171 15.19 15.9131C15.5 15.5092 15.5 14.9228 15.5 13.75C15.5 12.5772 15.5 11.9908 15.19 11.5869C15.1102 11.4829 15.0171 11.3898 14.9131 11.31C14.5092 11 13.9228 11 12.75 11H11.25C10.0772 11 9.49082 11 9.08686 11.31C8.98286 11.3898 8.88977 11.4829 8.80997 11.5869C8.5 11.9908 8.5 12.5772 8.5 13.75C8.5 14.9228 8.5 15.5092 8.80997 15.9131C8.88977 16.0171 8.98286 16.1102 9.08686 16.19C9.49082 16.5 10.0772 16.5 11.25 16.5Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
              </Svg>
            }
            color="#0A55D0" 
            label="Reset Password" 
            onPress={() => router.push('/change-password')}
            textColor={colors.text}
          />
          
          {/* 
          <MenuItem 
            icon={
              <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path d="M2.5 5.83398H17.5M8.33333 9.16732V14.1673M11.6667 9.16732V14.1673M3.33333 5.83398L4.16667 15.834C4.16667 16.4973 4.43006 17.1336 4.89891 17.6025C5.36776 18.0713 6.00363 18.334 6.66663 18.334H13.3333C13.9964 18.334 14.6323 18.0713 15.1011 17.6025C15.5699 17.1336 15.8333 16.4973 15.8333 15.834L16.6667 5.83398M7.5 5.83398V3.33398C7.5 3.11297 7.5878 2.90101 7.74408 2.74473C7.90036 2.58845 8.11232 2.50065 8.33333 2.50065H11.6667C11.8877 2.50065 12.0996 2.58845 12.2559 2.74473C12.4122 2.90101 12.5 3.11297 12.5 3.33398V5.83398" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            }
            color="#FF6B00" 
            label="Clear Cache" 
            onPress={handleClearCache}
          />
          */}
          <MenuItem 
            icon={
              <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Path d="M16.25 4.58398L15.7336 12.9382C15.6016 15.0727 15.5357 16.1399 15.0007 16.9072C14.7361 17.2866 14.3956 17.6067 14.0006 17.8473C13.2017 18.334 12.1325 18.334 9.99392 18.334C7.8526 18.334 6.78192 18.334 5.98254 17.8464C5.58733 17.6054 5.24667 17.2847 4.98223 16.9047C4.4474 16.1362 4.38287 15.0674 4.25384 12.93L3.75 4.58398" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <Path d="M2.5 4.58268H17.5M13.3797 4.58268L12.8109 3.40912C12.433 2.62957 12.244 2.23978 11.9181 1.99669C11.8458 1.94277 11.7693 1.8948 11.6892 1.85327C11.3283 1.66602 10.8951 1.66602 10.0287 1.66602C9.14067 1.66602 8.69667 1.66602 8.32973 1.86112C8.24842 1.90436 8.17082 1.95427 8.09774 2.01032C7.76803 2.26327 7.58386 2.66731 7.21551 3.4754L6.71077 4.58268" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <Path d="M7.91663 13.75V8.75" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <Path d="M12.0834 13.75V8.75" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              </Svg>
            }
            color="#B10303" 
            label="Delete Account" 
            isDestructive
            onPress={() => setDeleteModalVisible(true)}
            textColor={colors.text}
          />

          <MenuItem 
            icon={
              <Ionicons name="log-out-outline" size={20} color="white" />
            }
            color="#6B7280" 
            label="Logout" 
            onPress={handleLogout}
            textColor={colors.text}
          />

        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalIconContainer}>
               <Ionicons name="trash-outline" size={40} color="#6B7280" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Account</Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Are you sure you want to Delete your account? Your request will be sent to our team, and you will receive an email once the deletion is approved and your account is deleted.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]} 
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.deleteButtonText}>Yes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SubscriptionModal 
        visible={subscriptionModalVisible}
        onClose={() => setSubscriptionModalVisible(false)}
      />
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
    fontSize: 20,
    fontWeight: 500,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  premiumBanner: {
    marginHorizontal: 20,
    backgroundColor: '#1E3A8A', // Dark Blue
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  premiumContent: {
    flex: 1,
    paddingRight: 10,
    zIndex: 2,
  },
  premiumTitle: {
     color: '#fff',
     fontSize: 16,
     fontWeight: 'bold',
  },
  premiumDesc: {
    color: '#E0E7FF', // Light indigo/blue
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 18,
  },
  upgradeButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  premiumDecoration: {
     justifyContent: 'center',
     alignItems: 'center',
     opacity: 0.8,
  },
  menuContainer: {
    paddingHorizontal: 20,
    gap: 10, // Gap between items
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Increased for better touch target
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  proBadge: {
      backgroundColor: '#526D65', // Darkish green
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
  },
  proBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalIconContainer: {
      marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
