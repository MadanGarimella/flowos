import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const proxyTarget = process.env.VITE_PROXY_TARGET || "http://localhost:8080";
const allowedHostsValue = process.env.VITE_ALLOWED_HOSTS || "localhost,127.0.0.1,192.168.93.1";
const allowedHosts = allowedHostsValue.trim().toLowerCase() === "all"
  ? true
  : allowedHostsValue
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    allowedHosts,
    proxy: {
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts,
  },
});
