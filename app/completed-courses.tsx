import { CertificateModal } from '@/components/CertificateModal';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const DUMMY_COMPLETED_COURSES = [
  {
    id: '1',
    title: 'Financial literacy and Budgeting',
    instructor: 'Andrew Dickson',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
  },
  {
    id: '2',
    title: 'Cybersecurity Awareness',
    instructor: 'Sarah Jenkins',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
  },
  {
    id: '3',
    title: 'Digital Marketing Basics',
    instructor: 'Mike Ross',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
  },
];

export default function CompletedCourses() {
  const colors = useThemedColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<typeof DUMMY_COMPLETED_COURSES[0] | null>(null);

  const handleCreatePress = (course: typeof DUMMY_COMPLETED_COURSES[0]) => {
    setSelectedCourse(course);
    setModalVisible(true);
  };

  const filteredCourses = DUMMY_COMPLETED_COURSES.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.bglight10 }]} 
          onPress={() => router.back()}
        >
          <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <Path fill-rule="evenodd" clip-rule="evenodd" d="M7.018 11.3914C6.89032 11.2636 6.8186 11.0903 6.8186 10.9096C6.8186 10.7289 6.89032 10.5556 7.018 10.4278L13.8362 3.60959C13.8986 3.5426 13.9739 3.48887 14.0575 3.4516C14.1412 3.41434 14.2314 3.3943 14.323 3.39268C14.4145 3.39107 14.5055 3.40791 14.5904 3.4422C14.6753 3.47649 14.7524 3.52753 14.8171 3.59228C14.8819 3.65702 14.9329 3.73414 14.9672 3.81904C15.0015 3.90394 15.0183 3.99488 15.0167 4.08642C15.0151 4.17797 14.9951 4.26826 14.9578 4.35189C14.9205 4.43553 14.8668 4.5108 14.7998 4.57322L8.46346 10.9096L14.7998 17.2459C14.8668 17.3084 14.9205 17.3836 14.9578 17.4673C14.9951 17.5509 15.0151 17.6412 15.0167 17.7327C15.0183 17.8243 15.0015 17.9152 14.9672 18.0001C14.9329 18.085 14.8819 18.1621 14.8171 18.2269C14.7524 18.2916 14.6753 18.3427 14.5904 18.377C14.5055 18.4113 14.4145 18.4281 14.323 18.4265C14.2314 18.4249 14.1412 18.4048 14.0575 18.3676C13.9739 18.3303 13.8986 18.2766 13.8362 18.2096L7.018 11.3914Z" fill="#5A7C65" fill-opacity="0.5"/>
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Completed Courses</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.bglight01 || '#F9FAFB' }]}>
        <Ionicons name="search" size={20} color={colors.gray300} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search Modules"
          placeholderTextColor={colors.gray300}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredCourses.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.courseImage} />
            <View style={styles.cardContent}>
              <Text style={[styles.courseTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.instructor, { color: colors.gray300 }]}>{item.instructor}</Text>
              
              <View style={styles.completedBadge}>
                <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <Path fill-rule="evenodd" clip-rule="evenodd" d="M4.50004 1.09721C4.79893 0.752413 5.16851 0.475969 5.5837 0.286649C5.99888 0.0973298 6.44994 -0.000432304 6.90625 1.43698e-06C7.86746 1.43698e-06 8.72879 0.425001 9.31246 1.09721C9.7677 1.0647 10.2246 1.13056 10.6521 1.29031C11.0797 1.45005 11.4678 1.69994 11.7902 2.023C12.1131 2.34534 12.363 2.73337 12.5227 3.16077C12.6824 3.58816 12.7484 4.04492 12.716 4.50004C13.0607 4.799 13.337 5.16861 13.5262 5.58379C13.7154 5.99897 13.813 6.45 13.8125 6.90625C13.8129 7.36256 13.7152 7.81362 13.5259 8.22881C13.3365 8.64399 13.0601 9.01357 12.7153 9.31246C12.7476 9.76758 12.6817 10.2243 12.522 10.6517C12.3622 11.0791 12.1124 11.4672 11.7895 11.7895C11.4672 12.1124 11.0791 12.3622 10.6517 12.522C10.2243 12.6817 9.76758 12.7476 9.31246 12.7153C9.01357 13.0601 8.64399 13.3365 8.22881 13.5259C7.81362 13.7152 7.36256 13.8129 6.90625 13.8125C6.44994 13.8129 5.99888 13.7152 5.5837 13.5259C5.16851 13.3365 4.79893 13.0601 4.50004 12.7153C4.04485 12.7479 3.58798 12.6821 3.16045 12.5225C2.73292 12.3629 2.34474 12.1131 2.02229 11.7902C1.69927 11.4678 1.44941 11.0796 1.28966 10.6521C1.12992 10.2246 1.06404 9.7677 1.0965 9.31246C0.751834 9.01351 0.475524 8.64389 0.286328 8.22871C0.097132 7.81353 -0.000519642 7.36251 2.07956e-06 6.90625C2.07956e-06 5.94504 0.425002 5.08371 1.09721 4.50004C1.06481 4.04492 1.13072 3.58814 1.29046 3.16074C1.4502 2.73334 1.70003 2.34531 2.023 2.023C2.34531 1.70003 2.73334 1.4502 3.16074 1.29046C3.58815 1.13072 4.04492 1.06481 4.50004 1.09721ZM9.46334 5.62133C9.50583 5.5647 9.53659 5.50015 9.55378 5.43146C9.57097 5.36278 9.57427 5.29135 9.56346 5.22138C9.55265 5.1514 9.52797 5.08429 9.49086 5.02399C9.45374 4.9637 9.40495 4.91143 9.34735 4.87025C9.28975 4.82908 9.22449 4.79984 9.15543 4.78425C9.08636 4.76865 9.01488 4.76702 8.94517 4.77945C8.87547 4.79188 8.80895 4.81812 8.74953 4.85663C8.69011 4.89513 8.63899 4.94512 8.59917 5.00367L6.307 8.21242L5.15667 7.06208C5.05596 6.96824 4.92276 6.91716 4.78513 6.91959C4.6475 6.92201 4.51619 6.97777 4.41885 7.0751C4.32152 7.17244 4.26576 7.30375 4.26334 7.44138C4.26091 7.57901 4.312 7.71221 4.40584 7.81292L5.99959 9.40667C6.05412 9.46116 6.11986 9.50313 6.19224 9.52967C6.26463 9.5562 6.34192 9.56666 6.41875 9.56033C6.49558 9.55399 6.57012 9.53101 6.63718 9.49298C6.70424 9.45495 6.76221 9.40277 6.80709 9.34008L9.46334 5.62133Z" fill="#5A7C65"/>
                </Svg>

                 <Text style={styles.completedText}>Completed</Text>
              </View>

              <TouchableOpacity 
                style={styles.viewCertButton}
                onPress={() => handleCreatePress(item)}
              >
                  <Text style={styles.viewCertText}>View Certificate</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Certificate Modal */}
      <CertificateModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        courseName={selectedCourse?.title}
      />
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
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30, // More space between items due to button
  },
  courseImage: {
    width: 80, // Slightly larger image
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instructor: {
    fontSize: 14,
    marginBottom: 6,
  },
  completedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 5,
  },
  completedText: {
      color: '#526D65', // Greenish
      fontSize: 12,
      fontStyle: 'italic',
      fontWeight: '500',
  },
  viewCertButton: {
      backgroundColor: '#526D65',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignSelf: 'flex-start',
  },
  viewCertText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 12,
  },
});
