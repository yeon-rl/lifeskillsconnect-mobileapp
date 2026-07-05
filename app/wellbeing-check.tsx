import { ThemedText } from '@/components/themed-text';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { wellbeingService } from '@/services/api/apiServices';
import { useUserStore } from '@/store/userStore';
import { useOnboarding } from '@/context/OnboardingContext';
import { toast } from 'sonner-native';
const { width } = Dimensions.get('window');

type Step = 0 | 1 | 2 | 3 | 4;

const CHECK_TYPES = ['Initial Assessment', 'Monthly Follow up'];


export default function WellbeingCheck() {
  const router = useRouter();
  const colors = useThemedColors();
  const { currentUser } = useUserStore();
  const { setHasCompletedOnboarding } = useOnboarding();

  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checkType, setCheckType] = useState('Initial Assessment');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (step === 3 && questions.length === 0) {
        setLoading(true);
        try {
          const fetchedData = await wellbeingService.getWellbeingQuestions();
          setQuestions(fetchedData.questions || []);
        } catch (error) {
          console.error("Failed to fetch questions:", error);
          toast.error("Failed to load wellbeing questions. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchQuestions();
  }, [step, questions.length]);

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step === 3) setStep(1); // Skip Step 2 if it's unused
    else if (step > 0) setStep((step - 1) as Step);
    else router.back();
  };

  const handleAnswer = (questionIndex: number, rating: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: rating }));
  };

  const completedQuestions = Object.keys(answers).length;
  const progress = questions.length > 0 ? completedQuestions / questions.length : 0;

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
          <TouchableOpacity 
            style={[styles.dropdown, { backgroundColor: colors.modalBg }]}
            onPress={() => setShowTypePicker(!showTypePicker)}
          >
            <Text style={{ color: colors.text, fontSize: 15 }}>{checkType}</Text>
            <Ionicons name={showTypePicker ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {showTypePicker && (
            <View style={[styles.inlineDropdown, { backgroundColor: colors.modalBg, borderColor: colors.primary }]}>
              {CHECK_TYPES.map((option) => (
                <TouchableOpacity 
                  key={option} 
                  style={styles.optionItem}
                  onPress={() => {
                    setCheckType(option);
                    setShowTypePicker(false);
                  }}
                >
                  <Text style={[
                    styles.optionText, 
                    { color: checkType === option ? colors.primary : colors.text },
                    checkType === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {checkType === option && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 'auto' }]}
        onPress={() => setStep(3)}
      >
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to submit a wellbeing check');
      return;
    }

    if (completedQuestions < questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }
    
    setLoading(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qIdx, score]) => ({
        question_id: questions[parseInt(qIdx)].id,
        answer: score,
        check_type: checkType === 'Initial Assessment' ? 'initial' : 'monthly'
      }));

      const finalCheckType = checkType === 'Initial Assessment' ? 'initial' : 'monthly';
      const response = await wellbeingService.submitWellbeingAnswers(formattedAnswers);
      
      // If it was an initial assessment, complete onboarding
      if (finalCheckType === 'initial') {
        await setHasCompletedOnboarding(true);
      }

      const result = response?.current_result;
      if (result && result.aggregate_rating !== undefined) {
        setResultData({
          aggregate_rating: result.aggregate_rating,
          is_flagged: result.is_flagged,
          total_score: result.total_score,
          comparison: response.comparison ?? null,
          previous_result: response.previous_result ?? null,
        });
        setStep(4);
      } else {
        toast.success('Wellbeing check completed!');
        router.back();
      }
    } catch (error) {
      console.error("Failed to submit answers:", error);
      toast.error("Failed to submit answers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.questionHeader}>Answer the questions below</ThemedText>
      
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading questions...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.scaleHeader}>
            <Text style={styles.scaleText}>Scale from 1 - 5</Text>
            <Text style={styles.scaleText}>Complete</Text>
          </View>

          {questions.map((q, index) => (
            <View key={index} style={styles.questionCard}>
              <Text style={[styles.questionText, { color: colors.text }]}>
                {typeof q === 'string' ? q : q.question_text || q.question || q.text}
              </Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <TouchableOpacity 
                    key={rating}
                    style={[
                      styles.ratingButton, 
                      { backgroundColor: answers[index] === rating ? colors.primary : colors.bglight10 }
                    ]}
                    onPress={() => handleAnswer(index, rating)}
                  >
                    <Text style={[
                      styles.ratingButtonText, 
                      { color: answers[index] === rating ? 'white' : colors.text }
                    ]}>
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {!loading && (
        <View style={[styles.submitButtonContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[
              styles.primaryButton, 
              { backgroundColor: colors.primary },
              completedQuestions < questions.length && { opacity: 0.5 }
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.resultHeader}>
        <View style={[styles.scoreCircle, { borderColor: colors.primary + '20' }]}>
          <Text style={[styles.scoreText, { color: colors.primary }]}>{resultData.aggregate_rating}</Text>
          <Text style={styles.scoreLabel}>Wellbeing Score</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.resultCard, { backgroundColor: colors.modalBg }]}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Current Result</ThemedText>
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Total Score:</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>{resultData.total_score}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Status:</Text>
            <Text style={[styles.resultValue, { color: resultData.is_flagged ? '#EF4444' : '#10B981' }]}>
              {resultData.is_flagged ? 'Flagged' : 'Normal'}
            </Text>
          </View>
        </View>

        {resultData.previous_result && (
          <View style={[styles.resultCard, { backgroundColor: colors.modalBg }]}>
            <ThemedText type="subtitle" style={styles.cardTitle}>Previous Result</ThemedText>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Previous Score:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{resultData.previous_result.total_score}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Previous Rating:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{resultData.previous_result.aggregate_rating}</Text>
            </View>
          </View>
        )}

        {resultData.comparison && (
          <View style={[styles.resultCard, { backgroundColor: colors.modalBg }]}>
            <ThemedText type="subtitle" style={styles.cardTitle}>Comparison</ThemedText>
            <Text style={[styles.comparisonText, { color: resultData.comparison.status === 'decline' ? '#EF4444' : '#10B981' }]}>
              {resultData.comparison.message}
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 'auto', marginBottom: 20 }]}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.bglight10 }]}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 3 && renderStep3()}
      {step === 4 && resultData && renderStep4()}
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
    borderColor: '#E5E7EB',
  },
  // Dropdown Picker Styles
  inlineDropdown: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionText: {
    fontSize: 15,
  },
  selectedOptionText: {
    fontWeight: '700',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  // Step 4
  resultHeader: {
    alignItems: 'center',
    marginVertical: 30,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: -5,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 16,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  comparisonText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
});
