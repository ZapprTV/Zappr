import { Parcel } from "@parcel/core";
import { join as joinPath } from "path";
import { clone as gitClone } from "isomorphic-git";
import * as http from "isomorphic-git/http/node/index.cjs";
import * as fs from "fs";

// visto che pnpm run è una MERDA non passa gli argomenti in linea di comando come environment variable e quindi devo fare queste cagate con l'argv >:(
const parseArgv = (argv) => {
    const result = {};
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.startsWith('--')) {
            const [name, value] = arg.slice(2).split('=');
            result[name] = value || true;
        };
    };
    return result;
};
const argv = parseArgv(process.argv);

let config = await fs.promises.readFile("config.json", "utf8", err => {
    if (err) throw err;
});
config = JSON.parse(config);

console.log("rimozione in corso della build precedente...")
await fs.promises.rm(joinPath(process.cwd(), "dist"), { recursive: true, force: true }, err => {
    if (err) throw err;
});

console.log("bundling in corso...");
let bundler = new Parcel({
    entries: "index.html",
    defaultConfig: "@parcel/config-default",
    mode: "production"
});

try {
    let { bundleGraph, buildTime } = await bundler.run();
    let bundles = bundleGraph.getBundles();
    console.log(`creati ${bundles.length} bundle in ${buildTime}ms nella cartella dist`);
} catch (err) {
    console.log(err.diagnostics);
};

await fs.promises.copyFile("config.json", "dist/config.json", 0, err => {
    if (err) throw err;
});
console.log("copiata la config nella cartella dist");

if (argv.bundleChannels === true) {
    const dir = joinPath(process.cwd(), "dist", "channels"),
          channelsBundleURL = argv.channelsURL ?? "https://github.com/ZapprTV/channels.git";

    if (channelsBundleURL.endsWith(".git")) {
        await gitClone({
            fs, http, dir, url: channelsBundleURL
        });
    
        await fs.promises.rm(joinPath(dir, ".git"), { recursive: true, force: true }, err => {
            if (err) throw err;
        });
    } else {
        await fs.promises.cp(joinPath(process.cwd(), channelsBundleURL), joinPath(process.cwd(), "dist", channelsBundleURL), { recursive: true });
    };

    console.log("download dei channels terminato");
};