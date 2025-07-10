import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Grindsheet - DSA Problem Tracker",
  description:
    "Track your Data Structures and Algorithms practice progress efficiently",
  keywords: [
    "DSA",
    "algorithms",
    "data structures",
    "coding practice",
    "interview prep",
  ],
  authors: [{ name: "Grindsheet Team" }],
  creator: "Grindsheet",
  publisher: "Grindsheet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicons/favicon.ico", // Default favicon
    shortcut: "/favicons/favicon-16x16.png", // Shortcut icon
    apple: "/favicons/apple-touch-icon.png", // Apple Touch Icon
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://grindsheet.xyz/",
    title: "Grindsheet - DSA Problem Tracker",
    description:
      "Track your Data Structures and Algorithms practice progress efficiently",
    siteName: "Grindsheet",
    images: [
      {
        url: "/grindsheet-logo.png",
        width: 512,
        height: 512,
        alt: "Grindsheet Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grindsheet - DSA Problem Tracker",
    description:
      "Track your Data Structures and Algorithms practice progress efficiently",
    images: ["/grindsheet-logo.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.seline.com/seline.js"
          data-token="e9bc725355b30cb"
          strategy="afterInteractive"
        />
      </head>
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        className={`
        min-h-screen bg-background font-sans antialiased
        // These often fix v0 alignment differences:
        leading-normal tracking-normal text-base ${jetBrainsMono.className}
      `}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
