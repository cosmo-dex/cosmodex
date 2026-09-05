import { getAllBlogs } from "@/lib/blogs";
import BlogPageClient from "./BlogPageClient";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAllBlogs();
  return <BlogPageClient initialPosts={posts} />;
}
