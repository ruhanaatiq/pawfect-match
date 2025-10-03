/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {

    domains: ["i.ibb.co", "i.ibb.co.com", "api.dicebear.com"], 

    domains: ["i.ibb.co"], // "i.ibb.co.com" is invalid, see note below

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
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
