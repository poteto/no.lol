import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';

import { rhythm } from '../utils/typography';

interface BioQueryData {
  avatar: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData;
    };
  };
  site: {
    siteMetadata: {
      author: string;
      social: {
        twitter: string;
      };
    };
  };
}

const Bio: React.FunctionComponent = () => {
  const data = useStaticQuery<BioQueryData>(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic-optimized.jpg/" }) {
        childImageSharp {
          gatsbyImageData(width: 50, height: 50, quality: 90, layout: FIXED)
        }
      }
      site {
        siteMetadata {
          author
          social {
            twitter
          }
        }
      }
    }
  `);
  const { author, social } = data.site.siteMetadata;

  return (
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(2.5),
      }}
    >
      <GatsbyImage
        image={data.avatar.childImageSharp.gatsbyImageData}
        alt={author}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 50,
          borderRadius: `100%`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <p>
        Written by <strong>{author}</strong> who lives and works in the Bay Area
        building useful things.
        {` `}
        <a href={`https://twitter.com/${social.twitter}`}>
          You should follow her on Twitter
        </a>
      </p>
    </div>
  );
};

export default Bio;
