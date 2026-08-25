module.exports = {
  siteMetadata: {
    title: `no.lol`,
    author: `Lauren Tan`,
    description: `Lauren Tan's personal blog`,
    siteUrl: `https://www.no.lol/`,
    social: {
      github: `poteto`,
      twitter: `potetotes`,
      linkedin: `laurenelizabethtan`,
      medium: `sugarpirate`,
    },
  },
  jsxRuntime: `automatic`,
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/talks`,
        name: `talks`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
              backgroundColor: `transparent`,
              withWebp: true,
              showCaptions: true,
              quality: 80,
            },
          },
          `gatsby-remark-embedder`,
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-code-titles`,
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          `gatsby-remark-external-links`,
        ],
      },
    },
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-135472857-1`,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            title: `no.lol`,
            output: `/rss.xml`,
            query: `
              {
                allMarkdownRemark(
                  sort: { frontmatter: { date: DESC } }
                  filter: {
                    frontmatter: { published: { eq: true }, kind: { eq: "post" } }
                  }
                  limit: 1000
                ) {
                  nodes {
                    excerpt
                    html
                    fields {
                      slug
                    }
                    frontmatter {
                      title
                      date
                    }
                  }
                }
              }
            `,
            serialize: ({ query: { site, allMarkdownRemark } }) =>
              allMarkdownRemark.nodes.map((node) => {
                const url = new URL(
                  node.fields.slug,
                  site.siteMetadata.siteUrl
                ).toString();
                return {
                  ...node.frontmatter,
                  description: node.excerpt,
                  url,
                  guid: url,
                  custom_elements: [{ 'content:encoded': node.html }],
                };
              }),
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `no.lol`,
        short_name: `no.lol`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#ff7a60`,
        display: `minimal-ui`,
        icon: `content/assets/donut-solid.png`,
      },
    },
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-plugin-typescript`,
    {
      resolve: `gatsby-plugin-web-font-loader`,
      options: {
        typekit: { id: `ldl2nlv` },
      },
    },
    {
      resolve: 'gatsby-plugin-react-svg',
      options: {
        rule: {
          include: /assets/,
        },
      },
    },
    `gatsby-plugin-netlify`, // must be last
  ],
};
