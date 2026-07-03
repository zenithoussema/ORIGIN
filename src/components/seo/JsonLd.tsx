export interface JsonLdProps {
  type: 'Restaurant' | 'Menu' | 'BreadcrumbList' | 'FAQPage' | 'WebSite' | 'Organization';
  data: Record<string, unknown>;
}

export function JsonLd({ type, data }: JsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function RestaurantJsonLd() {
  return (
    <JsonLd
      type="Restaurant"
      data={{
        name: 'ORIGIN',
        description: 'Premium Restaurant & Café - Experience culinary excellence.',
        url: 'https://origin.sa',
        telephone: '+966-50-123-4567',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'SA',
          addressLocality: 'Riyadh',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 24.7136,
          longitude: 46.6753,
        },
        image: 'https://origin.sa/og-image.jpg',
        priceRange: '$$',
        servesCuisine: ['Coffee', 'Fine Dining', 'Desserts'],
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '08:00',
            closes: '23:00',
          },
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '256',
        },
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      type="WebSite"
      data={{
        name: 'ORIGIN',
        url: 'https://origin.sa',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://origin.sa/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      type="Organization"
      data={{
        name: 'ORIGIN',
        url: 'https://origin.sa',
        logo: 'https://origin.sa/logo.png',
        sameAs: [],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+966-50-123-4567',
          contactType: 'customer service',
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      type="BreadcrumbList"
      data={{
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <JsonLd
      type="FAQPage"
      data={{
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }}
    />
  );
}
