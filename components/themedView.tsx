import { useThemedColors } from "@/hooks/use-themed-colors";
import React from "react";
import { View, ViewProps } from "react-native";

type ThemedViewProps = {
  children: React.ReactNode;
  className?: string;
} & ViewProps;

export default function ThemedView({
  children,
  className,
  ...rest
}: ThemedViewProps) {
  const colors = useThemedColors();

  return (
    <View
      {...rest}
      className={className}
      style={{ backgroundColor: colors.background }}
    >
      {children}
    </View>
  );
}
