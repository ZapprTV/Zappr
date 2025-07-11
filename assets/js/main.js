import videojs from "video.js";
import "videojs-contrib-quality-menu";
import { DateTime } from "luxon";
import mediumZoom from "medium-zoom";

await fetch("/config.json")
    .then(response => response.json())
    .then(json => window["zappr"] = json)
    .catch(err => {
        console.log(`Impossibile trovare config (${err}), in uso quella di default`);
        window["zappr"] = {
            "config": {
                "channels": {
                    "host": "https://channels.zappr.stream"
                },
                "backend": {
                    "host": {
                        "vercel": "https://vercel-api.zappr.stream",
                        "cloudflare": "https://cloudflare-api.zappr.stream"
                    }
                },
                "logos": {
                    "host": "https://channels.zappr.stream/logos",
                    "optimized": true
                }
            }
        };
    });

let currentType = "",
    typingLCN = false,
    multipleChannelSelection = false,
    currentlyPlaying = "",
    targetedChannel = "",
    target = "";

const player = videojs("tv", {
    playbackRates: [0.25, 0.5, 1, 1.25, 1.5, 2, 4],
    enableSmoothSeeking: true,
    liveui: true,
    retryOnError: true,
    controlBar: {
        skipButtons: {
            backward: 5,
            forward: 5
        }
    },
    errorDisplay: false,
    html5: {
        vhs: {
            overrideNative: true,
            useBandwidthFromLocalStorage: true
        }
    },
    plugins: {
        qualityMenu: {},
        reloadSourceOnError: {}
    }
});

window.player = player;
window.videojs = videojs;

player.on("fullscreenchange", () => screen.orientation.lock("landscape-primary").catch(() => {}));
player.on("play", () => {
    document.querySelector("#hide-player").media = "not all";
});
player.on("loadeddata", () => {
    if (player.liveTracker.isLive() && !player.scrubbing() && !player.seeking()) {
        player.liveTracker.seekToLiveEdge();
    };
});

const channelslist = document.querySelector("#channels"),
      overlays = document.querySelector("#overlays"),
      iframe = document.querySelector("iframe"),
      nightAdultChannelsStyle = document.querySelector("#night-adult-channels");

window["closeModal"] = () => {
    if (document.querySelector(".modal") != null) {
        document.querySelector(".modal").classList.remove("is-visible");
        document.querySelector(".modal").remove();
    };
};

const createErrorModal = async ({ title, error, info, params }) => {
    let urlParams = new URLSearchParams(params).toString();
    const modalHTML = `<div class="modal">
        <div class="modal-content">
            <div class="modal-title">
                <h1>${title}</h1>
                <div class="close" onclick="closeModal()"></div>
            </div>
            <p>${error}</p>
            ${info != undefined ? `
            <div class="technical-info">
                <h3>Informazioni tecniche</h3>
                <a onclick="copyInfo()">Copia</a>
            </div>
            <div class="code" onclick="copyInfo()">${info}</div>    
            ` : ""}
            <p id="report-error">Per favore segnala questo errore via GitHub o email. Cliccando su uno dei pulsanti qui sotto le informazioni principali dell'errore verranno compilate automaticamente.</p>
            <div class="modal-buttons">
                <a class="button primary" href="https://github.com/ZapprTV/channels/issues/new?${urlParams}" target="_blank">
                    Segnala tramite GitHub
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h14v-7h2v7q0 .825-.587 1.413T19 21zm4.7-5.3l-1.4-1.4L17.6 5H14V3h7v7h-2V6.4z"></path></svg>
                </a>
                <a class="button secondary" href="mailto:zappr@francescoro.si?subject=${params.title}&body=${
                    encodeURIComponent(`Informazioni tecniche: ${params.info}

Per favore specifica qui sotto se il canale funziona da altre parti (su altri siti o in HbbTV) e su che browser dà errore:

`)
                }" target="_blank">
                    Segnala tramite email
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#000" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h14v-7h2v7q0 .825-.587 1.413T19 21zm4.7-5.3l-1.4-1.4L17.6 5H14V3h7v7h-2V6.4z"></path></svg>
                </a>
            </div>
        </div>
    </div>`;

    if (document.querySelector(".modal") === null) {
        overlays.insertAdjacentHTML("beforeend", modalHTML);
    } else {
        document.querySelector(".modal").outerHTML = modalHTML;
    };

    await new Promise(resolve => setTimeout(resolve, 500));

    document.querySelector(".modal").classList.add("is-visible");
};

const createModal = async ({ title, text, buttons }) => {
    const modalHTML = `<div class="modal">
        <div class="modal-content">
            <div class="modal-title">
                <h1>${title}</h1>
                <div class="close" onclick="closeModal()"></div>
            </div>
            <p>${text}</p>
            ${buttons ? `<div class="modal-buttons">
                ${buttons.map(button => `<a class="button ${button.type}" href="${button.href}" ${button.newtab ? `target="_blank"` : ""}>${button.text}</a>`).join(" ")}
            </div>` : ""}
        </div>
    </div>`;

    if (document.querySelector(".modal") === null) {
        overlays.insertAdjacentHTML("beforeend", modalHTML);
    } else {
        document.querySelector(".modal").outerHTML = modalHTML;
    };

    await new Promise(resolve => setTimeout(resolve, 1));

    document.querySelector(".modal").classList.add("is-visible");
};

if (new URLSearchParams(location.search).get("geoblock-warning") != null) {
    createModal({
        title: "Attenzione!",
        text: `Il tuo indirizzo IP non risulta essere italiano. Ciò significa che alcuni canali non saranno visibili.
        <br><br>
        Se ti trovi all'estero, usa una VPN con dei server in Italia. Altrimenti, se ti trovi in Italia, controlla di non avere una VPN o proxy attiva.`
    });
};

const loadStream = async ({ type, url, api = false, name, lcn, logo, http = false, feed = false }) => {
    if (api) {
        url = `${window["zappr"].config.backend.host[api]}/api?${url}`;
    };

    closeModal();
    player.off("error");
    player.on("error", async () => {
        closeModal();
        if (!feed) {
            if (player.error().code === 2 && http) {
                createModal({
                    title: "Canali HTTP non attivi",
                    text: `Questo è un canale di tipo HTTP. Clicca su "Attiva" qui sotto e segui le istruzioni per attivare la visione di questo tipo di canale.`,
                    buttons: [{
                        type: "primary",
                        href: `/mixed${
                            navigator.userAgent.includes("Firefox") ? "#firefox" :
                                navigator.userAgent.includes("Android") ? "#android" : ""
                        }`,
                        text: "Attiva",
                        newtab: true
                    },
                    {
                        type: "secondary",
                        href: "javascript:closeModal();",
                        text: "Annulla"
                    }]
                });
            } else if (player.error().code === 4) {
                let httpError;

                await fetch(player.src())
                    .then(response => httpError = `${response.status} ${response.statusText}`)
                    .catch(() => {});

                createErrorModal({
                    title: "Errore canale",
                    error: `Impossibile caricare <b>${name}</b> <i>(${url})</i> per un problema di formato/server${httpError ? `: <b>${httpError}</b>` : " sconosciuto."}`,
                    params: {
                        template: "errore.yml",
                        labels: "Errore",
                        title: `${lcn} - ${name}: Errore formato/server (${httpError ? httpError : "sconosciuto"})`,
                        name: name,
                        lcn: lcn,
                        info: `MEDIA_ERR_SRC_NOT_SUPPORTED: ${httpError ? httpError : "Errore sconosciuto."}`
                    }
                });
            } else if (player.error().code === 3 && (!new URL(url).host.endsWith("-dash-live.akamaized.net") && !new URL(url).host.startsWith("rai")) || lcn === 3) {
                let videojsLog = videojs.log.history().slice(Math.max(videojs.log.history().length - 50, 1)).map(el => el.map(key => typeof key === "object" ? JSON.stringify(key) : key).join(" ")).join("\n");

                createErrorModal({
                    title: "Errore canale",
                    error: `Impossibile caricare <b>${name}</b> <i>(${url})</i> per un problema di decoding.`,
                    info: videojsLog,
                    params: {
                        template: "errore.yml",
                        labels: "Errore",
                        title: `${lcn} - ${name}: Errore decoding`,
                        name: name,
                        lcn: lcn,
                        info: videojsLog
                    }
                });
            } else if (player.error().code === 2) {
                let httpError;

                await fetch(player.src())
                    .then(response => httpError = `${response.status} ${response.statusText}`)
                    .catch(() => {});

                createErrorModal({
                    title: "Errore canale",
                    error: `Impossibile caricare <b>${name}</b> <i>(${url})</i> per un problema di server${httpError ? `: <b>${httpError}</b>` : " sconosciuto."}`,
                    params: {
                        template: "errore.yml",
                        labels: "Errore",
                        title: `${lcn} - ${name}: Errore server (${httpError ? httpError : "sconosciuto"})`,
                        name: name,
                        lcn: lcn,
                        info: `MEDIA_ERR_NETWORK: ${httpError ? httpError : "Errore sconosciuto."}`
                    }
                });
            } else if (player.error().code === 1 || player.error().code === 5) {
                let errors = {
                    1: "MEDIA_ERR_ABORTED",
                    2: "MEDIA_ERR_NETWORK",
                    3: "MEDIA_ERR_DECODE",
                    4: "MEDIA_ERR_SRC_NOT_SUPPORTED",
                    5: "MEDIA_ERR_ENCRYPTED"
                };
                let httpStatus;

                await fetch(player.src())
                    .then(response => httpStatus = `${response.status} ${response.statusText}`)
                    .catch(() => {});

                let videojsLog = videojs.log.history().slice(Math.max(videojs.log.history().length - 50, 1)).map(el => el.map(key => typeof key === "object" ? JSON.stringify(key) : key).join(" ")).join("\n");
                
                createErrorModal({
                    title: "Errore canale",
                    error: `Impossibile caricare <b>${name}</b> <i>(${url})</i> per un errore sconosciuto.`,
                    info: `${httpStatus ? `HTTP: ${httpStatus} - ` : ""}Video.js (${errors[player.error().code]}): ${videojsLog}`,
                    params: {
                        template: "errore.yml",
                        labels: "Errore",
                        title: `${lcn} - ${name}: Errore sconosciuto`,
                        name: name,
                        lcn: lcn,
                        info: `${httpStatus ? `HTTP: ${httpStatus} - ` : ""}Video.js (${errors[player.error().code]}): ${videojsLog}`
                    }
                });
            } else {
                player.src(player.currentSource());
                player.play();
            };
        };
    });

    document.title = `${name} - Zappr`;
    const img = document.querySelector(`img[src="${logo}"]`);
    const canvas = document.querySelector("canvas");

    const generateMetadataImage = () => {
        const ctx = canvas.getContext("2d");
        const canvasSize = canvas.width;
        const aspectRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (aspectRatio > 1) {
            drawWidth = canvasSize;
            drawHeight = canvasSize / aspectRatio;
            offsetX = 0;
            offsetY = (canvasSize - drawHeight) / 2;
        } else {
            drawWidth = canvasSize * aspectRatio;
            drawHeight = canvasSize;
            offsetX = (canvasSize - drawWidth) / 2;
            offsetY = 0;
        };

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        canvas.toBlob((blob) => {
            const artworkURL = URL.createObjectURL(blob);
    
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: `${name} - Zappr`,
                    artist: "In riproduzione",
                    artwork: [{
                        src: artworkURL,
                        sizes: "512x512",
                        type: "image/png"
                    }],
                });
            }
        });
    }

    img.addEventListener("load", () => generateMetadataImage());
    if (img.complete) generateMetadataImage();

    if (document.querySelector(".modal.is-visible") != null) document.querySelector(".modal").classList.remove("is-visible");

    switch(currentType) {
        case "twitch":
        case "youtube":
        case "iframe":
            if (!["twitch", "youtube", "iframe"].includes(type)) document.querySelector("iframe").remove();
            if (currentType === "iframe" && type != "iframe") {
                document.querySelector("#fullscreen-button-container").remove();
            };
            break;

        case "popup":
            document.querySelector("#reopen-window").remove();
            document.querySelector(".vjs-big-play-button").style.cssText = "";
            popupPlayer.close();
            break;
            
    };

    if (type === "popup") {
        player.reset();
        window.popupPlayer = window.open(
            url,
            "popupWindow",
            new URLSearchParams({
                left: document.querySelector("#channels-column").offsetWidth,
                top: window.outerHeight - window.innerHeight,
                width: window.innerWidth - document.querySelector("#channels-column").offsetWidth,
                height: window.innerHeight - (window.outerHeight - window.innerHeight)
            }).toString().replaceAll("&", ",")
        );

        if (!popupPlayer) {
            createModal({
                title: "Accesso ai popup negato",
                text: `Il tuo browser non ha permesso a Zappr di aprire una finestra popup per la visione di <b>${name}</b>. Per vedere il canale, devi dare il permesso a Zappr di poter aprire finestre popup, oppure puoi aprire la finestra sottoforma di una nuova scheda e vedere il canale lì.`,
                buttons: [{
                    type: "primary",
                    href: url,
                    newtab: true,
                    text: "Apri in una nuova finestra"
                },
                {
                    type: "secondary",
                    href: "javascript:closeModal();",
                    text: "Chiudi"
                }]
            });
        };
        window.addEventListener("unload", () => popupPlayer.close());
        document.querySelector("#overlays").insertAdjacentHTML("afterbegin", `<a href="#" id="reopen-window"><svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24"><path fill="#fff" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6q.425 0 .713.288T12 4t-.288.713T11 5H5v14h14v-6q0-.425.288-.712T20 12t.713.288T21 13v6q0 .825-.587 1.413T19 21zM19 6.4L10.4 15q-.275.275-.7.275T9 15t-.275-.7t.275-.7L17.6 5H15q-.425 0-.712-.288T14 4t.288-.712T15 3h5q.425 0 .713.288T21 4v5q0 .425-.288.713T20 10t-.712-.288T19 9z"/></svg>Riapri player</a>`);
        document.querySelector("#reopen-window").addEventListener("click", () => {
            if (popupPlayer.closed) document.querySelector(".channel.watching").click()
            else popupPlayer.focus();
        });
        document.querySelector(".vjs-big-play-button").style.cssText = "display: none !important";

        currentType = "popup";
    } else {
        switch(type) {
            case "hls":
            case "dash":
            case "audio":
                player.src({
                    src: url,
                    type: type === "hls" ? "application/x-mpegURL"
                        : type === "dash" ? "application/dash+xml"
                        : type === "audio" ? "audio/mpeg"
                        : ""
                });
                break;

            case "direct":
                player.src(url);
                break;

            case "twitch":
            case "youtube":
            case "iframe":
                if (!["twitch", "youtube", "iframe"].includes(currentType)) player.reset();
                
                let iframe;
                if (document.querySelector("iframe") === null) {
                    iframe = document.createElement("iframe");
                } else {
                    iframe = document.querySelector("iframe");
                };
                
                iframe.allowFullscreen = true;
                iframe.allow = "autoplay";
                iframe.scrolling = "no";
                if (type === "twitch") {
                    iframe.src = `https://player.twitch.tv/?channel=${url}&parent=${location.hostname}`;
                } else if (type === "youtube") {
                    if (url.startsWith("UC") && url.length > 11) {
                        iframe.src = `https://www.youtube-nocookie.com/embed/live_stream?channel=${url}&autoplay=1&modestbranding=1&rel=0&hl=it-it`;
                    } else {
                        iframe.src = `https://www.youtube-nocookie.com/embed/${url}?autoplay=1&modestbranding=1&rel=0&hl=it-it`;
                    };
                } else if (type === "iframe") {
                    iframe.src = url;
                    if (document.querySelector("#fullscreen-button-container") === null) {
                        const fullscreenButtonContainer = document.createElement("div");
                        fullscreenButtonContainer.id = "fullscreen-button-container";
                        const fullscreenButton = document.createElement("div");
                        fullscreenButton.id = "fullscreen-button";
                        fullscreenButtonContainer.insertAdjacentElement("afterbegin", fullscreenButton);
                        fullscreenButton.addEventListener("click", () => {
                            if (document.fullscreenElement === null) {
                                overlays.requestFullscreen();
                            } else {
                                document.exitFullscreen();
                            };
                        })

                        overlays.insertAdjacentElement("beforeend", fullscreenButtonContainer);
                    };
                };

                if (document.querySelector("iframe") === null) overlays.insertAdjacentElement("afterbegin", iframe);
                break;
        };
        currentType = type;
        player.play();
    };
};

const loadChannel = async ({ type, url, api = false, name, lcn, logo, http = false, license = false, feed = false }) => {
    if (url.startsWith("zappr://")) {
        const parameter = url.split("/")[3];
        switch(url.split("/")[2]) {

            case "sky":
                await fetch(`https://apid.sky.it/vdp/v1/getLivestream?id=${parameter}&isMobile=false`)
                    .then(response => response.json())
                    .then(json => {
                        loadStream({
                            type: type,
                            url: json.streaming_url,
                            name: name,
                            lcn: lcn,
                            logo: logo
                        });
                    });
                break;

            case "la7-hbbtv":
                await fetch(`https://www.la7.it/appPlayer/liveUrlWithFailPerApp.php?channel=${parameter}`)
                    .then(response => response.json())
                    .then(json => {
                        loadStream({
                            type: type,
                            url: json.main,
                            name: name,
                            lcn: lcn,
                            logo: logo
                        });
                    });
                break;

            case "wim":
                const token = await fetch("https://platform.wim.tv/wimtv-server/oauth/token", {
                    method: "POST",
                    headers: {
                        "Authorization": "Basic d3d3Og==",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    },
                    body: "grant_type=client_credentials"
                })
                    .then(response => response.json())
                    .then(json => json.access_token);

                await fetch(`https://platform.wim.tv/wimtv-server/api/public/live/channel/${parameter}/play`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: "{}"
                })
                    .then(response => response.json())
                    .then(json => {
                        loadStream({
                            type: type,
                            url: json.srcs[0].uniqueStreamer,
                            name: name,
                            lcn: lcn,
                            logo: logo
                        });
                    });
                break;

            case "wp-yt-iframe":
                await fetch(`https://${parameter}/wp-json/wp/v2/pages/${url.split("/")[4]}`)
                    .then(response => response.json())
                    .then(json => {
                        const iframeSrc = new DOMParser().parseFromString(json.content.rendered, "text/html").querySelector("iframe").src;
                        const videoURL = iframeSrc.replaceAll(new URL(iframeSrc).search, "");
                        const videoId = videoURL.split("/")[4];

                        loadStream({
                            type: type,
                            url: type === "youtube" ? videoId : videoURL.replaceAll("/embed/", "/watch?v="),
                            name: name,
                            lcn: lcn,
                            logo: logo
                        });
                    });
                break;

            case "streamingvideoprovider":
                await fetch(`https://service.webvideocore.net/?l=info&a=xmlClipPath&clip_id=${parameter}`)
                    .then(response => response.text())
                    .then(text => {
                        const xml = new DOMParser().parseFromString(text, "application/xml");

                        loadStream({
                            type: type,
                            url: xml.querySelector("url").textContent,
                            name: name,
                            lcn: lcn,
                            logo: logo
                        });
                    });
                break;

            case "persidera":
                await fetch("https://hbbtv.persidera.it/api/channels?action=getChannels&organizationId=15209")
                    .then(response => response.json())
                    .then(json => {
                        loadStream({
                            type: type,
                            url: json.channels.filter(ch => ch.logicalChannel == parameter)[0].urls[0].url,
                            name: name,
                            lcn: lcn,
                            logo: logo
                        });
                    });
                break;

            case "rubidia":
                if (url.split("/")[4] === "selector") {
                    await fetch(`https://hbbtv.rubidia.it/API/v3/Frontend/${parameter}/Launcher/${url.split("/")[5]}`)
                        .then(response => response.json())
                        .then(json => {
                            loadStream({
                                type: type,
                                url: json.Data.Buttons.filter(el => el[0].Id == url.split("/")[6])[0][0].Media.HLS,
                                name: name,
                                lcn: lcn,
                                logo: logo
                            });
                        });
                }

        };
    } else if (license) {
        switch(license) {
            
            case "xdevel-wms":
                await fetch("https://play.xdevel.com/was")
                    .then(response => response.json())
                    .then(json => {
                        loadStream({
                            type: type,
                            url: `${url}?wmsAuthSign=${json.was}`,
                            name: name,
                            lcn: lcn,
                            logo: logo
                        });
                    });
                break;

        };
    } else {
        await loadStream({ type: type, url: url, api: api, name: name, lcn: lcn, logo: logo, http: http, feed: feed })
    };
};

const getChannelLogoURL = (logo) => {
    const config = zappr.config.logos;

    return `${config.host}/${config.optimized ? "optimized/": ""}${logo}${logo.endsWith(".svg") ? "" : (config.optimized ? ".webp" : ".png")}`;
};


const getChannelsListURL = (path) => {
    const config = zappr.config.channels;

    return `${config.host}/${path}.json`;
};

const addChannels = (channels) => {
    if (window.location.search === "?amazon-appstore") {
        channels.filter(el => el.lcn === 7 || el.lcn === 29).forEach(el => {
            channels.splice(channels.indexOf(el), 1);
        });
    };
    channels.forEach(channel => {
        const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isGeoblocked = new URLSearchParams(location.search).get("geoblock-warning") != null;

        channelslist.insertAdjacentHTML("beforeend", `
            ${channel.hbbtv ? `<div class="hbbtv-container">` : ""}
                <div class="${channel.hbbtvapp ? "hbbtv-app" : ""} ${channel.hbbtvmosaic ? "hbbtv-enabler hbbtv-mosaic": "channel"} ${channel.adult === true ? "adult" : channel.adult === "night" ? "adult at-night" : ""}" data-name="${channel.name}" data-lowercase-name="${encodeURIComponent(channel.name.toLowerCase())}" data-logo="${getChannelLogoURL(channel.logo)}" ${channel.type != undefined && (!isGeoblocked || !channel.geoblock) ? `data-type="${channel.type}"` : ""} ${channel.type != undefined && typeof channel.geoblock === "object" && channel.geoblock && isGeoblocked ? `data-type="${channel.geoblock.type}"` : ""} ${channel.url != undefined && (!isGeoblocked || !channel.geoblock) ? `data-url="${channel.url}"` : ""} ${channel.url != undefined && typeof channel.geoblock === "object" && channel.geoblock && isGeoblocked ? `data-url="${channel.geoblock.url}"` : ""} data-lcn="${channel.lcn}" ${channel.seek != undefined ? `data-seek="${channel.seek}"` : ""} ${channel.disabled ? `disabled data-disabled="${channel.disabled}"` : ""} ${!channel.disabled && channel.http && isiOS ? `disabled data-disabled="http-ios"` : ""} ${!channel.disabled && channel.geoblock && isGeoblocked && typeof channel.geoblock === "boolean" ? `disabled data-disabled="geoblock"` : ""} ${channel.api && (!isGeoblocked || !channel.geoblock) ? `data-api="${channel.api}"` : ""} ${typeof channel.geoblock === "object" && channel.geoblock && isGeoblocked && channel.geoblock.api != undefined ? `data-api="${channel.geoblock.api}"` : ""} ${channel.cssfix ? `data-cssfix="${channel.cssfix}"` : ""} ${channel.http ? `data-http="true"` : ""} ${channel.license ? `data-license="${channel.license}"` : ""} ${channel.feed ? `data-feed="${channel.feed}"` : ""}>
                    <div class="lcn">${channel.lcn}</div>
                    <img class="logo" src="${getChannelLogoURL(channel.logo)}" crossorigin="anonymous">
                    <div class="channel-title-subtitle">
                        <div class="channel-name">${channel.name}</div>
                        ${channel.subtitle ? `<div class="channel-subtitle">${channel.subtitle}</div>` : ""}
                        ${channel.hbbtvmosaic ? `<div class="channel-subtitle">Mosaico HbbTV</div>` : ""}
                        ${channel.feed && !channel.subtitle ? `<div class="channel-subtitle">Non sempre attivo</div>` : ""}
                    </div>
                    ${channel.hd ? `<div class="hd"></div>` : ""}
                    ${channel.uhd ? `<div class="uhd"></div>` : ""}
                    ${channel.type === "audio" || channel.radio ? `<div class="radio"></div>` : ""}
                    ${channel.ondemand ? `<div class="ondemand"></div>` : ""}
                    ${channel.type === "popup" ? `<div class="external"></div>` : ""}
                    ${channel.adult === true ? `<div class="adult-marker"></div>`
                        : channel.adult === "night" ? `<div class="adult-marker at-night"></div>` : ""}

                    ${channel.hbbtvmosaic ? `<div class="hbbtv-enabler-arrow">&gt;</div>` : ""}
                </div>

                ${channel.hbbtv && !channel.hbbtvmosaic ? `<div class="hbbtv-enabler">
                    <div class="hbbtv-enabler-arrow">&gt;</div>
                    <div class="hbbtv-enabler-text">Visualizza canali HbbTV</div>
                </div>` : ""}
                ${channel.hbbtv ? `<div class="hbbtv-channels">
                    ${channel.hbbtv.map(subchannel =>
                        subchannel.categorySeparator === undefined
                            ? `<div class="channel ${subchannel.hbbtvapp ? "hbbtv-app" : ""} ${subchannel.adult === true ? "adult" : subchannel.adult === "night" ? "adult at-night" : ""}" data-name="${subchannel.name}" data-lowercase-name="${encodeURIComponent(subchannel.name.toLowerCase())}" data-logo="${getChannelLogoURL(subchannel.logo)}" ${subchannel.type != undefined ? `data-type="${subchannel.type}"` : ""} ${subchannel.url != undefined ? `data-url="${subchannel.url}"` : ""} data-lcn="${channel.lcn}.${subchannel.sublcn}" ${subchannel.seek ? `data-seek="${subchannel.seek}"` : ""} ${subchannel.disabled ? `disabled data-disabled="${subchannel.disabled}"` : ""} ${!subchannel.disabled && subchannel.http && isiOS ? `disabled data-disabled="http-ios"` : ""} ${!subchannel.disabled && subchannel.geoblock && isGeoblocked && typeof subchannel.geoblock === "boolean"? `disabled data-disabled="geoblock"` : ""} ${subchannel.api && (!isGeoblocked || !subchannel.geoblock) ? `data-api="${subchannel.api}"` : ""} ${typeof subchannel.geoblock === "object" && subchannel.geoblock && isGeoblocked && subchannel.geoblock.api != undefined ? `data-api="${subchannel.geoblock.api}"` : ""} ${subchannel.cssfix ? `data-cssfix="${subchannel.cssfix}"` : ""} ${subchannel.http ? `data-http="true"` : ""} ${subchannel.license ? `data-license="${subchannel.license}"` : ""} ${subchannel.feed ? `data-feed="${subchannel.feed}"` : ""}>
                                <div class="lcn">${channel.lcn}.${subchannel.sublcn}</div>
                                <img class="logo" src="${getChannelLogoURL(subchannel.logo)}" crossorigin="anonymous">
                                <div class="channel-title-subtitle">
                                    <div class="channel-name">${subchannel.name}</div>
                                    ${subchannel.subtitle != null ? `<div class="channel-subtitle">${subchannel.subtitle}</div>` : ""}
                                    ${subchannel.feed && !subchannel.subtitle ? `<div class="channel-subtitle">Non sempre attivo</div>` : ""}
                                </div>
                                ${subchannel.hd ? `<div class="hd"></div>` : ""}
                                ${subchannel.uhd ? `<div class="uhd"></div>` : ""}
                                ${subchannel.type === "audio" || subchannel.radio ? `<div class="radio"></div>` : ""}
                                ${subchannel.ondemand ? `<div class="ondemand"></div>` : ""}
                                ${subchannel.type === "popup" ? `<div class="external"></div>` : ""}
                                ${subchannel.adult === true ? `<div class="adult-marker"></div>`
                                    : subchannel.adult === "night" ? `<div class="adult-marker at-night"></div>` : ""}
                            </div>`
                            : `<div class="category">${subchannel.categorySeparator}</div>`
                    ).join("")}
                </div>` : ""}
            ${channel.hbbtv ? `</div>` : ""}
        `);
    });
};

await fetch(getChannelsListURL("it/dtt/national"))
    .then(response => response.json())
    .then(channels => {
        window.nationalChannels = channels;
    });

if (localStorage.getItem("region") != null && localStorage.getItem("region") != "national") {
    document.querySelector("select").value = localStorage.getItem("region");

    await fetch(getChannelsListURL(`it/dtt/regional/${localStorage.getItem("region")}`))
        .then(response => response.json())
        .then(json => {
            window.regionalChannels = json.channels;
            
            window.channels = nationalChannels.channels.concat(regionalChannels);
            window.channels.sort((a, b) => a.lcn - b.lcn);
        });
} else {
    window.channels = nationalChannels.channels;
    channels.filter(ch => ch.lcn === 103)[0].lcn = 3;
};
addChannels(channels);

const returnErrorMessage = (errorCode) => {
    return ({
        "not-working": "Lo streaming di questo canale non funziona al momento.",
        "http-ios": "Questo è un canale HTTP, una tipologia di canale che non è visibile su iOS.",
        "geoblock": "Questo canale non è visibile al di fuori dell'Italia."
    })[errorCode];
};

const adultChannelConfirmation = async (night = false) => {
    createModal({
        title: "Attenzione!",
        text: `${night ? `In questa fascia oraria (23:00 - 07:00), questo canale potrebbe trasmettere contenuti vietati ai minori di 18 anni.`
            : `Questo canale trasmette contenuti vietati ai minori di 18 anni.`}
            <br><br>Cliccando sul pulsante <b>Continua</b> qui sotto, confermi di essere consapevole della natura del materiale trasmesso e di avere l'età necessaria per poter guardarlo. Inoltre, accetti di assumerti la piena responsabilità della visione di questo canale, esonerando Zappr e i suoi affiliati da qualsiasi conseguenza derivante da un uso improprio o non autorizzato.<br><br><b>Continuare?</b>`,
        buttons: [{
            type: "primary",
            href: "#",
            text: "Continua"
        },
        {
            type: "secondary",
            href: "javascript:closeModal();",
            text: "Annulla"
        }]
    });

    document.querySelector(".modal .button.primary").addEventListener("click", () => {
        window.sessionStorage.setItem(`${night ? "nightAdult" : "adult"}ChannelConfirmation`, true);
        closeModal();
        document.querySelector(".channel.watching").click();
    });
};

const state = {
    schedule: {},
    timeouts: new Map(),
    playingRegional: false
};
  
const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};
  
const getCurrentTime = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};
  
const getCurrentDay = () => new Date().getDay();

const isSpecificDate = (program) => "day" in program;

const isProgramActive = (program) => {
    const now = new Date();
    const currentTime = getCurrentTime();
    const startTime = parseTime(program.from);
    const endTime = parseTime(program.to);
    
    if (isSpecificDate(program)) {
        const programDate = new Date(program.day);
        const isSameDate = now.toDateString() === programDate.toDateString();
        return isSameDate && currentTime >= startTime && currentTime < endTime;
    };
    
    const currentDay = getCurrentDay();
    return program.days.includes(currentDay) && currentTime >= startTime && currentTime < endTime;
};

const getNextAirTime = (program) => {
    const now = new Date();
    const currentTime = getCurrentTime();
    const startTime = parseTime(program.from);

    if (isSpecificDate(program)) {
        const programDate = new Date(program.day);
        if (programDate >= now && (programDate.getDate() !== now.getDate() || currentTime < startTime)) {
            return new Date(program.day + ' ' + program.from);
        };
        return null;
    };

    let nextDate = new Date();
    let daysToAdd = 0;
    const currentDay = getCurrentDay();

    if (currentTime >= startTime) {
        const nextDayIndex = program.days.find(day => day > currentDay);
        if (nextDayIndex !== undefined) {
            daysToAdd = nextDayIndex - currentDay;
        } else {
            daysToAdd = 7 - currentDay + program.days[0];
        };
    } else if (!program.days.includes(currentDay)) {
        const nextDayIndex = program.days.find(day => day > currentDay);
        if (nextDayIndex !== undefined) {
            daysToAdd = nextDayIndex - currentDay;
        } else {
            daysToAdd = 7 - currentDay + program.days[0];
        };
    };

    nextDate.setDate(nextDate.getDate() + daysToAdd);
    nextDate.setHours(...program.from.split(':'), 0, 0);
    return nextDate;
};

const scheduleProgram = (program) => {
    if (isProgramActive(program)) {
        const now = new Date();
        const endTime = new Date(now.toDateString() + ' ' + program.to);
        const timeUntilEnd = endTime.getTime() - now.getTime();
        
        const endTimeoutId = setTimeout(() => {
            loadStream({
                type: "dash",
                url: channels.filter(el => el.lcn === 103)[0].url,
                name: "Rai 3",
                lcn: 103,
                logo: getChannelLogoURL("rai3.svg")
            });
            scheduleProgram(program);
        }, timeUntilEnd);
        
        state.timeouts.set(`${program.title}-end`, endTimeoutId);
        loadStream({
            type: "dash",
            url: channels.filter(el => el.lcn === 3)[0].url,
            name: channels.filter(el => el.lcn === 3)[0].name,
            lcn: 3,
            logo: getChannelLogoURL("rai3.svg")
        });
        state.playingRegional = true;
        return;
    } else if (!state.playingRegional) {
        loadStream({
            type: "dash",
            url: channels.filter(el => el.lcn === 103)[0].url,
            name: "Rai 3",
            lcn: 103,
            logo: getChannelLogoURL("rai3.svg")
        });
    };

    const nextAirTime = getNextAirTime(program);
    if (!nextAirTime) return;

    const timeUntilAir = nextAirTime.getTime() - new Date().getTime();
    if (timeUntilAir <= 0) return;

    const timeoutId = setTimeout(() => {
        loadStream({
            type: "dash",
            url: channels.filter(el => el.lcn === 3)[0].url,
            name: channels.filter(el => el.lcn === 3)[0].name,
            lcn: 3,
            logo: getChannelLogoURL("rai3.svg")
        });
        state.playingRegional = true;
        
        const endTime = new Date(nextAirTime.toDateString() + ' ' + program.to);
        const timeUntilEnd = endTime.getTime() - nextAirTime.getTime();
        
        const endTimeoutId = setTimeout(() => {
            loadStream({
                type: "dash",
                url: channels.filter(el => el.lcn === 103)[0].url,
                name: "Rai 3",
                lcn: 103,
                logo: getChannelLogoURL("rai3.svg")
            });
            scheduleProgram(program);
        }, timeUntilEnd);
        
        state.timeouts.set(`${program.title}-end`, endTimeoutId);
      }, timeUntilAir);
    

    state.timeouts.set(program.title, timeoutId);
};

const start = (scheduleData) => {
    state.schedule = scheduleData;

    Object.values(scheduleData).flat().forEach(scheduleProgram);
};

const remove = () => {
    for (const timeoutId of state.timeouts.values()) {
        clearTimeout(timeoutId);
    };

    state.timeouts.clear();
    state.schedule = {};
    state.playingRegional = false;
};

const createScheduler = (scheduleData) => ({
    start: () => start(scheduleData),
    remove: () => remove()
});

document.querySelectorAll(".channel").forEach(el => {
    if (el.dataset.disabled != undefined) {
        el.title = returnErrorMessage(el.dataset.disabled);
        el.addEventListener("click", () => alert(returnErrorMessage(el.dataset.disabled)));
    } else {
        el.addEventListener("click", async () => {
            currentlyPlaying = el;

            if (state.schedule != {}) {
                createScheduler("").remove();
            };

            if (el.dataset.lcn === "3" && el.dataset.name.includes("TGR")) {
                const regionalPrograms = await fetch("https://www.rainews.it/dl/rai24/assets/json/palinsesto-tgr.json")
                    .then(response => response.json());

                createScheduler(regionalPrograms).start();
                return;
            };

            if (document.querySelector(`style.cssfix[media=""]`) != null) {
                document.querySelector(`style.cssfix[media=""]`).media = "not all";
            };

            if (el.dataset.cssfix != undefined) {
                document.querySelector(`style.cssfix#${el.dataset.cssfix}-fix`).media = "";
            };

            if (el.classList.contains("hbbtv-app")) {
                overlays.classList.add("hbbtv-app");
            } else if (overlays.classList.contains("hbbtv-app") && !el.classList.contains("hbbtv-app")) {
                overlays.classList.remove("hbbtv-app");
            };

            if (document.querySelector(".watching") != null) {
                document.querySelector(".watching").classList.remove("watching");
            };
            if (document.querySelector(".watching-hbbtv") != null) {
                document.querySelector(".watching-hbbtv").classList.remove("watching-hbbtv");
            };
            if (el.dataset.lcn.includes(".")) {
                el.closest(".hbbtv-container").querySelector(".channel").classList.add("watching-hbbtv");
                if (!el.closest(".hbbtv-container").querySelector(".hbbtv-enabler").classList.contains("clicked")) {
                    el.closest(".hbbtv-container").querySelector(".hbbtv-enabler").classList.add("clicked");
                };
            };
            el.classList.add("watching");
            if (el.classList.contains("adult")) {
                if (!el.classList.contains("at-night") && window.sessionStorage.getItem("adultChannelConfirmation") != "true") {
                    adultChannelConfirmation();
                    return;
                } else if (el.classList.contains("at-night") && (new Date().getHours() >= 23 || new Date().getHours() < 7) && window.sessionStorage.getItem("nightAdultChannelConfirmation") != "true") {
                    adultChannelConfirmation(true);
                    return;
                };
            };
            await loadChannel({
                type: el.dataset.type,
                url: el.dataset.url,
                api: el.dataset.api,
                name: el.dataset.name,
                lcn: el.dataset.lcn,
                logo: el.dataset.logo,
                http: el.dataset.http,
                license: el.dataset.license,
                feed: el.dataset.feed
            });
        });
    };
});
document.querySelectorAll(".hbbtv-enabler").forEach(el => {
    el.addEventListener("click", () => el.classList.toggle("clicked"));
});

const selectChannel = (channel, zapping) => {
    try {
        document.querySelector("input").value = "";
        document.querySelector("#search").innerHTML = "";

        if (typeof(channel) === "number" || typeof(channel) === "string") targetedChannel = document.querySelector(`.channel[data-lcn="${channel}"]`);
        else if (typeof(channel) === "object") targetedChannel = channel;
    
        if (targetedChannel === null) targetedChannel = document.querySelector(`.hbbtv-enabler[data-lcn="${channel}"]`);
        setTimeout(() => {
            try {
                targetedChannel.scrollIntoView({
                    block: "center",
                    behavior: "smooth"
                });
            } catch {};
        }, targetedChannel != undefined && targetedChannel.dataset.lcn.includes(".") && !zapping ? 250 : 0);
        targetedChannel.classList.add("highlighted");
    
        if (zapping) {
            if (targetedChannel.previousElementSibling != null) {
                targetedChannel.previousElementSibling.classList.remove("highlighted");
            }
            if (targetedChannel.previousElementSibling != null && targetedChannel.previousElementSibling.querySelector(".channel") != null) {
                targetedChannel.previousElementSibling.querySelector(".channel").classList.remove("highlighted");
            }
            if (targetedChannel.parentElement.className === "hbbtv-container") {
                if (targetedChannel.parentElement.previousElementSibling.querySelector(".channel") != null) {
                    targetedChannel.parentElement.previousElementSibling.querySelector(".channel").classList.remove("highlighted");
                } else {
                    targetedChannel.parentElement.previousElementSibling.classList.remove("highlighted");
                };
            };
            if (targetedChannel.nextElementSibling != null) {
                targetedChannel.nextElementSibling.classList.remove("highlighted");
            }
            if (targetedChannel.nextElementSibling != null && targetedChannel.nextElementSibling.querySelector(".channel") != null) {
                targetedChannel.nextElementSibling.querySelector(".channel").classList.remove("highlighted");
            }
            if (targetedChannel.parentElement.className === "hbbtv-container") {
                if (targetedChannel.parentElement.nextElementSibling.querySelector(".channel") != null) {
                    targetedChannel.parentElement.nextElementSibling.querySelector(".channel").classList.remove("highlighted");
                } else {
                    targetedChannel.parentElement.nextElementSibling.classList.remove("highlighted");
                };
            };
        };
    
        targetedChannel.focus();
        targetedChannel.click();
    } catch {};
};

const toggleNightAdultChannelsStyle = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const nextToggleTime = new Date();
    
    if (currentHour >= 23 || currentHour < 7) {
        nightAdultChannelsStyle.media = "not all";
        nextToggleTime.setHours(7, 0, 0, 0);
        if (currentHour >= 23) {
            nextToggleTime.setDate(nextToggleTime.getDate() + 1);
        }
    } else {
        nightAdultChannelsStyle.media = "";
        nextToggleTime.setHours(23, 0, 0, 0);
        if (currentHour < 7) {
            nextToggleTime.setDate(nextToggleTime.getDate() - 1);
        }
    };

    setTimeout(toggleNightAdultChannelsStyle, nextToggleTime.getTime() - now.getTime());
};

toggleNightAdultChannelsStyle();

const keydownHandler = (e) => {
    if (document.activeElement != document.querySelector("input")) {
        if (e.code === "Escape" && document.querySelector(".modal") != null && document.querySelector(".modal").classList.contains("is-visible")) closeModal();

        if (["Backspace", "Delete", "NumpadEnter", "Enter", "Escape", "PageUp", "PageDown"].includes(e.code) || e.key === "." || e.code.startsWith("Digit") || (e.code.startsWith("Numpad") && e.code.length === 7)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
        };
        const lcnTypingElement = document.querySelector("#lcn-typing"),
            lcnTypedElement = document.querySelector("#lcn-typed"),
            controlsElement = document.querySelector("#controls");
        
        let matchedChannel = channels.filter(ch => ch.lcn === parseInt(lcnTypedElement.innerText));

        if ((lcnTypedElement.innerText.includes(".") && matchedChannel[0] != undefined && matchedChannel[0].hbbtv && matchedChannel[0].hbbtv.filter(subch => subch.sublcn == lcnTypedElement.innerText.split(".")[1]).length === 0) || (lcnTypedElement.innerText.includes(".") && matchedChannel[0] != undefined && !matchedChannel[0].hbbtv)) {
            matchedChannel = [];
        };
        
        if (!multipleChannelSelection && e.code.startsWith("Digit") || (e.code.startsWith("Numpad") && e.code.length === 7) || e.key === "." || e.code === "NumpadDecimal") {
            typingLCN = true;
            lcnTypingElement.style.display = "block";
            if (!(e.key === "." && lcnTypedElement.innerText.includes("."))) {
                lcnTypedElement.innerText += e.code.startsWith("Digit") || e.key === "." ? e.key : e.code.replaceAll("Numpad", "").replaceAll("Decimal", ".");
            };
        };

        if (typingLCN) {
            switch(e.code) {
                case "Backspace":
                case "Delete":
                case "NumpadDivide":
                case "NumpadMultiply":
                case "NumpadSubtract":
                    if (lcnTypedElement.innerText.slice(0, -1) === "") {
                        lcnTypingElement.style.display = "none";
                    };
                    lcnTypedElement.innerText = lcnTypedElement.innerText.slice(0, -1);
                    break;

                case "NumpadEnter":
                case "Enter":
                    if (matchedChannel.length != 0 && lcnTypedElement.innerText.slice(-1) != ".") {
                        if (matchedChannel.length > 1) {
                            multipleChannelSelection = true;
                        } else {
                            selectChannel(lcnTypedElement.innerText);
                            lcnTypingElement.style.display = "none";
                            lcnTypedElement.innerText = "";
                            typingLCN = false;
                        };
                    } else {
                        lcnTypingElement.classList.add("shaking");
                        setTimeout(() => {
                            lcnTypingElement.classList.remove("shaking");
                        }, 500);
                    };
                    break;

                case "Escape":
                    lcnTypingElement.style.display = "none";
                    lcnTypedElement.innerText = "";
                    typingLCN = false;
                    break;

            };

        };

        if (multipleChannelSelection) {
            controlsElement.innerHTML = `<b>Premi ${matchedChannel.map((channel, index) => `${index + 1} per ${channel.name}`).join(",<br>")}<br>oppure Esc per annullare</b>`;

            if (e.code.startsWith("Digit") || (e.code.startsWith("Numpad") && e.code.length === 7)) {
                const number = e.code.startsWith("Digit") ? e.key : e.code.replaceAll("Numpad", "");

                if (number <= matchedChannel.length && number != 0 && [number - 1] != undefined) {
                    selectChannel(document.querySelector(`.channel[data-name="${matchedChannel[number - 1].name}"][data-lcn="${matchedChannel[number - 1].lcn}"]`));
                    lcnTypingElement.style.display = "none";
                    lcnTypedElement.innerText = "";
                    controlsElement.innerHTML = "Invio per confermare<br>o Esc per annullare";
                    typingLCN = false;
                    multipleChannelSelection = false;
                };
            } else if (e.code === "Escape") {
                lcnTypingElement.style.display = "none";
                lcnTypedElement.innerText = "";
                controlsElement.innerHTML = "Invio per confermare<br>o Esc per annullare";
                typingLCN = false;
                multipleChannelSelection = false;
            };
        };

        if (e.code === "PageUp" || e.code === "PageDown") {
            if (currentlyPlaying === "") {
                selectChannel(1);
            } else {
                const firstChannel = document.querySelectorAll(".channel")[0];
                const lastChannel = document.querySelectorAll(".channel")[document.querySelectorAll(".channel").length - 1];
                if (currentlyPlaying === firstChannel) {
                    target = e.code === "PageUp" ? lastChannel : currentlyPlaying.nextElementSibling;
                } else if (currentlyPlaying === lastChannel) {
                    target = e.code === "PageDown" ? firstChannel : currentlyPlaying.previousElementSibling;
                } else if (currentlyPlaying.parentElement.classList.contains("hbbtv-container")) {
                    target = e.code === "PageUp" ? currentlyPlaying.parentElement.previousElementSibling : currentlyPlaying.parentElement.nextElementSibling;
                } else if (currentlyPlaying.parentElement.classList.contains("hbbtv-channels") && currentlyPlaying.previousElementSibling === null) {
                    target = e.code === "PageUp" ? currentlyPlaying.parentElement.parentElement.querySelector(".channel") : currentlyPlaying.nextElementSibling;
                } else {
                    target = e.code === "PageUp" ? currentlyPlaying.previousElementSibling : currentlyPlaying.nextElementSibling;
                };

                if (target.classList.contains("hbbtv-container")) {
                    target = target.querySelector(".channel");
                } else if (target.classList.contains("hbbtv-enabler")) {
                    target = target.parentElement.nextElementSibling;
                } else if (target.classList.contains("category")) {
                    target = e.code === "PageUp" ? target.previousElementSibling : target.nextElementSibling;
                };

                if (target != undefined) {
                    selectChannel(target, true);
                };
            };

        };
    };
};

window.addEventListener("keydown", keydownHandler);

document.querySelectorAll(".tooltip").forEach(el => {
    el.addEventListener("click", async () => {
        document.querySelectorAll(`.tooltip-content:not(${el.dataset.target})`).forEach(el => {
            el.classList.remove("visible");
        });
        document.querySelector(el.dataset.target).classList.toggle("visible");
        if (el.dataset.target === "#news" && document.querySelector("#news").classList.contains("news-not-loaded")) {
            await fetch("https://mastodon.uno/@zappr.rss")
                .then(response => response.text())
                .then(xml => {
                    const rss = new DOMParser().parseFromString(xml, "application/xml");
                    const posts = rss.querySelectorAll("item");
                    posts.forEach(post => {
                        const postContent = new DOMParser().parseFromString(post.querySelector("description").textContent, "text/html");
                        if (!postContent.body.innerText.includes("⠀")) {
                            const postLink = postContent.querySelector("a:not(.mention, .hashtag)") != null ? postContent.querySelector("a:not(.mention, .hashtag)").getAttribute("href") : post.querySelector("link").textContent;
                            if (postContent.querySelector("a:not(.mention, .hashtag)") != null) {
                                postContent.querySelectorAll("a:not(.mention, .hashtag)").forEach(link => {
                                    link.remove();
                                });
                            };
                            if (postContent.querySelector(":empty") != null) {
                                postContent.querySelectorAll(":empty").forEach(paragraph => {
                                    paragraph.remove();
                                });
                            };
    
                            document.querySelector("#news-list").insertAdjacentHTML("afterbegin", `
                                <div class="news-item">
                                    <a class="news-content" href="${postLink}" target="_blank">
                                        <span class="news-date">${DateTime.fromRFC2822(post.querySelector("pubDate").textContent).setLocale("it").toLocaleString()}</span>
                                        ${Array.from(postContent.querySelectorAll("p")).map(paragraph => paragraph.innerText).join("<br><br>")}
                                    </a>
                                    ${post.children[post.children.length - 1].tagName === "media:content" && post.children[post.children.length - 1].getAttribute("type").startsWith("image/")
                                        ? `<img class="news-image" src="${post.children[post.children.length - 1].getAttribute("url").replaceAll("/original/", "/small/")}" data-zoom-src="${post.children[post.children.length - 1].getAttribute("url")}">`
                                        : ""
                                    }
                                </div>
                            `)
                        };
                    });
                });
            
            mediumZoom(".news-image", { background: "rgba(0, 0, 0, 0.8)", margin: 32 });
            document.querySelector("#news").classList.remove("news-not-loaded");
        };
    });
});

// https://stackoverflow.com/a/67240166/4168960
const updateSelectWidth = (e) => {
    const target = document.querySelector("select");

    let tempSelect = document.createElement("select"),
        tempOption = document.createElement("option");
  
    tempOption.textContent = target.options[target.selectedIndex].text;
    tempSelect.style.cssText += `
        visibility: hidden;
        position: fixed;
    `;
    tempSelect.appendChild(tempOption);
    target.after(tempSelect);
    
    const tempSelectWidth = tempSelect.getBoundingClientRect().width;
    target.style.width = `${tempSelectWidth}px`;
    tempSelect.remove();
};

updateSelectWidth();
document.querySelector("select").addEventListener("change", e => updateSelectWidth(e));

document.querySelector("#save-and-reload").addEventListener("click", () => {
    localStorage.setItem("region", document.querySelector("select").value);
    location.reload();
});

let installPrompt = null;
const installButton = document.querySelector("#icons #install");
const disableInAppInstallPrompt = () => {
    installPrompt = null;
    installButton.setAttribute("hidden", "");
};

window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    installPrompt = e;
    installButton.removeAttribute("hidden");
});

installButton.addEventListener("click", async e => {
    e.preventDefault();
    if (!installPrompt) return;
    await installPrompt.prompt();
    disableInAppInstallPrompt();
});

window.addEventListener("appinstalled", () => {
    disableInAppInstallPrompt();
});

window["copyInfo"] = () => {
    document.querySelector(".modal .technical-info a").innerText = "Copiato!";
    document.querySelector(".modal .technical-info a").classList.add("copied");
    setTimeout(() => {
        document.querySelector(".modal .technical-info a").innerText = "Copia";
        document.querySelector(".modal .technical-info a").classList.remove("copied");
    }, 2500);
    let range = document.createRange();
    range.selectNode(document.querySelector(".modal .code"));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    navigator.clipboard.writeText(document.querySelector(".modal .code").innerText);
};

document.querySelector("input").addEventListener("input", e => {
    const search = encodeURIComponent(e.target.value.toLowerCase());
    document.querySelector("#search").innerHTML = search ? `#channels > .channel:not([data-lowercase-name*="${search}"]), #channels > .hbbtv-container > .channel:not([data-lowercase-name*="${search}"], :has(+ .hbbtv-enabler + .hbbtv-channels > .channel[data-lowercase-name*="${search}"])), #channels > .hbbtv-container > .channel:not([data-lowercase-name*="${search}"], :has(+ .hbbtv-enabler + .hbbtv-channels > .channel[data-lowercase-name*="${search}"])) + .hbbtv-enabler, .hbbtv-mosaic:not([data-lowercase-name*="${search}"], :has(+ .hbbtv-channels > .channel[data-lowercase-name*="${search}"])), .channel:not([data-lowercase-name*="${search}"]) + .hbbtv-enabler + .hbbtv-channels .channel:not([data-lowercase-name*="${search}"]), .hbbtv-mosaic:not([data-lowercase-name*="${search}"]) + .hbbtv-channels .channel:not([data-lowercase-name*="${search}"]), .channel:not([data-lowercase-name*="${search}"]) + .hbbtv-enabler + .hbbtv-channels .category, .hbbtv-mosaic:not([data-lowercase-name*="${search}"]) + .hbbtv-channels .category {
    display: none;
}
.hbbtv-channels:has([data-lowercase-name*="${search}"]) {
    height: var(--scroll-height);
    border-bottom: 2px #373737 solid;
}
.hbbtv-container:has(.hbbtv-channels [data-lowercase-name*="${search}"]) > .channel + .hbbtv-enabler {
    height: 2.5rem;
    padding: 0.5rem 0 0.5rem 1rem;
    border-bottom: 2px #373737 solid;
}
.hbbtv-container:has(.hbbtv-channels [data-lowercase-name*="${search}"]) .hbbtv-enabler-arrow {
    transform: rotate(90deg);
}` : "";
});
document.querySelector("#search-icon").addEventListener("click", () => {
    if (!document.querySelector("#channels-column").classList.contains("search-visible")) document.querySelector("input").focus();
    document.querySelector("#channels-column").classList.toggle("search-visible");
});

// https://stackoverflow.com/a/60949881
Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))).then(() => {
    document.querySelector("#loading").classList.add("loaded");
    document.querySelectorAll(".hbbtv-channels").forEach(el => {
        el.style.cssText = `--scroll-height: ${el.scrollHeight}px;`;
    });
    if (new URLSearchParams(location.search).get("lcn") != null) {
        selectChannel(new URLSearchParams(location.search).get("lcn"));
    };
});