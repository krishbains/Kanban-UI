import React, { useState } from 'react';

interface AIInputProps {
  onJsonResult: (json: Record<string, unknown>) => void;
  onCancel: () => void;
}

const HARDCODED_PROMPT = `
You are an expert template generator. Output a single JSON array of columns, each with:
- id: string (no hyphens)
- title: string
- bg: string (column background color, suitable and distinct)
- hsva: { h: number, s: number, v: number, a: number }
- tasks: array of { id: string (format: {columnId}-{taskNumber}), title: string, bg: string (task background color, different from column and suitable for white text) }
Rules:
- Do not wrap the array in an object or add extra properties.
- Do not omit any required keys.
- Only output valid JSON, no explanations or extra text.
- The output must start with '[' and end with ']'.
- Use the user's instruction for template details.
- For colors: Each column should have a suitable, distinct color. Each task's bg must be different from its parent column's bg and must not blend with white text or the column's bg.
- Do not invent fields not described above.
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
      // Step 1: Start the job
      const res = await fetch('/api/gemini-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: HARDCODED_PROMPT, userInput: input }),
      });
      if (!res.ok) {
        let errorDetails = '';
        try {
          const text = await res.text();
          errorDetails = text ? ` | Response: ${text}` : '';
        } catch {}
        throw new Error(`API error: ${res.status} ${res.statusText}${errorDetails}`);
      }
      const data = await res.json();
      if (!data || !data.jobId) throw new Error('No job ID returned');
      const jobId = data.jobId;

      // Step 2: Poll for result
      let attempts = 0;
      const maxAttempts = 20; // ~40 seconds max
      let jobResult = null;
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 2000)); // 2s delay
        const statusRes = await fetch(`/api/gemini-template-status?id=${jobId}`);
        if (!statusRes.ok) {
          let errorDetails = '';
          try {
            const text = await statusRes.text();
            errorDetails = text ? ` | Response: ${text}` : '';
          } catch {}
          throw new Error(`Status API error: ${statusRes.status} ${statusRes.statusText}${errorDetails}`);
        }
        const statusData = await statusRes.json();
        if (statusData.status === 'done') {
          jobResult = statusData.result;
          break;
        } else if (statusData.status === 'error') {
          throw new Error(statusData.error || 'Unknown error in job');
        }
        attempts++;
      }
      if (!jobResult) throw new Error('Job timed out or did not complete');
      const cleaned = cleanLLMJson(jobResult);
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