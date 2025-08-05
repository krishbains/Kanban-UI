import { NextRequest, NextResponse } from 'next/server';
import { jobs } from '../gemini-template/jobsStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('id');
  if (!jobId) {
    return NextResponse.json({ error: 'Missing job id' }, { status: 400 });
  }
  const job = jobs[jobId];
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  return NextResponse.json(job);
} 