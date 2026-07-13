import { useThemedColors } from '@/hooks/use-themed-colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const AccordionItem = ({ faq, colors }: { faq: any, colors: any }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={[styles.faqItem, { backgroundColor: colors.modalBg, borderColor: colors.gray250 }]}>
      <TouchableOpacity 
        onPress={() => setExpanded(!expanded)} 
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        activeOpacity={0.7}
      >
        <Text style={[styles.faqQuestion, { color: colors.text, flex: 1, marginBottom: 0 }]}>{faq.question}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      {expanded && (
        <Text style={[styles.faqAnswer, { color: colors.textSecondary, marginTop: 12 }]}>{faq.answer}</Text>
      )}
    </View>
  );
};

export default function Support() {
  const colors = useThemedColors();
  const router = useRouter();

  const faqs = [
    {
      question: "How do I update my profile information?",
      answer: "You can update your profile information by navigating to the Profile tab, clicking the Edit button near your avatar, and saving your changes."
    },
    {
      question: "How does the Wellbeing Check work?",
      answer: "The Wellbeing Check is based on the Warwick-Edinburgh Mental Wellbeing Scale. It asks you a series of questions to help gauge your current mental state and track your progress over time."
    },
    {
      question: "I forgot my password, what should I do?",
      answer: "Go to the profile page and select 'Reset Password'. We will guide you through the process of securing your account."
    },
    {
      question: "How do I apply for jobs?",
      answer: "Navigate to the Job Feeds tab, find a role that matches your skills, and click the 'Apply' button. You can also save jobs to apply later."
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton]} 
          className="w-10 h-10 rounded-full items-center justify-center bg-[#5A7C651A] dark:bg-[#5A7C651A]"
          onPress={() => router.back()}
        >
          <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <Path fillRule="evenodd" clipRule="evenodd" d="M7.01813 11.3895C6.89044 11.2616 6.81873 11.0883 6.81873 10.9076C6.81873 10.7269 6.89044 10.5537 7.01813 10.4258L13.8363 3.60763C13.8987 3.54064 13.974 3.48692 14.0576 3.44965C14.1413 3.41238 14.2316 3.39235 14.3231 3.39073C14.4147 3.38912 14.5056 3.40596 14.5905 3.44025C14.6754 3.47454 14.7525 3.52558 14.8173 3.59032C14.882 3.65507 14.933 3.73219 14.9673 3.81709C15.0016 3.90199 15.0185 3.99292 15.0168 4.08447C15.0152 4.17602 14.9952 4.2663 14.9579 4.34994C14.9207 4.43358 14.8669 4.50885 14.7999 4.57127L8.46358 10.9076L14.7999 17.244C14.8669 17.3064 14.9207 17.3817 14.9579 17.4653C14.9952 17.549 15.0152 17.6392 15.0168 17.7308C15.0185 17.8223 15.0016 17.9133 14.9673 17.9982C14.933 18.0831 14.882 18.1602 14.8173 18.2249C14.7525 18.2897 14.6754 18.3407 14.5905 18.375C14.5056 18.4093 14.4147 18.4261 14.3231 18.4245C14.2316 18.4229 14.1413 18.4029 14.0576 18.3656C13.974 18.3284 13.8987 18.2746 13.8363 18.2076L7.01813 11.3895Z" fill="#5A7C65" fillOpacity="0.5"/>
          </Svg>
        </TouchableOpacity>
      </View>

      <Text style={[styles.screenTitle, { color: colors.text }]}>Support & Help</Text>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        
        {faqs.map((faq, index) => (
          <AccordionItem key={index} faq={faq} colors={colors} />
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 10,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  }
});
