import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SeoHeadProps {
  title: string;
  description: string;
  isTool?: boolean;
  image?: string;
}

export function SeoHead({ title, description, isTool = false, image = '/logo.svg' }: SeoHeadProps) {
  const location = useLocation();
  const baseUrl = 'https://visatk.us';
  const currentUrl = `${baseUrl}${location.pathname}`;
  const siteName = 'Visatk';
  const fullTitle = isTool ? `${title} | ${siteName} Tools` : `${title} | ${siteName}`;

  useEffect(() => {
    document.title = fullTitle;
    
    const setMetaTag = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('name=')) {
          element.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] || '');
        } else if (selector.includes('property=')) {
          element.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] || '');
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // Deep SEO Meta
    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // OpenGraph / Social Graphing
    setMetaTag('meta[property="og:type"]', 'content', isTool ? 'product' : 'website');
    setMetaTag('meta[property="og:url"]', 'content', currentUrl);
    setMetaTag('meta[property="og:title"]', 'content', fullTitle);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:image"]', 'content', `${baseUrl}${image}`);
    setMetaTag('meta[property="og:site_name"]', 'content', siteName);

    // Twitter Card
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMetaTag('meta[name="twitter:url"]', 'content', currentUrl);
    setMetaTag('meta[name="twitter:title"]', 'content', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:image"]', 'content', `${baseUrl}${image}`);

    // JSON-LD Structured Data for Google Rich Snippets
    let structuredData = document.querySelector('#json-ld');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.setAttribute('id', 'json-ld');
      structuredData.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredData);
    }
    
    const schema = isTool ? {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": fullTitle,
      "description": description,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web",
      "url": currentUrl,
      "publisher": { "@type": "Organization", "name": siteName, "url": baseUrl }
    } : {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "url": baseUrl,
      "description": description
    };
    
    structuredData.textContent = JSON.stringify(schema);

  }, [fullTitle, description, currentUrl, isTool, image, baseUrl]);

  return null;
}
