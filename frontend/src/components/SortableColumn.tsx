import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

interface SortableColumnProps {
  id: string;
  children: React.ReactNode;
  disableDrag?: boolean;
  className?: string;
}

export const SortableColumn = ({ id, children, disableDrag = false, className }: SortableColumnProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    touchAction: 'none',
  };
  return (
    <div ref={setNodeRef} {...(!disableDrag ? attributes : {})} {...(!disableDrag ? listeners : {})} style={style} className={`flex-shrink-0 ${className || ''}`}>
      {children}
    </div>
  );
}; 