import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/landing/Footer";
import RisingStars from "@/component/RisingStar";
import { getBlogBySlug, getAllBlogs, getValidImageUrl } from "@/lib/blogs";
import { getAvatarUrl } from "@/lib/avatar";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

function renderFormattedText(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((chunk, i) => {
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-white font-sans">
          {chunk.slice(2, -2)}
        </strong>
      );
    }
    return chunk;
  });
}

function renderMarkdown(content: string) {
  const blocks = content.split("\n\n");
  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={idx} className="text-3xl sm:text-4xl font-bold font-sans text-white mt-10 mb-4 border-b border-white/10 pb-3">
          {renderFormattedText(trimmed.replace("# ", ""))}
        </h1>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={idx} className="text-xl sm:text-2xl font-bold font-sans text-[#38bdf8] mt-8 mb-3">
          {renderFormattedText(trimmed.replace("## ", ""))}
        </h2>
      );
    }
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={idx} className="text-lg sm:text-xl font-bold font-sans text-[#E873C3] mt-6 mb-2">
          {renderFormattedText(trimmed.replace("### ", ""))}
        </h3>
      );
    }
    if (trimmed.startsWith("```")) {
      const code = trimmed.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
      return (
        <pre key={idx} className="bg-[#0b061a] border border-white/10 rounded-xl p-4 overflow-x-auto text-sm font-mono text-[#e2e8f0] my-4">
          <code>{code}</code>
        </pre>
      );
    }
    if (trimmed.startsWith("> ")) {
      return (
        <blockquote key={idx} className="border-l-4 border-[#38bdf8] bg-white/[0.02] p-4 rounded-r-xl italic text-[#e2e8f0] my-4">
          {renderFormattedText(trimmed.replace("> ", ""))}
        </blockquote>
      );
    }

    if (trimmed.includes("\n")) {
      const lines = trimmed.split("\n");
      return (
        <div key={idx} className="space-y-2 my-4">
          {lines.map((line, i) => {
            const lineTrim = line.trim();
            if (/^\d+\.\s/.test(lineTrim)) {
              return (
                <div key={i} className="flex items-start gap-2 text-[#94a3b8] font-sans text-base leading-relaxed pl-2">
                  <span className="font-semibold text-[#38bdf8] font-sans shrink-0">
                    {lineTrim.match(/^\d+\./)?.[0]}
                  </span>
                  <span className="font-sans text-[#94a3b8]">
                    {renderFormattedText(lineTrim.replace(/^\d+\.\s/, ""))}
                  </span>
                </div>
              );
            }
            if (/^[*-]\s/.test(lineTrim)) {
              return (
                <div key={i} className="flex items-start gap-2 text-[#94a3b8] font-sans text-base leading-relaxed pl-2">
                  <span className="text-[#38bdf8] font-sans shrink-0">•</span>
                  <span className="font-sans text-[#94a3b8]">
                    {renderFormattedText(lineTrim.replace(/^[*-]\s/, ""))}
                  </span>
                </div>
              );
            }
            return (
              <p key={i} className="text-[#94a3b8] font-sans text-base leading-relaxed">
                {renderFormattedText(lineTrim)}
              </p>
            );
          })}
        </div>
      );
    }

    return (
      <p key={idx} className="text-[#94a3b8] font-sans text-base sm:text-lg leading-relaxed">
        {renderFormattedText(trimmed)}
      </p>
    );
  });
}

export const dynamicParams = true;
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: "Dispatch Not Found | CosmoDex",
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

  return {
    title: `${post.title} | CosmoDex Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `${appUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${appUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [{ url: post.coverImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export async function generateStaticParams() {
  const blogs = await getAllBlogs();
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await getBlogBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const allBlogs = await getAllBlogs();
  const relatedPosts = allBlogs.filter(
    (p) => p.slug !== post.slug && p.category === post.category
  ).slice(0, 2);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cosmodex.in";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${appUrl}/blog/${post.slug}`,
    },
    headline: post.title,
    description: post.excerpt,
    image: [post.coverImage],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "CosmoDex",
      logo: {
        "@type": "ImageObject",
        url: `${appUrl}/images/logo.png`,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col relative overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Structured Data Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      {/* ── Deep Space Background FX matching Course Page ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050508]">
        <div className="absolute inset-0 bg-[#050508]" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.22)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(232,115,195,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(141,55,214,0.08)_0%,transparent_70%)]" />
        <RisingStars />
      </div>

      <main className="relative z-10 flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Back Navigation */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-purple-300 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-purple-400" />
          <span>Back to Dispatches</span>
        </Link>

        <article className="space-y-10">
          {/* Header Metadata */}
          <header className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                {post.category}
              </span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                <Clock size={14} className="text-purple-400" />
                {post.readTime}
              </span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                <Calendar size={14} className="text-purple-400" />
                {post.publishedAt}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight leading-[1.15]">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-normal border-l-2 border-purple-500 pl-4 py-1">
              {post.excerpt}
            </p>

            {/* Author Bar with CosmoDex Character Avatar */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-purple-500/40 shadow-md bg-purple-950">
                  <Image
                    src={getAvatarUrl(post.author.avatar)}
                    alt={post.author.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {post.author.name}
                  </h3>
                  <p className="text-xs text-purple-300/80 font-mono">
                    {post.author.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  title="Share dispatch"
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Share2 size={16} />
                </button>
                <button
                  title="Bookmark dispatch"
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Bookmark size={16} />
                </button>
              </div>
            </div>
          </header>

          {/* Cover Image Banner */}
          <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden bg-gray-900 border border-white/10 shadow-2xl">
            <Image
              src={getValidImageUrl(post.coverImage)}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-40" />
          </div>

          {/* Article Body */}
          <div className="space-y-6 text-[#94a3b8] text-base sm:text-lg leading-relaxed font-sans">
            {renderMarkdown(post.content)}
          </div>

          {/* Article Footer Tags */}
          <div className="pt-8 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-gray-400 mr-2">Tags:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300 text-xs font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <div className="pt-12 border-t border-white/10 space-y-6">
              <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                <span>Related Dispatches</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedPosts.map((rel) => (
                  <Link key={rel.id} href={`/blog/${rel.slug}`} className="group block">
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.05] transition-all space-y-3">
                      <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-mono font-semibold">
                        {rel.category}
                      </span>
                      <h4 className="text-base font-bold font-display text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {rel.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-semibold pt-1">
                        Read Dispatch <ChevronRight size={14} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
