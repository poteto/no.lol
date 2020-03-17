import React from 'react';
import { Link, graphql } from 'gatsby';

import Layout from '../components/layout';
import SEO from '../components/seo';
import SpeakerBio from '../components/speaker-bio';
import { rhythm } from '../utils/typography';
import KEYWORDS from '../constants/seo-keywords';

interface SpeakingIndexProps {
  data: any;
  location: Location;
}

const SpeakingIndex: React.FunctionComponent<SpeakingIndexProps> = ({
  data,
  location,
}) => {
  const siteTitle = data.site.siteMetadata.title;
  const talks = data.allMarkdownRemark.edges;

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="Speaking" keywords={KEYWORDS} />
      <SpeakerBio />
      {talks.map(({ node }: { node: any }) => {
        const title = node.frontmatter.title || node.fields.slug;
        const relativeSlug = `/speaking${node.fields.slug}`;
        return (
          <div
            className="talk-preview"
            style={{ marginBottom: rhythm(1) }}
            key={node.fields.slug}
          >
            <h2
              style={{
                marginBottom: 0,
              }}
            >
              <Link style={{ boxShadow: `none` }} to={relativeSlug}>
                {node.frontmatter.conference}&mdash;{title}
              </Link>
            </h2>
            <small title={node.frontmatter.shortDate}>
              {node.frontmatter.shortDate} &middot; {node.frontmatter.location}
            </small>
            <div
              style={{ marginTop: rhythm(0.5), marginBottom: rhythm(0.5) }}
              className="u-video-wrapper"
            >
              <iframe
                width="100%"
                height="auto"
                src={node.frontmatter.recording}
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            {node.frontmatter.slides ? (
              <p>
                <a className="squiggly" href={node.frontmatter.slides}>
                  View slides
                </a>
              </p>
            ) : (
              ''
            )}
            <p
              dangerouslySetInnerHTML={{
                __html: node.frontmatter.abstract || node.excerpt,
              }}
            />
          </div>
        );
      })}
    </Layout>
  );
};

export default SpeakingIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { published: { eq: true }, kind: { eq: "talk" } } }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            shortDate: date(formatString: "MMMM DD, YYYY")
            title
            conference
            location
            abstract
            categories
            slides
            recording
          }
        }
      }
    }
  }
`;
