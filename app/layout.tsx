import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "SkillBridge — Build your next chapter",
  description:
    "A focused learning studio for the skills that move you forward.",
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
