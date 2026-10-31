import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Results | CosmoDex Battle ",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VictoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
