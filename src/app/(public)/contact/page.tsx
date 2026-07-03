import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact ORIGIN | Get in Touch",
  description:
    "Get in touch with ORIGIN. Contact us for reservations, inquiries, or feedback. We're here to serve you.",
  openGraph: {
    title: "Contact ORIGIN | Get in Touch",
    description:
      "Get in touch with ORIGIN. Contact us for reservations, inquiries, or feedback.",
    url: "https://origin.sa/contact",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ORIGIN Restaurant" }],
  },
  alternates: { canonical: "https://origin.sa/contact" },
};

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://origin.sa" },
          { name: "Contact", url: "https://origin.sa/contact" },
        ]}
      />
      <ContactClient />
    </>
  );
}
