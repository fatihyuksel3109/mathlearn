'use client';

import { motion } from 'framer-motion';

interface CuteAvatarProps {
  avatar: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const avatarEmojis: Record<string, string> = {
  fox: '🦊',
  panda: '🐼',
  cat: '🐱',
  dog: '🐶',
  bunny: '🐰',
  bear: '🐻',
};

const sizeClasses = {
  sm: 'text-3xl',
  md: 'text-5xl',
  lg: 'text-7xl',
};

export default function CuteAvatar({ avatar, size = 'md', className = '' }: CuteAvatarProps) {
  const emoji = avatarEmojis[avatar] || avatarEmojis.fox;

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
      transition={{ duration: 0.3 }}
      className={`${sizeClasses[size]} ${className}`}
    >
      {emoji}
    </motion.div>
  );
}

