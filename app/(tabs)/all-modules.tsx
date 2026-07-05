import CardComponent2 from '@/components/CardComponent2';
import { ThemedText } from '@/components/themed-text';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { useFetchCourses } from "@/hooks/useCourses";
import { CourseProp } from '@/store/courseStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



// --- COMPONENT ---

export default function AllModules() {
  const router = useRouter();
  const colors = useThemedColors();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);


  const { courses: coursesData, isLoading: coursesLoading, error: coursesError } = useFetchCourses();
  const courses = useMemo(() => coursesData?.courses || [], [coursesData]);

  console.log('Courses in AllModules:', {
    type: typeof coursesData,
    isArray: Array.isArray(coursesData?.courses),
    value: coursesData
  });

  // console.log(coursesData, "what exactly is here")

  // Dynamic categories from courses
  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(courses.map(c => c.category?.name).filter(Boolean)));
    return categories;
  }, [courses]);

  // Grouped courses by category
  const groupedCourses = useMemo(() => {
    const groups: { [key: string]: CourseProp[] } = {};
    
    // Latest Modules (Sorted by created_at, top 5)
    const latest = [...courses].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 5);
    
    if (latest.length > 0) {
      groups['Latest Module'] = latest;
    }

    // Group by category
    courses.forEach(course => {
      const catName = course.category?.name;
      if (catName) {
        if (!groups[catName]) {
          groups[catName] = [];
        }
        groups[catName].push(course);
      }
    });

    return groups;
  }, [courses]);

  const handleSearchFocus = () => setIsSearching(true);
  const handleCancelSearch = () => {
    Keyboard.dismiss();
    inputRef.current?.blur();
    setIsSearching(false);
    setSearchQuery('');
  };

  const navigateToDetail = (id: string) => {
    router.push(`/all-module-detail/${id}`);
  };

  const renderSection = (title: string, data: CourseProp[]) => (
    <View style={styles.sectionContainer} className='mt-5'>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={300}
        contentContainerStyle={styles.listContent}
      >
        {data.map((item) => (
          <CardComponent2
            key={item.id.toString()}
            title={item.title}
            rating={item.averageRating}
            reviews={item.reviewCount}
            isPremium={item.is_paid === 1}
            image={item.thumbnail}
            onViewModule={() => navigateToDetail(item.id.toString())}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderSearchView = () => (
     <View style={styles.searchViewContainer}>
        <View style={styles.tagsContainer}>
            {categoryOptions.map((cat, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={styles.categoryTag}
                    onPress={() => {
                        setSearchQuery(cat!);
                        Keyboard.dismiss();
                    }}
                >
                    <Text style={styles.categoryTagText}>{cat}</Text>
                </TouchableOpacity>
            ))}
        </View>
     </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <ThemedText type="title" style={styles.headerTitle}>Modules Library</ThemedText>
        
        {/* Search Bar */}
        <View style={[styles.searchBarContainer, { backgroundColor: colors.bglight01 }]}>
            <Ionicons name="search" size={20} color="#999" style={{marginRight: 8}} />
            <TextInput
                ref={inputRef}
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search Modules"
                placeholderTextColor="#999"
                value={searchQuery}
                onFocus={handleSearchFocus}
                onChangeText={setSearchQuery}
            />
             {isSearching && (
                 <TouchableOpacity onPress={handleCancelSearch}>
                     <Ionicons name="close" size={20} color={colors.text} />
                 </TouchableOpacity>
             )}
        </View>
      </View>

      {isSearching ? (
         searchQuery.length > 0 ? (
            <View style={styles.searchViewContainer}>
                <FlatList
                    data={courses.filter(item => 
                        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
                    renderItem={({ item }) => (
                         <View style={{ width: '48%' }}>
                            <CardComponent2
                                title={item.title}
                                rating={item.averageRating}
                                reviews={item.reviewCount}
                                isPremium={item.is_paid === 1}
                                image={item.thumbnail}
                                onViewModule={() => navigateToDetail(item.id.toString())}
                            />
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{alignSelf: 'center', marginTop: 20, color: '#666'}}>No modules found</Text>}
                />
            </View>
         ) : (
            renderSearchView()
         )
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {Object.keys(groupedCourses).map(category => (
                <React.Fragment key={category}>
                    {renderSection(category, groupedCourses[category])}
                </React.Fragment>
            ))}
            <View style={{height: 100}} /> 
        </ScrollView>
      )}



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#F7F7F7', // Or a themed light gray
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  // Search View Components
  searchViewContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
  },
  tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
  },
  categoryTag: {
      backgroundColor: '#F9F9F9',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 4,
  },
  categoryTagText: {
      color: '#666',
      fontSize: 14
  },

});
