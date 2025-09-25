import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Ensure Next.js traces files relative to this project, not a parent folder with another lockfile
  outputFileTracingRoot: path.join(__dirname),
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
