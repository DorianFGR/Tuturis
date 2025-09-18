import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ensure Next.js traces files relative to this project, not a parent folder with another lockfile
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
