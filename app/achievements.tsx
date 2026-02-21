import { useThemedColors } from '@/hooks/use-themed-colors';
import { pointsService } from '@/services/api/apiServices';
import { useUserStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function Achievements() {
  const themedColors = useThemedColors();
  const router = useRouter();

  const [rankModalVisible, setRankModalVisible] = useState(false);
  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userPointsData, setUserPointsData] = useState<any>(null);

  const { currentUser, authToken } = useUserStore();


  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!authToken) return;
      
      setLoading(true);
      try {
        const data = await pointsService.getUserPoints(authToken);
        setUserPointsData(data.userPoints);
      } catch (error) {
        console.error("Error fetching achievements data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPoints();
  }, [authToken]);

  console.log(JSON.stringify(userPointsData, null, 2), "check current user")

  const AchievementItem = ({ 
    label, 
    onPress 
  }: { 
    label: string, 
    onPress: () => void 
  }) => (
    <TouchableOpacity 
      style={[styles.itemContainer, { backgroundColor: themedColors.backgroundBg }]}
      onPress={onPress}
    >
      <Text style={[styles.itemLabel, { color: themedColors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={themedColors.gray300} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themedColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: themedColors.bglight10 }]} 
          onPress={() => router.back()}
        >
          <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <Path fillRule="evenodd" clipRule="evenodd" d="M7.01813 11.3914C6.89044 11.2636 6.81873 11.0903 6.81873 10.9096C6.81873 10.7289 6.89044 10.5556 7.01813 10.4278L13.8363 3.60959C13.8987 3.5426 13.974 3.48887 14.0576 3.4516C14.1413 3.41434 14.2316 3.3943 14.3231 3.39268C14.4147 3.39107 14.5056 3.40791 14.5905 3.4422C14.6754 3.47649 14.7525 3.52753 14.8173 3.59228C14.882 3.65702 14.933 3.73414 14.9673 3.81904C15.0016 3.90394 15.0185 3.99488 15.0168 4.08642C15.0152 4.17797 14.9952 4.26826 14.9579 4.35189C14.9207 4.43553 14.8669 4.5108 14.7999 4.57322L8.46358 10.9096L14.7999 17.2459C14.8669 17.3084 14.9207 17.3836 14.9579 17.4673C14.9952 17.5509 15.0152 17.6412 15.0168 17.7327C15.0185 17.8243 15.0016 17.9152 14.9673 18.0001C14.933 18.085 14.882 18.1621 14.8173 18.2269C14.7525 18.2916 14.6754 18.3427 14.5905 18.377C14.5056 18.4113 14.4147 18.4281 14.3231 18.4265C14.2316 18.4249 14.1413 18.4048 14.0576 18.3676C13.974 18.3303 13.8987 18.2766 13.8363 18.2096L7.01813 11.3914Z" fill="#5A7C65" fillOpacity="0.5"/>
          </Svg>

        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={[styles.pageTitle, { color: themedColors.text }]}>Achievement 🏆</Text>
        <Text style={[styles.subTitle, { color: themedColors.gray300 }]}>Your Learning Journey.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.listContainer}>
          <AchievementItem 
            label="Rank level" 
            onPress={() => setRankModalVisible(true)} 
          />
          <AchievementItem 
            label="Total Points" 
            onPress={() => setPointsModalVisible(true)} 
          />
           <AchievementItem 
            label="Certificate" 
            onPress={() => router.push('/certificates')} 
          />
           <AchievementItem 
            label="Completed Courses" 
            onPress={() => router.push('/completed-courses')} 
          />
        </View>
      </ScrollView>

      {/* Rank Level Modal (Silver Level) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={rankModalVisible}
        onRequestClose={() => setRankModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: themedColors.modalBg }]}>
                {/* Silver Medal Icon Placeholder */}
                <View style={styles.iconContainer} className='w-[100px] h-[100px]'>
                    <Image
                        source={require('../assets/images/silver.png')}
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        resizeMode="cover"
                    />
                </View>
                
                <Text style={[styles.modalTitle, { color: themedColors.text }]}>{userPointsData?.level || currentUser?.reward_level || 'N/A'} level</Text>
                <Text style={[styles.modalText, { color: themedColors.gray700 }]}>
                    You are currently on {userPointsData?.level || currentUser?.reward_level || 'N/A'} level.
                </Text>

                <TouchableOpacity 
                    style={[styles.primaryButton, { backgroundColor: '#526D65' }]}
                    onPress={() => setRankModalVisible(false)}
                >
                    <Text style={styles.primaryButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* Total Points Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={pointsModalVisible}
        onRequestClose={() => setPointsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
             <View style={[styles.modalContent, { backgroundColor: themedColors.modalBg }]}>
                {/* Gift/Points Icon Placeholder */}
                <View style={styles.iconContainer} className='w-[100px] h-[100px]'>
                     <Image
                        source={require('../assets/images/gift.png')}
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        resizeMode="cover"
                    />
                </View>

                <Text style={[styles.modalTitle, { color: themedColors.text }]}>Current Points: {userPointsData?.total_points || 0} Points</Text>
                <Text style={[styles.modalText, { color: themedColors.gray700 }]}>
                    You've accumulated a total of {userPointsData?.total_points || 0} Points
                </Text>

                <View style={styles.modalButtonsRow}>
                    <TouchableOpacity 
                        style={[styles.rowButton, styles.cancelButton]}
                        onPress={() => setPointsModalVisible(false)}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                         style={[styles.rowButton, { backgroundColor: '#526D65' }]}
                         onPress={() => {
                             setPointsModalVisible(false);
                             // Navigate to history if needed
                         }}
                    >
                        <Text style={styles.primaryButtonText}>Point History</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    // Add subtle shadow or border if needed to match design "cards"
    // Using a light gray background for items if main bg is white
  },
  itemLabel: {
    fontSize: 16,
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
    padding: 30,
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
  iconContainer: {
      marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonsRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
  },
  rowButton: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
  },
  cancelButton: {
      backgroundColor: '#D1D5DB', // Gray 300 equivalent roughly
  },
  cancelButtonText: {
      color: '#374151',
      fontWeight: '600',
      fontSize: 16,
  },
});
