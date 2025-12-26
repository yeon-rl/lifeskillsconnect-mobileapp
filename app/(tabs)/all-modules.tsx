import CardComponent2 from '@/components/CardComponent2';
import { ThemedText } from '@/components/themed-text';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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

// --- MOCK DATA ---
const ALL_CATEGORIES = [
  'Career Guidance',
  'Professional Development',
  'Financial literacy and Budgeting',
  'Health',
  'Interview and workplace skills'
];

interface ModuleItem {
  id: string;
  title: string;
  rating: number;
  reviews: number;
  image?: any; // In a real app, use source type
}

const LATEST_MODULES: ModuleItem[] = [
  { id: '1', title: 'Interview and workplace skills', rating: 4.6, reviews: 344 },
  { id: '2', title: 'Interview and workplace skills', rating: 4.6, reviews: 344 },
];

const CAREER_GUIDANCE: ModuleItem[] = [
  { id: '3', title: 'Resume and cover letter writing', rating: 4.8, reviews: 150 },
  { id: '4', title: 'Resume and cover letter writing', rating: 4.8, reviews: 150 },
];

const PROFESSIONAL_DEV: ModuleItem[] = [
  { id: '5', title: 'Networking and personal branding', rating: 4.7, reviews: 200 },
  { id: '6', title: 'Networking and personal branding', rating: 4.7, reviews: 200 },
];

const SKILL_ENHANCEMENT: ModuleItem[] = [
  { id: '7', title: 'Time management and productivity', rating: 4.9, reviews: 120 },
  { id: '8', title: 'Time management and productivity', rating: 4.9, reviews: 120 },
];

// --- COMPONENT ---

export default function AllModules() {
  const router = useRouter();
  const colors = useThemedColors();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);

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

  const renderSection = (title: string, data: ModuleItem[]) => (
    <View style={styles.sectionContainer} className='mt-5'>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={{ marginRight: 16 }}>
            <CardComponent2
              title={item.title}
              rating={item.rating}
              reviews={item.reviews}
              onViewModule={() => navigateToDetail(item.id)}
            />
          </View>
        )}
      />
    </View>
  );

  const renderSearchView = () => (
     <View style={styles.searchViewContainer}>
        <View style={styles.tagsContainer}>
            {ALL_CATEGORIES.map((cat, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={styles.categoryTag}
                    onPress={() => {
                        setSearchQuery(cat);
                        // IsSearching is already true if we are here (implied by view structure? no)
                        // Actually renderSearchView is called when isSearching=true but query empty?
                        // Or maybe we want to start search if not.
                        // But wait, renderSearchView is shown when isSearching is true OR false?
                        // No, let's check usage.
                        // renderSearchView is in the 'else' of query length check.
                        // So isSearching must be true.
                        // Wait, if I set query, it auto filters.
                        // But I need to ensure keyboard doesn't dismiss if I don't want it to
                        // Or maybe I do want to dismiss it? usually tag click searches.
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
                    data={[
                        ...LATEST_MODULES.map(i => ({...i, category: 'Latest Module'})), 
                        ...CAREER_GUIDANCE.map(i => ({...i, category: 'Career Guidance'})), 
                        ...PROFESSIONAL_DEV.map(i => ({...i, category: 'Professional Development'})), 
                        ...SKILL_ENHANCEMENT.map(i => ({...i, category: 'Skill Enhancement'}))
                    ].filter(item => 
                        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.category.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    keyExtractor={(item, index) => item.id + index}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
                    renderItem={({ item }) => (
                         <View style={{ width: '48%' }}>
                            <CardComponent2
                                title={item.title}
                                rating={item.rating}
                                reviews={item.reviews}
                                onViewModule={() => navigateToDetail(item.id)}
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
            {renderSection('Latest Module', LATEST_MODULES)}
            {renderSection('Career Guidance', CAREER_GUIDANCE)}
            {renderSection('Professional Development', PROFESSIONAL_DEV)}
            {renderSection('Skill Enhancement', SKILL_ENHANCEMENT)}
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
