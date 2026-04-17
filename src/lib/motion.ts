import { type Variants, type Transition } from 'framer-motion';

// Consistent easing — matches Google Material / Linear
const ease = [0.4, 0, 0.2, 1] as const;
const easeOut = [0, 0, 0.2, 1] as const;

// Spring physics for interactive elements
export const spring = { type: 'spring', stiffness: 400, damping: 30 } as const;
export const gentleSpring = { type: 'spring', stiffness: 260, damping: 25 } as const;

// --- Reusable Variants ---

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: [...easeOut] } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: [...ease] } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [...easeOut] } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.2, ease: [...ease] } },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [...easeOut] } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [...easeOut] } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [...easeOut] } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [...easeOut] } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15, ease: [...ease] } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [...easeOut] } },
};

// --- Interactive presets (use with whileHover / whileTap) ---

export const hoverLift = {
  y: -4,
  transition: { ...gentleSpring },
};

export const hoverGlow = {
  y: -2,
  boxShadow: '0 8px 30px -8px hsl(var(--primary) / 0.15)',
  transition: { ...gentleSpring },
};

export const pressDown = {
  scale: 0.96,
  transition: { ...spring },
};

export const tapScale = {
  scale: 0.98,
  transition: { ...spring },
};

// --- Page transition wrapper props ---
export const pageTransition = {
  initial: 'hidden' as const,
  animate: 'visible' as const,
  exit: 'exit' as const,
  variants: slideUp,
};

// --- Count-up hook helper ---
export function countUpConfig(end: number, duration = 1.2): Transition {
  return { duration, ease: [...easeOut] };
}
