import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url"; 

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
    build: {
        target: "esnext",
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                mixed: resolve(__dirname, "mixed.html"),
                offlinePWA: resolve(__dirname, "offline-pwa.html"),
                privacy: resolve(__dirname, "privacy.html"),
            },
        }
    },
}