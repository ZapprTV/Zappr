import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import topLevelAwait from "vite-plugin-top-level-await";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
    build: {
        target: "chrome51",
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                offlinePWA: resolve(__dirname, "offline-pwa.html"),
                privacy: resolve(__dirname, "privacy.html"),
            },
        }
    },
    plugins: [
        topLevelAwait()
    ]
}