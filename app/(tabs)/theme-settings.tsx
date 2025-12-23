import { useTheme } from '@/context/ThemeContext';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function ThemeSettings() {
  const { themeMode, setThemeMode, isDark } = useTheme();
  const colors = useThemedColors();
  const router = useRouter();
  const logout = useUserStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleThemeModeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.gray300 }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {themeMode === 'system' ? 'Following system' : themeMode === 'dark' ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={(value) => handleThemeModeChange(value ? 'dark' : 'light')}
            trackColor={{ false: colors.gray300, true: colors.primary }}
            thumbColor={isDark ? colors.white : colors.white}
          />
        </View>

        <View style={styles.themeOptions}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              themeMode === 'light' && styles.themeOptionActive,
              { 
                borderColor: themeMode === 'light' ? colors.primary : colors.gray300,
                backgroundColor: themeMode === 'light' ? colors.bglight01 : 'transparent'
              }
            ]}
            onPress={() => handleThemeModeChange('light')}
          >
            <Text style={[
              styles.themeOptionText,
              { color: themeMode === 'light' ? colors.primary : colors.text }
            ]}>
              ☀️ Light
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              themeMode === 'dark' && styles.themeOptionActive,
              { 
                borderColor: themeMode === 'dark' ? colors.primary : colors.gray300,
                backgroundColor: themeMode === 'dark' ? colors.bglight01 : 'transparent'
              }
            ]}
            onPress={() => handleThemeModeChange('dark')}
          >
            <Text style={[
              styles.themeOptionText,
              { color: themeMode === 'dark' ? colors.primary : colors.text }
            ]}>
              🌙 Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              themeMode === 'system' && styles.themeOptionActive,
              { 
                borderColor: themeMode === 'system' ? colors.primary : colors.gray300,
                backgroundColor: themeMode === 'system' ? colors.bglight01 : 'transparent'
              }
            ]}
            onPress={() => handleThemeModeChange('system')}
          >
            <Text style={[
              styles.themeOptionText,
              { color: themeMode === 'system' ? colors.primary : colors.text }
            ]}>
              📱 System
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.bglight01, borderColor: colors.gray300 }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: '#ef4444' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  themeOptionActive: {
    borderWidth: 2,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
