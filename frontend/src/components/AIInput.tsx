import React, { useState } from 'react';

interface AIInputProps {
  onJsonResult: (json: Record<string, unknown>) => void;
  onCancel: () => void;
}

const HARDCODED_PROMPT = `
You are an expert template generator. Follow these rules:
- Output must be a single JSON array, not an object.
- The array should contain column objects, each with this structure:
  {
    "id": string,
    "title": string,
    "bg": string,
    "hsva": { "h": number, "s": number, "v": number, "a": number },
    "tasks": [ { "id": string, "title": string, "bg": string } ]
  }
- CRITICAL: ID naming convention for drag-and-drop functionality:
  * Column IDs must be simple strings without hyphens (e.g., "col1", "todo", "doing", "done")
  * Task IDs must follow the pattern: "{columnId}-{taskNumber}" (e.g., "col1-1", "todo-1", "doing-2")
  * This format is required for the drag-and-drop system to work properly
- Do not wrap the array in an object or add any extra properties.
- Do not omit any of the required keys (id, title, bg, hsva, tasks) in any column.
- Only output valid JSON, no explanations or extra text.
- The output must start with '[' and end with ']'.
- Use the user's instruction to fill in the template details.
- Do not invent fields not described in the rules.
`;

const cleanLLMJson = (raw: string): string => {
  // Remove code block markers and trim whitespace
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/, '')
    .trim();
};

export default function AIInput({ onJsonResult, onCancel }: AIInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gemini-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: HARDCODED_PROMPT, userInput: input }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (!data || !data.result) throw new Error('No result from LLM');
      const rawResult = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
      const cleaned = cleanLLMJson(rawResult);
      const json: Record<string, unknown> = JSON.parse(cleaned);
      onJsonResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 bg-neutral-900 p-4 rounded border border-neutral-700 mt-2">
      <textarea
        className="w-full h-24 p-2 rounded bg-neutral-800 text-white border border-neutral-700"
        placeholder="Describe the template you want (e.g. 'A kanban board with 3 columns: Todo, Doing, Done')"
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading}
      />
      {error && <div className="text-red-400 text-xs">{error}</div>}
      <div className="flex gap-2">
        <button
          className="bg-purple-600 text-white px-3 py-1 rounded"
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
        <button
          className="bg-neutral-700 text-white px-3 py-1 rounded"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 