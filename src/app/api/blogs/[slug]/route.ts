import { NextRequest, NextResponse } from 'next/server';
import { getBlogBySlug } from '@/lib/blogs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const blog = await getBlogBySlug(slug);
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, blog },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error(`[GET /api/blogs/${slug}] Error:`, err);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}