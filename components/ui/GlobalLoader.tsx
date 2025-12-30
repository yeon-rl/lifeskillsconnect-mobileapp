import { useUiStore } from '@/store/uiStore';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

export const GlobalLoader = () => {
  const isLoading = useUiStore((state) => state.isLoading);

  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={isLoading}
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loaderWrapper: {
    padding: 20,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
