import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as DocumentPicker from 'expo-document-picker';
import { toast } from 'sonner-native';
import { useThemedColors } from '@/hooks/use-themed-colors';
import { useUserStore } from '@/store/userStore';
import { Job } from '@/hooks/use-jobs';

interface ApplicationModalProps {
    visible: boolean;
    onClose: () => void;
    job: Job | null;
    onSuccess: (cvUrl: string, coverLetter: string) => Promise<void>;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
    visible,
    onClose,
    job,
    onSuccess,
}) => {
    const colors = useThemedColors();
    const currentUser = useUserStore((state) => state.currentUser);
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!job) return null;

    const handleFilePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                const file = result.assets[0];
                if (file.size && file.size > 2 * 1024 * 1024) {
                    toast.error("File size cannot exceed 2MB");
                    return;
                }
                setSelectedFile(result);
            }
        } catch (error) {
            console.error("Error picking document:", error);
            toast.error("Failed to pick document");
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile || selectedFile.canceled) {
            toast.error("Please upload your CV before submitting");
            return;
        }

        try {
            setIsSubmitting(true);
            
            const fileAsset = selectedFile.assets[0];

            // 1. Upload to Cloudinary
            const formData = new FormData();
            // @ts-ignore
            formData.append('file', {
                uri: Platform.OS === 'ios' ? fileAsset.uri.replace('file://', '') : fileAsset.uri,
                type: 'application/pdf',
                name: fileAsset.name || 'cv.pdf',
            });
            formData.append("upload_preset", process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

            const cloudinaryResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (!cloudinaryResponse.ok) {
                const errorData = await cloudinaryResponse.json();
                console.error("Cloudinary error:", errorData);
                throw new Error("Failed to upload CV to Cloudinary");
            }

            const cloudinaryData = await cloudinaryResponse.json();
            const cvUrl = cloudinaryData.secure_url;

            // 2. Submit via parent component
            await onSuccess(cvUrl, coverLetter);
            
            toast.success("Application submitted successfully!");
            onClose();
            // Reset state
            setSelectedFile(null);
            setCoverLetter("");
        } catch (error: any) {
            console.error("Application submission error:", error);
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.fullScreenContainer, { backgroundColor: colors.background }]}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={styles.header}>
                            <View style={styles.headerTitleRow}>
                                <View style={[styles.headerIcon, { backgroundColor: '#5A7C641A' }]}>
                                    <Ionicons name="document-text" size={20} color="#5A7C64" />
                                </View>
                                <Text style={[styles.headerTitle, { color: colors.text }]}>Application</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                                {/* Job Info */}
                                <View style={styles.jobInfoRow}>
                                    <View style={[styles.jobLogoContainer, { backgroundColor: '#FFEDD5' }]}>
                                        <Image source={{ uri: job.logo }} style={styles.jobLogo} contentFit="contain" />
                                    </View>
                                    <View style={styles.jobDetails}>
                                        <View style={styles.typeBadge}>
                                            <Ionicons name="briefcase" size={12} color="#fff" />
                                            <Text style={styles.typeBadgeText}>{job.type}</Text>
                                        </View>
                                        <Text style={[styles.companyName, { color: colors.textSecondary }]}>{job.company}</Text>
                                    </View>
                                </View>

                                <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
                                
                                <View style={styles.metaRow}>
                                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{job.location}</Text>
                                </View>
                                <View style={styles.metaRow}>
                                    <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{job.salary}</Text>
                                </View>

                                <View style={styles.divider} />

                                {/* Form */}
                                <View style={styles.form}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Enter Name</Text>
                                        <View style={[styles.inputContainer, { backgroundColor: '#5A7C640D' }]}>
                                            <TextInput
                                                style={[styles.input, { color: colors.text }]}
                                                placeholder="Enter name"
                                                defaultValue={currentUser?.fullname || ""}
                                                editable={false}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Enter email</Text>
                                        <View style={[styles.inputContainer, { backgroundColor: '#5A7C640D' }]}>
                                            <TextInput
                                                style={[styles.input, { color: colors.text }]}
                                                placeholder="Enter email"
                                                defaultValue={currentUser?.email || ""}
                                                editable={false}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Upload Cv</Text>
                                        <TouchableOpacity 
                                            onPress={handleFilePick}
                                            style={[styles.fileUpload, { backgroundColor: '#5A7C640D' }]}
                                        >
                                            <Text style={[styles.fileName, { color: selectedFile ? colors.text : colors.textSecondary }]}>
                                                {(!selectedFile || selectedFile.canceled) ? "Upload a pdf (2mb max)" : selectedFile.assets[0].name}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Cover Letter</Text>
                                        <View style={[styles.textAreaContainer, { backgroundColor: '#5A7C640D' }]}>
                                            <TextInput
                                                style={[styles.textArea, { color: colors.text }]}
                                                placeholder="Write your cover letter here..."
                                                placeholderTextColor={colors.textSecondary}
                                                multiline
                                                numberOfLines={4}
                                                value={coverLetter}
                                                onChangeText={setCoverLetter}
                                                textAlignVertical="top"
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity 
                                        style={[styles.submitButton, { backgroundColor: '#5A7C64' }]} 
                                        onPress={handleSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.submitButtonText}>Done</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    keyboardView: {
        flex: 1,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    jobInfoRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    jobLogoContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    jobLogo: {
        width: '70%',
        height: '70%',
    },
    jobDetails: {
        justifyContent: 'center',
        gap: 4,
    },
    typeBadge: {
        backgroundColor: '#4A90E2',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
        alignSelf: 'flex-start',
    },
    typeBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    companyName: {
        fontSize: 14,
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    metaText: {
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 20,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8C8C8C',
    },
    inputContainer: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 52,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    input: {
        fontSize: 14,
    },
    fileUpload: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    fileName: {
        fontSize: 12,
        textAlign: 'center',
    },
    textAreaContainer: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 120,
    },
    textArea: {
        fontSize: 14,
        height: 100,
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#5A7C64',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
