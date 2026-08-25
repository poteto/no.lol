// SVGs are turned into React components by gatsby-plugin-react-svg.
declare module '*.svg' {
  import type React from 'react';

  const SvgComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default SvgComponent;
}

declare module '*.css';

declare module 'typography-theme-wordpress-2016' {
  import type { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

// Injected by Gatsby at build time.
declare const __PATH_PREFIX__: string;
