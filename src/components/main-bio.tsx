import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SOCIAL from '../constants/social';
import { rhythm } from '../utils/typography';

interface MainBioQueryData {
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

const MainBio: React.FunctionComponent = () => {
  const data = useStaticQuery<MainBioQueryData>(graphql`
    query MainBioQuery {
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
          <span role="img" aria-label="woman technologist">
            👩🏻‍💻
          </span>{' '}
          Hello! Lauren Tan is a leader, speaker, and software engineer{' '}
          <span role="img" aria-label="sparkles">
            ✨
          </span>
        </h1>
        <ul className="horizontal-links" style={{ marginBottom: rhythm(1) }}>
          {SOCIAL.map((s) => (
            <li key={s.kind}>
              <a className="u-no-box-shadow" href={s.url}>
                <FontAwesomeIcon
                  icon={s.icon}
                  color="var(--gray)"
                  title={`Link to my ${s.kind}`}
                />
              </a>
            </li>
          ))}
        </ul>
        <p>
          Hi there! I&apos;m a polyglot Software Engineer at Facebook and
          frequent public speaker. Previously, I was an Engineering Manager at
          Netflix. I&apos;m the
          <span role="img" aria-label="woman surfing">
            🏄🏻‍♀️
          </span>{' '}
          webmaster of this little website. I started my career in tech as a UI
          designer, but the allure of learning to bring my designs to life was
          too enticing. I write about leadership, JavaScript, TypeScript,
          Elixir, Rust, and more. Welcome!
        </p>
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

export default MainBio;
