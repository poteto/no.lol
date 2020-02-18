import React from 'react';
import { graphql } from 'gatsby';

import Bio from '../components/bio';
import Layout from '../components/layout';
import SEO from '../components/seo';
import { rhythm, scale } from '../utils/typography';

interface TalkTemplateProps {
  data: any;
  pageContext: any;
  location: Location;
}

const TalkTemplate: React.FunctionComponent<TalkTemplateProps> = ({
  data,
  location,
}) => {
  const { markdownRemark: talk, site } = data;
  const { title: siteTitle } = site.siteMetadata;
  const slug = talk.fields.slug;
  const fileName = `${slug.substring(0, slug.length - 1)}.md`;
  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={`${talk.frontmatter.title}`}
        description={talk.frontmatter.description || talk.excerpt}
        keywords={talk.frontmatter.keywords}
      />
      <div className="talk">
        <h1 style={{ marginTop: 0 }}>
          {talk.frontmatter.published ? '' : 'DRAFT: '}
          {talk.frontmatter.conference}&mdash;{talk.frontmatter.title}
        </h1>
        <small
          style={{
            ...scale(-1 / 5),
            display: `block`,
            marginTop: rhythm(-1),
          }}
          title={talk.frontmatter.shortDate}
        >
          {talk.frontmatter.shortDate} &middot; {talk.frontmatter.location}
        </small>
        <div style={{ marginTop: rhythm(0.5) }} className="u-video-wrapper">
          <iframe
            width="100%"
            height="auto"
            src={talk.frontmatter.recording}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        {talk.frontmatter.slides ? (
          <p>
            <a className="squiggly" href={talk.frontmatter.slides}>
              View slides
            </a>
          </p>
        ) : (
          ''
        )}
        <div
          style={{ marginTop: rhythm(1) }}
          dangerouslySetInnerHTML={{ __html: talk.html }}
        />
        <hr />
        <div style={{ marginBottom: rhythm(1) }}>
          <small>
            <strong>Abstract:</strong> {talk.frontmatter.abstract}
          </small>
        </div>
        <small>
          <a
            target="_blank"
            rel="nofollow noopener noreferrer"
            href={`https://github.com/poteto/no.lol/tree/master/content/talks${fileName}`}
          >
            Edit this page on GitHub
          </a>
        </small>
        <hr
          style={{
            margin: `${rhythm(1)} 0`,
          }}
        />
        <Bio />
      </div>
    </Layout>
  );
};

export default TalkTemplate;

export const pageQuery = graphql`
  query TalkBySlug($slug: String!) {
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
        published
      }
    }
  }
`;
