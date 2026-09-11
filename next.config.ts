import type { NextConfig } from 'next';

// GitHub Pages serves a project site under /<repo>, so the preview build needs a basePath.
// Local `next dev` / `next build` are unaffected unless GITHUB_PAGES=true is set.
const isPages = process.env.GITHUB_PAGES === 'true';
const basePath = isPages ? '/monolit' : '';

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // The preview runs entirely on the deterministic demo adapter, so it exports as a static site.
  ...(isPages
    ? { output: 'export' as const, basePath, assetPrefix: basePath, trailingSlash: true, images: { unoptimized: true } }
    : {}),
};
export default config;
