import { NextResponse } from 'next/server';
import { getAllBlogs } from '@/lib/blogs';

export async function GET() {
  try {
    const blogs = await getAllBlogs();
    return NextResponse.json({ success: true, blogs }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('[GET /api/blogs] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
