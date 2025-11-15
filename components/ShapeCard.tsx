'use client';

import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';

interface ShapeCardProps {
  id: string;
  name: string;
  emoji: string;
}

export default function ShapeCard({ id, name, emoji }: ShapeCardProps) {
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
      animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
      className="bg-white cute-border border-4 border-cute-primary rounded-2xl p-6 cursor-grab active:cursor-grabbing cute-shadow hover:bg-pastel-pink"
    >
      <div className="text-5xl mb-2">{emoji}</div>
      <div className="text-lg font-bold text-cute-primary">{name}</div>
    </motion.div>
  );
}

