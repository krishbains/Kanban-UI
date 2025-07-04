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
}

type KanbanBoxProps = {
  tasks: Task[];
  columnId: string;
  bg: string;
  hsva: { h: number; s: number; v: number; a: number };
  onAddTask: (columnId: string) => void;
  onRenameColumn?: (oldId: string, newId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onDeleteTasks?: (columnId: string, taskIds: string[]) => void;
  deleteMode: boolean;
  setDeleteMode: (mode: boolean) => void;
  onChangeColour?: (columnId: string, color: string, hsva?: { h: number; s: number; v: number; a: number }) => void;
  moveMode?: boolean;
};

export const KanbanBox = ({tasks, columnId, bg, hsva, onAddTask, onRenameColumn, onDeleteColumn, onDeleteTasks, deleteMode, setDeleteMode, onChangeColour, moveMode}: KanbanBoxProps) => {

  const { setNodeRef, isOver } = useDroppable({
    id: columnId, // This ID must be unique and match what you'll check in handleDragEnd
  });
  const { active, over } = useDndContext();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(columnId);
  const inputRef = useRef<HTMLInputElement>(null);
  const showGlow = isEditing;
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (title !== columnId && onRenameColumn) {
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
      >
        <h2 className="relative flex justify-center items-center mb-6">
          {isEditing ? (
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
          items={tasks.map(task => `${columnId}-${task.id}`)}
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
                  const overIndex = tasks.findIndex(task => `${columnId}-${task.id}` === overId);
                  // If not found, append at end
                  const insertAt = overIndex === -1 ? tasks.length : overIndex;
                  const items = [...tasks];
                  items.splice(insertAt, 0, { id: '__skeleton__', title: '', bg: '' });
                  return items.map((task) =>
                    task.id === '__skeleton__' ? (
                      <Task key="__skeleton__" id="__skeleton__" title="" bg="" isPlaceholder/>
                    ) : (
                      <Task 
                        key={`${columnId}-${task.id}`} 
                        id={`${columnId}-${task.id}`} 
                        title={task.title} 
                        bg={task.bg} 
                        selected={deleteMode && selectedTasks.includes(task.id)}
                        onClick={deleteMode ? (e: React.MouseEvent) => handleTaskClick(e, task.id) : undefined}
                        disableDrag={deleteMode}
                      />
                    )
                  );
                }
              }
              // Default: just render tasks
              return tasks.map(task => {
                const scopedId = `${columnId}-${task.id}`;
                if (active && active.id === scopedId) {
                  // Hide the original while dragging
                  return null;
                }
                return (
                  <Task 
                    key={scopedId} 
                    id={scopedId} 
                    title={task.title} 
                    bg={task.bg} 
                    selected={deleteMode && selectedTasks.includes(task.id)}
                    onClick={deleteMode ? (e: React.MouseEvent) => handleTaskClick(e, task.id) : undefined}
                    disableDrag={deleteMode}
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
