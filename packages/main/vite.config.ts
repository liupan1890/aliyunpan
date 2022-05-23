import { builtinModules } from "module";
import { defineConfig } from "vite";

export default defineConfig({
  root: __dirname,
  build: {
    outDir: "../../dist/main",
    lib: {
      entry: "index.ts",
      formats: ["cjs"],
      fileName: () => "[name].js",
    },
    minify: process.env./* from mode option */ NODE_ENV === "production",
    emptyOutDir: false,
    rollupOptions: {
      external: ["electron", ...builtinModules],
    },
  },
});
