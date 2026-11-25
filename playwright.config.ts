import { defineConfig } from "@playwright/test"

const baseURL = "http://127.0.0.1:4173"

export default defineConfig({
  testDir: "./tests",
  use: { baseURL },
  webServer: { command: "npm run dev", url: `${baseURL}/r/registry.json`, reuseExistingServer: !process.env.CI },
})
