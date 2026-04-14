import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
}

export function SeoHead({ title, description, canonical }: SeoProps) {
  useEffect(() => {
    document.title = `${title} | DevKit Pro`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Optional: Add JSON-LD for SoftwareApplication schema here
  }, [title, description, canonical]);

  return null;
}
