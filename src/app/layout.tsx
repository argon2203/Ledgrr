import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ledgr | AI Conversational Back-Office & GST Accounting Assistant",
  description: "Multimodal back-office and GST accounting assistant for small businesses in India. Features conversational accounting in Hinglish, voice notes, bill OCR, real-time GSTR-3B tax computation, daybook, inventory stock tracking, and Udhaar khata with WhatsApp payment reminders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col h-screen overflow-hidden bg-slate-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}
