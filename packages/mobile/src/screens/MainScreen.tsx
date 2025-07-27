/**
 * SORACOM Button メイン画面
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {
  BatteryLevel,
  TransmissionStatus,
  LedStatus,
  ClickType
} from '@soracom-button/core';
import { SoracomButtonService } from '../services/SoracomButtonService';
import { BatterySelector } from '../components/BatterySelector';
import { StatusDisplay } from '../components/StatusDisplay';
import { LedIndicator } from '../components/LedIndicator';

const { width, height } = Dimensions.get('window');

interface MainScreenProps {
  service: SoracomButtonService;
}

export const MainScreen: React.FC<MainScreenProps> = ({ service }) => {
  const [batteryLevel, setBatteryLevel] = useState<BatteryLevel>(BatteryLevel.FULL);
  const [transmissionStatus, setTransmissionStatus] = useState<TransmissionStatus>(TransmissionStatus.IDLE);
  const [ledStatus, setLedStatus] = useState<LedStatus>(LedStatus.OFF);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    // ボタン管理からのイベントリスナーを設定
    const buttonManager = service.getButtonManager();
    
    const unsubscribeStatus = buttonManager.onStatusChange((status) => {
      setTransmissionStatus(status);
      updateStatusMessage(status);
    });

    const unsubscribeLed = buttonManager.onLedChange((status) => {
      setLedStatus(status);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeLed();
    };
  }, [service]);

  const updateStatusMessage = useCallback((status: TransmissionStatus) => {
    const i18n = service.getI18nManager();
    switch (status) {
      case TransmissionStatus.SENDING:
        setStatusMessage(i18n.t('sending'));
        break;
      case TransmissionStatus.SUCCESS:
        setStatusMessage(i18n.t('succeeded'));
        break;
      case TransmissionStatus.FAILED:
        setStatusMessage(i18n.t('failed'));
        break;
      default:
        setStatusMessage('');
    }
  }, [service]);

  const handlePressIn = useCallback(() => {
    service.onPressStart();
  }, [service]);

  const handlePressOut = useCallback(() => {
    service.onPressEnd(batteryLevel);
  }, [service, batteryLevel]);

  const getButtonStyle = () => {
    const baseStyle = styles.button;
    switch (transmissionStatus) {
      case TransmissionStatus.SENDING:
        return [baseStyle, styles.buttonSending];
      case TransmissionStatus.SUCCESS:
        return [baseStyle, styles.buttonSuccess];
      case TransmissionStatus.FAILED:
        return [baseStyle, styles.buttonFailed];
      default:
        return baseStyle;
    }
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>SORACOM Button</Text>
      </View>

      {/* メインボタンエリア */}
      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={getButtonStyle()}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          disabled={transmissionStatus === TransmissionStatus.SENDING}
        >
          <Text style={styles.buttonText}>TAP</Text>
        </TouchableOpacity>

        {/* LED インジケーター */}
        <LedIndicator status={ledStatus} />
      </View>

      {/* バッテリーレベル選択 */}
      <BatterySelector
        value={batteryLevel}
        onChange={setBatteryLevel}
        service={service}
      />

      {/* ステータス表示 */}
      <StatusDisplay
        status={transmissionStatus}
        message={statusMessage}
        service={service}
      />

      {/* フッター */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Single tap, double tap, or long press (1s+)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  button: {
    width: Math.min(width * 0.6, 200),
    height: Math.min(width * 0.6, 200),
    borderRadius: Math.min(width * 0.3, 100),
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  buttonSending: {
    backgroundColor: '#FF9500',
  },
  buttonSuccess: {
    backgroundColor: '#34C759',
  },
  buttonFailed: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});