import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

interface Meta {
  name?: string;
  property?: string;
  content: string;
}

interface SEOProps {
  description?: string;
  lang?: string;
  meta?: Meta[];
  keywords?: string[];
  title: string;
}

interface SEOQueryData {
  site: {
    siteMetadata: {
      title: string;
      description: string;
      author: string;
    };
  };
}

// Rendered from a page's `Head` export (Gatsby Head API), so it may only
// return document head elements.
const SEO: React.FunctionComponent<SEOProps> = ({
  description,
  lang = 'en',
  meta = [],
  keywords = [],
  title,
}) => {
  const { site } = useStaticQuery<SEOQueryData>(graphql`
    query SeoQuery {
      site {
        siteMetadata {
          title
          description
          author
        }
      }
    }
  `);

  const metaDescription = description || site.siteMetadata.description;
  const fullTitle = `${title} | ${site.siteMetadata.title} - A blog by ${site.siteMetadata.author}`;
  const metaTags: Meta[] = [
    {
      name: `description`,
      content: metaDescription,
    },
    {
      property: `og:title`,
      content: title,
    },
    {
      property: `og:description`,
      content: metaDescription,
    },
    {
      property: `og:type`,
      content: `website`,
    },
    {
      name: `twitter:card`,
      content: `summary`,
    },
    {
      name: `twitter:creator`,
      content: site.siteMetadata.author,
    },
    {
      name: `twitter:title`,
      content: title,
    },
    {
      name: `twitter:description`,
      content: metaDescription,
    },
    ...(keywords.length > 0
      ? [{ name: `keywords`, content: keywords.join(`, `) }]
      : []),
    ...meta,
  ];

  return (
    <>
      <html lang={lang} />
      <title>{fullTitle}</title>
      {metaTags.map(({ name, property, content }) => (
        <meta
          key={name ?? property}
          name={name}
          property={property}
          content={content}
        />
      ))}
    </>
  );
};

export default SEO;
