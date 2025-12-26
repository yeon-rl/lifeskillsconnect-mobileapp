import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 'plans' | 'payment';

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ visible, onClose }) => {
  const colors = useThemedColors();
  const [step, setStep] = useState<Step>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annually'>('annually');
  const [selectedPayment, setSelectedPayment] = useState<'apple' | 'card' | 'paypal'>('apple');

  const handleClose = () => {
    setStep('plans'); // Reset on close
    onClose();
  };

  const handleContinue = () => {
    if (step === 'plans') {
      setStep('payment');
    } else {
      // Finalize payment logic here
      handleClose();
    }
  };

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
    type: 'apple' | 'card' | 'paypal', 
    label: string,
    icon: React.ReactNode
  }) => (
    <TouchableOpacity 
      style={[
        styles.paymentCard,
        selectedPayment === type && styles.selectedPaymentCard
      ]}
      onPress={() => setSelectedPayment(type)}
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
                  type="apple"
                  label="Apple Pay"
                  icon={<Ionicons name="logo-apple" size={24} color="#000" />}
                />
                <PaymentOption 
                  type="card"
                  label="Card Payment"
                  icon={<Ionicons name="card-outline" size={24} color="#000" />}
                />
                <PaymentOption 
                  type="paypal"
                  label="PayPal"
                  icon={<Ionicons name="logo-paypal" size={24} color="#003087" />}
                />

                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>£108</Text>
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
              style={[styles.modalButton, styles.continueButton]} 
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                {step === 'plans' ? 'Upgrade' : 'Continue'}
              </Text>
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
