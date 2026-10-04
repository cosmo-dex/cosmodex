import { NextRequest, NextResponse } from 'next/server';
import { getBlogBySlug } from '@/lib/blogs';

// Static blog API - no database calls for cost optimization
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  const { slug } = await params;
  try {
    // Using static blog service instead of database queries
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