import { useThemedColors } from '@/hooks/use-themed-colors';
import { authService } from '@/services/api/apiServices';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { toast } from 'sonner-native';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 'plans' | 'duration' | 'payment';
type MainPlan = 'Standard' | 'Exclusive' | 'Enterprise';

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ visible, onClose }) => {
  const colors = useThemedColors();
  const [step, setStep] = useState<Step>('plans');
  const [selectedMainPlan, setSelectedMainPlan] = useState<MainPlan>('Standard');
  const [selectedDuration, setSelectedDuration] = useState<'monthly' | 'annually'>('annually');
  const [selectedPayment, setSelectedPayment] = useState<'apple' | 'card' | 'paypal'>('card');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setStep('plans'); // Reset on close
    onClose();
  };

  const handleBack = () => {
    if (step === 'duration') setStep('plans');
    else if (step === 'payment') setStep('duration');
  };

  const handleNext = () => {
    if (step === 'plans') {
        if (selectedMainPlan === 'Enterprise') {
            toast.info("Please contact us at partnerships@accordiaharmony.org for Enterprise plans.");
            return;
        }
        setStep('duration');
    } else if (step === 'duration') {
        setStep('payment');
    } else {
        toast.info("Processing payment...");
    }
  };

  const PlanCard = ({ 
    type, 
    title, 
    price, 
    yearlyPrice, 
    features, 
    subtitle,
    headerColor,
    stars = 0,
    email
  }: { 
    type: MainPlan, 
    title: string, 
    price?: string, 
    yearlyPrice?: string,
    features: string[],
    subtitle?: string,
    headerColor: string,
    stars?: number,
    email?: string
  }) => (
    <TouchableOpacity 
      style={[
        styles.mainPlanCard, 
        { borderColor: selectedMainPlan === type ? headerColor : '#E5E7EB' }
      ]}
      onPress={() => setSelectedMainPlan(type)}
    >
      <View style={[styles.mainPlanHeader, { backgroundColor: headerColor }]}>
        <View style={styles.mainPlanHeaderTitleRow}>
            <Ionicons name="ribbon-outline" size={18} color="#fff" />
            <Text style={styles.mainPlanHeaderTitle}>{title}</Text>
            {stars > 0 && (
                <View style={styles.starsRow}>
                    {[...Array(stars)].map((_, i) => (
                        <Ionicons key={i} name="star" size={14} color="#FBBF24" />
                    ))}
                </View>
            )}
        </View>
        <Ionicons 
            name={selectedMainPlan === type ? "radio-button-on" : "radio-button-off"} 
            size={20} 
            color="#fff" 
        />
      </View>
      
      <View style={styles.mainPlanContent}>
        {subtitle && <Text style={styles.mainPlanSubtitle}>{subtitle}</Text>}
        
        {price ? (
            <View style={styles.mainPlanPriceRow}>
                <Text style={styles.mainPlanPriceValue}>{price}</Text>
                <Text style={styles.mainPlanPricePeriod}>/month</Text>
            </View>
        ) : (
            <Text style={styles.customPricingText}>Custom Pricing</Text>
        )}

        {yearlyPrice && <Text style={styles.yearlySavingsText}>{yearlyPrice}</Text>}

        <View style={styles.mainPlanFeaturesList}>
            {features.map((f, i) => (
                <View key={i} style={styles.mainPlanFeatureItem}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={headerColor} />
                    <Text style={styles.mainPlanFeatureText}>{f}</Text>
                </View>
            ))}
        </View>

        {email && (
            <View style={styles.enterpriseContact}>
                <Text style={styles.enterpriseContactText}>Email us at</Text>
                <Text style={styles.enterpriseEmail}>{email}</Text>
            </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const DurationOption = ({ 
    type, 
    price, 
    features, 
    recommended, 
    discount 
  }: { 
    type: 'monthly' | 'annually', 
    price: string, 
    features: string[],
    recommended?: boolean,
    discount?: string,
  }) => (
    <TouchableOpacity 
      style={[
        styles.optionCard, 
        { borderColor: selectedDuration === type ? '#526D65' : '#E5E7EB' },
        selectedDuration === type && { borderWidth: 1.5 },
      ]}
      onPress={() => setSelectedDuration(type)}
    >
      <View style={styles.optionHeader}>
        <Text style={[
           styles.optionTitle,
           { color: colors.text }
        ]}>
            {type === 'monthly' ? 'Pay Monthly' : 'Pay Annually'}
        </Text>
        {recommended && (
            <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
            </View>
        )}
      </View>
      
      <View style={styles.priceRow}>
        <Text style={[styles.priceText, { color: colors.text }]}>{price}</Text>
        {discount && (
            <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}</Text>
            </View>
        )}
      </View>

      <View style={styles.featuresList}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={styles.bulletPoint} />
            <Text style={[styles.featureText, { color: colors.gray700 }]}>{feature}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={step !== 'plans'}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={step === 'plans' ? styles.fullScreenContainer : styles.modalOverlay}>
        <View style={[
            step === 'plans' ? styles.fullScreenContent : styles.modalContent, 
            { backgroundColor: colors.background }
        ]}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={step === 'plans' ? handleClose : handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {step === 'plans' ? (
            <View style={styles.plansContainer}>
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.plansScrollContent}
                >
                    <Text style={styles.plansTitle}>Choose plan</Text>
                    <Text style={styles.plansSubtitle}>Get ahead with these premium features</Text>

                    <View style={styles.plansList}>
                        <PlanCard 
                            type="Standard"
                            title="Standard Plan"
                            price="£9.99"
                            yearlyPrice="£96 / year • Save 20%"
                            subtitle="Best For individuals"
                            headerColor="#8B8B8B"
                            features={[
                                "Unlimited Premium course access",
                                "Learn at your own pace",
                                "Completion certificates"
                            ]}
                        />

                        <PlanCard 
                            type="Exclusive"
                            title="Exclusive Plan"
                            price="£14.99"
                            yearlyPrice="£144 / year • Save 20%"
                            subtitle="For focused learners who want curated pathways."
                            headerColor="#526D65"
                            stars={1}
                            features={[
                                "Everything in Standard",
                                "Access to Exclusive courses",
                                "Custom-select specialised learning tracks"
                            ]}
                        />

                        <PlanCard 
                            type="Enterprise"
                            title="Enterprise Plan"
                            headerColor="#1E3A5F"
                            stars={2}
                            subtitle="For schools, councils, academies & youth programmes."
                            features={[
                                "Everything in Exclusive",
                                "Dedicated Admin Portal",
                                "Full administrative control",
                                "Real-time progress tracking"
                            ]}
                            email="partnerships@accordiaharmony.org"
                        />
                    </View>
                </ScrollView>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
          ) : step === 'duration' ? (
              <View style={styles.modalStepContainer}>
                <Text style={styles.modalStepTitle}>Upgrade to {selectedMainPlan}</Text>
                <Text style={styles.modalStepSubtitle}>Choose a plan that works for you</Text>

                <View style={styles.contentContainer}>
                    <DurationOption 
                        type="monthly"
                        price="£11 / monthly"
                        features={['Cancel anytime', 'Full Access to premium features']}
                        recommended={true}
                    />
                    
                    <DurationOption 
                        type="annually"
                        price="£9 / monthly."
                        features={['Cancel anytime', 'Full Access to premium features']}
                        discount="30% Off"
                    />
                </View>

                <View style={[styles.totalRow, { marginBottom: 16 }]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                        {selectedDuration === 'annually' ? '£108' : '£11'}
                    </Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.upgradeBtn} onPress={handleNext}>
                        <Text style={styles.upgradeBtnText}>Upgrade</Text>
                    </TouchableOpacity>
                </View>
              </View>
          ) : (
              <View style={styles.modalStepContainer}>
                <Text style={styles.modalStepTitle}>Upgrade to Premium</Text>
                <Text style={styles.modalStepSubtitle}>Choose Payment method to finish upgrading</Text>

                <View style={styles.contentContainer}>
                    <TouchableOpacity 
                        style={[styles.paymentMethod, selectedPayment === 'apple' && styles.selectedPayment]} 
                        onPress={() => setSelectedPayment('apple')}
                    >
                        <View style={styles.paymentIcon}>
                            <Ionicons name="logo-apple" size={20} color="#000" />
                            <Text style={styles.paymentBrand}>Pay</Text>
                        </View>
                        <Text style={styles.paymentName}>Apple Pay</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.paymentMethod, selectedPayment === 'card' && styles.selectedPayment]} 
                        onPress={() => setSelectedPayment('card')}
                    >
                        <Ionicons name="card-outline" size={20} color="#000" />
                        <Text style={styles.paymentName}>Card Payment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.paymentMethod, selectedPayment === 'paypal' && styles.selectedPayment]} 
                        onPress={() => setSelectedPayment('paypal')}
                    >
                        <Ionicons name="logo-paypal" size={20} color="#0066CC" />
                        <Text style={styles.paymentName}>PayPal</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                        {selectedDuration === 'annually' ? '£108' : '£11'}
                    </Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.upgradeBtn} onPress={handleNext}>
                        <Text style={styles.upgradeBtnText}>Continue</Text>
                    </TouchableOpacity>
                </View>
              </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullScreenContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plansContainer: {
    flex: 1,
  },
  plansScrollContent: {
    paddingBottom: 20,
  },
  plansTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  plansSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  plansList: {
    gap: 16,
    marginBottom: 24,
  },
  mainPlanCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  mainPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mainPlanHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainPlanHeaderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  mainPlanContent: {
    padding: 16,
  },
  mainPlanSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  mainPlanPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  mainPlanPriceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#526D65',
  },
  mainPlanPricePeriod: {
    fontSize: 16,
    color: '#526D65',
    fontWeight: '500',
  },
  customPricingText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#112D4E',
    marginBottom: 12,
  },
  yearlySavingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  mainPlanFeaturesList: {
    gap: 10,
  },
  mainPlanFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainPlanFeatureText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  enterpriseContact: {
    marginTop: 16,
  },
  enterpriseContactText: {
    fontSize: 12,
    color: '#6B7280',
  },
  enterpriseEmail: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#526D65',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalStepContainer: {
    width: '100%',
  },
  modalStepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  modalStepSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4B5563',
    marginBottom: 24,
  },
  contentContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recommendedBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#526D65',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  featuresList: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletPoint: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4B5563',
  },
  featureText: {
    fontSize: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  upgradeBtn: {
    flex: 1,
    backgroundColor: '#526D65',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  selectedPayment: {
    backgroundColor: '#C5D1CB',
    borderWidth: 1,
    borderColor: '#526D65',
  },
  paymentIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentBrand: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 2,
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
});
