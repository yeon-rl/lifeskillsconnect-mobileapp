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

const DUMMY_CERTIFICATES = [
  {
    id: '1',
    title: 'Financial literacy and Budgeting',
    instructor: 'Andrew Dickson',
    date: '2week ago',
    image: require('../assets/images/woman.png'),
  },
  {
    id: '2',
    title: 'Cybersecurity Awareness',
    instructor: 'Sarah Jenkins',
    date: '3week ago',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
  },
  {
    id: '3',
    title: 'Digital Marketing Basics',
    instructor: 'Mike Ross',
    date: '1month ago',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
  },
  {
    id: '4',
    title: 'Leadership Skills',
    instructor: 'Harvey Specter',
    date: '2months ago',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
  },
];

export default function Certificates() {
  const colors = useThemedColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<typeof DUMMY_CERTIFICATES[0] | null>(null);

  const handleCertificatePress = (cert: typeof DUMMY_CERTIFICATES[0]) => {
    setSelectedCertificate(cert);
    setModalVisible(true);
  };

  const filteredCertificates = DUMMY_CERTIFICATES.filter(cert => 
    cert.title.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Text style={[styles.title, { color: colors.text }]}>Certificate 🎓</Text>
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
        {filteredCertificates.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => handleCertificatePress(item)}
          >
            <Image source={{ uri: item.image }} style={styles.courseImage} />
            <View style={styles.cardContent}>
              <Text style={[styles.courseTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.instructor, { color: colors.gray700 }]}>{item.instructor}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
             <Ionicons name="chevron-forward" size={20} color={colors.gray300} />
          </TouchableOpacity>
        ))}
         {/* Separators are handled by margin/gap */}
      </ScrollView>

      {/* Certificate Modal */}
      <CertificateModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        courseName={selectedCertificate?.title}
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
    fontSize: 24,
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
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // Very light gray divider
  },
  courseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructor: {
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#5A7C65', // Green color from image
    fontWeight: '500',
  },
});
