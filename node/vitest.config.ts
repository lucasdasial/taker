import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // ou 'jsdom', dependendo do teu projeto
    include: ["test/**/*.test.{js,ts,jsx,tsx}"], // apenas arquivos na pasta /test
  },
});
