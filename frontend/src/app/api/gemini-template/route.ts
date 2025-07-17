import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt, userInput } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
  }
  const fullPrompt = `${prompt}\nUser instruction: ${userInput}`;
  try {
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      }),
    });
    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }
    const geminiData = await geminiRes.json();
    // Extract the text from the response
    const result = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 