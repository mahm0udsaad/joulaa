import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { dir } from "i18next";
import { languages } from "../i18n/settings";
import ClientProviders from "@/components/providers"; // Adjust path if needed
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/toaster";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Elegance - Premium Makeup & Cosmetics",
  description:
    "Discover premium makeup and cosmetics products for your beauty routine",
};

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

type RootLayoutProps = {
  children: ReactNode;
  params: {
    lng: string;
  };
};

export default async function RootLayout({
  children,
  params: paramsPromise,
}: {
  children: ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await paramsPromise;

  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={`${inter.className} ${playfair.variable}`}>
        <ClientProviders>
          <Navbar lng={lng} />
          {children}
          <Toaster />
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
