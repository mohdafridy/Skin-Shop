import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { brandLine } from "@/data/navigation";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://theskinshop.example.com"),
  title: {
    default: `The Skin Shop — ${brandLine}`,
    template: "%s | The Skin Shop",
  },
  description:
    "Organic, botanical skincare handcrafted in Kashmir. Discover The Skin Shop's collection of cleansers, serums, creams and rituals rooted in traditional craftsmanship and result-oriented, cruelty-free formulations. Ships across India.",
  openGraph: {
    siteName: "The Skin Shop",
    title: `The Skin Shop — ${brandLine}`,
    description:
      "Organic, botanical skincare handcrafted in Kashmir — cruelty-free, plant-based, result-oriented. Ships across India.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory text-ink">
        <CartProvider>
          <WishlistProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-burgundy focus:px-4 focus:py-2 focus:text-sm focus:text-ivory"
            >
              Skip to content
            </a>
            <AnnouncementBar />
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <WhatsAppButton />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
