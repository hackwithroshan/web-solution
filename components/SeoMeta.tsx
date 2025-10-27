import React, { useEffect } from 'react';

interface SeoMetaProps {
  title: string;
  description: string;
}

const SeoMeta: React.FC<SeoMetaProps> = ({ title, description }) => {
  useEffect(() => {
    // Update the document title
    if (title) {
        document.title = title;
    }

    // Update the meta description
    if (description) {
        let metaDescription = document.querySelector('meta[name="description"]');

        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }

        metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return null; // This component doesn't render anything
};

export default SeoMeta;