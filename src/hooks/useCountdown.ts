"use client";

import { useState, useEffect, useCallback } from "react";

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  /** Total milliseconds remaining */
  totalMs: number;
}

/**
 * Real-time countdown hook.
 * Updates every second until the target date.
 */
export function useCountdown(targetDate: string | Date): CountdownValues {
  const getTimeLeft = useCallback((): CountdownValues => {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalMs: 0,
      };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      isExpired: false,
      totalMs: diff,
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<CountdownValues>(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [getTimeLeft]);

  return timeLeft;
}
