'use client';

import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';

interface FractionBlockProps {
  id: string;
  filled: boolean;
  total: number;
}

export default function FractionBlock({ id, filled, total }: FractionBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      animate={isDragging ? { scale: 1.1, zIndex: 50 } : { scale: 1, zIndex: 1 }}
      className={`w-16 h-16 rounded-xl border-4 ${
        filled
          ? 'bg-cute-accent border-cute-primary'
          : 'bg-gray-200 border-gray-400'
      } cursor-grab active:cursor-grabbing cute-shadow`}
    >
      {filled && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-full h-full flex items-center justify-center text-2xl"
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
}

