"use client"

import { KanbanBox } from "@/components/KanbanBox";
import { closestCorners, DndContext, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useEffect, useRef, useCallback } from "react";
import { Task } from "@/components/Task";
import { SortableContext } from "@dnd-kit/sortable";
import { SortableColumn } from "@/components/SortableColumn";
import { FloatingMenu } from "@/components/FloatingMenu";
import ColourWheel from "@/components/ColourWheel";

// import Image from "next/image";

type Task = {
  id: string;
  title: string;
  bg: string;
  isEditing?: boolean;
};

export type Column = {
  id: string;
  title: string;
  bg: string;
  hsva: { h: number; s: number; v: number; a: number };
  tasks: Task[];
};

const defaultHSVA = {
  'bg-slate-600': { h: 30, s: 60, v: 80, a: 1 },
  'bg-slate-700': { h: 120, s: 60, v: 80, a: 1 },
  'bg-slate-900': { h: 270, s: 60, v: 80, a: 1 },
  'bg-slate-800': { h: 0, s: 0, v: 50, a: 1 },
  'bg-blue-900': { h: 210, s: 100, v: 56, a: 1 },
};

const defaultColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    bg: 'bg-slate-600',
    hsva: defaultHSVA['bg-slate-600'],
    tasks: [
      { id: '1', title: 'Buy milk', bg: 'bg-blue-800' },
      { id: '2', title: 'Finish project', bg: 'bg-green-800' },
      { id: '3', title: 'Call mom', bg: 'bg-red-800' },
    ],
  },
  {
    id: 'inProgress',
    title: 'In Progress',
    bg: 'bg-slate-700',
    hsva: defaultHSVA['bg-slate-700'],
    tasks: [
      { id: '4', title: 'Write report', bg: 'bg-yellow-700' },
      { id: '5', title: 'Fix bug', bg: 'bg-pink-700' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    bg: 'bg-slate-900',
    hsva: defaultHSVA['bg-slate-900'],
    tasks: [],
  },
  {
    id: 'trashed',
    title: 'Trashed',
    bg: 'bg-slate-800',
    hsva: defaultHSVA['bg-slate-800'],
    tasks: [],
  },
];

// Add columns prop to Board
interface BoardProps {
  columns?: Column[];
  onSchemaChange?: (schema: Column[]) => void;
  isMobile?: boolean;
}

const Board = ({ columns: columnsProp, onSchemaChange, isMobile = false }: BoardProps) => {
  const [activeTask, setActiveTask] = useState<{ id: string; title: string; bg: string } | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>(columnsProp || defaultColumns);
  // Track delete mode per column
  const [deleteModes, setDeleteModes] = useState<Record<string, boolean>>({});
  // Move mode state
  const [moveMode, setMoveMode] = useState(false);
  const [newColumnId, setNewColumnId] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState(false);
  // Track which ColourWheel is open: { type: 'task'|'column', columnId, taskId? }
  const [colourWheelTarget, setColourWheelTarget] = useState<null | { type: 'task'|'column', columnId: string, taskId?: string, anchorRect: DOMRect }>(null);
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [zoomCenter, setZoomCenter] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const boardContentRef = useRef<HTMLDivElement>(null);
  const lastNotifiedSchema = useRef<string>('');
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
  );

  // Zoom constants
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.1;

  // Calculate zoom center based on mouse position
  const calculateZoomCenter = useCallback((event: MouseEvent | WheelEvent) => {
    if (!boardContentRef.current) return { x: 0, y: 0 };
    
    const rect = boardContentRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    return { x, y };
  }, []);

  // Zoom handlers with mouse center
  const zoomIn = useCallback((center?: { x: number; y: number }) => {
    setZoom(prev => {
      const newZoom = Math.min(prev + ZOOM_STEP, MAX_ZOOM);
      setZoomLevel(Math.round(newZoom * 100));
      if (center) {
        setZoomCenter(center);
      }
      return newZoom;
    });
  }, []);

  const zoomOut = useCallback((center?: { x: number; y: number }) => {
    setZoom(prev => {
      const newZoom = Math.max(prev - ZOOM_STEP, MIN_ZOOM);
      setZoomLevel(Math.round(newZoom * 100));
      if (center) {
        setZoomCenter(center);
      }
      return newZoom;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setZoomLevel(100);
    setZoomCenter({ x: 0, y: 0 });
  }, []);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if target is not an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        // For keyboard shortcuts, zoom to center of viewport
        const center = { x: 50, y: 50 };
        zoomIn(center);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        const center = { x: 50, y: 50 };
        zoomOut(center);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check if target is not an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Only zoom if Ctrl/Cmd is pressed
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const center = calculateZoomCenter(e);
        if (e.deltaY < 0) {
          // Zoom in - check if we're not at max zoom
          if (zoom < MAX_ZOOM) {
            zoomIn(center);
          }
        } else {
          // Zoom out - check if we're not at min zoom
          if (zoom > MIN_ZOOM) {
            zoomOut(center);
          }
        }
      }
    };

    const boardElement = boardRef.current;
    if (boardElement) {
      boardElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => boardElement.removeEventListener('wheel', handleWheel);
    }
  }, [zoomIn, zoomOut, calculateZoomCenter, zoom]);

  useEffect(() => {
    if (newColumnId) {
      const timeout = setTimeout(() => setNewColumnId(null), 0);
      return () => clearTimeout(timeout);
    }
  }, [newColumnId]);



  // Add this useEffect to sync columns state with columnsProp
  useEffect(() => {
    if (columnsProp) {
      setColumns(columnsProp);
    } else {
      setColumns(defaultColumns);
    }
  }, [columnsProp]);

  // Notify parent component when schema changes
  useEffect(() => {
    if (onSchemaChange && columns && columns.length > 0) {
      const schemaString = JSON.stringify(columns);
      if (schemaString !== lastNotifiedSchema.current) {
        lastNotifiedSchema.current = schemaString;
        onSchemaChange(columns);
      }
    }
  }, [columns, onSchemaChange]);

  // Helper: get column by id
  const getColumn = (id: string) => columns.find(col => col.id === id);
  // Helper: get column index by id
  const getColumnIndex = (id: string) => columns.findIndex(col => col.id === id);

  // Parse id for DnD (columnId-taskId)
  const parseId = (scopedId: string) => {
    const [columnId, ...rest] = scopedId.split('-');
    const taskId = rest.join('-');
    return { columnId, taskId };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { columnId, taskId } = parseId(event.active.id as string);
    const col = getColumn(columnId);
    const task = col?.tasks.find((task: Task) => task.id === taskId);
    if (task) setActiveTask({ id: event.active.id as string, title: task.title, bg: task.bg });
    if (typeof event.active.id === 'string' && !event.active.id.includes('-')) {
      setActiveColumnId(event.active.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // COLUMN DRAG-AND-DROP
    if (
      typeof active.id === 'string' &&
      typeof over.id === 'string' &&
      !active.id.includes('-') &&
      !over.id.includes('-')
    ) {
      const oldIndex = columns.findIndex(col => col.id === active.id);
      const newIndex = columns.findIndex(col => col.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setColumns(arrayMove(columns, oldIndex, newIndex));
        // console.log('Document Schema (Column Reorder):', JSON.stringify(columns, null, 2));
      }
      return; // Don't run the rest of the handler for column drags
    }

    const { columnId: fromColumnId, taskId: activeId } = parseId(active.id as string);
    const { columnId: toColumnId, taskId: overId } = parseId(over.id as string);
    if (!fromColumnId || !toColumnId) return;
    const fromColIdx = getColumnIndex(fromColumnId);
    const toColIdx = getColumnIndex(toColumnId);
    if (fromColIdx === -1 || toColIdx === -1) return;
    const fromCol = columns[fromColIdx];
    const toCol = columns[toColIdx];
    const activeTaskIndex = fromCol.tasks.findIndex((task: Task) => task.id === activeId);
    if (activeTaskIndex === -1) return;
    const movingTask = fromCol.tasks[activeTaskIndex];
    if (fromColumnId === toColumnId) {
      const overIndex = toCol.tasks.findIndex((task: Task) => task.id === overId);
      if (overIndex === -1) return;
      const updatedTasks = arrayMove(toCol.tasks, activeTaskIndex, overIndex);
      setColumns(prev => {
        const newColumns = prev.map((col, idx) =>
          idx === fromColIdx ? { ...col, tasks: updatedTasks } : col
        );
        // console.log('Document Schema (Task Reorder):', JSON.stringify(newColumns, null, 2));
        return newColumns;
      });
    } else {
      const overIndex = toCol.tasks.findIndex((task: Task) => task.id === overId);
      setColumns(prev => {
        const newFrom = [...fromCol.tasks];
        newFrom.splice(activeTaskIndex, 1);
        const newTo = [...toCol.tasks];
        let insertAt = overIndex;
        if (overIndex !== -1 && newTo.length > 0) {
          const lastTask = newTo[newTo.length - 1];
          const lastTaskId = lastTask.id;
          if (overId === lastTaskId && over.rect && event.activatorEvent) {
            let pointerY = 0;
            const activatorEvent = event.activatorEvent;
            if (
              typeof window !== 'undefined' &&
              'MouseEvent' in window &&
              activatorEvent instanceof window.MouseEvent
            ) {
              pointerY = activatorEvent.clientY;
            } else if (
              typeof window !== 'undefined' &&
              'TouchEvent' in window &&
              activatorEvent instanceof window.TouchEvent &&
              activatorEvent.touches.length > 0
            ) {
              pointerY = activatorEvent.touches[0].clientY;
            }
            const lastRect = over.rect;
            const lastMidY = lastRect.top + lastRect.height / 2;
            if (pointerY > lastMidY) {
              insertAt = newTo.length;
            }
          }
        }
        if (overIndex === -1) {
          newTo.push(movingTask);
        } else {
          newTo.splice(insertAt, 0, movingTask);
        }
        const newColumns = prev.map((col, idx) => {
          if (idx === fromColIdx) return { ...col, tasks: newFrom };
          if (idx === toColIdx) return { ...col, tasks: newTo };
          return col;
        });
        // console.log('Document Schema (Task Move):', JSON.stringify(newColumns, null, 2));
        return newColumns;
      });
    }
    setActiveColumnId(null);
    setActiveTask(null);
  };

  const handleDragCancel = () => {
    setActiveColumnId(null);
    setActiveTask(null);
  };

  // Add column handler
  const handleAddColumn = () => {
    const name = "Untitled";
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    // Generate unique id
    const newId = Date.now().toString();
    setColumns(prev => {
      const newColumns = [
        ...prev,
        {
          id: newId,
          title: trimmed,
          bg: 'bg-blue-900',
          hsva: defaultHSVA['bg-blue-900'],
          tasks: [],
        },
      ];
      // console.log('Document Schema (Add Column):', JSON.stringify(newColumns, null, 2));
      return newColumns;
    });
    setNewColumnId(newId);
    // Optionally, immediately trigger rename handler for consistency
    handleRenameColumn(newId, trimmed);
  };

  const handleAddTask = (columnId: string) => {
    const newTask = {
      id: Date.now().toString(),
      title: '',
      bg: 'bg-blue-800',
      isEditing: true,
    };
    setColumns(prev => {
      const newColumns = prev.map(col =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
      );
      // console.log('Document Schema (Add Task):', JSON.stringify(newColumns, null, 2));
      return newColumns;
    });
  };

  const handleDeleteTasks = (columnId: string, taskIds: string[]) => {
    setColumns(prev => {
      const newColumns = prev.map(col =>
        col.id === columnId ? { ...col, tasks: col.tasks.filter(task => !taskIds.includes(task.id)) } : col
      );
      // console.log('Document Schema (Delete Tasks):', JSON.stringify(newColumns, null, 2));
      return newColumns;
    });
    setDeleteModes(prev => ({ ...prev, [columnId]: false }));
  };

  const handleSetDeleteMode = (columnId: string, mode: boolean) => {
    setDeleteModes(prev => ({ ...prev, [columnId]: mode }));
  };

  const handleRemoveColumn = (columnId: string) => {
    setColumns(prev => {
      const newColumns = prev.filter(col => col.id !== columnId);
      // console.log('Document Schema (Remove Column):', JSON.stringify(newColumns, null, 2));
      return newColumns;
    });
  };

  const handleChangeColumnColour = (columnId: string, color: string, hsva?: { h: number; s: number; v: number; a: number }) => {
    setColumns(prev => {
      const newColumns = prev.map(col =>
        col.id === columnId ? { ...col, bg: color, hsva: hsva || col.hsva } : col
      );
      // console.log('Document Schema (Change Column Colour):', JSON.stringify(newColumns, null, 2));
      return newColumns;
    });
  };

  const handleRenameColumn = (oldId: string, newTitle: string) => {
    setColumns(prev => {
      const newColumns = prev.map(col =>
        col.id === oldId ? { ...col, title: newTitle } : col
      );
      // console.log('Document Schema (Rename Column):', JSON.stringify(newColumns, null, 2));
      return newColumns;
    });
  };

  const handleRenameTask = (columnId: string, taskId: string, newTitle: string) => {
    setColumns(prev => {
      const newColumns = prev.map(col =>
        col.id === columnId ? {
          ...col,
          tasks: col.tasks.map(task =>
            task.id === taskId ? { ...task, title: newTitle, isEditing: false } : task
          )
        } : col
      );
      // console.log('Document Schema (Rename Task):', JSON.stringify(newColumns, null, 2));
      return newColumns;
    });
  };

  const handleSetTaskEditing = (columnId: string, taskId: string, editing: boolean) => {
    setColumns(prev => {
      const newColumns = prev.map(col =>
        col.id === columnId ? {
          ...col,
          tasks: col.tasks.map(task =>
            task.id === taskId ? { ...task, isEditing: editing } : task
          )
        } : col
      );
      // console.log('Document Schema (Set Task Editing):', JSON.stringify(newColumns, null, 2));
      return newColumns;
    });
  };

  // Helper to close ColourWheel on outside click
  useEffect(() => {
    if (!colourWheelTarget) return;
    const handle = (e: MouseEvent) => {
      // If click is inside the popover, do nothing
      const pop = document.getElementById('colourwheel-popover');
      if (pop && pop.contains(e.target as Node)) return;
      setColourWheelTarget(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [colourWheelTarget]);

  // Handler for FloatingMenu to toggle color mode
  const handleSetColorMode = (v: boolean) => {
    setColorMode(v);
    setColourWheelTarget(null); // close any open popover
  };

  // Handler for KanbanBox/Task to open ColourWheel
  const handleOpenColourWheel = (target: { type: 'task'|'column', columnId: string, taskId?: string }, anchor: HTMLElement) => {
    const anchorRect = anchor.getBoundingClientRect();
    setColourWheelTarget({ ...target, anchorRect });
  };

  // Handler for picking a color
  const handleColourPick = (hex: string, hsva: { h: number; s: number; v: number; a: number }) => {
    if (!colourWheelTarget) return;
    if (colourWheelTarget.type === 'task' && colourWheelTarget.taskId) {
      setColumns(prev => {
        const newColumns = prev.map(col =>
          col.id === colourWheelTarget.columnId ? {
            ...col,
            tasks: col.tasks.map(task =>
              task.id === colourWheelTarget.taskId ? { ...task, bg: hex } : task
            )
          } : col
        );
        // console.log('Document Schema (Change Task Colour):', JSON.stringify(newColumns, null, 2));
        return newColumns;
      });
    } else if (colourWheelTarget.type === 'column') {
      setColumns(prev => {
        const newColumns = prev.map(col =>
          col.id === colourWheelTarget.columnId ? { ...col, bg: hex, hsva } : col
        );
        // console.log('Document Schema (Change Column Colour via Wheel):', JSON.stringify(newColumns, null, 2));
        return newColumns;
      });
    }
  };

  return (
    <div className="bg-slate-900 relative h-full overflow-hidden" ref={boardRef}>
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2 shadow-lg">
        <button
          onClick={() => zoomOut({ x: 50, y: 50 })}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-1 px-2 rounded text-sm transition-colors"
          disabled={zoom <= MIN_ZOOM}
          title="Zoom Out (Ctrl/Cmd + -)"
        >
          -
        </button>
        <span className="text-white text-sm font-medium min-w-[3rem] text-center">
          {zoomLevel}%
        </span>
        <button
          onClick={() => zoomIn({ x: 50, y: 50 })}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-1 px-2 rounded text-sm transition-colors"
          disabled={zoom >= MAX_ZOOM}
          title="Zoom In (Ctrl/Cmd + =)"
        >
          +
        </button>
        <button
          onClick={resetZoom}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-1 px-2 rounded text-sm transition-colors"
          disabled={zoom === 1}
          title="Reset Zoom (Ctrl/Cmd + 0)"
        >
          Reset
        </button>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800 rounded px-2 py-1 text-center">
          Ctrl/Cmd + Scroll to zoom (mouse-centered)
        </div>
      </div>
      
      {/* Scrollable container that contains the zoomed content */}
      <div className="mt-20 h-[calc(100vh-5rem)] overflow-auto">
        <div
          className={`flex flex-row space-x-4 px-4 pb-4 min-w-max ${isMobile ? 'kanban-board-mobile' : ''}`}
          ref={boardContentRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: `${zoomCenter.x}% ${zoomCenter.y}%`,
            transition: 'transform 0.1s ease-out'
          }}
        >
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          collisionDetection={closestCorners}
          sensors={sensors}
        >
          <SortableContext items={columns.map(col => col.id)}>
            {columns.map((column) => (
              <SortableColumn
                key={column.id}
                id={column.id}
                disableDrag={!moveMode || !!deleteModes[column.id]}
                className={isMobile ? 'kanban-column-mobile' : ''}
              >
                <KanbanBox
                  tasks={column.tasks || []}
                  columnId={column.id}
                  bg={column.bg}
                  hsva={column.hsva}
                  onAddTask={handleAddTask}
                  onRenameColumn={handleRenameColumn}
                  onDeleteColumn={handleRemoveColumn}
                  onDeleteTasks={handleDeleteTasks}
                  deleteMode={!!deleteModes[column.id]}
                  setDeleteMode={(mode: boolean) => handleSetDeleteMode(column.id, mode)}
                  onChangeColour={handleChangeColumnColour}
                  moveMode={moveMode}
                  columnTitle={column.title}
                  autoFocusTitle={newColumnId === column.id}
                  onRenameTask={handleRenameTask}
                  onSetTaskEditing={handleSetTaskEditing}
                  colorMode={colorMode}
                  onColorModeClick={colorMode ? handleOpenColourWheel : undefined}
                />
              </SortableColumn>
            ))}
          </SortableContext>
          <div className="flex items-center mb-4 px-4">
            <button
              onClick={handleAddColumn}
              className="bg-gray-900 text-white font-bold py-2 px-4 rounded shadow shadow-[0_0_6px_2px_rgba(255,255,255,0.2)] hover:shadow-[0_0_12px_4px_rgba(30,144,255,0.7)]"
              disabled={moveMode}
            >
              +
            </button>
          </div>
        </DndContext>
        </div>
      </div>
      
      {/* DragOverlay - positioned outside zoomed container to avoid coordinate issues */}
      <DragOverlay>
        {activeTask ? (
          <div style={{ transform: `scale(${zoom})` }}>
            <Task id={activeTask.id} title={activeTask.title} bg={activeTask.bg} />
          </div>
        ) : activeColumnId ? (
          (() => {
            const col = columns.find(c => c.id === activeColumnId);
            if (!col) return null;
            return (
              <div style={{ transform: `scale(${zoom})` }}>
                <KanbanBox
                  tasks={col.tasks}
                  columnId={col.id}
                  bg={col.bg}
                  hsva={col.hsva}
                  onAddTask={() => {}}
                  onRenameColumn={() => {}}
                  onDeleteColumn={() => {}}
                  onDeleteTasks={() => {}}
                  deleteMode={false}
                  setDeleteMode={() => {}}
                  onChangeColour={() => {}}
                  moveMode={false}
                  columnTitle={col.title}
                  autoFocusTitle={false}
                />
              </div>
            );
          })()
        ) : null}
      </DragOverlay>
      
      {/* ColourWheel Popover */}
      {colourWheelTarget && (
        <div
          id="colourwheel-popover"
          style={{
            position: 'fixed',
            left: colourWheelTarget.anchorRect.left + colourWheelTarget.anchorRect.width / 2,
            top: colourWheelTarget.anchorRect.top + colourWheelTarget.anchorRect.height + 8,
            zIndex: 1000,
            transform: 'translate(-50%, 0)',
            background: 'white',
            borderRadius: 8,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            padding: 12,
          }}
        >
          <ColourWheel
            onColourPick={handleColourPick}
            initialHsva={colourWheelTarget.type === 'column'
              ? (columns.find(c => c.id === colourWheelTarget.columnId)?.hsva)
              : undefined}
          />
        </div>
      )}
      <div className="absolute left-1/2 -translate-x-1/2 top-120 z-50 pointer-events-none">
        <FloatingMenu moveMode={moveMode} setMoveMode={setMoveMode} colorMode={colorMode} setColorMode={handleSetColorMode} />
      </div>
    </div>
  );
}

export default Board; 