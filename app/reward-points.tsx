import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemedColors } from "@/hooks/use-themed-colors";

export default function RewardPointsScreen() {
  const colors = useThemedColors();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.bglight10 }]}
          >
            <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <Path fill-rule="evenodd" clip-rule="evenodd" d="M7.01813 11.3914C6.89044 11.2636 6.81873 11.0903 6.81873 10.9096C6.81873 10.7289 6.89044 10.5556 7.01813 10.4278L13.8363 3.60959C13.8987 3.5426 13.974 3.48887 14.0576 3.4516C14.1413 3.41434 14.2316 3.3943 14.3231 3.39268C14.4147 3.39107 14.5056 3.40791 14.5905 3.4422C14.6754 3.47649 14.7525 3.52753 14.8173 3.59228C14.882 3.65702 14.933 3.73414 14.9673 3.81904C15.0016 3.90394 15.0185 3.99488 15.0168 4.08642C15.0152 4.17797 14.9952 4.26826 14.9579 4.35189C14.9207 4.43553 14.8669 4.5108 14.7999 4.57322L8.46358 10.9096L14.7999 17.2459C14.8669 17.3084 14.9207 17.3836 14.9579 17.4673C14.9952 17.5509 15.0152 17.6412 15.0168 17.7327C15.0185 17.8243 15.0016 17.9152 14.9673 18.0001C14.933 18.085 14.882 18.1621 14.8173 18.2269C14.7525 18.2916 14.6754 18.3427 14.5905 18.377C14.5056 18.4113 14.4147 18.4281 14.3231 18.4265C14.2316 18.4249 14.1413 18.4048 14.0576 18.3676C13.974 18.3303 13.8987 18.2766 13.8363 18.2096L7.01813 11.3914Z" fill="#5A7C65" fill-opacity="0.5"/>
            </Svg>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="subtitle" style={styles.pageTitle}>
            Reward Point
          </ThemedText>

          {/* Progress Card */}
          <LinearGradient
            colors={["#5A7C65", "#7A9C85"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressCard}
          >
             <View style={styles.progressHeader}>
                <View style={styles.levelBadge}>
                    <ThemedText style={{fontSize: 18}}>🥉</ThemedText>
                    <ThemedText style={styles.levelText}>Bronze Level</ThemedText>
                </View>
                <ThemedText style={styles.pointsTotal}>240 Points</ThemedText>
             </View>

             <ThemedText style={styles.goalTitle}>Goal Progress</ThemedText>
             <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: '70%' }]} />
             </View>
             <ThemedText style={styles.progressSubtext}>70% toward Silver Level 🥈</ThemedText>

             <Pressable 
                style={styles.historyButton}
                onPress={() => router.push("/point-history")}
             >
                <ThemedText style={styles.historyButtonText}>Point History</ThemedText>
             </Pressable>

             {/* Background Decoration Svg */}
             <View style={styles.cardSvgBg}>
                <Svg width="100%" height="100%" viewBox="0 0 200 150">
                    <Path 
                        d="M150 50C130 50 110 70 110 100C110 130 130 150 150 150C170 150 190 130 190 100C190 70 170 50 150 50Z" 
                        fill="white" 
                        fillOpacity="0.05" 
                    />
                    <Path 
                        d="M180 20C165 20 150 35 150 55C150 75 165 90 180 90C195 90 210 75 210 55C210 35 195 20 180 20Z" 
                        fill="white" 
                        fillOpacity="0.05" 
                    />
                </Svg>
             </View>
          </LinearGradient>

          {/* Earn More Card */}
          <Pressable 
            style={[styles.earnMoreCard, { backgroundColor: colors.tag }]}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.earnMoreContent}>
                <View style={styles.giftIconContainer}>
                    <Svg width="22" height="21" viewBox="0 0 22 21" fill="none">
                        <Path d="M7.875 1.5097C7.37772 1.5097 6.9008 1.70724 6.54917 2.05887C6.19754 2.4105 6 2.88742 6 3.3847C6 3.88198 6.19754 4.35889 6.54917 4.71052C6.9008 5.06215 7.37772 5.2597 7.875 5.2597H9.75V9.7597H1.875C1.37772 9.7597 0.900805 9.56216 0.549175 9.21052C0.197544 8.85889 0 8.38198 0 7.8847V7.1347C0 6.0987 0.84 5.2597 1.875 5.2597H5.068C4.58181 4.53745 4.39354 3.65526 4.54253 2.79747C4.69152 1.93967 5.16624 1.17263 5.86749 0.656628C6.56875 0.140627 7.44228 -0.0844136 8.30557 0.0285299C9.16885 0.141473 9.95509 0.583662 10.5 1.2627C11.0449 0.583662 11.8312 0.141473 12.6944 0.0285299C13.5577 -0.0844136 14.4313 0.140627 15.1325 0.656628C15.8338 1.17263 16.3085 1.93967 16.4575 2.79747C16.6065 3.65526 16.4182 4.53745 15.932 5.2597H19.875C20.91 5.2597 21.75 6.0997 21.75 7.1347V7.8847C21.75 8.9207 20.91 9.7597 19.875 9.7597H11.25V5.2597H13.125C13.4958 5.2597 13.8584 5.14973 14.1667 4.9437C14.475 4.73768 14.7154 4.44484 14.8573 4.10223C14.9992 3.75962 15.0363 3.38262 14.964 3.0189C14.8916 2.65519 14.713 2.3211 14.4508 2.05887C14.1886 1.79665 13.8545 1.61807 13.4908 1.54573C13.1271 1.47338 12.7501 1.51051 12.4075 1.65242C12.0649 1.79434 11.772 2.03466 11.566 2.343C11.36 2.65135 11.25 3.01386 11.25 3.3847V5.2597H9.75V3.3847C9.75 2.3487 8.91 1.5097 7.875 1.5097ZM9.75 11.2597H1.5V18.0097C1.5 18.6064 1.73705 19.1787 2.15901 19.6007C2.58097 20.0226 3.15326 20.2597 3.75 20.2597H9.75V11.2597ZM11.25 11.2597V20.2597H18C18.5967 20.2597 19.169 20.0226 19.591 19.6007C20.0129 19.1787 20.25 18.6064 20.25 18.0097V11.2597H11.25Z" fill="#012249"/>
                    </Svg>
                </View>
                <View style={{flex: 1}}>
                    <ThemedText style={styles.earnMoreTitle}>Earn More Point?</ThemedText>
                    <ThemedText style={styles.earnMoreSubtext}>Learn How to earn more points.</ThemedText>
                </View>
                <View style={[styles.arrowContainer, { backgroundColor: '#0D2D5E33' }]}>
                    <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                        <Rect width="30" height="30" rx="15" transform="matrix(-1 0 0 1 30 0)" fill="#012249"/>
                        <Path fill-rule="evenodd" clip-rule="evenodd" d="M17.916 15.3624C18.0118 15.2665 18.0656 15.1365 18.0656 15.001C18.0656 14.8655 18.0118 14.7356 17.916 14.6397L12.8024 9.52604C12.7555 9.4758 12.6991 9.4355 12.6364 9.40755C12.5736 9.3796 12.5059 9.36457 12.4373 9.36336C12.3686 9.36215 12.3004 9.37478 12.2367 9.4005C12.1731 9.42622 12.1152 9.4645 12.0667 9.51306C12.0181 9.56161 11.9798 9.61946 11.9541 9.68313C11.9284 9.7468 11.9158 9.815 11.917 9.88367C11.9182 9.95233 11.9332 10.02 11.9612 10.0828C11.9891 10.1455 12.0294 10.2019 12.0796 10.2488L16.8319 15.001L12.0796 19.7533C12.0294 19.8001 11.9891 19.8566 11.9612 19.9193C11.9332 19.982 11.9182 20.0497 11.917 20.1184C11.9158 20.1871 11.9284 20.2553 11.9541 20.3189C11.9798 20.3826 12.0181 20.4405 12.0667 20.489C12.1152 20.5376 12.1731 20.5759 12.2367 20.6016C12.3004 20.6273 12.3686 20.6399 12.4373 20.6387C12.5059 20.6375 12.5736 20.6225 12.6364 20.5945C12.6991 20.5666 12.7555 20.5263 12.8024 20.476L17.916 15.3624Z" fill="white"/>
                    </Svg>
                </View>
            </View>
          </Pressable>

          {/* QR Card */}
          <View style={[styles.qrCard, { backgroundColor: '#2C3E50' }]}>
            <LinearGradient
                colors={["#2C3E50", "#1A252F"]}
                style={styles.qrCardGradient}
            >
                <View style={styles.qrHeader}>
                    <View style={styles.logoRow}>
                        <Image
                            source={require("../assets/images/lifeskillsLogo.png")}
                            className="w-[90px] h-[40px] rounded-2xl"
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.qrLevelBadge}>
                        <ThemedText style={styles.qrLevelText}>Bronze Level</ThemedText>
                        <ThemedText style={{fontSize: 16}}>🥉</ThemedText>
                    </View>
                </View>

                <View style={styles.qrContainer}>
                    <View style={styles.qrCode}>
                        {/* Mock QR Code using Svg */}
                        <Svg width="140" height="140" viewBox="0 0 140 140">
                            <Rect x="0" y="0" width="40" height="40" fill="black" />
                            <Rect x="10" y="10" width="20" height="20" fill="white" />
                            <Rect x="100" y="0" width="40" height="40" fill="black" />
                            <Rect x="110" y="10" width="20" height="20" fill="white" />
                            <Rect x="0" y="100" width="40" height="40" fill="black" />
                            <Rect x="10" y="110" width="20" height="20" fill="white" />
                            <Rect x="50" y="50" width="40" height="40" fill="black" />
                            {/* Random dots */}
                            <Rect x="0" y="50" width="10" height="10" fill="black" />
                            <Rect x="20" y="70" width="10" height="10" fill="black" />
                            <Rect x="60" y="20" width="10" height="10" fill="black" />
                            <Rect x="80" y="40" width="10" height="10" fill="black" />
                            <Rect x="100" y="60" width="10" height="10" fill="black" />
                            <Rect x="50" y="100" width="10" height="10" fill="black" />
                            <Rect x="120" y="120" width="20" height="20" fill="black" />
                        </Svg>
                    </View>
                </View>

                <View style={styles.qrFooter}>
                    <ThemedText style={styles.userNameLabel}>Name: <ThemedText style={styles.userName}>Okokon Ewomazino Gift</ThemedText></ThemedText>
                    <ThemedText style={styles.cardNumber}>1 2 0 0   9 8 5 6    4 3 5 6    7 8 3 2</ThemedText>
                </View>

                {/* Background Decoration */}
                <View style={styles.qrSvgBg}>
                    <Svg width="100%" height="100%" viewBox="0 0 200 300">
                        <Path 
                            d="M0 150C0 100 50 50 100 50C150 50 200 100 200 150C200 200 150 250 100 250C50 250 0 200 0 150Z" 
                            fill="white" 
                            fillOpacity="0.03" 
                        />
                    </Svg>
                </View>
            </LinearGradient>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2 items-center mt-5 justify-start">
            <Pressable style={[styles.actionButton]}>
                <Image
                    source={require("../assets/images/apple.png")}
                    className="w-[150px] h-[50px] rounded-2xl"
                    resizeMode="contain"
                />
            </Pressable>
            <Pressable className="bg-[#5A7C65] w-[150px] h-[50px] rounded-xl flex-row gap-2 items-center justify-center">
                <Ionicons name="download-outline" size={20} color="white" />
                <ThemedText style={styles.downloadButtonText}>Download</ThemedText>
            </Pressable>
          </View>
        </ScrollView>

        {/* Earn More Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
                <ThemedText style={styles.modalTitle}>How to Earn More Point</ThemedText>
                
                <View style={styles.modalList}>
                    <View style={styles.modalRow}>
                        <ThemedText style={styles.modalRowLabel}>Answer Pop Quiz Correctly</ThemedText>
                        <ThemedText style={styles.modalRowValue}>10 Points</ThemedText>
                    </View>
                    <View style={styles.modalRow}>
                        <ThemedText style={styles.modalRowLabel}>Complete final assessment</ThemedText>
                        <ThemedText style={styles.modalRowValue}>25 Points</ThemedText>
                    </View>
                </View>

                <ThemedText style={styles.modalFootnote}>
                    Points add up as you learn—the more you engage, the more you earn!
                </ThemedText>

                <Pressable 
                    style={[styles.doneButton, { backgroundColor: colors.primary }]}
                    onPress={() => setModalVisible(false)}
                >
                    <ThemedText style={styles.doneButtonText}>Done</ThemedText>
                </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 5,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 20,
    marginTop: 10,
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    position: "relative",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  levelText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.9,
  },
  pointsTotal: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  goalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    opacity: 0.9,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
    opacity: 0.8,
  },
  progressSubtext: {
    color: "white",
    fontSize: 12,
    marginBottom: 20,
    opacity: 0.8,
  },
  historyButton: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  historyButtonText: {
    color: "#5A7C65",
    fontSize: 14,
    fontWeight: "600",
  },
  cardSvgBg: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 150,
    height: 150,
    opacity: 1,
  },
  earnMoreCard: {
    borderRadius: 12,
    marginTop: 20,
    padding: 16,
  },
  earnMoreContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  giftIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    // backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  earnMoreTitle: {
    color: "#012249",
    fontSize: 16,
    fontWeight: "600",
  },
  earnMoreSubtext: {
    color: "white",
    fontSize: 13,
    opacity: 0.9,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  qrCard: {
    borderRadius: 24,
    marginTop: 20,
    overflow: "hidden",
    minHeight: 400,
  },
  qrCardGradient: {
    flex: 1,
    padding: 24,
    position: "relative",
  },
  qrHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  logoRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  logoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 16,
  },
  qrLevelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qrLevelText: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  qrContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignSelf: "center",
    marginBottom: 40,
  },
  qrCode: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  qrFooter: {
    alignItems: "center",
  },
  userNameLabel: {
    color: "#2ECC71",
    fontSize: 14,
    marginBottom: 8,
  },
  userName: {
    color: "white",
    fontWeight: "600",
  },
  cardNumber: {
    color: "white",
    fontSize: 14,
    letterSpacing: 2,
    opacity: 0.8,
  },
  qrSvgBg: {
    position: "absolute",
    left: -50,
    top: 100,
    width: 200,
    height: 300,
    opacity: 1,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  appleWalletButton: {
    backgroundColor: "black",
  },
  appleButtonSmall: {
    color: "white",
    fontSize: 10,
    marginBottom: -2,
  },
  appleButtonMain: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  downloadButton: {
    backgroundColor: "#5A7C65",
  },
  downloadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  modalList: {
    width: "100%",
    gap: 16,
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalRowLabel: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  modalRowValue: {
    fontSize: 16,
    color: "#5A7C65",
    fontWeight: "bold",
  },
  modalFootnote: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 18,
    marginBottom: 24,
  },
  doneButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
