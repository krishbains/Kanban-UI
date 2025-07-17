import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useState, useRef } from 'react'
import { Task } from './Task';
import { useDroppable } from '@dnd-kit/core';
import { useDndContext } from '@dnd-kit/core';
import { EditButton } from './EditButton';

interface Task {
  id: string;
  title: string;
  bg: string;
  isEditing?: boolean;
}

type KanbanBoxProps = {
  tasks: Task[];
  columnId: string;
  bg: string;
  hsva: { h: number; s: number; v: number; a: number };
  onAddTask: (columnId: string) => void;
  onRenameColumn?: (oldId: string, newTitle: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onDeleteTasks?: (columnId: string, taskIds: string[]) => void;
  deleteMode: boolean;
  setDeleteMode: (mode: boolean) => void;
  onChangeColour?: (columnId: string, color: string, hsva?: { h: number; s: number; v: number; a: number }) => void;
  moveMode?: boolean;
  columnTitle: string;
  autoFocusTitle?: boolean;
  onRenameTask?: (columnId: string, taskId: string, newTitle: string) => void;
  onSetTaskEditing?: (columnId: string, taskId: string, editing: boolean) => void;
  colorMode?: boolean;
  onColorModeClick?: (target: { type: 'task'|'column', columnId: string, taskId?: string }, anchor: HTMLElement) => void;
};

export const KanbanBox = ({tasks, columnId, bg, hsva, onAddTask, onRenameColumn, onDeleteColumn, onDeleteTasks, deleteMode, setDeleteMode, onChangeColour, moveMode, columnTitle, autoFocusTitle, onRenameTask, onSetTaskEditing, colorMode = false, onColorModeClick}: KanbanBoxProps) => {

  const { setNodeRef, isOver } = useDroppable({
    id: columnId, // This ID must be unique and match what you'll check in handleDragEnd
  });
  const { active, over } = useDndContext();
  const [isEditing, setIsEditing] = useState(!!autoFocusTitle);
  const [title, setTitle] = useState(columnTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  const showGlow = isEditing;
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const titleRef = useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  React.useEffect(() => {
    setTitle(columnTitle);
  }, [columnTitle]);

  React.useEffect(() => {
    if (autoFocusTitle) setIsEditing(true);
  }, [autoFocusTitle]);

  const handleTitleClick = () => {
    if (colorMode && onColorModeClick && titleRef.current) {
      onColorModeClick({ type: 'column', columnId }, titleRef.current);
      return;
    }
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (title !== columnTitle && onRenameColumn) {
      onRenameColumn(columnId, title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const handleTaskClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (!deleteMode) return;
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleDeleteButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deleteMode) {
      setDeleteMode(true);
      setSelectedTasks([]);
      return;
    }
    if (selectedTasks.length > 0) {
      if (onDeleteTasks) onDeleteTasks(columnId, selectedTasks);
      setSelectedTasks([]);
      setDeleteMode(false);
    } else {
      setDeleteMode(false);
    }
  };

  return (
    <div className='flex justify-center'>
      <div
        ref={setNodeRef}
        className={`min-w-[272px] min-h-[578px] flex flex-col rounded-md transition-all p-4 shadow-lg ${isOver ? 'bg-slate-700' : ''} ${bg.startsWith('#') ? '' : bg}`}
        style={bg.startsWith('#') ? { backgroundColor: bg } : undefined}
        onClick={colorMode && onColorModeClick ? (e) => {
          if (e.target instanceof HTMLElement && titleRef.current && !e.target.closest('[data-task-box]')) {
            onColorModeClick({ type: 'column', columnId }, titleRef.current);
          }
        } : undefined}
      >
        <h2 className="relative flex justify-center items-center mb-6">
          {isEditing && !colorMode ? (
            <input
              ref={inputRef}
              className="inline-block px-4 py-1 mr-4 max-w-[calc(100%-3rem)] rounded-full bg-gray-800 text-white font-semibold shadow text-base outline-none border border-gray-500 truncate text-center"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              maxLength={32}
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
              style={{ zIndex: 1 }}
              disabled={moveMode}
            />
          ) : (
            <span
              ref={titleRef}
              className="inline-block px-4 py-1 mr-4 max-w-[calc(100%-3rem)] rounded-full bg-gray-800 text-white font-semibold shadow text-base cursor-pointer truncate text-center"
              onClick={e => { if (!moveMode) { e.stopPropagation(); handleTitleClick(); } }}
              onPointerDown={e => e.stopPropagation()}
              title="Click to edit column title"
              style={{ zIndex: 1 }}
            >
              {title.trim() === "" ? (
                <span className="text-gray-400">Untitled</span>
              ) : (
                title
              )}
            </span>
          )}
          <div className="absolute top-0 right-0" style={{ zIndex: 2 }}>
            <div className={deleteMode || moveMode ? 'opacity-50 cursor-not-allowed' : ''}>
              <EditButton 
                onAddTask={() => onAddTask(columnId)} 
                onDeleteColumn={onDeleteColumn ? () => onDeleteColumn(columnId) : undefined}
                onColourSelected={(color: string, hsvaValue?: { h: number; s: number; v: number; a: number }) => {
                  if (onChangeColour) onChangeColour(columnId, color, hsvaValue);
                }}
                hsva={hsva}
                moveMode={moveMode}
                disabled={deleteMode}
              />
            </div>
          </div>
        </h2>
        <div className={`bg-gray-400 -mx-1 mb-5 h-px transition-shadow ${showGlow ? 'bg-white shadow-[0_0_12px_2px_rgba(255,255,255,0.55)]' : ''}`} />
        <SortableContext
          items={(tasks || []).map(task => `${columnId}-${task.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col space-y-4">
            {(() => {
              // If dragging, show skeleton at the right spot
              if (active && over) {
                const overId = over.id as string;
                // Only show skeleton in this column if overId belongs to this column
                const [overCol] = overId.split('-');
                if (overCol === columnId) {
                  const overIndex = (tasks || []).findIndex(task => `${columnId}-${task.id}` === overId);
                  let insertAt = overIndex === -1 ? (tasks || []).length : overIndex;
                  // Precise drop-at-end logic for skeleton
                  if (overIndex !== -1 && (tasks || []).length > 0) {
                    const lastTask = (tasks || [])[(tasks || []).length - 1];
                    const lastTaskId = `${columnId}-${lastTask.id}`;
                    // Use window.event to get pointer position
                    let pointerY = 0;
                    let pointerAvailable = false;
                    if (overId === lastTaskId && over.rect && typeof window !== 'undefined' && window.event) {
                      const evt = window.event;
                      if ('clientY' in evt && typeof evt.clientY === 'number') {
                        pointerY = evt.clientY;
                        pointerAvailable = true;
                      } else if ('touches' in evt && Array.isArray(evt.touches) && evt.touches.length > 0) {
                        pointerY = evt.touches[0].clientY;
                        pointerAvailable = true;
                      }
                      if (pointerAvailable) {
                        const lastRect = over.rect;
                        const lastMidY = lastRect.top + lastRect.height / 2;
                        if (pointerY > lastMidY) {
                          // Show skeleton at end
                          insertAt = (tasks || []).length;
                        }
                      }
                    }
                  }
                  const items = [...(tasks || [])];
                  items.splice(insertAt, 0, { id: '__skeleton__', title: '', bg: '', isEditing: false });
                  return items.map((task) =>
                    task.id === '__skeleton__' ? (
                      <Task key="__skeleton__" id="__skeleton__" title="" bg="" isPlaceholder isEditing={false} moveMode={moveMode}/>
                    ) : (
                      <Task 
                        key={`${columnId}-${task.id}`} 
                        id={`${columnId}-${task.id}`} 
                        title={task.title} 
                        bg={task.bg} 
                        isEditing={task.isEditing}
                        selected={deleteMode && selectedTasks.includes(task.id)}
                        onClick={deleteMode ? (e: React.MouseEvent) => handleTaskClick(e, task.id) : undefined}
                        disableDrag={!moveMode || deleteMode}
                        onRenameTask={onRenameTask}
                        onSetTaskEditing={onSetTaskEditing}
                        columnId={columnId}
                        taskId={task.id}
                        colorMode={colorMode}
                        data-task-box
                        moveMode={moveMode}
                      />
                    )
                  );
                }
              }
              // Default: just render tasks
              return (tasks || []).map(task => {
                const scopedId = `${columnId}-${task.id}`;
                if (active && active.id === scopedId) {
                  // Hide the original while dragging
                  return null;
                }
                const taskRef = React.createRef<HTMLDivElement>();
                return (
                  <Task 
                    key={scopedId} 
                    id={scopedId} 
                    title={task.title} 
                    bg={task.bg} 
                    isEditing={task.isEditing && !colorMode}
                    selected={deleteMode && selectedTasks.includes(task.id)}
                    onClick={colorMode && onColorModeClick ? (e) => {
                      e.stopPropagation();
                      if (taskRef.current) onColorModeClick({ type: 'task', columnId, taskId: task.id }, taskRef.current);
                    } : (deleteMode ? (e: React.MouseEvent) => handleTaskClick(e, task.id) : undefined)}
                    data-task-box
                    disableDrag={!moveMode || deleteMode}
                    onRenameTask={onRenameTask}
                    onSetTaskEditing={onSetTaskEditing}
                    columnId={columnId}
                    taskId={task.id}
                    colorMode={colorMode}
                    ref={taskRef}
                    moveMode={moveMode}
                  />
                );
              });
            })()}
          </div>
        </SortableContext>
        <div onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()} className='flex justify-center items-center mt-5'>
        <button 
          onClick={() => onAddTask(columnId)} 
          className={`hover:shadow-[0_0_12px_4px_rgba(30,144,255,0.7)] bg-green-500 border-1 border-gray-900 rounded-full shadow-[0_0_6px_1px_rgba(255,255,255,0.15)] min-w-[35px] min-h-[35px] p-1 mr-2 ${moveMode || deleteMode ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={moveMode || deleteMode}
        >
          ➕
        </button>
        <button 
          onClick={handleDeleteButtonClick}
          className={`hover:shadow-[0_0_12px_4px_rgba(30,144,255,0.7)] border-1 border-gray-900 rounded-full shadow-[0_0_6px_1px_rgba(255,255,255,0.15)] min-w-[35px] min-h-[35px] p-1 ${deleteMode ? 'bg-red-700 text-white' : 'bg-red-500 text-white'}`}
          disabled={moveMode}
        >
          {deleteMode && selectedTasks.length > 0 ? '🗑️' : '✖️'}
        </button>
        </div>
      </div>
    </div>
  )
}
