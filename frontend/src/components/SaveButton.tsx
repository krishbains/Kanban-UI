"use client"

import { useState } from "react";
import { saveWorkspace } from "@/lib/workspace";
import { Column } from "@/app/Board";

interface SaveButtonProps {
  schema: Column[];
  workspaceName: string;
}

export const SaveButton = ({ schema, workspaceName }: SaveButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSave = async () => {
    console.log('Document Schema (Save Button Clicked):', JSON.stringify(schema, null, 2));
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const success = await saveWorkspace(schema, workspaceName);
      if (success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonText = () => {
    if (isSaving) return "Saving...";
    if (saveStatus === "success") return "Saved!";
    if (saveStatus === "error") return "Error!";
    return "Save";
  };

  const getButtonClass = () => {
    const baseClass = "px-4 py-2 rounded font-medium transition-all duration-200";
    if (isSaving) return `${baseClass} bg-gray-600 text-gray-300 cursor-not-allowed`;
    if (saveStatus === "success") return `${baseClass} bg-green-600 text-white`;
    if (saveStatus === "error") return `${baseClass} bg-red-600 text-white`;
    return `${baseClass} bg-blue-600 text-white hover:bg-blue-700`;
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className={getButtonClass()}
    >
      {getButtonText()}
    </button>
  );
}; 