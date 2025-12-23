import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemedColors } from "@/hooks/use-themed-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import Animated, { FadeInRight, FadeOutRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

export default function NotificationsScreen() {
  const colors = useThemedColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<
    "all" | "message" | "activity" | "safeguarding"
  >("all");

  // Sample notifications organized by type
  const initialNotifications = [
    {
      id: "1",
      type: "message",
      title: "Mentor David replied",
      message:
        "In situation of saving get an app like piggy vest helping you keep money till you need it.",
      timestamp: "2025-11-16T10:45:00",
      icon: (
        <Svg width="21" height="20" viewBox="0 0 21 20" fill="none">
          <Path
            d="M7.125 7.5C7.125 7.59946 7.08549 7.69484 7.01517 7.76517C6.94484 7.83549 6.84946 7.875 6.75 7.875C6.65054 7.875 6.55516 7.83549 6.48484 7.76517C6.41451 7.69484 6.375 7.59946 6.375 7.5C6.375 7.40055 6.41451 7.30516 6.48484 7.23484C6.55516 7.16451 6.65054 7.125 6.75 7.125C6.84946 7.125 6.94484 7.16451 7.01517 7.23484C7.08549 7.30516 7.125 7.40055 7.125 7.5ZM7.125 7.5H6.75M10.875 7.5C10.875 7.59946 10.8355 7.69484 10.7652 7.76517C10.6948 7.83549 10.5995 7.875 10.5 7.875C10.4005 7.875 10.3052 7.83549 10.2348 7.76517C10.1645 7.69484 10.125 7.59946 10.125 7.5C10.125 7.40055 10.1645 7.30516 10.2348 7.23484C10.3052 7.16451 10.4005 7.125 10.5 7.125C10.5995 7.125 10.6948 7.16451 10.7652 7.23484C10.8355 7.30516 10.875 7.40055 10.875 7.5ZM10.875 7.5H10.5M14.625 7.5C14.625 7.59946 14.5855 7.69484 14.5152 7.76517C14.4448 7.83549 14.3495 7.875 14.25 7.875C14.1505 7.875 14.0552 7.83549 13.9848 7.76517C13.9145 7.69484 13.875 7.59946 13.875 7.5C13.875 7.40055 13.9145 7.30516 13.9848 7.23484C14.0552 7.16451 14.1505 7.125 14.25 7.125C14.3495 7.125 14.4448 7.16451 14.5152 7.23484C14.5855 7.30516 14.625 7.40055 14.625 7.5ZM14.625 7.5H14.25M0.75 10.51C0.75 12.11 1.873 13.504 3.457 13.737C4.544 13.897 5.642 14.02 6.75 14.106V18.75L10.934 14.567C11.1412 14.3607 11.4197 14.2418 11.712 14.235C13.6636 14.187 15.6105 14.0207 17.542 13.737C19.127 13.504 20.25 12.111 20.25 10.509V4.491C20.25 2.889 19.127 1.496 17.543 1.263C15.211 0.920716 12.857 0.74926 10.5 0.750002C8.108 0.750002 5.756 0.925002 3.457 1.263C1.873 1.496 0.75 2.89 0.75 4.491V10.509V10.51Z"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
      actions: [],
      isRead: false,
      activity: "",
    },
    {
      id: "2",
      type: "activity",
      title: "Bronze Level Complete!",
      message:
        "You've officially leveled up to Silver Tier. Keep the momentum going!",
      timestamp: "2025-11-16T10:45:00",
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 17C10.3264 17 8.86971 18.265 8.11766 20.1312C7.75846 21.0225 8.27389 22 8.95877 22H15.0412C15.7261 22 16.2415 21.0225 15.8823 20.1312C15.1303 18.265 13.6736 17 12 17Z"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Path
            d="M18.5 5H19.7022C20.9031 5 21.5035 5 21.8168 5.37736C22.13 5.75472 21.9998 6.32113 21.7393 7.45395L21.3485 9.15307C20.7609 11.7086 18.6109 13.6088 16 14"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M5.5 5H4.29779C3.09692 5 2.49649 5 2.18324 5.37736C1.86999 5.75472 2.00024 6.32113 2.26075 7.45395L2.65148 9.15307C3.23914 11.7086 5.38912 13.6088 8 14"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 17C15.0208 17 17.565 12.3379 18.3297 5.99089C18.5412 4.23558 18.647 3.35793 18.0868 2.67896C17.5267 2 16.6223 2 14.8134 2H9.18658C7.37775 2 6.47333 2 5.91317 2.67896C5.35301 3.35793 5.45875 4.23558 5.67025 5.99089C6.435 12.3379 8.97923 17 12 17Z"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </Svg>
      ),
      actions: [],
      isRead: false,
      activity: "level-up",
    },
    {
      id: "3",
      type: "activity",
      title: "You just earned 50 points!",
      message:
        "Thanks for completing your check-in today. Points are adding up fast 💪",
      timestamp: "2025-11-16T10:45:00",
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 11V15C4 18.2998 4 19.9497 5.02513 20.9749C6.05025 22 7.70017 22 11 22H13C16.2998 22 17.9497 22 18.9749 20.9749C20 19.9497 20 18.2998 20 15V11"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M3 9C3 8.25231 3 7.87846 3.20096 7.6C3.33261 7.41758 3.52197 7.26609 3.75 7.16077C4.09808 7 4.56538 7 5.5 7H18.5C19.4346 7 19.9019 7 20.25 7.16077C20.478 7.26609 20.6674 7.41758 20.799 7.6C21 7.87846 21 8.25231 21 9C21 9.74769 21 10.1215 20.799 10.4C20.6674 10.5824 20.478 10.7339 20.25 10.8392C19.9019 11 19.4346 11 18.5 11H5.5C4.56538 11 4.09808 11 3.75 10.8392C3.52197 10.7339 3.33261 10.5824 3.20096 10.4C3 10.1215 3 9.74769 3 9Z"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <Path
            d="M6 3.78571C6 2.79949 6.79949 2 7.78571 2H8.14286C10.2731 2 12 3.7269 12 5.85714V7H9.21429C7.43908 7 6 5.56091 6 3.78571Z"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <Path
            d="M18 3.78571C18 2.79949 17.2005 2 16.2143 2H15.8571C13.7269 2 12 3.7269 12 5.85714V7H14.7857C16.5609 7 18 5.56091 18 3.78571Z"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <Path
            d="M12 11V22"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
      actions: [],
      isRead: true,
      activity: "reward",
    },
    {
      id: "4",
      type: "activity",
      title: "You're almost there!",
      message:
        'You\'ve completed 3 of 4 weekly goals. Finish one more to earn your "Consistency Champ" badge!',
      timestamp: "2025-11-15T14:30:00",
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M15.1312 2.5C14.1462 2.17555 13.0936 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 10.9548 21.8396 9.94704 21.5422 9"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Path
            d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M19.5 4.5L12 12M19.5 4.5V2M19.5 4.5H22"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </Svg>
      ),
      actions: [],
      isRead: true,
      activity: "encouragement",
    },
    {
      id: "5",
      type: "activity",
      title: "Try Premium for 7 days FREE!",
      message:
        "Explore deeper modules, exclusive mentorship, and priority support.",
      timestamp: "2025-11-15T14:30:00",
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M4.26781 18.8447C4.49269 20.515 5.87613 21.8235 7.55966 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.879 17.7547 20 16.6376 20 15.5C20 14.3624 19.879 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55966 9.09909C5.87613 9.17649 4.49269 10.485 4.26781 12.1553C4.12104 13.2453 4 14.3624 4 15.5C4 16.6376 4.12104 17.7547 4.26781 18.8447Z"
            stroke="#5A7C65"
            strokeWidth="1.5"
          />
          <Path
            d="M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C13.9593 2 15.5 3.5 16 5"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M11.9961 15.5H12.0051"
            stroke="#5A7C65"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
      actions: [],
      isRead: true,
      activity: "advert",
    },
    {
      id: "6",
      type: "safeguarding",
      title: "Crisis Support Available",
      message:
        "Feeling overwhelmed? You're not alone. Our crisis support team is here 24/7 if you need someone to talk to. 💬",
      timestamp: "2025-11-16T10:45:00",
      icon: "🚨",
      actions: [
        { label: "Tap to chat anonymously.", action: "call", icon: "☎️" },
      ],
      isRead: false,
      activity: "crisis",
    },
    {
      id: "7",
      type: "safeguarding",
      title: "New Safe Space Added Near You",
      message:
        "Good news! A verified Safe Space has been added in your area. If you ever need help, it's a safe place to go.",
      timestamp: "2025-11-16T10:45:00",
      icon: "📍",
      actions: [{ label: "Tap to view on map.", action: "map", icon: "🗺️" }],
      isRead: true,
      activity: "safe-space",
    },
    {
      id: "8",
      type: "safeguarding",
      title: "Need to Report Something?",
      message:
        "You can report abuse, harassment, or anything that makes you feel unsafe—completely anonymously.",
      timestamp: "2025-11-15T14:30:00",
      icon: "🛑",
      actions: [
        { label: "Tap here to speak up.", action: "report", icon: "📢" },
      ],
      isRead: true,
      activity: "report",
    },
    {
      id: "9",
      type: "activity",
      title: "Set small goals for big growth!",
      message:
        "Your AI mentor has a new recommendation based on your progress in Financial Literacy!",
      timestamp: "2025-11-15T14:30:00",
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M19 16V14C19 11.1716 19 9.75736 18.1213 8.87868C17.2426 8 15.8284 8 13 8H11C8.17157 8 6.75736 8 5.87868 8.87868C5 9.75736 5 11.1716 5 14V16C5 18.8284 5 20.2426 5.87868 21.1213C6.75736 22 8.17157 22 11 22H13C15.8284 22 17.2426 22 18.1213 21.1213C19 20.2426 19 18.8284 19 16Z"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <Path
            d="M19 18C20.4142 18 21.1213 18 21.5607 17.5607C22 17.1213 22 16.4142 22 15C22 13.5858 22 12.8787 21.5607 12.4393C21.1213 12 20.4142 12 19 12"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <Path
            d="M5 18C3.58579 18 2.87868 18 2.43934 17.5607C2 17.1213 2 16.4142 2 15C2 13.5858 2 12.8787 2.43934 12.4393C2.87868 12 3.58579 12 5 12"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <Path
            d="M13.5 3.5C13.5 4.32843 12.8284 5 12 5C11.1716 5 10.5 4.32843 10.5 3.5C10.5 2.67157 11.1716 2 12 2C12.8284 2 13.5 2.67157 13.5 3.5Z"
            stroke="#5A7C65"
            strokeWidth="1.5"
          />
          <Path
            d="M12 5V8"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9 13V14"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M15 13V14"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M10 17.5C10 17.5 10.6667 18 12 18C13.3333 18 14 17.5 14 17.5"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </Svg>
      ),
      actions: [],
      isRead: true,
      activity: "ai",
    },
    {
      id: "10",
      type: "activity",
      title: "You might like this one!",
      message: `Check out "Digital Safety"—a module designed to keep you safe and smart online.`,
      timestamp: "2025-11-15T14:30:00",
      icon: (
        <Svg width="20" height="18" viewBox="0 0 20 18" fill="none">
          <Path
            d="M3.75 3.878V3C3.75 2.40326 3.98705 1.83097 4.40901 1.40901C4.83097 0.987053 5.40326 0.75 6 0.75H13.5C14.0967 0.75 14.669 0.987053 15.091 1.40901C15.5129 1.83097 15.75 2.40326 15.75 3V3.878M3.75 3.878C3.985 3.795 4.237 3.75 4.5 3.75H15C15.263 3.75 15.515 3.795 15.75 3.878M3.75 3.878C3.31121 4.03313 2.93133 4.32052 2.66269 4.70056C2.39404 5.0806 2.24986 5.5346 2.25 6V6.878M15.75 3.878C16.1888 4.03313 16.5687 4.32052 16.8373 4.70056C17.106 5.0806 17.2501 5.5346 17.25 6V6.878M2.25 6.878C2.485 6.795 2.737 6.75 3 6.75H16.5C16.7555 6.7497 17.0091 6.79299 17.25 6.878M2.25 6.878C1.376 7.187 0.75 8.02 0.75 9V15C0.75 15.5967 0.987053 16.169 1.40901 16.591C1.83097 17.0129 2.40326 17.25 3 17.25H16.5C17.0967 17.25 17.669 17.0129 18.091 16.591C18.5129 16.169 18.75 15.5967 18.75 15V9C18.7501 8.5346 18.606 8.0806 18.3373 7.70056C18.0687 7.32052 17.6888 7.03313 17.25 6.878"
            stroke="#5A7C65"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
      actions: [],
      isRead: true,
      activity: "module",
    },
  ];

  // Helper function to format relative time
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    let relativeTime = "now";
    if (diffMins < 1) relativeTime = "just now";
    else if (diffMins < 60) relativeTime = `${diffMins}m ago`;
    else if (diffHours < 24) relativeTime = `${diffHours}h ago`;
    else if (diffDays < 7) relativeTime = `${diffDays}d ago`;
    else relativeTime = date.toLocaleDateString();

    return `${relativeTime}, ${timeStr}`;
  };

  // Filter notifications based on active tab
  const filteredNotifications =
    activeTab === "all"
      ? initialNotifications
      : initialNotifications.filter((notif) => notif.type === activeTab);

  const renderNotification = ({ item }: { item: any }) => (
    <View>
      <Pressable
        className="px-4 py-3 flex-row gap-3 items-start"
        style={
          {
            //   backgroundColor: !item.isRead ? colors.bglight10 : "transparent",
          }
        }
      >
        <View
          style={{
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {/* {item.type === "safeguarding" && (
            <Svg
              width="20"
              height="22"
              viewBox="0 0 20 22"
              fill="none"
              //   xmlns="http://www.w3.org/2000/svg"
            >
              <Path
                d="M18.75 9.9333V7.03029C18.75 5.39029 18.75 4.57028 18.3459 4.03529C17.9418 3.50029 17.0281 3.24056 15.2007 2.7211C13.9522 2.3662 12.8516 1.93863 11.9723 1.54829C10.7734 1.0161 10.174 0.75 9.75 0.75C9.326 0.75 8.7266 1.0161 7.52771 1.54829C6.64839 1.93863 5.54784 2.36619 4.29933 2.7211C2.47193 3.24056 1.55822 3.50029 1.15411 4.03529C0.75 4.57028 0.75 5.39029 0.75 7.03029V9.9333C0.75 15.5585 5.81277 18.9335 8.344 20.2694C8.9511 20.5898 9.2546 20.75 9.75 20.75C10.2454 20.75 10.5489 20.5898 11.156 20.2694C13.6872 18.9335 18.75 15.5585 18.75 9.9333Z"
                fill="#5A7C65"
                stroke="#5A7C65"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
          )} */}
          {typeof item.icon === "string" ? (
            <ThemedText style={{ fontSize: 20 }}>{item.icon}</ThemedText>
          ) : (
            item.icon
          )}
        </View>
        <View className="flex-1">
          <ThemedText
            className="font-semibold text-sm"
            style={{ color: colors.text, fontStyle: "italic" }}
            type="small14"
          >
            {item.title}
          </ThemedText>
          <ThemedText
            className="text-xs mt-1"
            style={{ color: colors.textSecondary }}
            numberOfLines={2}
            type="small14"
          >
            {item.message}
          </ThemedText>

          {/* Action buttons for safeguarding notifications */}
          {item.type === "safeguarding" &&
            item.actions &&
            item.actions.length > 0 && (
              <View
                className="  flex-row gap-2 "
                // style={{ marginLeft: 45 }}
              >
                {item.actions.map((action: any, index: number) => (
                  <Pressable
                    key={index}
                    className="flex-1  rounded-lg"
                    // style={{ backgroundColor: colors.primary }}
                  >
                    <ThemedText
                      className="text-xs font-medium text-left"
                      style={{ color: colors.text, fontStyle: "italic" }}
                      type="small"
                    >
                      - {action.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            )}

          <ThemedText
            className="text-xs mt-1"
            style={{ color: colors.green }}
            type="small"
          >
            {formatTimestamp(item.timestamp)}
          </ThemedText>
        </View>{" "}
        {!item.isRead && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#3B82F6",
            }}
          />
        )}
      </Pressable>
    </View>
  );
  const tabs = [
    { label: "All", value: "all" as const },
    { label: "Messages", value: "message" as const },
    { label: "Activities", value: "activity" as const },
    { label: "Safeguarding", value: "safeguarding" as const },
  ];

  return (
    <ThemedView style={{ flex: 1 }}>
      <Animated.View
        style={{ flex: 1 }}
        entering={FadeInRight.duration(300)}
        exiting={FadeOutRight.duration(300)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View className="flex-row items-center px-4 py-3 gap-3">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <ThemedText
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
              Notifications
            </ThemedText>
          </View>

          {/* Tab Bar */}
          <View
            className="flex-row px-2"
            style={{
              borderBottomColor: colors.bglight10,
              borderBottomWidth: 1,
            }}
          >
            {tabs.map((tab) => (
              <Pressable
                key={tab.value}
                onPress={() => setActiveTab(tab.value)}
                className="px-4 py-3 mr-2"
                style={{
                  borderBottomWidth: activeTab === tab.value ? 2 : 0,
                  borderBottomColor:
                    activeTab === tab.value ? colors.primary : "transparent",
                }}
              >
                <ThemedText
                  className="text-sm font-medium"
                  style={{
                    color:
                      activeTab === tab.value
                        ? colors.text
                        : colors.textSecondary,
                  }}
                >
                  {tab.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {/* Notifications List */}
          {filteredNotifications.length > 0 ? (
            <FlatList
              data={filteredNotifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Ionicons
                name="notifications-off"
                size={64}
                color={colors.gray700}
              />
              <ThemedText
                className="mt-4 text-center"
                style={{ color: colors.gray700 }}
              >
                No notifications yet
              </ThemedText>
            </View>
          )}
        </SafeAreaView>
      </Animated.View>
    </ThemedView>
  );
}
