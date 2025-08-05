// In-memory job store (not persistent, for demo/dev only)
export const jobs: Record<string, { status: 'pending' | 'done' | 'error'; result?: string; error?: string }> = {};

// Helper to generate a simple unique job ID
export function generateJobId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
} 