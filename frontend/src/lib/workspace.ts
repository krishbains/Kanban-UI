import { database, ref, set, get } from "./firebase";
import { Column } from "@/app/Board";

export const saveWorkspace = async (schema: Column[], documentName: string = "default") => {
  try {
    if (!database) {
      console.warn("Firebase not configured - saving to localStorage instead");
      localStorage.setItem(`workspace_${documentName}`, JSON.stringify(schema));
      console.log(`Workspace \"${documentName}\" saved to localStorage`);
      return true;
    }
    
    const workspaceRef = ref(database, `workspaces/${documentName}`);
    await set(workspaceRef, schema);
    console.log(`Workspace \"${documentName}\" saved successfully`);
    return true;
  } catch (error) {
    console.error("Error saving workspace:", error);
    return false;
  }
};

export const loadWorkspace = async (documentName: string = "default"): Promise<Column[] | null> => {
  try {
    if (!database) {
      console.warn("Firebase not configured - loading from localStorage instead");
      const saved = localStorage.getItem(`workspace_${documentName}`);
      if (saved) {
        console.log(`Workspace \"${documentName}\" loaded from localStorage`);
        const parsed = JSON.parse(saved) as Column[];
        if (Array.isArray(parsed)) {
          parsed.forEach((col: Column) => {
            if (!Array.isArray(col.tasks)) col.tasks = [];
          });
        }
        return parsed;
      }
      return null;
    }
    
    const snapshot = await get(ref(database!, `workspaces/${documentName}`));
    if (snapshot.exists()) {
      console.log(`Workspace \"${documentName}\" loaded successfully`);
      const data = snapshot.val() as Column[];
      if (Array.isArray(data)) {
        data.forEach((col: Column) => {
          if (!Array.isArray(col.tasks)) col.tasks = [];
        });
      }
      return data;
    } else {
      console.log(`Workspace \"${documentName}\" not found, returning null`);
      return null;
    }
  } catch (error) {
    console.error("Error loading workspace:", error);
    return null;
  }
};

export const listWorkspaces = async (): Promise<string[]> => {
  try {
    if (!database) return [];
    const snapshot = await get(ref(database, "workspaces"));
    if (snapshot.exists()) {
      const workspaces = snapshot.val() as Record<string, unknown>;
      return Object.keys(workspaces);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error listing workspaces:", error);
    return [];
  }
};

export const deleteWorkspace = async (documentName: string = "default") => {
  try {
    if (!database) {
      // Remove from localStorage
      localStorage.removeItem(`workspace_${documentName}`);
      console.log(`Workspace \"${documentName}\" deleted from localStorage`);
      return true;
    }
    // Remove from Firebase
    const workspaceRef = ref(database, `workspaces/${documentName}`);
    await set(workspaceRef, null);
    console.log(`Workspace \"${documentName}\" deleted from Firebase`);
    return true;
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return false;
  }
}; 