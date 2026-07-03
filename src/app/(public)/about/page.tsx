import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About ORIGIN | Our Story",
  description:
    "Discover the story behind ORIGIN. A premium restaurant and café dedicated to culinary excellence and unforgettable dining experiences.",
  openGraph: {
    title: "About ORIGIN | Our Story",
    description:
      "Discover the story behind ORIGIN. A premium restaurant and café dedicated to culinary excellence.",
    url: "https://origin.sa/about",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ORIGIN Restaurant" }],
  },
  alternates: { canonical: "https://origin.sa/about" },
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://origin.sa" },
          { name: "About", url: "https://origin.sa/about" },
        ]}
      />
      <AboutClient />
    </>
  );
}
