console.log("Loading vite.config.js");

import { defineConfig } from "vite";
import dsv from "@rollup/plugin-dsv";

export default defineConfig({
  optimizeDeps: {
    include: ["@rollup/plugin-dsv"],
  },
  plugins: [dsv()],
});
