import { NextRequest, NextResponse } from 'next/server';
import { getBlogBySlug } from '@/lib/blogs';

export const dynamic = 'force-dynamic';

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
    return NextResponse.json({ success: true, blog });
  } catch (err) {
    console.error(`[GET /api/blogs/${slug}] Error:`, err);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}
