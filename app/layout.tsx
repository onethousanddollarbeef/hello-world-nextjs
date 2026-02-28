import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Julia's Hideous Laughter",
    description: "Assignment hub with Week 1, Week 2, and Week 3 pages.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className="antialiased">{children}</body>
        </html>
    );
}