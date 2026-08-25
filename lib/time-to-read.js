const sanitizeHtml = require('sanitize-html');
const { words } = require('lodash');

// gatsby-transformer-remark dropped its built-in `timeToRead` field in
// Gatsby 5. This is a faithful port of the algorithm it used
// (utils/time-to-read.js in 2.x) so the reading times shown on posts do not
// change.
//
// The original called sanitize-html with `{ allowTags: [] }`, which is not a
// real option, so sanitize-html's defaults applied: the tags below survived
// (and their names were counted as words), everything else was stripped to
// its text. sanitize-html 2.x allows many more tags by default (notably
// `span`, which wraps every syntax-highlighted token), so the 1.x defaults
// are spelled out here.
const SANITIZE_HTML_1_DEFAULTS = {
  allowedTags: [
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'p',
    'a',
    'ul',
    'ol',
    'nl',
    'li',
    'b',
    'i',
    'strong',
    'em',
    'strike',
    'abbr',
    'code',
    'hr',
    'br',
    'div',
    'table',
    'thead',
    'caption',
    'tbody',
    'tr',
    'th',
    'td',
    'pre',
    'iframe',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src'],
  },
};

const AVERAGE_WORDS_PER_MINUTE = 265;

// Unicode ranges for Han (Chinese) and Hiragana/Katakana (Japanese) characters
const CJ_RANGES = [
  [11904, 11930],
  [11931, 12020],
  [12032, 12246],
  [12293, 12294],
  [12295, 12296],
  [12321, 12330],
  [12344, 12348],
  [13312, 19894],
  [19968, 40939],
  [63744, 64110],
  [64112, 64218],
  [131072, 173783],
  [173824, 177973],
  [177984, 178206],
  [178208, 183970],
  [183984, 191457],
  [194560, 195102],
  [12353, 12439],
  [12445, 12448],
  [110593, 110879],
  [127488, 127489],
  [12449, 12539],
  [12541, 12544],
  [12784, 12800],
  [13008, 13055],
  [13056, 13144],
  [65382, 65392],
  [65393, 65438],
  [110592, 110593],
];

function isCjChar(char) {
  const code = char.codePointAt(0);
  return CJ_RANGES.some(([from, to]) => code >= from && code < to);
}

function timeToRead(html) {
  const pureText = sanitizeHtml(html, SANITIZE_HTML_1_DEFAULTS);
  const latinChars = [];
  const cjChars = [];
  for (const char of pureText) {
    (isCjChar(char) ? cjChars : latinChars).push(char);
  }
  // On average one word consists of 2 characters in both Chinese and Japanese.
  const wordCount = words(latinChars.join('')).length + cjChars.length * 0.56;
  return Math.max(1, Math.round(wordCount / AVERAGE_WORDS_PER_MINUTE));
}

module.exports = { timeToRead };
