import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["components/**/*.test.{ts,tsx}", "components/**/*.spec.{ts,tsx}"],
    exclude: ["node_modules", ".next", "lib/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
})
