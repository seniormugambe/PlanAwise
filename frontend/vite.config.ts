import { defineConfig, loadEnv, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const enableComponentTagger = env.VITE_ENABLE_COMPONENT_TAGGER === "true";
  const plugins: PluginOption[] = [react()];
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:5000";
  const apiProxy = {
    "/api": {
      target: apiProxyTarget,
      changeOrigin: true,
      secure: false,
    },
  };

  if (mode === "development" && enableComponentTagger) {
    const { componentTagger } = await import("lovable-tagger");
    plugins.push(componentTagger());
  }

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: apiProxy,
    },
    preview: {
      host: "0.0.0.0",
      port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
      proxy: apiProxy,
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
            ui: ["@radix-ui/react-dialog", "@radix-ui/react-select", "@radix-ui/react-tabs"],
          },
        },
      },
    },
  };
});
