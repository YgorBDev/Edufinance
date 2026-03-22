import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/components": path.resolve(__dirname, "./src/Componentes"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/integrations/supabase": path.resolve(__dirname, "./src/integrations/supabase"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
