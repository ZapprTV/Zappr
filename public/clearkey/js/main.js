const kid = new URL(location.href).searchParams.get("kid");
const key = new URL(location.href).searchParams.get("key");
const url = new URL(location.href).searchParams.get("url");

if (url) {
    document.addEventListener("shaka-ui-loaded", async () => {
        const video = document.querySelector('video');
        const player = video.ui.getControls().getPlayer();
        if (kid && key) {
            player.configure({
                drm: {
                    clearKeys: {
                        [kid]: key
                    }
                }
            });
        };
        await player.load(url);

        window.player = player;
    });
};