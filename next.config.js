/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  /* The paid funnel's pages are gone. Anything still pointing at them (an old
     ad, an email, a bookmark) lands somewhere useful instead of a 404:
     /checkout opens the free-registration modal via the #register hash. */
  async redirects() {
    return [
      { source: '/checkout', destination: '/#register', permanent: false },
      { source: '/thank-you-vip', destination: '/thank-you', permanent: false },
      { source: '/refund-policy', destination: '/terms-and-conditions', permanent: false },
    ];
  },
  experimental: {
    // Tree-shake the icon barrel so only the used glyphs ship.
    optimizePackageImports: ['@phosphor-icons/react'],
  },
};

module.exports = nextConfig;
