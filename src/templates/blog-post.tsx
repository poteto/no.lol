import React from 'react';
import { Link, graphql } from 'gatsby';
import Image from 'gatsby-image';

import Bio from '../components/bio';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Pills from '../components/pills';
import { rhythm, scale } from '../utils/typography';
import pluralizeReadingTime from '../utils/pluralize-reading-time';

interface BlogPostTemplateProps {
  data: any;
  pageContext: any;
  location: Location;
}

const BlogPostTemplate: React.FunctionComponent<BlogPostTemplateProps> = ({
  data,
  pageContext,
  location,
}) => {
  const { markdownRemark: post, site } = data;
  const { title: siteTitle } = site.siteMetadata;
  const { previous, next } = pageContext;
  const publicUrl = `https://www.no.lol${post.fields.slug}`;

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={`${post.frontmatter.title}`}
        description={post.frontmatter.description || post.excerpt}
        keywords={post.frontmatter.keywords}
      />
      <div className="blog-post">
        <h1 style={{ marginTop: 0 }}>
          {post.frontmatter.published ? '' : 'DRAFT: '}
          {post.frontmatter.title}
        </h1>
        <small
          style={{
            ...scale(-1 / 5),
            display: `block`,
            marginTop: rhythm(-1),
          }}
          title={post.frontmatter.longDate}
        >
          {post.frontmatter.shortDate} &middot;{' '}
          {pluralizeReadingTime(post.timeToRead)}
        </small>
        <Pills items={post.frontmatter.categories} />
        <Image
          fluid={post.frontmatter.cover.childImageSharp.fluid}
          alt={post.frontmatter.coverAuthor}
          className="u-full-width"
          style={{
            marginTop: rhythm(1),
          }}
        />
        <small>
          Photo by{' '}
          <a href={post.frontmatter.coverOriginalUrl}>
            {post.frontmatter.coverAuthor}
          </a>{' '}
          on{' '}
          <a href="https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
            Unsplash
          </a>
        </small>
        <div
          style={{ marginTop: rhythm(1) }}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <small>
          <a
            target="_blank"
            rel="nofollow noopener noreferrer"
            href={`https://twitter.com/search?q=${publicUrl}`}
          >
            Discuss on Twitter
          </a>{' '}
          &middot;{' '}
          <a
            target="_blank"
            rel="nofollow noopener noreferrer"
            href={`https://github.com/poteto/no.lol/tree/master/content/blog${
              post.fields.slug
            }`}
          >
            Edit this post on GitHub
          </a>
        </small>
        <hr
          style={{
            margin: `${rhythm(1)} 0`,
          }}
        />
        <Bio />

        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </div>
    </Layout>
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      timeToRead
      fields {
        slug
      }
      frontmatter {
        title
        shortDate: date(formatString: "MMMM DD, YYYY")
        longDate: date(formatString: "MMMM DD, YYYY, h:mm:ss a")
        description
        categories
        cover {
          childImageSharp {
            fluid(maxWidth: 1200) {
              ...GatsbyImageSharpFluid
            }
          }
        }
        coverAuthor
        coverOriginalUrl
        keywords
        published
      }
    }
  }
`;
