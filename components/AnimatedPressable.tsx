import React, { useRef } from 'react';
import { Pressable, PressableProps, Animated, StyleProp, ViewStyle } from 'react-native';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  scaleTo?: number; // Scale value when pressed (default: 0.95)
  duration?: number; // Animation duration in ms (default: 150)
}

export function AnimatedPressable({
  children,
  style,
  scaleTo = 0.95,
  duration = 150,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    Animated.spring(scaleAnim, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
    onPressOut?.(event);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        {...props}
        style={style}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
