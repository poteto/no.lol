import React from 'react';
import { Link, graphql } from 'gatsby';
import Image from 'gatsby-image';

import MainBio from '../components/main-bio';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Pills from '../components/pills';
import { rhythm } from '../utils/typography';

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props;
    const siteTitle = data.site.siteMetadata.title;
    const posts = data.allMarkdownRemark.edges;

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title="Writing"
          keywords={[
            `blog`,
            `gatsby`,
            `javascript`,
            `typescript`,
            `elixir`,
            `react`,
            `lauren tan`,
            `engineering manager`,
            `engineering leader`,
          ]}
        />
        <MainBio />
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug;
          const imageAuthor = node.frontmatter.coverAuthor;
          const { fluid } = node.frontmatter.cover.childImageSharp;
          return (
            <div style={{ marginBottom: rhythm(1) }} key={node.fields.slug}>
              <h2
                style={{
                  marginBottom: 0,
                }}
              >
                <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                  {title}
                </Link>
              </h2>
              <small>{node.frontmatter.date}</small>
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
              <Link
                className={`squiggly`}
                style={{ boxShadow: `none` }}
                to={node.fields.slug}
              >
                Read more
              </Link>
            </div>
          );
        })}
      </Layout>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
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
