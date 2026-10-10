import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

function devHosts() {
  const hosts = new Set(["localhost", "127.0.0.1"]);
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4") hosts.add(entry.address);
    }
  }
  return [...hosts];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile(), basicSsl({ name: "egpfc", domains: devHosts() })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
