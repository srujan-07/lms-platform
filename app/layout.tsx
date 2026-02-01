import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/auth/stackauth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AI & Cybersecurity LMS",
    description: "Learning Management System for AI and Cybersecurity Education",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <StackProvider app={stackServerApp}>
                    <StackTheme>
                        {children}
                    </StackTheme>
                </StackProvider>
            </body>
        </html>
    );
}
