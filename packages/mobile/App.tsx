/**
 * SORACOM Button React Native App
 */
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
} from 'react-native';
import { SoracomButtonService } from './src/services/SoracomButtonService';
import { MainScreen } from './src/screens/MainScreen';

const App: React.FC = () => {
  const [service, setService] = useState<SoracomButtonService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const buttonService = new SoracomButtonService();
      await buttonService.initialize();
      
      setService(buttonService);
      setIsInitialized(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart the application.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!isInitialized || !service) {
    // TODO: Add loading screen component
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <MainScreen service={service} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;