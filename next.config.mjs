import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root,
  },
  transpilePackages: ["antd", "@ant-design/icons", "@ant-design/nextjs-registry"],
};

export default nextConfig;
