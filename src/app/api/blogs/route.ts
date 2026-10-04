import { NextResponse } from 'next/server';
import { getAllBlogs } from '@/lib/blogs';

// Static blog API - no database calls for cost optimization
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Using static blog service instead of database queries
    const blogs = await getAllBlogs();
    return NextResponse.json({ success: true, blogs });
  } catch (err) {
    console.error('[GET /api/blogs] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}