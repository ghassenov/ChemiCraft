import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [tailwindcss()],
    resolve: {
        alias: {
            "@": "/src",
        },
    },
    server: {
        host: true,
        port: 5173,
        open: true,
    },
    build: {
        target: "ES2022",
        sourcemap: true,
    },
});
