module.exports = {
  siteMetadata: {
    title: `no.lol`,
    author: `Lauren Tan`,
    description: `Lauren Tan's personal blog`,
    siteUrl: `https://www.no.lol/`,
    social: {
      github: `poteto`,
      twitter: `sugarpirate_`,
      linkedin: `laurenelizabethtan`,
      medium: `sugarpirate`,
    },
  },
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
            },
          },
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
          {
            resolve: `@weknow/gatsby-remark-twitter`,
            options: {
              align: `center`,
            },
          },
          `gatsby-remark-external-links`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-135472857-1`,
      },
    },
    `gatsby-plugin-feed`,
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
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-plugin-typescript`,
    {
      resolve: `gatsby-plugin-favicon`,
      options: { logo: './static/favicon.png' },
    },
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
    `gatsby-plugin-netlify-cache`,
    `gatsby-plugin-netlify`, // must be last
  ],
};
