import { useThemedColors } from "@/hooks/use-themed-colors";
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
  const [hasNotifications] = React.useState(true); // Set to true when there are new notifications

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
            <ThemedText className="font-bold">
              {currentUser?.fullname?.split(" ")[0]}
            </ThemedText>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Pressable>
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
            {hasNotifications && (
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#3B82F6",
                }}
              />
            )}
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
};

export default UserHeader;
