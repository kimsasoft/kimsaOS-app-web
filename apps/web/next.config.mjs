/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/supabase', '@repo/database'],
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: '../../',
  },
}

export default nextConfig;
