import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Monorepo: pin the workspace root so Next.js output tracing does not
  // infer it from unrelated lockfiles outside this repository.
  outputFileTracingRoot: path.join(currentDir, "..", ".."),
};

export default nextConfig;
