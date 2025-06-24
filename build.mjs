import { build } from "vite";
import { join as joinPath } from "path";
import { clone as gitClone } from "isomorphic-git";
import * as http from "isomorphic-git/http/node/index.cjs";
import * as fs from "fs";

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

await build();

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