/**
 * LED インジケーターコンポーネント
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LedStatus } from '@soracom-button/core';

interface LedIndicatorProps {
  status: LedStatus;
}

export const LedIndicator: React.FC<LedIndicatorProps> = ({ status }) => {
  const animatedValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === LedStatus.SENDING) {
      // 点滅アニメーション
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();
      
      return () => {
        blinkAnimation.stop();
      };
    } else {
      // 点滅を停止して通常の透明度に戻す
      animatedValue.setValue(1);
    }
  }, [status, animatedValue]);

  const getLedColor = () => {
    switch (status) {
      case LedStatus.SENDING:
        return '#FF9500'; // オレンジ
      case LedStatus.SUCCESS:
        return '#FF3B30'; // 赤
      case LedStatus.FAILED:
        return '#34C759'; // 緑
      default:
        return '#E5E5EA'; // グレー（オフ）
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.led,
          {
            backgroundColor: getLedColor(),
            opacity: status === LedStatus.OFF ? 0.3 : animatedValue,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -30,
    right: -30,
  },
  led: {
    width: 20,
    height: 20,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});