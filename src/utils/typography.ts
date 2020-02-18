import Typography from 'typography';
import Wordpress2016 from 'typography-theme-wordpress-2016';
import './global.css';

const HEADER_FONT_FAMILY = ['granville', 'serif'];
const BODY_FONT_FAMILY = [
  'neue-haas-unica',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Helvetica',
  'Arial',
  'sans-serif',
];

Wordpress2016.overrideThemeStyles = () => ({
  'h1, h2, h3, h4, h5, h6': {
    marginTop: `2.5rem`,
  },
  'h1, h2': {
    fontFamily: HEADER_FONT_FAMILY.join(','),
    lineHeight: `1.3em`,
  },
  'h3, h4, h5, h6': {
    fontFamily: BODY_FONT_FAMILY.join(','),
    lineHeight: `1.3em`,
  },
  a: {
    color: 'var(--textLink)',
  },
  hr: {
    background: 'var(--hr)',
  },
  'a.gatsby-resp-image-link': {
    boxShadow: 'none',
  },
  // These two are for gatsby-remark-autolink-headers:
  'a.anchor': {
    boxShadow: 'none',
  },
  'a.anchor svg[aria-hidden="true"]': {
    stroke: 'var(--gray)',
  },
  // TODO: why tho
  'h1 code, h2 code, h3 code, h4 code, h5 code, h6 code': {
    fontSize: 'inherit',
  },
  blockquote: {
    color: 'inherit',
    borderLeftColor: 'inherit',
    opacity: '0.8',
  },
  'blockquote.translation': {
    fontSize: '1rem',
  },
  footer: {
    fontSize: '0.8rem',
    display: 'flex',
    'justify-content': 'space-between',
  },
  small: {
    color: 'var(--gray)',
    lineHeight: `1.1em`,
  },
  '.blog-post figcaption': {
    fontSize: '0.8rem',
    color: 'var(--gray)',
    textAlign: 'center',
  },
});

delete Wordpress2016.googleFonts;

Wordpress2016.baseFontSize = '18px';
Wordpress2016.headerFontFamily = HEADER_FONT_FAMILY;
Wordpress2016.bodyFontFamily = BODY_FONT_FAMILY;

const typography = new Typography(Wordpress2016);

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles();
}

export default typography;
export const rhythm = typography.rhythm;
export const scale = typography.scale;
