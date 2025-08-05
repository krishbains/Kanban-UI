import { NextRequest, NextResponse } from 'next/server';
import { jobs, generateJobId } from './jobsStore';

export async function POST(req: NextRequest) {
  const { prompt, userInput } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
  }
  const fullPrompt = `${prompt}\nUser instruction: ${userInput}`;

  // Create a job and return the job ID immediately
  const jobId = generateJobId();
  jobs[jobId] = { status: 'pending' };
  console.log('Starting Gemini job', jobId);

  // Start the LLM call in the background (no await)
  (async () => {
    try {
      console.log('Calling Gemini API for job', jobId);
      const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        }),
      });
      if (!geminiRes.ok) {
        const err = await geminiRes.text();
        console.error('Gemini API call failed for job', jobId, err);
        jobs[jobId] = { status: 'error', error: err };
        return;
      }
      const geminiData = await geminiRes.json();
      const result = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('Gemini API call complete for job', jobId, result);
      jobs[jobId] = { status: 'done', result };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      console.error('Gemini API call failed for job', jobId, message);
      jobs[jobId] = { status: 'error', error: message };
    }
  })();

  // Respond immediately with the job ID
  return NextResponse.json({ jobId });
} 