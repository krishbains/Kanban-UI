"use client"

import { KanbanBox } from "@/components/KanbanBox";
import { closestCorners, DndContext, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { Task } from "@/components/Task";
import { SortableContext } from "@dnd-kit/sortable";
import { SortableColumn } from "@/components/SortableColumn";
import { FloatingMenu } from "@/components/FloatingMenu";

// import Image from "next/image";

type Task = {
  id: string;
  title: string;
  bg: string;
};

type Column = {
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

const Board = () => {
  const [mounted, setMounted] = useState(false);
  const [activeTask, setActiveTask] = useState<{ id: string; title: string; bg: string } | null>(null);
  const [columns, setColumns] = useState<Record<string, Column>>({
    todo: { bg: 'bg-slate-600', hsva: defaultHSVA['bg-slate-600'], tasks: [
      { id: '1', title: 'Buy milk', bg: 'bg-blue-800' },
      { id: '2', title: 'Finish project', bg: 'bg-green-800' },
      { id: '3', title: 'Call mom', bg: 'bg-red-800' },
    ]},
    inProgress: { bg: 'bg-slate-700', hsva: defaultHSVA['bg-slate-700'], tasks: [
      { id: '4', title: 'Write report', bg: 'bg-yellow-700' },
      { id: '5', title: 'Fix bug', bg: 'bg-pink-700' },
    ]},
    done: { bg: 'bg-slate-900', hsva: defaultHSVA['bg-slate-900'], tasks: [] },
    trashed: { bg: 'bg-slate-800', hsva: defaultHSVA['bg-slate-800'], tasks: [] },
  });

  // Track delete mode per column
  const [deleteModes, setDeleteModes] = useState<Record<string, boolean>>({});

  // Move mode state
  const [moveMode, setMoveMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
  )

  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // or a loading skeleton

  const parseId = (scopedId: string) => {
    const [columnId, ...rest] = scopedId.split('-');
    const taskId = rest.join('-');
    return { columnId, taskId };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { columnId, taskId } = parseId(event.active.id as string);
    const task = columns[columnId]?.tasks.find((task: Task) => task.id === taskId);
    if (task) setActiveTask({ id: event.active.id as string, title: task.title, bg: task.bg });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const { columnId: fromColumn, taskId: activeId } = parseId(active.id as string);
    const { columnId: toColumn, taskId: overId } = parseId(over.id as string);
    if (!fromColumn || !toColumn) return;
    const activeTaskIndex = columns[fromColumn]?.tasks.findIndex((task: Task) => task.id === activeId);
    if (activeTaskIndex === -1) return;
    const movingTask = columns[fromColumn].tasks[activeTaskIndex];
    // Reordering in same column
    if (fromColumn === toColumn) {
      const overIndex = columns[toColumn]?.tasks.findIndex((task: Task) => task.id === overId);
      if (overIndex === -1) return;
      const updatedTasks = arrayMove(columns[toColumn].tasks, activeTaskIndex, overIndex);
      setColumns(prev => ({
        ...prev,
        [fromColumn]: { ...prev[fromColumn], tasks: updatedTasks },
      }));
    } else {
      // Moving across columns
      const overIndex = columns[toColumn]?.tasks.findIndex((task: Task) => task.id === overId);
      setColumns(prev => {
        const newFrom = [...prev[fromColumn].tasks];
        newFrom.splice(activeTaskIndex, 1);
        const newTo = [...prev[toColumn].tasks];
        if (overIndex === -1) {
          newTo.push(movingTask);
        } else {
          newTo.splice(overIndex, 0, movingTask);
        }
        return {
          ...prev,
          [fromColumn]: { ...prev[fromColumn], tasks: newFrom },
          [toColumn]: { ...prev[toColumn], tasks: newTo },
        };
      });
    }
    setActiveTask(null);
  };

  const handleDragCancel = () => setActiveTask(null);

  // Add column handler
  const handleAddColumn = () => {
    const name = prompt("Enter new column name:");
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed || columns[trimmed]) return;
    setColumns(prev => ({ ...prev, [trimmed]: { bg: 'bg-blue-900', hsva: defaultHSVA['bg-blue-900'], tasks: [] } }));
  };

  const handleAddTask = (columnId: string) => {
    // const name = prompt("Enter new task name:");
    // if (!name) return;
    // const trimmed = name.trim();
    // if (!trimmed) return;
  
    // Generate a unique id (for demo, use Date.now())
    const newTask = {
      id: Date.now().toString(),
      title: 'Untitled',
      bg: 'bg-blue-800', // or any default color you want
    };
  
    setColumns(prev => ({...prev,[columnId]: {...prev[columnId], tasks: [...prev[columnId].tasks, newTask],},}));
  };

  // Handler to delete tasks in a column
  const handleDeleteTasks = (columnId: string, taskIds: string[]) => {
    setColumns(prev => {
      if (!prev[columnId]) return prev;
      return {
        ...prev,
        [columnId]: {
          ...prev[columnId],
          tasks: prev[columnId].tasks.filter(task => !taskIds.includes(task.id)),
        },
      };
    });
    setDeleteModes(prev => ({ ...prev, [columnId]: false }));
  };

  const handleSetDeleteMode = (columnId: string, mode: boolean) => {
    setDeleteModes(prev => ({ ...prev, [columnId]: mode }));
  };

  // Remove column handler
  const handleRemoveColumn = (columnId: string) => {
    setColumns(prev => {
      const newCols = { ...prev };
      delete newCols[columnId];
      return newCols;
    });
  };

  const handleChangeColumnColour = (columnId: string, color: string, hsva?: { h: number; s: number; v: number; a: number }) => {
    setColumns(prev => {
      const prevBg = prev[columnId]?.bg;
      if (!prevBg) return prev;
      console.log(`changed ${columnId}'s bg from ${prevBg} to ${color}`);
      return {
        ...prev,
        [columnId]: {
          ...prev[columnId],
          bg: color,
          hsva: hsva || prev[columnId].hsva,
        },
      };
    });
  };

  return (
    <div className="bg-slate-900 relative">
      <div className="mt-20 flex flex-row overflow-x-auto space-x-4 px-4 pb-4"> 
        {moveMode ? (
          <DndContext
            onDragStart={e => {
              handleDragStart(e);
            }}
            onDragEnd={e => {
              handleDragEnd(e);
            }}
            onDragCancel={handleDragCancel}
            collisionDetection={closestCorners}
            sensors={sensors}
          >
            <SortableContext items={Object.keys(columns)}>
              {Object.entries(columns).map(([columnId, column]) => (
                <SortableColumn key={columnId} id={columnId} disableDrag={!!deleteModes[columnId]}>
                  <KanbanBox 
                    tasks={column.tasks} 
                    columnId={columnId} 
                    bg={column.bg} 
                    hsva={column.hsva}
                    onAddTask={handleAddTask}
                    onRenameColumn={undefined}
                    onDeleteColumn={handleRemoveColumn}
                    onDeleteTasks={handleDeleteTasks}
                    deleteMode={!!deleteModes[columnId]}
                    setDeleteMode={(mode: boolean) => handleSetDeleteMode(columnId, mode)}
                    onChangeColour={handleChangeColumnColour}
                    moveMode={moveMode}
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
            <DragOverlay>
              {activeTask ? (
                <Task id={activeTask.id} title={activeTask.title} bg={activeTask.bg} />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <>
            <SortableContext items={Object.keys(columns)}>
              {Object.entries(columns).map(([columnId, column]) => (
                <SortableColumn key={columnId} id={columnId} disableDrag={true}>
                  <KanbanBox 
                    tasks={column.tasks} 
                    columnId={columnId} 
                    bg={column.bg} 
                    hsva={column.hsva}
                    onAddTask={handleAddTask}
                    onRenameColumn={undefined}
                    onDeleteColumn={handleRemoveColumn}
                    onDeleteTasks={handleDeleteTasks}
                    deleteMode={!!deleteModes[columnId]}
                    setDeleteMode={(mode: boolean) => handleSetDeleteMode(columnId, mode)}
                    onChangeColour={handleChangeColumnColour}
                    moveMode={moveMode}
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
          </>
        )}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-120 z-50 pointer-events-none">
        <FloatingMenu moveMode={moveMode} setMoveMode={setMoveMode} />
      </div>
    </div>
  );
}

export default Board; 