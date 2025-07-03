import React from 'react'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from './ui/dropdown-menu'

interface EditButtonProps {
  onAddTask: () => void;
  onDeleteColumn?: () => void;
}

export const EditButton = ({ onAddTask, onDeleteColumn }: EditButtonProps) => {

  return (
    <div className="border-1 border-gray-900 max-h-[25px] min-w-[35px] bg-transparent rounded-md flex items-center justify-center shadow-[0_0_12px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_0_12px_4px_rgba(30,144,255,0.7)]">
    <DropdownMenu>
      <DropdownMenuTrigger onClick={e => e.stopPropagation()}>
         ✏️
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
      >
        <DropdownMenuLabel>Edit</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem onClick={onAddTask}>
            Add Card
        </DropdownMenuItem>
        <DropdownMenuItem>Change Colour</DropdownMenuItem>
        <DropdownMenuItem onClick={onDeleteColumn}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div> 
  )
}
