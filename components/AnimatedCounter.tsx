// components/AnimatedCounter.tsx
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TextStyle, StyleProp } from "react-native";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // ms
  style?: StyleProp<TextStyle>;
  className?: string; // NativeWind className, e.g. "text-coral text-3xl font-bold"
}

/**
 * Counts up from 0 to `value` on mount/change instead of snapping straight
 * to the final number. Makes stat cards (streaks, totals) feel alive
 * without pulling in a new animation library.
 */
export function AnimatedCounter({
  value,
  duration = 800,
  style,
  className,
}: AnimatedCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v));
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false, // text content can't use the native driver
    }).start();

    return () => animatedValue.removeListener(listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Text style={style} className={className}>
      {displayValue}
    </Text>
  );
}
