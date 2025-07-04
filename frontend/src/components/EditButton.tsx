import React, { useRef, useEffect } from 'react'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from './ui/dropdown-menu'
import ColourWheel from './ColourWheel'

interface EditButtonProps {
  onAddTask: () => void;
  onDeleteColumn?: () => void;
  onColourSelected?: (color: string, hsva?: { h: number; s: number; v: number; a: number }) => void;
  hsva: { h: number; s: number; v: number; a: number };
  moveMode?: boolean;
  disabled?: boolean;
}

export const EditButton = ({ onAddTask, onDeleteColumn, onColourSelected, hsva, moveMode = false, disabled = false }: EditButtonProps) => {
  const [showColourWheel, setShowColourWheel] = React.useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleColourPick = (color: string, hsvaValue: { h: number; s: number; v: number; a: number }) => {
    if (onColourSelected) onColourSelected(color, hsvaValue);
  };

  useEffect(() => {
    if (!showColourWheel) return;
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowColourWheel(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColourWheel]);

  return (
    <div className="border-1 border-gray-900 max-h-[25px] min-w-[35px] bg-transparent rounded-md flex items-center justify-center shadow-[0_0_12px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_0_12px_4px_rgba(30,144,255,0.7)]">
      <DropdownMenu>
        <DropdownMenuTrigger onClick={e => { e.stopPropagation(); }} disabled={moveMode || disabled}>
          ✏️
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
        >
          <DropdownMenuLabel>Edit</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={moveMode || disabled}>Rename</DropdownMenuItem>
          <DropdownMenuItem onClick={onAddTask} disabled={moveMode || disabled}>
            Add Card
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowColourWheel(true)} disabled={moveMode || disabled}>Change Colour</DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteColumn} disabled={moveMode || disabled}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {showColourWheel && !moveMode && !disabled && (
        <div ref={popoverRef} className="absolute z-50 top-8 right-0 bg-white p-2 rounded shadow-lg" onClick={e => e.stopPropagation()}>
          <ColourWheel onColourPick={handleColourPick} initialHsva={hsva} />
        </div>
      )}
    </div>
  )
}
