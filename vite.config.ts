import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Set base to './' for relative paths - works in any subdirectory
  // Change to '/your-folder/' if hosting in a specific WordPress subdirectory
  base: './',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate sourcemaps for debugging (optional)
    sourcemap: false,
    // Ensure clean output
    emptyOutDir: true,
  },
}));
