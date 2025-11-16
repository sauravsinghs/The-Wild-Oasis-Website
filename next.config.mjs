/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Any Supabase project (matches your SUPABASE_URL host, not a single hardcoded project)
      {
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // output: "export",
};

export default nextConfig;
