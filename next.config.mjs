/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["i.ibb.co"], // "i.ibb.co.com" is invalid, see note below
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile photos
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub avatars
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com", // DiceBear avatars
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
