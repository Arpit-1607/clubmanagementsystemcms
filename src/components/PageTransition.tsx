import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { slideUp } from '@/lib/motion';

export function PageTransition({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={slideUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}
