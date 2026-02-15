import { useThemedColors } from "@/hooks/use-themed-colors";
import { useNotificationStore } from "@/store/notificationStore";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, Pressable, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

const UserHeader = () => {
  const name = "Zeeno";
  const colors = useThemedColors();
  const router = useRouter();
  const { unreadCount } = useNotificationStore();

  const { currentUser } = useUserStore();

  const handleNotificationPress = () => {
    router.push("/notifications");
  };

  return (
    <ThemedView
      style={{
        paddingTop: Platform.OS === "android" ? 10 : 0, // Extra breathing room for Android top bar
      }}
    >
      <View className="flex-row justify-between">
        <View className="flex-row gap-2">
          <View className="w-[40px] h-[40px] rounded-full bg-gray-200 overflow-hidden">
            <Image
              source={
                currentUser?.userImage
                  ? { uri: currentUser.userImage }
                  : require("@/assets/images/userAvatar.png")
              }
              className="w-full h-full rounded-2xl"
              resizeMode="cover"
            />
          </View>

          <View>
            <ThemedText style={{ color: colors.textSecondary }} type="small">
              Hey {currentUser?.username}, ready to grow today?
            </ThemedText>
            <View className="flex-row items-center gap-1">
            <ThemedText className="font-bold">
              {currentUser?.fullname?.split(" ")[0]}
              {
                currentUser?.is_premium ? (
                  <Svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <Path fill-rule="evenodd" clip-rule="evenodd" d="M5.29417 1.29084C5.6458 0.885192 6.08061 0.559964 6.56906 0.337235C7.05751 0.114506 7.58817 -0.000508593 8.125 1.69057e-06C9.25584 1.69057e-06 10.2692 0.500002 10.9558 1.29084C11.4914 1.25259 12.029 1.33007 12.5319 1.51801C13.0349 1.70594 13.4916 1.99993 13.8708 2.38C14.2508 2.75922 14.5446 3.21573 14.7326 3.71855C14.9205 4.22137 14.9981 4.75873 14.96 5.29417C15.3655 5.64588 15.6906 6.08072 15.9131 6.56916C16.1357 7.05761 16.2506 7.58823 16.25 8.125C16.2505 8.66184 16.1355 9.1925 15.9128 9.68095C15.69 10.1694 15.3648 10.6042 14.9592 10.9558C14.9972 11.4913 14.9197 12.0286 14.7317 12.5315C14.5438 13.0343 14.2499 13.4908 13.87 13.87C13.4908 14.2499 13.0343 14.5438 12.5315 14.7317C12.0286 14.9197 11.4913 14.9972 10.9558 14.9592C10.6042 15.3648 10.1694 15.69 9.68095 15.9128C9.1925 16.1355 8.66184 16.2505 8.125 16.25C7.58817 16.2505 7.05751 16.1355 6.56906 15.9128C6.08061 15.69 5.6458 15.3648 5.29417 14.9592C4.75865 14.9975 4.22115 14.9202 3.71817 14.7324C3.2152 14.5446 2.75852 14.2508 2.37917 13.8708C1.99914 13.4915 1.70518 13.0349 1.51725 12.5319C1.32932 12.0289 1.25182 11.4914 1.29 10.9558C0.884511 10.6041 0.55944 10.1693 0.336856 9.68084C0.114273 9.19239 -0.000611344 8.66177 2.44654e-06 8.125C2.44654e-06 6.99417 0.500003 5.98083 1.29084 5.29417C1.25272 4.75872 1.33025 4.22135 1.51819 3.71852C1.70612 3.21569 2.00004 2.75919 2.38 2.38C2.75919 2.00004 3.21569 1.70612 3.71852 1.51818C4.22135 1.33025 4.75872 1.25272 5.29417 1.29084ZM11.1333 6.61334C11.1833 6.54671 11.2195 6.47076 11.2397 6.38996C11.26 6.30915 11.2638 6.22512 11.2511 6.1428C11.2384 6.06047 11.2094 5.98152 11.1657 5.91058C11.1221 5.83964 11.0647 5.77815 10.9969 5.72971C10.9291 5.68127 10.8523 5.64687 10.7711 5.62853C10.6898 5.61018 10.6057 5.60826 10.5237 5.62289C10.4417 5.63751 10.3635 5.66838 10.2936 5.71368C10.2237 5.75898 10.1635 5.81779 10.1167 5.88667L7.42 9.66167L6.06667 8.30834C5.94819 8.19794 5.79148 8.13783 5.62957 8.14069C5.46765 8.14355 5.31316 8.20914 5.19865 8.32365C5.08414 8.43816 5.01855 8.59265 5.01569 8.75457C5.01283 8.91648 5.07294 9.07319 5.18334 9.19167L7.05834 11.0667C7.12249 11.1308 7.19984 11.1802 7.28499 11.2114C7.37015 11.2426 7.46108 11.2549 7.55147 11.2474C7.64186 11.24 7.72955 11.213 7.80844 11.1682C7.88734 11.1235 7.95554 11.0621 8.00834 10.9883L11.1333 6.61334Z" fill="#1DA1F2"/>
                  </Svg>
                ) : null
              }
            </ThemedText>

            </View>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Pressable onPress={() => router.push('/support')}>
            <Svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              // xmlns="http://www.w3.org/2000/svg"
            >
              <Path
                d="M21 11.1833V8.28029C21 6.64029 21 5.82028 20.5959 5.28529C20.1918 4.75029 19.2781 4.49056 17.4507 3.9711C16.2022 3.6162 15.1016 3.18863 14.2223 2.79829C13.0234 2.2661 12.424 2 12 2C11.576 2 10.9766 2.2661 9.77771 2.79829C8.89839 3.18863 7.79784 3.61619 6.54933 3.9711C4.72193 4.49056 3.80822 4.75029 3.40411 5.28529C3 5.82028 3 6.64029 3 8.28029V11.1833C3 16.8085 8.06277 20.1835 10.594 21.5194C11.2011 21.8398 11.5046 22 12 22C12.4954 22 12.7989 21.8398 13.406 21.5194C15.9372 20.1835 21 16.8085 21 11.1833Z"
                fill="#5A7C65"
                stroke="#5A7C65"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <Path
                d="M14.5 11.5C14.5 12.8807 13.3807 14 12 14C10.6193 14 9.5 12.8807 9.5 11.5C9.5 10.1193 10.6193 9 12 9C13.3807 9 14.5 10.1193 14.5 11.5Z"
                fill="white"
                stroke="#5A7C65"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
          <Pressable
            onPress={handleNotificationPress}
            style={{ position: "relative" }}
          >
            <Svg
              width="23"
              height="25"
              viewBox="0 0 23 25"
              fill="none"
              // xmlns="http://www.w3.org/2000/svg"
            >
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.88907 8.4375C2.88907 6.19974 3.77801 4.05363 5.36035 2.47129C6.94269 0.888948 9.0888 0 11.3266 0C13.5643 0 15.7104 0.888948 17.2928 2.47129C18.8751 4.05363 19.7641 6.19974 19.7641 8.4375V9.375C19.7641 12.0287 20.7641 14.4463 22.4116 16.275C22.5142 16.3887 22.5874 16.5259 22.6247 16.6745C22.6621 16.823 22.6625 16.9785 22.6258 17.1272C22.5892 17.276 22.5167 17.4135 22.4146 17.5277C22.3125 17.642 22.184 17.7294 22.0403 17.7825C20.1103 18.495 18.0903 19.02 16.0016 19.3363C16.0486 19.9789 15.9626 20.6244 15.749 21.2323C15.5353 21.8403 15.1987 22.3977 14.7599 22.8697C14.3212 23.3417 13.7899 23.7181 13.1992 23.9756C12.6084 24.233 11.971 24.3658 11.3266 24.3658C10.6822 24.3658 10.0447 24.233 9.45396 23.9756C8.86321 23.7181 8.33189 23.3417 7.89318 22.8697C7.45447 22.3977 7.11778 21.8403 6.90415 21.2323C6.69052 20.6244 6.60454 19.9789 6.65157 19.3363C4.59113 19.024 2.5678 18.503 0.612815 17.7812C0.469232 17.7282 0.340811 17.6409 0.238767 17.5268C0.136723 17.4127 0.0641609 17.2754 0.0274168 17.1268C-0.00932722 16.9783 -0.00913521 16.8229 0.0279762 16.6745C0.0650877 16.526 0.13799 16.3888 0.240315 16.275C1.94882 14.3833 2.89291 11.924 2.88907 9.375V8.4375ZM8.51657 19.5625C8.50058 19.9415 8.56141 20.3198 8.69542 20.6747C8.82943 21.0295 9.03383 21.3536 9.29634 21.6274C9.55885 21.9012 9.87404 22.1191 10.2229 22.268C10.5718 22.4168 10.9472 22.4936 11.3266 22.4936C11.7059 22.4936 12.0813 22.4168 12.4302 22.268C12.7791 22.1191 13.0943 21.9012 13.3568 21.6274C13.6193 21.3536 13.8237 21.0295 13.9577 20.6747C14.0917 20.3198 14.1526 19.9415 14.1366 19.5625C12.267 19.7309 10.3861 19.7309 8.51657 19.5625Z"
                fill="#5A7C65"
              />
            </Svg>
            {unreadCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: "#E11D48", // Using a vibrant rose/red for the badge
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 4,
                  borderWidth: 1.5,
                  borderColor: colors.background, // Contrast with header background
                }}
              >
                <ThemedText
                  style={{
                    color: "white",
                    fontSize: 8,
                    fontWeight: "bold",
                    lineHeight: 12,
                    textAlign: "center",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </ThemedText>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
};

export default UserHeader;
