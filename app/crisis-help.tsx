import { useThemedColors } from '@/hooks/use-themed-colors';
import { getCrisesHelp } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { toast } from 'sonner-native';

interface CrisisHelpCard {
  id: string;
  name: string;
  description: string;
  number: string;
  bgColor?: string;
  textColor?: string;
  buttonColor?: string;
}

const crisisTemplates = [
  {
    id: '1',
    title: '🆘 Emergency Services',
    bgColor: '#EB433530',
    buttonColor: '#A10707',
    textColor: '#A10707',
  },
  {
    id: '2',
    title: '💬 Mental Health & Emotional Support',
    bgColor: '#4285F445',
    buttonColor: '#4285F4',
    textColor: '#4285F4',
  },
  {
    id: '3',
    title: 'Papyrus HOPELINEUK',
    bgColor: '#2009F133',
    buttonColor: '#2009F1',
    textColor: '#2009F1',
  },
  {
    id: '4',
    title: '🏠 Abuse & Domestic Violence',
    bgColor: '#5A7C654D',
    buttonColor: '#5A7C65',
    textColor: '#5A7C65',
  },
  {
    id: '5',
    title: '🧒 Children & Young People',
    bgColor: '#7A1D6F42',
    buttonColor: '#7A1D6F',
    textColor: '#7A1D6F',
  },
  {
    id: '6',
    title: 'Rape Crisis England & Wales',
    bgColor: '#29CD2F4F',
    buttonColor: '#2AA52F',
    textColor: '#2AA52F',
  },
  {
    id: '7',
    title: 'NSPCC (Child protection and safeguarding)',
    bgColor: '#0F4A974F',
    buttonColor: '#0F4A97',
    textColor: '#0F4A97',
  },
];

const CrisisCard = ({ crisis }: { crisis: CrisisHelpCard }) => {
  const colors = useThemedColors();
  
  // Clean both name and title (remove emojis, punctuation, lowercase)
  const cleanName = crisis.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const nameWords = cleanName.split(/\s+/).filter((w) => w.length > 2);

  const template = crisisTemplates.reduce((bestMatch, card) => {
    const cleanTitle = card.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const titleWords = cleanTitle.split(/\s+/).filter((word) => word.length > 2);

    // Check for direct inclusion first
    if (cleanName.includes(cleanTitle) || cleanTitle.includes(cleanName)) {
      return { card, score: 100 };
    }

    // Calculate word overlap score
    const overlap = titleWords.filter((word) => nameWords.includes(word)).length;
    const score = (overlap / Math.max(titleWords.length, 1)) * 10;

    if (score > (bestMatch?.score || 0)) {
      return { card, score };
    }
    return bestMatch;
  }, null as { card: typeof crisisTemplates[0]; score: number } | null)?.card;

  // Merge API data with template styles
  const bgColor = crisis.bgColor || template?.bgColor || '#f3f4f6';
  const textColor = crisis.textColor || template?.textColor || '#000000';
  const buttonColor = crisis.buttonColor || template?.buttonColor || '#1f2937';

  const handleDial = async () => {
    const url = `tel:${crisis.number}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error(`Phone dialer unavailable. You can manually dial: ${crisis.number}`);
      }
    } catch (error) {
      console.error('An error occurred while trying to dial:', error);
      toast.error('Unable to open the phone dialer.');
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]}>{crisis.name}</Text>
      </View>
      <Text style={[styles.cardDescription, { color: colors.text }]}>{crisis.description}</Text>
      <TouchableOpacity 
        style={[styles.dialButton, { backgroundColor: buttonColor }]} 
        onPress={handleDial}
        activeOpacity={0.8}
      >
        <Text style={styles.dialButtonText}>Dial</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function CrisisHelp() {
  const colors = useThemedColors();
  const router = useRouter();
  const [crisisHelp, setCrisisHelp] = useState<CrisisHelpCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrisisHelp = async () => {
      try {
        const response = await getCrisesHelp();
        // Assuming response structure is { crisisHelp: [...] }
        setCrisisHelp(response.crisisHelp || []);
      } catch (error) {
        console.error('Error fetching crisis help:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCrisisHelp();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.bglight01 }]} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerEmoji}>🚨</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Crisis Help</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        ) : (
          crisisHelp.map((crisis) => (
            <CrisisCard key={crisis.id} crisis={crisis} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  dialButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dialButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
