export type NavLink = {
  label: string;
  href: string;
};

export const mainNav: NavLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Skin", href: "/shop?collection=Skin" },
  { label: "Hair", href: "/shop?collection=Hair" },
  { label: "Body", href: "/shop?collection=Body" },
  { label: "Rituals", href: "/rituals" },
  { label: "Our Story", href: "/our-story" },
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Skin", href: "/shop?collection=Skin" },
      { label: "Hair", href: "/shop?collection=Hair" },
      { label: "Body", href: "/shop?collection=Body" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/our-story" },
      { label: "Contact", href: "/contact" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Account", href: "/account" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Follow",
    links: [{ label: "Instagram", href: "https://www.instagram.com/skinshopofficial" }],
  },
];

export const brandLine = "Rooted in Kashmir. Made for Your Ritual.";
export const logoLine = "To End Skin Problems.";
export const announcementMessage = brandLine;

// As supplied by the business — the tagline printed on packaging.
export const productTagline = "Food For Your Skin";

export const founderName = "Mumin Bhat";
export const founderQuote = "The Skin Shop is the name, where results claim the fame.";

// As supplied by the business.
export const foundedYear = 2019;

export const brandPillars: string[] = [
  "Organic & Botanical",
  "Cruelty-Free",
  "Handcrafted in Kashmir",
  "Ships Across India",
];
