import { StyleSheet, View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import { useAppStore } from './src/store/useAppStore';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { queryClient } from './src/api/queryClient';

function App() {
  const hydrate = useAppStore(s => s.hydrate);
  const isHydrated = useAppStore(s => s.isHydrated);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color="#FF6B35" size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', backgroundColor: '#0D0D0D' },
});

export default App;
