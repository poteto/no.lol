declare module '*.css';

declare module 'typography-theme-wordpress-2016' {
  import type { TypographyOptions } from 'typography';

  const theme: TypographyOptions;
  export default theme;
}

// Injected by Gatsby at build time.
declare const __PATH_PREFIX__: string;
