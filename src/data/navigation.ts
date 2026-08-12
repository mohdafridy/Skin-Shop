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
    links: [{ label: "Instagram", href: "#" }],
  },
];

export const brandLine = "Kashmir, Bottled Beautifully.";
export const logoLine = "To End Skin Problems.";
export const announcementMessage = brandLine;
