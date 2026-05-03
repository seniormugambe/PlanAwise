import { defineConfig, loadEnv, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const enableComponentTagger = env.VITE_ENABLE_COMPONENT_TAGGER === "true";
  const plugins: PluginOption[] = [react()];

  if (mode === "development" && enableComponentTagger) {
    const { componentTagger } = await import("lovable-tagger");
    plugins.push(componentTagger());
  }

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: "http://localhost:4000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ["@tanstack/react-query", "lucide-react", "react", "react-dom", "react-router-dom"],
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.message.includes("contains an annotation that Rollup cannot interpret") &&
            warning.message.includes("node_modules")
          ) {
            return;
          }

          warn(warning);
        },
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            web3: ["wagmi", "viem", "@rainbow-me/rainbowkit"],
            ui: ["@radix-ui/react-dialog", "@radix-ui/react-select", "@radix-ui/react-tabs"],
          },
        },
      },
    },
  };
});
