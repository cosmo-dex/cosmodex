import type { Metadata } from "next";
import CourseSchema from "@/components/seo/CourseSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";

export const metadata: Metadata = {
  title: "Learn Python from Scratch — Interactive Course",
  description:
    "Free interactive Python course for students and beginners. Learn Python syntax, loops, data structures, and algorithms with gamified missions and terminal challenges.",
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
