import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { CSSProperties } from 'react'

interface TaskProps {
    id: string;
    title: string;
    bg: string;
    isPlaceholder?: boolean;
    selected?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    disableDrag?: boolean;
    disableActions?: boolean;
}
export const Task = ({id, title, bg, isPlaceholder = false, selected = false, onClick, disableDrag = false, disableActions = false} : TaskProps) => {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id})

    const sortableStyle: CSSProperties = {transition, transform: CSS.Transform.toString(transform), touchAction: 'none'}
    const disabledStyle: CSSProperties = disableActions ? { pointerEvents: 'none' as CSSProperties['pointerEvents'], opacity: 0.6 } : {}
    const style: CSSProperties = { ...sortableStyle, ...disabledStyle }
    if (isPlaceholder) {
      return (
        <div
          className={`border-2 border-dashed ${bg} min-w-[230px] min-h-[50px] rounded-md flex items-center justify-center animate-pulse opacity-70`}
          style={sortableStyle}
        >
          {/* Empty skeleton */}
        </div>
      );
    }
    return (
      <div 
        ref={setNodeRef} 
        {...(!disableDrag ? attributes : {})}
        {...(!disableDrag ? listeners : {})}
        style={style}
        className={`text-white border-1 border-gray-900 ${bg} min-w-[230px] min-h-[50px] rounded-md flex items-center justify-center shadow-lg ${selected ? 'border-4 border-blue-500' : ''}`}
        key={id}
        onClick={disableActions ? undefined : onClick}
      >
          {title}
      </div>
    )
}
