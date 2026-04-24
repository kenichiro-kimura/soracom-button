/**
 * ステータス表示コンポーネント
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TransmissionStatus } from '@soracom-button/core';
import { SoracomButtonService } from '../services/SoracomButtonService';

interface StatusDisplayProps {
  status: TransmissionStatus;
  message: string;
  service: SoracomButtonService;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  status,
  message,
  service
}) => {
  const i18n = service.getI18nManager();

  const getStatusColor = () => {
    switch (status) {
      case TransmissionStatus.SENDING:
        return '#FF9500';
      case TransmissionStatus.SUCCESS:
        return '#34C759';
      case TransmissionStatus.FAILED:
        return '#FF3B30';
      default:
        return '#333';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {i18n.t('status label')}
      </Text>
      <View style={[styles.statusContainer, { borderLeftColor: getStatusColor() }]}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {message || i18n.t('ready')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
});