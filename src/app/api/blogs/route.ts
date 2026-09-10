import { NextResponse } from 'next/server';
import { getAllBlogs } from '@/lib/blogs';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const blogs = await getAllBlogs();
    return NextResponse.json({ success: true, blogs });
  } catch (err) {
    console.error('[GET /api/blogs] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
