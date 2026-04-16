import { useThemedColors } from '@/hooks/use-themed-colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Dimensions, Image, Modal, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const { width } = Dimensions.get('window');

interface CertificateModalProps {
  visible: boolean;
  onClose: () => void;
  courseName?: string;
  studentName?: string;
  date?: string;
  certificateImage?: string;
}

export const CertificateModal = ({ 
  visible, 
  onClose,
  courseName = "Financial literacy and Budgeting",
  studentName = "Arlene McCoy",
  date = "29 May, 2024",
  certificateImage
}: CertificateModalProps) => {

  const themedColors = useThemedColors();
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: themedColors.modalBg}]}>
          {/* Certificate Card */}
          <LinearGradient
            colors={['#E0C3FC', '#8EC5FC']} // Light purple to light blue gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.certificateCard}
          >
             {certificateImage ? (
                <Image 
                    source={{ uri: certificateImage }} 
                    style={StyleSheet.absoluteFillObject} 
                    resizeMode="contain"
                />
             ) : (
                <View style={styles.certificateInner}>
                    {/* Header Content */}
                    <View style={styles.certHeader}>
                        <Text style={styles.dateText}>DATE: {date}</Text>
                        <Text style={styles.certTitle}>CERTIFICATE OF COMPLETION</Text>
                        <Text style={styles.acknowledgeText}>This acknowledges that</Text>
                        <Text style={styles.studentName}>{studentName}</Text>
                    </View>

                    {/* Body Content */}
                    <View style={styles.certBody}>
                        <Text style={styles.bodyText}>have successfully completed the</Text>
                        <Text style={styles.courseName}>{courseName}</Text>
                        <Text style={styles.bodyText}>offered by <Text style={{fontWeight: 'bold'}}>WatchDog Security</Text></Text>
                    </View>

                    <Text style={styles.descriptionText}>
                        This training provided comprehensive knowledge and practical skills in identifying, preventing, and responding to phishing and smishing attacks, enhancing cybersecurity awareness and resilience.
                    </Text>

                    {/* Signatures */}
                    <View style={styles.signaturesRow}>
                        <View style={styles.signatureBlock}>
                            {/* Fake Signature */}
                            <Text style={styles.signatureSign}>Manraaj</Text>
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatoryName}>Manraaj Singh Mand</Text>
                            <Text style={styles.signatoryTitle}>Co-Founder</Text>
                        </View>
                        <View style={styles.signatureBlock}>
                            {/* Fake Signature */}
                            <Text style={styles.signatureSign}>Ranhjot</Text>
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatoryName}>Ranhjot Singh Mand</Text>
                            <Text style={styles.signatoryTitle}>Co-Founder</Text>
                        </View>
                    </View>
                    
                    {/* Decorative Badge */}
                    <View style={styles.badgeContainer}>
                        <Ionicons name="ribbon" size={40} color="#6D28D9" />
                    </View>
                </View>
             )}
             
             {/* Right Side Dark Detail (mimicking the image design) */}
             {!certificateImage && (
                <View style={styles.rightDecor}>
                    <Ionicons name="shield-checkmark" size={30} color="rgba(255,255,255,0.5)" />
                    <View style={styles.logoBottom}>
                        <Text style={styles.logoText}>WATCHDOG</Text>
                        <Text style={styles.logoTextSmall}>SECURITY</Text>
                    </View>
                </View>
             )}
          </LinearGradient>

          <Text style={[styles.modalCourseTitle, {color: themedColors.text}]}>{courseName}</Text>
          <Text style={styles.modalSubTitle}>Certificate of Completion</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.downloadButton]} 
              onPress={async () => {
                if (!certificateImage) {
                    Alert.alert("Error", "No certificate image available to download.");
                    return;
                }
                
                try {
                    const result = await Share.share({
                        url: certificateImage,
                        message: `Check out my certificate for ${courseName}!`,
                    });
                    
                    if (result.action === Share.sharedAction) {
                        if (result.activityType) {
                            // shared with activity type of result.activityType
                        } else {
                            // shared
                        }
                    } else if (result.action === Share.dismissedAction) {
                        // dismissed
                    }
                } catch (error: any) {
                    Alert.alert("Error", error.message);
                }
              }}
            >
              <Text style={styles.downloadButtonText}>Download</Text>
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
    // backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  certificateCard: {
    width: '100%',
    height: 220, // Approximate height
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
  },
  certificateInner: {
    flex: 2,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.6)', 
  },
  certHeader: {
    marginBottom: 5,
  },
  dateText: {
    fontSize: 6,
    color: '#4B5563',
    marginBottom: 2,
  },
  certTitle: {
    fontSize: 8,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 2,
  },
  acknowledgeText: {
    fontSize: 6,
    color: '#4B5563',
  },
  studentName: {
      fontSize: 10,
      fontWeight: 'bold',
      marginTop: 2,
      color: '#000',
  },
  certBody: {
      marginTop: 4,
      marginBottom: 4,
  },
  bodyText: {
      fontSize: 6,
      color: '#4B5563',
  },
  courseName: {
      fontSize: 7,
      fontWeight: 'bold',
      color: '#000',
      marginVertical: 1,
  },
  descriptionText: {
      fontSize: 5,
      color: '#6B7280',
      marginBottom: 5,
      lineHeight: 7,
  },
  signaturesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 'auto',
      paddingBottom: 2,
  },
  signatureBlock: {
      alignItems: 'flex-start',
  },
  signatureSign: {
      fontFamily: 'serif',
      fontStyle: 'italic',
      fontSize: 8,
      color: '#1F2937',
  },
  signatureLine: {
      height: 0.5,
      width: 40,
      backgroundColor: '#9CA3AF',
      marginVertical: 1,
  },
  signatoryName: {
      fontSize: 4,
      fontWeight: 'bold',
  },
  signatoryTitle: {
      fontSize: 4,
      color: '#6B7280',
  },
  badgeContainer: {
      position: 'absolute',
      right: 5,
      top: '40%',
      opacity: 0.8,
  },
  rightDecor: {
      flex: 0.6,
      backgroundColor: '#1E1B4B', // Dark Indigo/Black
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
  },
  logoBottom: {
      alignItems: 'center',
  },
  logoText: {
      color: '#fff',
      fontSize: 5,
      fontWeight: 'bold',
  },
  logoTextSmall: {
      color: '#fff',
      fontSize: 4,
  },
  modalCourseTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 4,
      textAlign: 'center',
  },
  modalSubTitle: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 20,
      textAlign: 'center',
  },
  buttonRow: {
      flexDirection: 'row',
      width: '100%',
      gap: 12,
  },
  button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
  },
  cancelButton: {
      backgroundColor: '#E5E7EB',
  },
  downloadButton: {
      backgroundColor: '#526D65',
  },
  cancelButtonText: {
      color: '#374151',
      fontSize: 14,
      fontWeight: '600',
  },
  downloadButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
  },
});
