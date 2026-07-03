import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import ReservationsClient from "./ReservationsClient";

export const metadata: Metadata = {
  title: "Reservations | Book Your Table",
  description:
    "Reserve your table at ORIGIN. Experience premium dining with easy online booking for any occasion.",
  openGraph: {
    title: "Reservations | Book Your Table at ORIGIN",
    description:
      "Reserve your table at ORIGIN. Experience premium dining with easy online booking.",
    url: "https://origin.sa/reservations",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ORIGIN Restaurant" }],
  },
  alternates: { canonical: "https://origin.sa/reservations" },
};

export default function ReservationsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://origin.sa" },
          { name: "Reservations", url: "https://origin.sa/reservations" },
        ]}
      />
      <ReservationsClient />
    </>
  );
}
