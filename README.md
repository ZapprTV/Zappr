<div align="center">
    <b>English</b> | <a href="README-it.md">Italiano</a>
</div>
<div align="center"><b>This repo contains Zappr's frontend. For the channel lists and the logos, you should turn to <a href="https://github.com/ZapprTV/channels">ZapprTV/channels</a>.</b></div>
<br><br>
<div align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="readme-assets/logo-dark.svg" />
        <source media="(prefers-color-scheme: light)" srcset="readme-assets/logo-light.svg" />
        <img alt="Zappr" src="readme-assets/logo-light.svg" width="50%" />
    </picture>
    <br>
    <b><i>Easily watch your country's free-to-air channels, national and local.</i></b>
</div>
<br>
<video src="https://github.com/user-attachments/assets/4b3f3346-2d0a-4d5c-8ca8-8c5fa108715d"></video>
<h1 align="center">🎉 Try it out now at <a href="https://zappr.stream">zappr.stream</a>! 🎉</h1>

### _[Skip to development information](#info-on-local-development)_

With Zappr, you can easily watch your country's free-to-air channels, national and local, for free and without having to configure anything! No more will you need to track down IPTV lists and clients until you find something that only *kind of* works - now, watching TV online is **easy**!

- 🗃 **Everything's well organized** - All channels have the same LCN as they have on Freeview, they're all in order and have their logo next to them.
- 📍 **Not just national channels** - Zappr allows you to watch your region's channels with one click: just select your region in the settings and your area's local channels will automatically be added to the channel list.
- 📲 **And not just the most famous channels!** - If a TV channel has an online streaming and is visible on Freeview, it's on Zappr. Not just the main channels or the most watched - Zappr has it all.
- 📻 **Not just TV, also radio** - Zappr also allows you to listen to the various radio stations available on Freeview. 
- ⏪ **Not just live** - You can pause all channels, and most of them allow you to seek backwards and forwards.
- 🌐 **Not just the usual streaming types** - Because Zappr is a web app and isn't based on a traditional media player, you'll be able to watch channels not available on most IPTV clients, such as ones protected by DRM, ones broadcast on Twitch, YouTube, etc.
- ⚡️ **Also, everything's fast...** - Zappr loads channels way faster than many other IPTV clients, and it's snappy and responsive. You don't even need your mouse to zap channels anymore: you can use the `PageDown` and `PageUp` keys to move between channels, or you can type a channel's LCN on your keyboard and then press `Enter` to reach it quickly.
- 🧑‍💻️ **...and easy to extend!** - 100% of Zappr's code is open source, and contributing is easy, especially when it comes to the channel lists: they're all in JSON format and are extensively documented by a JSON Schema.

If you want to use Zappr right now, it's ready to be used on [zappr.stream](https://zappr.stream). If, instead, you want to work on it...

# Info on local development
## Prepare the development environment
1. Clone the repo: `git clone https://github.com/ZapprTV/Zappr`
2. Install the dependencies: `npm install` (or `pnpm install`)
3. Edit the `public/config.json` file if necessary

The `public/config.json` file is the file that contains, other than the API's URLs, the URLs to the channel lists and logos. By default it uses the ones hosted by Zappr (`channels.zappr.stream`), but if you need to use a local copy, clone the relevant repo:

`git clone https://github.com/ZapprTV/channels`

Then edit `public/config.json` to make it point to your local copy:
```json
    "channels": {
        "host": "/channels"
    },
    [...]
    "logos": {
        "host": "/channels/logos",
        [...]
    },
```

## Next steps
To start up a local server, run `npm run dev` (or `pnpm run dev`).

To initiate a build, which will then end up in the `dist/` folder, run `npm run build` (or `pnpm run build`).
- The build will have the same configuration as the one in `config.json`, and will only include the frontend's files by default. If you also want to include the channel lists' and logos' files, add the command line argument `--bundleChannels`.
    - By default, `--bundleChannels` will download the channel lists and logos from `https://github.com/ZapprTV/channels`, but if you want it to download them from another Git repo or to copy them from a local folder, specify the name of the folder / the Git repo URL **(with .git at the end of it)** in the `--channelsURL` argument.
        - For example, `--channelsURL=Channels` will copy the local folder `Channels` and include it in the build, while `--channelsURL=https://github.com/User123/Channels.git` will clone the GitHub repo `User123/Channels` and include that in the build.
    - **IMPORTANT**: To specify command line arguments with NPM, you have to prefix them with `--`.
        - So, for example, instead of running `npm run build --bundleChannels`, you'll have to run `npm run build -- --bundleChannels`.
        - **This isn't the case with PNPM.** If you're using PNPM you can just run `pnpm run build --bundleChannels`.