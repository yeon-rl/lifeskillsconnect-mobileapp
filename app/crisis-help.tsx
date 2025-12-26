import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface CrisisService {
  id: string;
  title: string;
  description: string;
  phoneNumber: string;
  emoji?: string;
  backgroundColor: string;
  buttonColor: string;
  titleColor: string;
}

const crisisServices: CrisisService[] = [
  {
    id: '1',
    emoji: '🚨',
    title: 'Emergency Services',
    description: 'Call 999, For immediate danger or life-threatening emergencies (Police, Ambulance, Fire)',
    phoneNumber: '999',
    backgroundColor: '#EB433530',
    buttonColor: '#A50E0E',
    titleColor: '#526D65',
  },
  {
    id: '2',
    emoji: '💬',
    title: 'Mental Health & Emotional Support',
    description: 'Samaritans, 24/7 free helpline for anyone in emotional distress - 116 123',
    phoneNumber: '116123',
    backgroundColor: '#4285F445',
    buttonColor: '#4285F4',
    titleColor: '#4285F4',
  },
  {
    id: '3',
    emoji: '🏠',
    title: 'Abuse & Domestic Violence',
    description: 'National Domestic Abuse Helpline (Refuge), 24/7 support for women experiencing domestic abuse - 0808 2000 247',
    phoneNumber: '08082000247',
    backgroundColor: '#5A7C654D',
    buttonColor: '#526D65',
    titleColor: '#526D65',
  },
  {
    id: '4',
    emoji: '🧒',
    title: 'Children & Young People',
    description: 'Childline (for under 19s - 24/7 support for any issue, bullying, abuse, stress) - 0800 1111',
    phoneNumber: '08001111',
    backgroundColor: '#7A1D6F42',
    buttonColor: '#7B1FA2',
    titleColor: '#7B1FA2',
  },
  {
    id: '5',
    title: 'Rape Crisis England & Wales',
    description: '0808 500 2222',
    phoneNumber: '08085002222',
    backgroundColor: '#29CD2F4F',
    buttonColor: '#388E3C',
    titleColor: '#388E3C',
  },
  {
    id: '6',
    title: 'NSPCC (Child protection and safeguarding)',
    description: '0808 800 5000',
    phoneNumber: '08088005000',
    backgroundColor: '#6666664F',
    buttonColor: '#616161',
    titleColor: '#616161',
  },
  {
    id: '7',
    title: 'Papyrus HOPELINEUK',
    description: 'For young people struggling with suicidal thoughts (under 35)\n0800 068 4141',
    phoneNumber: '08000684141',
    backgroundColor: '#2009F133',
    buttonColor: '#2929F1',
    titleColor: '#2929F1',
  },
];

const CrisisCard = ({ service }: { service: CrisisService }) => {
  const colors = useThemedColors();
  const handleDial = () => {
    Linking.openURL(`tel:${service.phoneNumber}`);
  };

  return (
    <View style={[styles.card, { backgroundColor: service.backgroundColor }]}>
      <View style={styles.cardHeader}>
        {service.emoji && <Text style={styles.emoji}>{service.emoji}</Text>}
        <Text style={[styles.cardTitle, { color: service.titleColor }]}>{service.title}</Text>
      </View>
      <Text style={[styles.cardDescription, { color: colors.text }]}>{service.description}</Text>
      {service.id === '5' || service.id === '6' || service.id === '7' ? (
        <View style={styles.phoneRow}>
          <Ionicons name="call-outline" size={16} color="#000" />
          <Text style={styles.phoneNumberText}> {service.phoneNumber}</Text>
        </View>
      ) : null}
      <TouchableOpacity 
        style={[styles.dialButton, { backgroundColor: service.buttonColor }]} 
        onPress={handleDial}
        activeOpacity={0.8}
      >
        <Text style={styles.dialButtonText}>Dial now</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function CrisisHelp() {
  const colors = useThemedColors();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
        <View style={{ width: 40 }} /> {/* Spacer to balance the back button */}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {crisisServices.map((service) => (
          <CrisisCard key={service.id} service={service} />
        ))}
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
  emoji: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    // color: '#333',
    lineHeight: 20,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumberText: {
    fontSize: 14,
    fontWeight: '600',
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
});
