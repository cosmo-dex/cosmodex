import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arena Battle Session | CosmoDex",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BattleCodingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
