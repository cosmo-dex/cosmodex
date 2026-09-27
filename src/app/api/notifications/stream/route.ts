import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Persistent SSE stream retired to eliminate continuous Vercel Serverless CPU / compute consumption.
  // Notifications are now efficiently handled via visibility-aware polling on /api/notifications.
  return NextResponse.json({
    status: 'deprecated',
    message: 'Use GET /api/notifications with polling instead of persistent SSE connection.',
  });
}
