const GithubSlugger = require('github-slugger');

// Posts exported from Medium contain non-breaking spaces inside headings.
// The github-slugger used by older gatsby-remark-autolink-headers turned them
// into hyphens ("not-my-concern"); the current one drops them
// ("not-myconcern"), which changed 88 heading anchors on this site. Recompute
// the ids the old way so existing deep links keep working. Must run after
// gatsby-remark-autolink-headers.

function isAnchor(node) {
  const className =
    (node.data && node.data.hProperties && node.data.hProperties.class) || '';
  return node.type === 'link' && /(^| )anchor( |$)/.test(className);
}

// Same rules as mdast-util-to-string.
function toString(node) {
  if (node.value) return node.value;
  if (node.alt) return node.alt;
  if (node.title) return node.title;
  if (node.children) return node.children.map(toString).join('');
  return '';
}

function visitHeadings(node, callback) {
  if (node.type === 'heading') callback(node);
  if (node.children)
    node.children.forEach((child) => visitHeadings(child, callback));
}

module.exports = ({ markdownAST }) => {
  const slugger = new GithubSlugger();

  visitHeadings(markdownAST, (heading) => {
    const anchor = heading.children.find(isAnchor);
    const text = heading.children
      .filter((child) => child !== anchor)
      .map(toString)
      .join('');
    const id = slugger.slug(text.replace(/\u00a0/g, ' '));

    heading.data = heading.data || {};
    heading.data.hProperties = heading.data.hProperties || {};
    heading.data.htmlAttributes = heading.data.htmlAttributes || {};
    heading.data.id = id;
    heading.data.hProperties.id = id;
    heading.data.htmlAttributes.id = id;

    if (anchor) {
      anchor.url = `#${id}`;
      anchor.data.hProperties['aria-label'] =
        `${id.split('-').join(' ')} permalink`;
    }
  });

  return markdownAST;
};
