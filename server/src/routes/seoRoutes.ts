import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { config } from '../config/env';

const router = Router();

/**
 * Escape special XML characters
 */
const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
};

/**
 * GET /sitemap.xml
 * Dynamic real-time XML Sitemap with Google Image extensions
 */
router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const baseUrl = config.CLIENT_URL.replace(/\/+$/, '');
    const products = await Product.find({ active: true })
      .select('name slug team type season images updatedAt createdAt')
      .lean();

    const staticRoutes = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/shop`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/shop?league=Premier+League`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/shop?league=La+Liga`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/shop?league=Serie+A`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/shop?type=Retro`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/shop?type=Fan+Version`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/shop?type=Player+Version`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/about`, priority: '0.6', changefreq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // 1. Static URLs
    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(route.loc)}</loc>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // 2. Dynamic Product URLs with Image Metadata
    for (const prod of products) {
      const productUrl = `${baseUrl}/shop/${encodeURIComponent(prod.slug)}`;
      const lastModDate = (prod as any).updatedAt
        ? new Date((prod as any).updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(productUrl)}</loc>\n`;
      xml += `    <lastmod>${lastModDate}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.85</priority>\n`;

      // Google Image extension for rich image search indexing
      if (prod.images?.front) {
        const imageUrl = prod.images.front.startsWith('http')
          ? prod.images.front
          : `${baseUrl}${prod.images.front}`;
        const imageTitle = `${prod.name} ${prod.team} ${prod.season} Kit`;

        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(imageUrl)}</image:loc>\n`;
        xml += `      <image:title>${escapeXml(imageTitle)}</image:title>\n`;
        xml += `      <image:caption>${escapeXml(`Official ${prod.name} available at Jersey World`)}</image:caption>\n`;
        xml += `    </image:image>\n`;
      }

      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (error) {
    return res.status(500).send('<!-- Error generating dynamic sitemap -->');
  }
});

/**
 * GET /robots.txt
 * Dynamic Robots.txt based on runtime client URL
 */
router.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = config.CLIENT_URL.replace(/\/+$/, '');
  const robots = `# Dynamic Robots.txt for Jersey World
User-agent: *
Allow: /
Allow: /shop
Allow: /shop/*
Allow: /about
Allow: /sitemap.xml

# Disallow protected and transactional paths
Disallow: /account/
Disallow: /account/*
Disallow: /checkout
Disallow: /order-success/*
Disallow: /admin/
Disallow: /admin/*
Disallow: /login
Disallow: /register
Disallow: /api/

# Canonical Sitemap reference
Sitemap: ${baseUrl}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400');
  return res.status(200).send(robots);
});

export default router;
