/**
 * Haptic feedback utility — uses the Vibration API where available,
 * degrades gracefully to a no-op on unsupported browsers.
 */

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const haptics = {
  /** Light tap — button presses, toggles */
  light: () => vibrate(10),
  /** Medium tap — completing a step, selections */
  medium: () => vibrate(25),
  /** Success — saving, achievements */
  success: () => vibrate([15, 50, 30]),
  /** Error — validation failures */
  error: () => vibrate([40, 30, 40]),
  /** Celebration — confetti moments */
  celebration: () => vibrate([10, 30, 10, 30, 50]),
};
