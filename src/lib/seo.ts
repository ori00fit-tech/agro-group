export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  type?: 'website' | 'article';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    tags?: string[];
  };
  noindex?: boolean;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export const siteMeta = {
  name: 'Agro Group',
  tagline: 'Excellence agricole, engagement durable',
  url: 'https://agro-group.com',
  defaultImage: '/images/og-default.jpg',
  twitter: '@agrogroup',
  locale: 'fr_FR',
  email: 'contact@agro-group.com',
  phone: '+212 5 00 00 00 00',
  address: {
    street: '123 Boulevard Mohammed V',
    city: 'Casablanca',
    postalCode: '20000',
    country: 'MA',
  },
  socials: {
    linkedin: 'https://linkedin.com/company/agro-group',
    twitter: 'https://twitter.com/agrogroup',
    instagram: 'https://instagram.com/agrogroup',
    facebook: 'https://facebook.com/agrogroup',
  },
};

export function generateOrganizationLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteMeta.name,
    url: siteMeta.url,
    logo: `${siteMeta.url}/images/logo.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteMeta.phone,
      contactType: 'customer service',
      availableLanguage: ['French', 'English', 'Arabic'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteMeta.address.street,
      addressLocality: siteMeta.address.city,
      postalCode: siteMeta.address.postalCode,
      addressCountry: siteMeta.address.country,
    },
    sameAs: Object.values(siteMeta.socials),
  };
}

export function generateBreadcrumbLD(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${siteMeta.url}${item.url}`,
    })),
  };
}
