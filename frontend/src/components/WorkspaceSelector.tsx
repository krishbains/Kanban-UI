"use client"

import { useState, useEffect } from "react";
import { listWorkspaces } from "@/lib/workspace";

interface WorkspaceSelectorProps {
  currentWorkspace: string;
  onWorkspaceChange: (workspaceName: string) => void;
}

export const WorkspaceSelector = ({ currentWorkspace, onWorkspaceChange }: WorkspaceSelectorProps) => {
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const workspaceList = await listWorkspaces();
        setWorkspaces(workspaceList);
      } catch (error) {
        console.error("Error loading workspaces:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaces();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-white">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Loading workspaces...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="workspace-select" className="text-white text-sm font-medium">
        Document:
      </label>
      <select
        id="workspace-select"
        value={currentWorkspace}
        onChange={(e) => onWorkspaceChange(e.target.value)}
        className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
      >
        {workspaces.length > 0 ? (
          workspaces.map((workspace) => (
            <option key={workspace} value={workspace}>
              {workspace}
            </option>
          ))
        ) : (
          <option value="default">default</option>
        )}
      </select>
    </div>
  );
}; 