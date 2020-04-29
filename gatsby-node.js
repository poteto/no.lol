const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);

async function createSpeakingPages(graphql, createPage) {
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          filter: { frontmatter: { kind: { eq: "talk" } } }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  );
  if (result.errors) {
    throw result.errors;
  }

  const talks = result.data.allMarkdownRemark.edges;

  talks.forEach((talk) => {
    createPage({
      path: `speaking${talk.node.fields.slug}`,
      component: path.resolve(`./src/templates/talk.tsx`),
      context: {
        slug: talk.node.fields.slug,
      },
    });
  });
}

async function createBlogPostPages(graphql, createPage) {
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          filter: { frontmatter: { kind: { eq: "post" } } }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  );
  if (result.errors) {
    throw result.errors;
  }

  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;

    createPage({
      path: post.node.fields.slug,
      component: path.resolve(`./src/templates/blog-post.tsx`),
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    });
  });
}

exports.createPages = async ({ graphql, actions }) => {
  await createBlogPostPages(graphql, actions.createPage);
  await createSpeakingPages(graphql, actions.createPage);
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};
