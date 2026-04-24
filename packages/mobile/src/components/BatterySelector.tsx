/**
 * バッテリーレベル選択コンポーネント
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BatteryLevel, BATTERY_LEVEL_LABELS } from '@soracom-button/core';
import { SoracomButtonService } from '../services/SoracomButtonService';

interface BatterySelectorProps {
  value: BatteryLevel;
  onChange: (value: BatteryLevel) => void;
  service: SoracomButtonService;
}

export const BatterySelector: React.FC<BatterySelectorProps> = ({
  value,
  onChange,
  service
}) => {
  const i18n = service.getI18nManager();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {i18n.t('battery level label')}
      </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          style={styles.picker}
        >
          {BATTERY_LEVEL_LABELS.map((label, index) => (
            <Picker.Item
              key={index}
              label={label}
              value={index as BatteryLevel}
            />
          ))}
        </Picker>
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  picker: {
    height: 50,
  },
});