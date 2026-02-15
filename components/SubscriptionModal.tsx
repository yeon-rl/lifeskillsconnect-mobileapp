import { useThemedColors } from '@/hooks/use-themed-colors';
import { authService, subscriptionService } from '@/services/api/apiServices';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { requestPurchase } from 'react-native-iap';
import { toast } from 'sonner-native';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 'plans' | 'payment';

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ visible, onClose }) => {
  const colors = useThemedColors();
  const [step, setStep] = useState<Step>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annually'>('annually');
  const [selectedPayment, setSelectedPayment] = useState<'card'>('card');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setStep('plans'); // Reset on close
    onClose();
  };

  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  // const { connected, products, getProducts: fetchProducts, currentPurchase, finishTransaction } = useIAP();
  
  // Stubs for disabled IAP
  const connected = false;
  const products = [];
  const fetchProducts = async () => {};
  const currentPurchase = null;
  const finishTransaction = async () => {};

  const handleContinue = async () => {
    if (step === 'plans') {
      setStep('payment');
      /* 
      if (Platform.OS === 'android') {
        initializeStripe();
      } else if (Platform.OS === 'ios') {
        initializeIAP();
      }
      */
    } else {
      toast.info("Credit card payment is coming soon!");
      /*
      if (Platform.OS === 'android') {
        handleStripePayment();
      } else if (Platform.OS === 'ios') {
        handleIAPPayment();
      }
      */
    }
  };

  const initializeStripe = async () => {
    try {
      const { authToken } = useUserStore.getState();
      const plan = selectedPlan === 'annually' ? 'yearly' : 'monthly';
      const data = await subscriptionService.getStripePaymentIntent(plan, authToken || undefined);
      
      if (data?.paymentIntent) {
        const { error } = await initPaymentSheet({
          merchantDisplayName: 'LifeSkills Connect',
          customerId: data.customer,
          customerEphemeralKeySecret: data.ephemeralKey,
          paymentIntentClientSecret: data.paymentIntent,
          allowsDelayedPaymentMethods: false,
          defaultBillingDetails: {
            name: useUserStore.getState().currentUser?.fullname,
          }
        });
        if (error) {
          console.error("Stripe init error:", error);
        }
      }
    } catch (err) {
      console.error("Stripe setup error:", err);
    }
  };

  const initializeIAP = async () => {
    try {
      const productIds = Platform.select({
        ios: ['com.lifeskills.monthly', 'com.lifeskills.annually'],
        default: [],
      });
      await fetchProducts({ skus: productIds });
    } catch (err) {
      console.error("IAP fetch error:", err);
    }
  };

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        if (error.code !== 'Canceled') {
          toast.error(error.message);
        }
      } else {
        toast.success("Payment successful!");
        await refreshProfile();
        handleClose();
      }
    } catch (err) {
      console.error("Stripe payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleIAPPayment = async () => {
    setLoading(true);
    try {
      const sku = selectedPlan === 'annually' ? 'com.lifeskills.annually' : 'com.lifeskills.monthly';
      await requestPurchase({ sku });
      // The actual verification and profile refresh will happen in a useEffect listening to currentPurchase
    } catch (err: any) {
      console.error("IAP purchase error:", err);
      toast.error(err.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    const { authToken } = useUserStore.getState();
    const profile = await authService.getProfile(authToken || undefined);
    if (profile?.user) {
      useUserStore.getState().setUser(profile.user);
    }
  };

  /* 
  React.useEffect(() => {
    const checkIAP = async () => {
      if (currentPurchase) {
        try {
          const { authToken } = useUserStore.getState();
          await subscriptionService.verifyIAPReceipt(currentPurchase.transactionReceipt, authToken || undefined);
          await finishTransaction({ purchase: currentPurchase });
          toast.success("Welcome to Premium!");
          await refreshProfile();
          handleClose();
        } catch (err) {
          console.error("IAP verification error:", err);
          toast.error("Failed to verify purchase");
        }
      }
    };
    checkIAP();
  }, [currentPurchase]);
  */

  const PlanOption = ({ 
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
        selectedPlan === type && styles.selectedOptionCard
      ]}
      onPress={() => setSelectedPlan(type)}
    >
      <View style={styles.optionHeader}>
        <Text style={[
           styles.optionTitle,
           selectedPlan === type && styles.selectedOptionTitle
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
        <Text style={styles.priceText}>{price}</Text>
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
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const PaymentOption = ({ 
    type, 
    label,
    icon
  }: { 
    type: 'card', 
    label: string,
    icon: React.ReactNode
  }) => (
    <TouchableOpacity 
      style={[
        styles.paymentCard,
        selectedPayment === type && styles.selectedPaymentCard
      ]}
      onPress={() => {
        setSelectedPayment(type);
        toast.info("Coming soon");
      }}
    >
      <View style={styles.paymentIconContainer}>
         {icon}
      </View>
      <Text style={styles.paymentLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          
          <Text style={[styles.modalTitle, { color: colors.text }]}>Upgrade to Premium</Text>
          <Text style={[styles.modalSubtitle, { color: colors.gray300 }]}>
            {step === 'plans' 
              ? 'Choose a plan that works for you' 
              : 'Choose Payment method to finish upgrading'}
          </Text>

          {step === 'plans' ? (
            <View style={styles.contentContainer}>
               <PlanOption 
                 type="monthly"
                 price="£11 / monthly"
                 features={['Cancel anytime', 'Full Access to premium features']}
                 recommended={true}
               />
               
               <PlanOption 
                 type="annually"
                 price="£9 / monthly."
                 features={['Cancel anytime', 'Full Access to premium features']}
                 discount="30% Off"
               />
            </View>
          ) : (
              <View style={styles.contentContainer}>
                <PaymentOption 
                  type="card"
                  label="Card Payment"
                  icon={<Ionicons name="card-outline" size={24} color="#000" />}
                />

                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>
                      {selectedPlan === 'annually' ? '£108' : '£11'}
                    </Text>
                </View>
             </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.modalButton, 
                styles.continueButton,
                loading && { opacity: 0.7 }
              ]} 
              onPress={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.continueButtonText}>
                  {step === 'plans' ? 'Upgrade' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  contentContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB', // Light gray bg for unselected
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  selectedOptionCard: {
    borderColor: '#526D65', // Dark Green border
    borderWidth: 1.5,
    backgroundColor: '#F0FDF4', // Very light green tint
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
    color: '#344054', // Gray 700
  },
  selectedOptionTitle: {
      color: '#354B45', // Darker green
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
      color: '#111827',
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
      gap: 4,
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
      backgroundColor: '#374151',
  },
  featureText: {
      fontSize: 12,
      color: '#374151',
  },
  // Payment Options
  paymentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: '#F9FAFB',
      gap: 12,
  },
  selectedPaymentCard: {
      backgroundColor: '#D1D5DB', // Darker select state per design
      borderWidth: 1,
      borderColor: '#9CA3AF',
  },
  paymentIconContainer: {
      width: 40,
      alignItems: 'center',
  },
  paymentLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: '#111827',
  },
  totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      paddingHorizontal: 4,
  },
  totalLabel: {
      fontSize: 14,
      color: '#9CA3AF',
  },
  totalAmount: {
      fontSize: 24,
      fontWeight: '600',
      color: '#111827',
  },
  // Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14, // Taller buttons
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  continueButton: {
    backgroundColor: '#526D65', // Dark green matching design
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
