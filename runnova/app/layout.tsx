import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MachineProvider } from "@/lib/MachineProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Runnova — Predictive Maintenance Dashboard",
  description: "AI-powered predictive maintenance for ASEAN SME resilience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-slate-950 text-white antialiased`}
      >
        <MachineProvider>{children}</MachineProvider>
      </body>
    </html>
  );
}
