import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
  isTool?: boolean; // Flag to inject SoftwareApplication JSON-LD
}

export function SeoHead({ title, description, canonical, isTool = false }: SeoProps) {
  useEffect(() => {
    const fullTitle = `${title} | DevKit Pro`;
    document.title = fullTitle;
    
    // Manage Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Manage Open Graph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', fullTitle);

    // Manage JSON-LD Structured Data for Tools
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
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      };
      scriptTag.text = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

  }, [title, description, canonical, isTool]);

  return null;
}
