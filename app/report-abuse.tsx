import { useThemedColors } from '@/hooks/use-themed-colors';
import { reportService } from '@/services/api/apiServices';
import { useUserStore } from '@/store/userStore';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { toast } from 'sonner-native';

interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
}

const FormField = ({ label, placeholder, value, onChangeText, multiline = false }: FormFieldProps) => {
  const colors = useThemedColors();
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: colors.inputBg, 
            color: colors.text,
            textAlignVertical: multiline ? 'top' : 'center',
            minHeight: multiline ? 100 : 50,
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.text + '80'}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
      />
    </View>
  );
};

const DropdownField = ({ label, value, onPress }: { label: string; value: string; onPress: () => void }) => {
  const colors = useThemedColors();
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity 
        style={[styles.input, { backgroundColor: colors.inputBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
        onPress={onPress}
      >
        <Text style={{ color: value === 'None' ? colors.text + '80' : colors.text }}>{value}</Text>
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M6 9L12 15L18 9" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

const SelectionModal = ({ 
  visible, 
  onClose, 
  options, 
  onSelect, 
  title 
}: { 
  visible: boolean; 
  onClose: () => void; 
  options: string[]; 
  onSelect: (value: string) => void; 
  title: string;
}) => {
  const colors = useThemedColors();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
          <View style={styles.bottomSheetHeader}>
            <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity 
                key={option} 
                style={styles.optionItem} 
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function ReportAbuse() {
  const colors = useThemedColors();
  const router = useRouter();

  const [reportType, setReportType] = useState('None');
  const [whoReporting, setWhoReporting] = useState('None');
  const [whatReporting, setWhatReporting] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [contactPreference, setContactPreference] = useState('');
  const [keepUpdated, setKeepUpdated] = useState(true);
  const [contactOnlyNecessary, setContactOnlyNecessary] = useState(true);
  const [evidence, setEvidence] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectionModal, setSelectionModal] = useState<{
    visible: boolean;
    type: 'reportType' | 'whoReporting' | null;
    options: string[];
    title: string;
  }>({
    visible: false,
    type: null,
    options: [],
    title: '',
  });

  const reportTypeOptions = [
    'Physical Abuse',
    'Emotional/Verbal Abuse',
    'Sexual Abuse',
    'Neglect',
    'Financial Abuse',
    'Psychological Abuse',
    'Cyberbullying/Online Harassment',
    'Other',
  ];

  const whoReportingOptions = [
    'father',
    'mother',
    'sibling',
    'partner/spouse',
    'friend',
    'acquaintance',
    'stranger',
    'caregiver',
    'authority figure (e.g., teacher, coach)',
    'other',
  ];

  const openSelection = (type: 'reportType' | 'whoReporting') => {
    setSelectionModal({
      visible: true,
      type,
      options: type === 'reportType' ? reportTypeOptions : whoReportingOptions,
      title: type === 'reportType' ? 'Select Report Type' : 'Who Are You Reporting?',
    });
  };

  const handleSelect = (value: string) => {
    if (selectionModal.type === 'reportType') {
      setReportType(value);
    } else if (selectionModal.type === 'whoReporting') {
      setWhoReporting(value);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setEvidence(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to snap a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setEvidence(result.assets[0].uri);
    }
  };

  const handleSendReport = () => {
    setShowConfirmModal(true);
  };

  const confirmSend = async () => {
    if (!reportType || reportType === 'None') {
      toast.error('Please select a report type');
      return;
    }
    if (!whoReporting || whoReporting === 'None') {
      toast.error('Please select who you are reporting');
      return;
    }
    if (!whatReporting.trim()) {
      toast.error('Please describe what you are reporting');
      return;
    }

    try {
      setIsSubmitting(true);
      setShowConfirmModal(false);
      
      const toastId = toast.loading('Preparing report...');
      
      let uploadedImageUrl = null;
      
      // Upload evidence to Cloudinary if available
      if (evidence) {
        toast.loading('Uploading evidence...', { id: toastId });
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
          uri: evidence,
          type: 'image/jpeg',
          name: 'evidence.jpg',
        });
        formData.append('upload_preset', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
        
        try {
          const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: formData,
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          if (!cloudinaryResponse.ok) {
            console.error('Cloudinary upload failed:', await cloudinaryResponse.text());
            throw new Error('Failed to upload image to Cloudinary');
          }

          const cloudinaryData = await cloudinaryResponse.json();
          uploadedImageUrl = cloudinaryData.secure_url;
        } catch (uploadError) {
          console.error('Error uploading file to Cloudinary:', uploadError);
          toast.error('Failed to upload evidence image', { id: toastId });
          // Optionally wait a bit so user sees error
          await new Promise(resolve => setTimeout(resolve, 2000));
          toast.loading('Continuing report submission...', { id: toastId });
        }
      }

      toast.loading('Submitting report...', { id: toastId });
      const { authToken } = useUserStore.getState();
      
      const payload = {
        reported_entity: whoReporting,
        report_type: reportType,
        report_subject: whatReporting.split('\n')[0].substring(0, 100),
        description: whatReporting,
        evidence: uploadedImageUrl ? [uploadedImageUrl] : [],
        contact_preference: (contactOnlyNecessary ? 'Only if necessary' : 'None') as any,
        additional_details: additionalDetails || contactPreference,
        keep_me_updated: keepUpdated,
      };

      await reportService.reportAbuse(payload, authToken || undefined);
      
      toast.success('Your report has been submitted confidentially.', { id: toastId });
      
      // Reset form fields instead of navigating back
      setReportType('None');
      setWhoReporting('None');
      setWhatReporting('');
      setAdditionalDetails('');
      setContactPreference('');
      setKeepUpdated(true);
      setContactOnlyNecessary(true);
      setEvidence(null);

    } catch (error: any) {
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit report. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <Path fillRule="evenodd" clipRule="evenodd" d="M7.01813 11.3895C6.89044 11.2616 6.81873 11.0883 6.81873 10.9076C6.81873 10.7269 6.89044 10.5537 7.01813 10.4258L13.8363 3.60763C13.8987 3.54064 13.974 3.48692 14.0576 3.44965C14.1413 3.41238 14.2316 3.39235 14.3231 3.39073C14.4147 3.38912 14.5056 3.40596 14.5905 3.44025C14.6754 3.47454 14.7525 3.52558 14.8173 3.59032C14.882 3.65507 14.933 3.73219 14.9673 3.81709C15.0016 3.90199 15.0185 3.99292 15.0168 4.08447C15.0152 4.17602 14.9952 4.2663 14.9579 4.34994C14.9207 4.43358 14.8669 4.50885 14.7999 4.57127L8.46358 10.9076L14.7999 17.244C14.8669 17.3064 14.9207 17.3817 14.9579 17.4653C14.9952 17.549 15.0152 17.6392 15.0168 17.7308C15.0185 17.8223 15.0016 17.9133 14.9673 17.9982C14.933 18.0831 14.882 18.1602 14.8173 18.2249C14.7525 18.2897 14.6754 18.3407 14.5905 18.375C14.5056 18.4093 14.4147 18.4261 14.3231 18.4245C14.2316 18.4229 14.1413 18.4029 14.0576 18.3656C13.974 18.3284 13.8987 18.2746 13.8363 18.2076L7.01813 11.3895Z" fill="#5A7C65" fillOpacity="0.5"/>
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>🛑 Report Abuse</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.description, { color: colors.text }]}>
          Your safety matters. All reports are confidential and reviewed by our safeguarding team. You will not be identified to the person you're reporting.
        </Text>

        <DropdownField 
          label="Select Report Type" 
          value={reportType} 
          onPress={() => openSelection('reportType')} 
        />

        <DropdownField 
          label="Who Are You Reporting?" 
          value={whoReporting} 
          onPress={() => openSelection('whoReporting')} 
        />

        <FormField 
          label="What Are You Reporting?" 
          placeholder="Enter offending content. (Describe the situation)" 
          value={whatReporting} 
          onChangeText={setWhatReporting} 
          multiline 
        />

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Evidence Upload (Optional)</Text>
          <View style={[styles.evidenceBox, { backgroundColor: colors.inputBg }]}>
            {evidence ? (
              <View style={styles.evidencePreview}>
                <Image source={{ uri: evidence }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeEvidence} onPress={() => setEvidence(null)}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </Svg>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.evidencePlaceholder}>
                <Text style={{ color: colors.text + '80', marginBottom: 12 }}>Insert file or snap a photo</Text>
                <View style={styles.evidenceButtons}>
                  <TouchableOpacity style={styles.evidenceButton} onPress={pickImage}>
                    <Text style={styles.evidenceButtonText}>Insert file</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.evidenceButton, { marginLeft: 10 }]} onPress={takePhoto}>
                    <Text style={styles.evidenceButtonText}>Snap Image</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        <FormField 
          label="Additional Details" 
          placeholder="Enter Additional details" 
          value={additionalDetails} 
          onChangeText={setAdditionalDetails} 
          multiline 
        />

        <FormField 
          label="Your Contact Preference" 
          placeholder="enter contact preference" 
          value={contactPreference} 
          onChangeText={setContactPreference} 
        />

        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>Keep me updated on this case</Text>
          <Switch 
            value={keepUpdated} 
            onValueChange={setKeepUpdated}
            trackColor={{ false: '#767577', true: '#5A7C65' }}
            thumbColor={Platform.OS === 'ios' ? '#fff' : keepUpdated ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>Contact me only if necessary</Text>
          <Switch 
            value={contactOnlyNecessary} 
            onValueChange={setContactOnlyNecessary}
            trackColor={{ false: '#767577', true: '#5A7C65' }}
            thumbColor={Platform.OS === 'ios' ? '#fff' : contactOnlyNecessary ? '#fff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, isSubmitting && { opacity: 0.7 }]} 
          onPress={handleSendReport}
          disabled={isSubmitting}
        >
          <Text style={styles.sendButtonText}>{isSubmitting ? 'Sending...' : 'Send Report'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <SelectionModal
        visible={selectionModal.visible}
        onClose={() => setSelectionModal(prev => ({ ...prev, visible: false }))}
        options={selectionModal.options}
        onSelect={handleSelect}
        title={selectionModal.title}
      />

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
            <View style={styles.warningIcon}>
              <Svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <Path d="M30 10L5 50H55L30 10Z" stroke="#E6AD4F" strokeWidth="2" />
                <Path d="M30 25V35" stroke="#E6AD4F" strokeWidth="2" strokeLinecap="round" />
                <Path d="M30 42H30.02" stroke="#E6AD4F" strokeWidth="4" strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Send Report</Text>
            <Text style={[styles.modalSubtitle, { color: colors.text + 'CC' }]}>Are you sure you want to send this report?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.inputBg }]} 
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#5A7C65' }]} 
                onPress={confirmSend}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5A7C651A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // offset back button
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  evidenceBox: {
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evidencePlaceholder: {
    alignItems: 'center',
    width: '100%',
  },
  evidenceButtons: {
    flexDirection: 'row',
  },
  evidenceButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  evidenceButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  evidencePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeEvidence: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  sendButton: {
    backgroundColor: '#5A7C65',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
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
  },
  warningIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSheet: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '60%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionText: {
    fontSize: 16,
  },
});
