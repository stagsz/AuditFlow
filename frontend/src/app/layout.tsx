import type { Metadata, Viewport } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif-display',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0e1117',
};

export const metadata: Metadata = {
  title: {
    default: 'AuditFlow — Streamline Your Audit Journey',
    template: '%s | AuditFlow',
  },
  description: 'AuditFlow replaces scattered spreadsheets and email chains with a single platform for ISO 9001 self-assessments, audit execution, non-conformity tracking, and corrective actions. Built for European SMEs.',
  keywords: [
    'ISO 9001',
    'quality management',
    'audit management',
    'NCR tracking',
    'CAPA',
    'self-assessment',
    'compliance software',
    'SME quality management',
  ],
  authors: [{ name: 'Greisz Consulting', url: 'https://greisz.se' }],
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
    url: 'https://audit-flow-zeta.vercel.app',
    siteName: 'AuditFlow',
    title: 'AuditFlow — Streamline Your Audit Journey',
    description: 'AuditFlow replaces scattered spreadsheets and email chains with a single platform for ISO 9001 self-assessments, audit execution, NCR tracking, and CAPA.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AuditFlow — ISO 9001 Quality Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuditFlow — Streamline Your Audit Journey',
    description: 'AuditFlow replaces spreadsheets with a single platform for ISO 9001 self-assessments, audits, NCR tracking, and CAPA.',
    images: ['/og-image.png'],
    creator: '@auditflow_io',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'theme-color': '#0e1117',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AuditFlow',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Cloud',
  offers: {
    '@type': 'Offer',
    price: '49',
    priceCurrency: 'EUR',
    priceSpecification: {
      '@type': 'PriceSpecification',
      price: '49',
      priceCurrency: 'EUR',
      billingDuration: 'P1M',
    },
    availability: 'https://schema.org/InStock',
  },
  description: 'ISO 9001:2015 Quality Management & Audit Platform for SMEs. Self-assessments, audit execution, NCR tracking, CAPA management, and compliance reporting.',
  featureList: [
    'Self-Assessment Management',
    'Audit Planning & Execution',
    'Non-Conformity Tracking',
    'Corrective Actions (CAPA)',
    'Reporting & Analytics',
    'Role-Based Access Control',
  ],
  publisher: {
    '@type': 'Organization',
    name: 'Greisz Consulting',
    url: 'https://greisz.se',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '24',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerifDisplay.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}