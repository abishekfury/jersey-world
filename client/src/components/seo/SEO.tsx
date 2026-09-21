import React from 'react';
import { Helmet as HelmetBase } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Helmet = HelmetBase as unknown as React.FC<React.PropsWithChildren<any>>;

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  canonical?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_TITLE = 'JERSEY WORLD — Wear The Game | Authentic Football Jerseys & AI Try-On';
const DEFAULT_DESCRIPTION =
  'Shop authentic club and national team football jerseys with premium player customization, retro kits, and AI Virtual Fitting Room experience. Fast delivery across India.';
const DEFAULT_KEYWORDS =
  'football jerseys, soccer jerseys, authentic jerseys, retro kits, premier league jerseys, real madrid jersey, barcelona jersey, custom jersey printing, AI virtual fitting, india football shop';
const DEFAULT_IMAGE = '/og-image.jpg';
const SITE_NAME = 'Jersey World';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  canonical,
  jsonLd,
  author = 'Jersey World',
  publishedTime,
  modifiedTime,
}) => {
  const location = useLocation();

  const formattedTitle = title
    ? title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://jersey-world.vercel.app';
  const targetCanonical = canonical || `${currentOrigin}${location.pathname}`;
  const absoluteImageUrl = image.startsWith('http') ? image : `${currentOrigin}${image}`;
  const absolutePageUrl = url || targetCanonical;
  const robotsDirective = noIndex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return (
    <Helmet>
      {/* Document Title */}
      <title>{formattedTitle}</title>

      {/* Standard Meta Tags */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsDirective} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={targetCanonical} />

      {/* Open Graph Meta Tags (Facebook, WhatsApp, LinkedIn, Discord) */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:url" content={absolutePageUrl} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:site" content="@jerseyworld_in" />
      <meta name="twitter:creator" content="@jerseyworld_in" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />

      {/* Article / Product Published Dates */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Structured Data (Schema.org JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
export default SEO;
