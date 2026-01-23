import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleProp, ViewStyle } from 'react-native';
import { useThemeColor } from '../utils/theme';

interface LoadingSpinnerProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function LoadingSpinner({ size = 64, style }: LoadingSpinnerProps) {
  const primaryColor = useThemeColor('primary');
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: size / 16,
          borderColor: `${primaryColor}20`,
          borderTopColor: primaryColor,
          transform: [{ rotate: spin }],
        }}
      />
    </View>
  );
}
