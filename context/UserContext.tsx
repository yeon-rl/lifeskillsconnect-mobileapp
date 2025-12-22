import React, { createContext, ReactNode, useContext, useState } from "react";

interface UserContextType {
  isPremium: boolean;
  isLoading: boolean;
  setIsPremium: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const handleSetIsPremium = (value: boolean) => {
    setIsPremium(value);
    // TODO: Persist to storage when you integrate your backend/database
  };

  return (
    <UserContext.Provider
      value={{
        isPremium,
        isLoading: false,
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
