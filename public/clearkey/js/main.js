const url = new URL(location.href).searchParams.get("url");
const urlWithoutSearch = url.replace(new URL(url).search, "");
const searchParams = Object.entries(Object.fromEntries(new URL(url).searchParams));
const playerOptions = Object.fromEntries(searchParams.filter(([key]) => key.startsWith("clearkeyPlayer.")));
const nonPlayerSearch = Object.fromEntries(searchParams.filter(([key]) => !key.startsWith("clearkeyPlayer.")));
const finalURL = `${urlWithoutSearch}?${new URLSearchParams(nonPlayerSearch).toString()}`;
const kid = new URL(location.href).searchParams.get("kid");
const key = new URL(location.href).searchParams.get("key");
const keys = JSON.parse(decodeURIComponent(new URL(location.href).searchParams.get("keys")));
const fallback = new URL(location.href).searchParams.get("fallback");
const fallbackURL = new URL(location.href).searchParams.get("fallbackURL");

if (finalURL) {
    document.addEventListener("shaka-ui-loaded", async () => {
        const video = document.querySelector("video");
        const player = video.ui.getControls().getPlayer();
        player.configure({
            manifest: {
                retryParameters: {
                    maxAttempts: 3
                }
            }
        });

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

        if (playerOptions["clearkeyPlayer.maxQuality"]) {
            player.configure({
                restrictions: {
                    maxHeight: parseInt(playerOptions["clearkeyPlayer.maxQuality"])
                }
            });
        };
        
        const onError = () => {
            if (fallbackURL) {
                let newSearch = Object.fromEntries(new URLSearchParams(window.location.search));
                delete newSearch.kid;
                delete newSearch.key;
                delete newSearch.keys;
                delete newSearch.fallbackURL;
                newSearch.url = fallbackURL;
                window.location.search = new URLSearchParams(newSearch).toString();
            } else {
                if ((keys || (kid && key)) && /iPad|iPhone|iPod/.test(navigator.userAgent) && !fallback) {
                    if (window.parent?.zappr?.locale?.disabledClearkeyiOS) document.body.innerHTML = window.parent.zappr.locale.disabledClearkeyiOS;
                    else document.body.innerHTML = "This channel is not visible on iOS due to its lack of support for ClearKey DRM.";
                } else if (fallback && window.parent?.zappr?.player) window.parent.zappr.player.src({});
            };
        };
        player.addEventListener("error", onError);
        await player.load(finalURL).catch(onError);

        if (playerOptions["clearkeyPlayer.audioLanguage"] && player.getAudioLanguages().includes(playerOptions["clearkeyPlayer.audioLanguage"])) player.selectAudioLanguage(playerOptions["clearkeyPlayer.audioLanguage"]);

        window.player = player;

        if (playerOptions["clearkeyPlayer.redirectTo"] && parseInt(playerOptions["clearkeyPlayer.redirectToAfterMs"])) {
            setTimeout(async () => {
                const redirectTo = await fetch(playerOptions["clearkeyPlayer.redirectTo"])
                    .then(response => response.url)
                    .catch(() => playerOptions["clearkeyPlayer.redirectTo"]);
                
                window.location.href = redirectTo;
            }, parseInt(playerOptions["clearkeyPlayer.redirectToAfterMs"]));
        };
    });
};
