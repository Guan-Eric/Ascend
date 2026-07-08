// components/FadeSlideIn.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";

interface FadeSlideInProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number; // ms before this element starts animating — use to stagger a list
  duration?: number; // ms
  distance?: number; // px it slides up from
}

/**
 * Wrap any card/row in this to give it a soft fade + slide-up entrance
 * instead of popping in instantly. Cheap: one Animated.Value, native driver,
 * runs once on mount.
 *
 * Usage for a staggered list:
 *   {items.map((item, i) => (
 *     <FadeSlideIn key={item.id} delay={i * 60}>
 *       <Card ... />
 *     </FadeSlideIn>
 *   ))}
 */
export function FadeSlideIn({
  children,
  style,
  delay = 0,
  duration = 350,
  distance = 16,
}: FadeSlideInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[style, { opacity, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}
