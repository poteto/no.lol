/**
 * Bio component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import Image from 'gatsby-image';

import { rhythm } from '../utils/typography';

const mainBioQuery = graphql`
  query MainBioQuery {
    avatar: file(absolutePath: { regex: "/profile-pic.png/" }) {
      childImageSharp {
        fixed(width: 250, height: 250) {
          ...GatsbyImageSharpFixed
        }
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
`;

function MainBio() {
  return (
    <StaticQuery
      query={mainBioQuery}
      render={data => {
        const { author } = data.site.siteMetadata;
        return (
          <div
            style={{
              display: `flex`,
              marginBottom: rhythm(2.5),
            }}
          >
            <div style={{ flex: `0 0 80%`, marginRight: rhythm(1) }}>
              <h1 style={{ marginTop: 0 }}>
                👩🏻‍💻 Hello! Lauren Tan is a leader, speaker, and software engineer
              </h1>
              <p>
                Hi there! I&apos;m an Engineering Manager at Netflix,
                accomplished public speaker, and thoughtful engineer at heart.
                As a leader, I strive to listen first, understand second, and
                speak last. Currently, I lead a stunning team in building the
                tools that power Netflix&apos;s content creation studio. We
                invest in technology to help bring great stories from all over
                the world to life, to allow our members to better discover and
                enjoy them, and to deliver them seamlessly in as high a quality
                as possible.
              </p>
            </div>
            <Image
              fixed={data.avatar.childImageSharp.fixed}
              alt={author}
              style={{
                marginRight: rhythm(1 / 2),
                marginBottom: 0,
                minWidth: 250,
                borderRadius: `100%`,
              }}
              imgStyle={{
                borderRadius: `50%`,
              }}
            />
          </div>
        );
      }}
    />
  );
}

export default MainBio;
