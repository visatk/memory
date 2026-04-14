import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
  isTool?: boolean;
}

export function SeoHead({ title, description, canonical, isTool = false }: SeoProps) {
  useEffect(() => {
    const fullTitle = `${title} | DevKit Pro`;
    document.title = fullTitle;
    
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Standard SEO
    setMetaTag('name', 'description', description);
    
    // Open Graph (Facebook, LinkedIn, Discord)
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', 'website');
    
    // Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);

    // JSON-LD Structured Data
    const scriptId = 'seo-json-ld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (isTool) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": title,
        "operatingSystem": "Web",
        "applicationCategory": "DeveloperApplication",
        "description": description,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      };
      scriptTag.text = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, canonical, isTool]);

  return null;
}
