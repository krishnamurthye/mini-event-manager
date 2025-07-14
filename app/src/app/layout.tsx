// app/layout.tsx
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import ApolloWrapper from "mini-event/lib/ApolloWrapper";
import Header from "./components/Header";
import GlobalAuthHandler from "mini-event/lib/components/GlobalAuthHandler";
import {Toaster} from 'react-hot-toast';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Mini Event Manager",
    description: "GraphQL + Next.js app",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ApolloWrapper>
            <GlobalAuthHandler/> {/* Handles auth error globally */}
            <Header/>
            <main>{children}</main>
            <Toaster position="top-center"/>
        </ApolloWrapper>
        </body>
        </html>
    );
}