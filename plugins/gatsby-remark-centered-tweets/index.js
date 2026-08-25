// The Twitter plugin this site used before Gatsby 5 requested embeds with
// `align=center`, so tweets rendered as <blockquote class="twitter-tweet"
// align="center">. gatsby-remark-embedder has no such option; add the
// attribute back so the tweet text stays centered as on the live site.
// Must run after gatsby-remark-embedder.

function visit(node, callback) {
  callback(node);
  if (node.children) node.children.forEach((child) => visit(child, callback));
}

module.exports = ({ markdownAST }) => {
  visit(markdownAST, (node) => {
    const props = node.data && node.data.hProperties;
    if (!props || node.data.hName !== 'blockquote') return;
    const className = [].concat(props.className || props.class || []).join(' ');
    if (/(^| )twitter-tweet( |$)/.test(className)) {
      props.align = 'center';
    }
  });
  return markdownAST;
};
