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
    isEditing?: boolean;
    onRenameTask?: (columnId: string, taskId: string, newTitle: string) => void;
    onSetTaskEditing?: (columnId: string, taskId: string, editing: boolean) => void;
    columnId?: string;
    taskId?: string;
    colorMode?: boolean;
    ref?: React.Ref<HTMLDivElement>;
}
export const Task = React.forwardRef<HTMLDivElement, TaskProps>(({id, title, bg, isPlaceholder = false, selected = false, onClick, disableDrag = false, disableActions = false, isEditing = false, onRenameTask, onSetTaskEditing, columnId, taskId, colorMode = false}, ref) => {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id})

    const sortableStyle: CSSProperties = {transition, transform: CSS.Transform.toString(transform), touchAction: 'none'}
    const disabledStyle: CSSProperties = disableActions ? { pointerEvents: 'none' as CSSProperties['pointerEvents'], opacity: 0.6 } : {}
    const style: CSSProperties = { ...sortableStyle, ...disabledStyle }
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    React.useEffect(() => {
      if (isEditing && textareaRef.current && !colorMode) {
        textareaRef.current.focus();
        textareaRef.current.select();
        // Auto-resize textarea
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, [isEditing, colorMode]);
    const [editValue, setEditValue] = React.useState(title);
    React.useEffect(() => {
      setEditValue(title);
    }, [title]);

    // Auto-resize textarea when content changes
    React.useEffect(() => {
      if (textareaRef.current && isEditing) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, [editValue, isEditing]);

    const handleBlur = () => {
      if (colorMode) return;
      if (onRenameTask && columnId && taskId) {
        onRenameTask(columnId, taskId, editValue.trim());
      }
      if (onSetTaskEditing && columnId && taskId) {
        onSetTaskEditing(columnId, taskId, false);
      }
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        textareaRef.current?.blur();
      }
    };
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditValue(e.target.value);
    };

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
    if (isEditing && !colorMode) {
      return (
        <textarea
          ref={textareaRef}
          className="inline-block px-2 py-1 w-full rounded bg-gray-800 text-white font-semibold shadow text-base outline-none border border-gray-500 resize-none overflow-hidden min-w-[230px] min-h-[50px] leading-relaxed"
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={1000}
          rows={1}
          style={style}
        />
      );
    }
    return (
      <div 
        ref={ref ? (node) => { setNodeRef(node); if (typeof ref === 'function') ref(node); else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node; } : setNodeRef}
        {...(!disableDrag ? attributes : {})}
        {...(!disableDrag ? listeners : {})}
        style={bg.startsWith('#') ? { ...style, backgroundColor: bg } : style}
        className={`text-white border-1 border-gray-900 ${bg.startsWith('#') ? '' : bg} min-w-[230px] min-h-[50px] rounded-md flex items-center justify-center shadow-lg ${selected ? 'border-4 border-blue-500' : ''} p-2`}
        key={id}
        onClick={disableActions ? undefined : (e => {
          if (!colorMode && onSetTaskEditing && columnId && taskId) {
            onSetTaskEditing(columnId, taskId, true);
          }
          if (onClick) onClick(e);
        })}
      >
          {title.trim() === '' ? (
            <span className="text-gray-400">Untitled</span>
          ) : (
            <div className="whitespace-pre-wrap text-center break-words w-full">
              {title}
            </div>
          )}
      </div>
    )
})

Task.displayName = 'Task';
