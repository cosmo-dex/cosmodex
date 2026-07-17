import "./globals.css";

export const metadata = {
  title: "Cosmodex Matchmaking",
  description: "Real-time 1v1 Coding Battles",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
