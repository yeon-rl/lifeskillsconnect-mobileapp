import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface UserContextType {
  isPremium: boolean;
  isLoading: boolean;
  setIsPremium: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const savedPremium = await AsyncStorage.getItem("isPremium");
        if (savedPremium !== null) {
          setIsPremium(savedPremium === "true");
        }
      } catch (error) {
        console.error("Failed to load user status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const handleSetIsPremium = async (value: boolean) => {
    try {
      setIsPremium(value);
      await AsyncStorage.setItem("isPremium", String(value));
    } catch (error) {
      console.error("Failed to save premium status:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        isPremium,
        isLoading,
        setIsPremium: handleSetIsPremium,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
