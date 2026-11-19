import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Lets the worker in /vemljuger/ control the page /vemljuger itself (no trailing slash).
        source: "/vemljuger/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/vemljuger" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
