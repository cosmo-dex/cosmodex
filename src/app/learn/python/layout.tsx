import type { Metadata } from "next";
import CourseSchema from "@/components/seo/CourseSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Learn Python from Scratch — Free Interactive Python Course",
  description:
    "Free interactive Python course for students and beginners. Learn Python syntax, loops, data structures, and algorithms with gamified missions, terminal challenges, and live code duels.",
  keywords: [
    "python coding",
    "learn python free",
    "how to learn python",
    "interactive python course",
    "python for beginners",
    "learn python by doing",
    // Course Landing Page — Python keywords from Excel
    "Python practice problems",
    "Python interview questions",
    "Python coding questions",
    "Python tutorial for beginners",
    "Python cheat sheet",
    "Python roadmap",
    "Python online course",
    "Python certification",
    "Python mcq questions",
    "Python quiz online",
    "Python practice online free",
    "Python questions and answers",
    "Python notes pdf",
    "Python basics explained",
    "Python advanced concepts",
    "Python problems and solutions",
    "Python exercises for practice",
    "Python projects for beginners",
    "Python interview cheat sheet",
    "Python crash course",
    "Python best practices",
    "free python course for students",
    "best site to learn python for beginners",
    "python programming fundamentals",
    "python exercises with solutions",
    "python dsa for beginners",
    "free coding practice sites",
  ],
  alternates: {
    canonical: `${appUrl}/learn/python`,
  },
  openGraph: {
    title: "Learn Python from Scratch — Interactive Course | CosmoDex",
    description:
      "Free interactive Python course for students and beginners. Learn Python syntax, data structures, and algorithms with gamified missions.",
    url: `${appUrl}/learn/python`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Python from Scratch — Interactive Course | CosmoDex",
    description:
      "Free interactive Python course with gamified missions, terminal exercises, and battle prep.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function PythonCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: appUrl },
          { name: "Learn", url: `${appUrl}/learn` },
          { name: "Python", url: `${appUrl}/learn/python` },
        ]}
      />
      <CourseSchema
        name="Python Programming Fundamentals"
        description="Master foundational and intermediate Python programming through gamified exercises, quizzes, terminal tasks, and cosmic league progression."
        courseCode="PY-101"
        url={`${appUrl}/learn/python`}
      />
      {children}
    </>
  );
}
