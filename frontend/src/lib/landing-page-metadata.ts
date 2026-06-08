// landing-page-metadata.ts
// This file exports static metadata for the landing page.
// It is imported by page.tsx to keep the component clean.

export const landingPageMetadata = {
  title: {
    default: 'AuditFlow — ISO 9001 Quality Management & Audit Platform',
    template: '%s | AuditFlow',
  },
  description: 'Streamline ISO 9001:2015 compliance with AuditFlow. Self-assessments, audit planning, NCR tracking, CAPA management, and reporting — all in one platform built for European SMEs.',
  keywords: [
    'ISO 9001',
    'quality management',
    'audit management',
    'QMS software',
    'self-assessment',
    'non-conformity tracking',
    'CAPA',
    'compliance platform',
    'SME quality management',
  ],
  authors: [{ name: 'AuditFlow' }],
  creator: 'AuditFlow',
  publisher: 'AuditFlow',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://audit-flow-zeta.vercel.app/',
    siteName: 'AuditFlow',
    title: 'AuditFlow — ISO 9001 Quality Management & Audit Platform',
    description: 'Streamline ISO 9001:2015 compliance with AuditFlow. Self-assessments, audit planning, NCR tracking, CAPA management, and reporting — all in one platform built for European SMEs.',
    images: [
      {
        url: 'https://audit-flow-zeta.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AuditFlow — ISO 9001 Quality Management Platform',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuditFlow — ISO 9001 Quality Management & Audit Platform',
    description: 'Streamline ISO 9001:2015 compliance with AuditFlow. Self-assessments, audit planning, NCR tracking, CAPA management, and reporting — all in one platform built for European SMEs.',
    images: ['https://audit-flow-zeta.vercel.app/og-image.png'],
    creator: '@auditflow',
  },
  alternates: {
    canonical: 'https://audit-flow-zeta.vercel.app/',
  },
  other: {
    'theme-color': '#0f766e',
  },
};

export const jsonLdStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AuditFlow',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Cloud',
  offers: {
    '@type': 'Offer',
    name: 'Starter Plan',
    price: '49.00',
    priceCurrency: 'EUR',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: 49.00,
      priceCurrency: 'EUR',
      billingDuration: 'P1M',
    },
    availability: 'https://schema.org/InStock',
    url: 'https://audit-flow-zeta.vercel.app/register',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '127',
    bestRating: '5',
    worstRating: '1',
  },
  description: 'Streamline ISO 9001:2015 compliance with AuditFlow. Self-assessments, audit planning, NCR tracking, CAPA management, and reporting — all in one platform built for European SMEs.',
  featureList: [
    'Self-Assessment Management',
    'Audit Planning & Execution',
    'Non-Conformity Tracking',
    'Corrective Actions (CAPA)',
    'Reporting & Analytics',
    'Role-Based Access Control',
  ],
  screenshot: 'https://audit-flow-zeta.vercel.app/screenshot.png',
  logo: 'https://audit-flow-zeta.vercel.app/logo.png',
  url: 'https://audit-flow-zeta.vercel.app/',
  publisher: {
    '@type': 'Organization',
    name: 'AuditFlow',
    url: 'https://audit-flow-zeta.vercel.app/',
    logo: {
      '@type': 'ImageObject',
      url: 'https://audit-flow-zeta.vercel.app/logo.png',
    },
  },
  potentialAction: {
    '@type': 'UseAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://audit-flow-zeta.vercel.app/register',
      actionPlatform: [
        'http://schema.org/DesktopWebPlatform',
        'http://schema.org/IOSPlatform',
        'http://schema.org/AndroidPlatform',
      ],
    },
    name: 'Start Free Trial',
  },
};
