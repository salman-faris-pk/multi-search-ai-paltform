import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack:{
    root: __dirname,
  },
  images:{
    domains: ["s2.googleusercontent.com"],
  }
};

export default nextConfig;
