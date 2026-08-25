import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube, faSpeakerDeck } from '@fortawesome/free-brands-svg-icons';
import { rhythm } from '../utils/typography';

interface SpeakerBioQueryData {
  avatar: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData;
    };
  };
  site: {
    siteMetadata: {
      author: string;
    };
  };
}

const SpeakerBio: React.FunctionComponent = () => {
  const data = useStaticQuery<SpeakerBioQueryData>(graphql`
    query SpeakerBioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic-optimized.jpg/" }) {
        childImageSharp {
          gatsbyImageData(width: 250, height: 250, quality: 95, layout: FIXED)
        }
      }
      site {
        siteMetadata {
          author
        }
      }
    }
  `);
  const { author } = data.site.siteMetadata;

  return (
    <div
      className="main-bio-container"
      style={{
        marginBottom: rhythm(2.5),
      }}
    >
      <div className="main-bio">
        <h1 className="heroine" style={{ marginBottom: rhythm(1 / 5) }}>
          <span role="img" aria-label="woman teacher">
            👩🏻‍🏫
          </span>{' '}
          Looking for a speaker for your upcoming tech conference?
        </h1>
        <ul className="horizontal-links" style={{ marginBottom: rhythm(1) }}>
          <li>
            <a
              className="u-no-box-shadow"
              href="http://bit.ly/talks-by-lauren-tan"
            >
              <FontAwesomeIcon
                icon={faYoutube}
                color="var(--gray)"
                title={`YouTube playlist with all my talks`}
              />
            </a>
          </li>
          <li>
            <a
              className="u-no-box-shadow"
              href="https://speakerdeck.com/poteto"
            >
              <FontAwesomeIcon
                icon={faSpeakerDeck}
                color="var(--gray)"
                title={`Link to all my slide decks`}
              />
            </a>
          </li>
        </ul>
        <p>
          Lauren Tan is a Software Engineer at Facebook. Previously, she was an
          Engineering Manager at Netflix. She&apos;s spoken at more than 15
          talks at small to large conferences. She speaks about TypeScript,
          JavaScript, React, GraphQL, Elixir/Phoenix, Microservices, engineering
          leadership and/or management.
        </p>
        <a className="squiggly" href="mailto:arr@sugarpirate.com">
          Get in touch!
        </a>
      </div>
      <GatsbyImage
        className="avatar"
        image={data.avatar.childImageSharp.gatsbyImageData}
        alt={author}
        style={{
          marginBottom: 0,
          minWidth: 250,
          borderRadius: `100%`,
          border: `8px solid var(--blue)`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
    </div>
  );
};

export default SpeakerBio;
