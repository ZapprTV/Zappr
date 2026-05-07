const url = new URL(location.href).searchParams.get("url");
const additionalParams = Object.fromEntries(Object.entries(Object.fromEntries(new URL(url).searchParams)).filter(([key]) => key.startsWith("clearkeyPlayer.")));
const kid = new URL(location.href).searchParams.get("kid");
const key = new URL(location.href).searchParams.get("key");
const keys = JSON.parse(decodeURIComponent(new URL(location.href).searchParams.get("keys")));

if (url) {
    document.addEventListener("shaka-ui-loaded", async () => {
        const video = document.querySelector('video');
        const player = video.ui.getControls().getPlayer();
        if (keys) {
            player.configure({
                drm: {
                    clearKeys: keys
                }
            });
        } else if (kid && key) {
            player.configure({
                drm: {
                    clearKeys: {
                        [kid]: key
                    }
                }
            });
        };

        if (additionalParams["clearkeyPlayer.maxQuality"]) {
            player.configure({
                restrictions: {
                    maxHeight: parseInt(additionalParams["clearkeyPlayer.maxQuality"])
                }
            });
        };

        await player.load(url);

        window.player = player;
    });
};