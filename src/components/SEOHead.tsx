/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
  schema?: Record<string, any>;
}

export default function SEOHead({ title, description, keywords, canonicalUrl, schema }: SEOHeadProps) {
  useEffect(() => {
    // 1. Update Title
    document.title = `${title} | MADECC Group Construction`;

    // 2. Manage General Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // 3. Manage Open Graph (OG) Tags
    updateMetaTag('og:title', `${title} | MADECC Group`, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:image', '/src/assets/images/luxury_residential_1782866705938.jpg', 'property');

    // 4. Manage Twitter Cards
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', `${title} | MADECC Group`);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', '/src/assets/images/luxury_residential_1782866705938.jpg');

    // 5. Canonical Link
    const finalCanonical = canonicalUrl || window.location.href;
    let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', finalCanonical);

    // 6. Schema.org LD-JSON injection
    const existingScript = document.getElementById('seo-schema-script');
    if (existingScript) {
      existingScript.remove();
    }

    if (schema) {
      const script = document.createElement('script');
      script.id = 'seo-schema-script';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      const scriptToRemove = document.getElementById('seo-schema-script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, schema]);

  return null; // Side-effect only component
}

function updateMetaTag(nameOrProperty: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attribute}='${nameOrProperty}']`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, nameOrProperty);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}
