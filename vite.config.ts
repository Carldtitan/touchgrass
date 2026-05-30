import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Requirement 11.1 — serve the frontend at http://localhost:3000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
});
