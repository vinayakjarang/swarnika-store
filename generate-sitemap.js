const fs = require('fs');

// Read data.js and extract the PRODUCTS array
const dataContent = fs.readFileSync('./data.js', 'utf8');
const productsMatch = dataContent.match(/const PRODUCTS = (\[[\s\S]*?\]);/);

if (!productsMatch) {
  console.error("Could not find PRODUCTS array in data.js");
  process.exit(1);
}

const PRODUCTS = eval(productsMatch[1]);
const SITE_URL = "https://swarnika.netlify.app";

const urls = [
  `  <url><loc>${SITE_URL}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  ...PRODUCTS.map(p => 
    `  <url><loc>${SITE_URL}/product.html?id=${encodeURIComponent(p.id)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
  )
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

fs.writeFileSync('./sitemap.xml', xml.trim());
console.log(`Generated sitemap.xml with ${PRODUCTS.length + 1} URLs.`);