import React from "react";

interface CourseSchemaProps {
  name: string;
  description: string;
  providerName?: string;
  url: string;
  courseCode?: string;
}

export default function CourseSchema({
  name,
  description,
  providerName = "CosmoDex",
  url,
  courseCode,
}: CourseSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    courseCode,
    provider: {
      "@type": "Organization",
      name: providerName,
      sameAs: "https://www.cosmodex.in",
    },
    url,
    offers: {
      "@type": "Offer",
      category: "Free",
      price: "0",
      priceCurrency: "USD",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: "PT15H",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
