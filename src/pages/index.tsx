import React from 'react';
import { Link, graphql } from 'gatsby';
import Image from 'gatsby-image';

import MainBio from '../components/main-bio';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Pills from '../components/pills';
import { rhythm } from '../utils/typography';
import pluralizeReadingTime from '../utils/pluralize-reading-time';
import KEYWORDS from '../constants/seo-keywords';

interface BlogIndexProps {
  data: any;
  location: Location;
}

const BlogIndex: React.FunctionComponent<BlogIndexProps> = ({
  data,
  location,
}) => {
  const siteTitle = data.site.siteMetadata.title;
  const posts = data.allMarkdownRemark.edges;

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="Writing" keywords={KEYWORDS} />
      <MainBio />
      {posts.map(({ node }: { node: any }) => {
        const title = node.frontmatter.title || node.fields.slug;
        const imageAuthor = node.frontmatter.coverAuthor;
        const { fluid } = node.frontmatter.cover.childImageSharp;
        return (
          <div
            className="blog-post-preview"
            style={{ marginBottom: rhythm(1) }}
            key={node.fields.slug}
          >
            <h2
              style={{
                marginBottom: 0,
              }}
            >
              <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                {title}
              </Link>
            </h2>
            <small title={node.frontmatter.longDate}>
              {node.frontmatter.shortDate} &middot;{' '}
              {pluralizeReadingTime(node.timeToRead)}
            </small>
            <Pills items={node.frontmatter.categories} />
            <Image
              style={{ marginTop: rhythm(0.5), marginBottom: rhythm(0.5) }}
              fluid={fluid}
              alt={imageAuthor}
            />
            <p
              dangerouslySetInnerHTML={{
                __html: node.frontmatter.description || node.excerpt,
              }}
            />
            <Link className={`squiggly`} to={node.fields.slug}>
              Read more
            </Link>
          </div>
        );
      })}
    </Layout>
  );
};

export default BlogIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { published: { eq: true }, kind: { eq: "post" } } }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          timeToRead
          frontmatter {
            shortDate: date(formatString: "MMMM DD, YYYY")
            longDate: date(formatString: "MMMM DD, YYYY, h:mm:ss a")
            title
            description
            categories
            cover {
              childImageSharp {
                fluid(maxWidth: 1200) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
        }
      }
    }
  }
`;
