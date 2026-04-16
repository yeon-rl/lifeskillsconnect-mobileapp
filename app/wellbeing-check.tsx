import { ThemedText } from '@/components/themed-text';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toast } from 'sonner-native';
const { width } = Dimensions.get('window');

type Step = 0 | 1 | 2;

const QUESTIONS = [
  "I've been feeling optimistic",
  "I've been feeling Useful",
  "I've been feeling relaxed",
  "I've been dealing with problems well",
  "I've been Thinking clearly",
  "I've been feeling close to others",
  "I'vw made up my own mind"
];

export default function WellbeingCheck() {
  const router = useRouter();
  const colors = useThemedColors();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checkType, setCheckType] = useState('None');

  const handleNext = () => {
    if (step < 2) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 0) setStep((step - 1) as Step);
    else router.back();
  };

  const handleAnswer = (questionIndex: number, rating: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: rating }));
  };

  const completedQuestions = Object.keys(answers).length;
  const progress = completedQuestions / QUESTIONS.length;

  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      
      
      <View style={styles.textSection}>
        <ThemedText type="title" style={styles.title}>Welcome To lifeSkills Connect</ThemedText>
        <ThemedText style={styles.description}>
          Before we personalise your learning journey. we'd like to get a quick sense of how you're feeling. This assessment help us tailor and support your growth
        </ThemedText>
      </View>

      <View style={styles.imageContainer}>
        {/* <View style={[styles.illustration, { backgroundColor: '#E5E7EB', borderRadius: 20 }]} /> */}
        <Image source={require('@/assets/images/wellbeing-check.png')} style={styles.illustration} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => setStep(1)}
        >
          <Text style={styles.buttonText}>Start wellbeing check (2 mins)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.skipButton}>
          {/* <Text style={styles.skipText}>Skip for now</Text> */}
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          Your answers are private and help us provide better support
        </Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={[styles.stepTitle, { color: colors.primary }]}>
        Warwick-Edinburgh Mental Wellbeing Check
      </ThemedText>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Description</Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>
            The Warwick-Edinburgh Mental Wellbeing Check is a short questionnaire that helps you reflect on how you've been feeling and functioning over the past two weeks. It looks at positive aspects of mental wellbeing such as optimism, confidence, relationships, and your ability to cope with daily life. Your responses generate a wellbeing score that helps you understand your current mental state and track changes over time. This check is not a diagnosis, but a helpful tool to support self-awareness and personal growth.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>Check Type</Text>
          <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.modalBg }]}>
            <Text style={{ color: colors.textSecondary }}>{checkType}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 'auto' }]}
        onPress={() => setStep(2)}
      >
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSubmit = async () => {
    if (completedQuestions < QUESTIONS.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }
    
    try {
      // In a real app, we would send answers to an API here
      console.log('Submitting wellbeing check:', answers);
      toast.success('Wellbeing check submitted successfully!');
      router.back();
    } catch (error) {
      toast.error('Failed to submit wellbeing check');
    }
  };

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.questionHeader}>Answer the questions below</ThemedText>
      
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.scaleHeader}>
          <Text style={styles.scaleText}>Scale from 1 - 5</Text>
          <Text style={styles.scaleText}>Complete</Text>
        </View>

        {QUESTIONS.map((q, index) => (
          <View key={index} style={styles.questionCard}>
            <Text style={[styles.questionText, { color: colors.text }]}>{q}</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(rating => (
                <TouchableOpacity 
                  key={rating}
                  style={[
                    styles.ratingButton, 
                    { backgroundColor: answers[index] === rating ? colors.primary : '#F3F4F6' }
                  ]}
                  onPress={() => handleAnswer(index, rating)}
                >
                  <Text style={[
                    styles.ratingButtonText, 
                    { color: answers[index] === rating ? 'white' : '#111827' }
                  ]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.submitButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.primaryButton, 
            { backgroundColor: colors.primary },
            completedQuestions < QUESTIONS.length && { opacity: 0.5 }
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    height: 60,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    marginVertical: 20,
  },
  illustration: {
    width: width * 0.8,
    height: 250,
  },
  textSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 30,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    color: '#4285F4',
    fontSize: 12,
    textAlign: 'center',
  },
  // Step 1
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // Step 2
  questionHeader: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  scaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scaleText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  questionCard: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 45,
    height: 45,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: 'white',
  },
});
