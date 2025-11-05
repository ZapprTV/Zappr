import videojs from "video.js";
import "videojs-contrib-quality-menu";
import { DateTime } from "luxon";
import mediumZoom from "medium-zoom";
import { merge } from "lodash";
import "videojs-contrib-eme";
import locales from "./locales";
import countries from "./countries";

let ipLocation = await fetch("https://zappr.stream/cdn-cgi/trace")
    .then(response => response.text())
    .then(trace => trace.split("\n").filter(el => el.startsWith("loc="))[0].split("=")[1].toLowerCase())
    .catch(() => "uk");

ipLocation = ipLocation in countries ? ipLocation : "uk";

const isFirstVisit = JSON.stringify(localStorage) === "{}";
const getCountry = () => {
    if (localStorage.getItem("videojs-vhs") && !localStorage.getItem("country")) localStorage.setItem("country", "it")
    else if (countries[ipLocation].nationalBase) localStorage.setItem("region", Object.keys(countries[ipLocation].regions[Object.keys(countries[ipLocation].regions)[0]])[0]);
    if (ipLocation && !localStorage.getItem("country")) {
        localStorage.setItem("country", ipLocation);
        return ipLocation;
    } else return localStorage.getItem("country") || Object.keys(countries)[0];
};
const getLanguage = () => {
    return localStorage.getItem("language") || (navigator.language || "en").split("-")[0];
};

let selectedCountry = getCountry();
let selectedLanguage = getLanguage();
try {
    if (!Object.keys(Object.assign({}, ...Object.keys(countries[selectedCountry].regions).map(group => countries[selectedCountry].regions[group]))).includes(localStorage.getItem("region"))) localStorage.removeItem("region");
} catch {
    localStorage.removeItem("region");
};
let selectedRegion = localStorage.getItem("region");
let language = selectedLanguage in locales ? selectedLanguage : "en";
let locale = locales[language];

const languageDropdown = document.querySelector("#language");
Object.keys(locales).forEach(lang => {
    languageDropdown.insertAdjacentHTML("beforeend", `<option value="${lang}" ${lang === selectedLanguage ? "selected" : ""}>${locales[lang].languageName}</option>`);
});

const countryDropdown = document.querySelector("#country");
Object.entries(countries).forEach(([country, value]) => {
    countryDropdown.insertAdjacentHTML("beforeend", `<option value="${country}" ${country === selectedCountry ? "selected" : ""}>${value.name}</option>`);
});

languageDropdown.addEventListener("change", e => {
    localStorage.setItem("language", e.target.value);
    locale = locales[e.target.value];
    languageDropdown.querySelector("[selected]").removeAttribute("selected");
    languageDropdown.querySelector(`option[value="${e.target.value}"]`).setAttribute("selected", "");
    document.querySelectorAll("[data-translation-id], [data-translation-hide]").forEach(el => {
        if (!el.dataset.translationHide) {
            if (el.dataset.translationTarget) el.setAttribute(el.dataset.translationTarget, locale[el.dataset.translationId])
                else el.innerHTML = locale[el.dataset.translationId];
        } else {
            let languages = el.dataset.translationHide.split(", ");
            if (languages.includes(language)) el.remove();
        };
    });
});
if (!countries[selectedCountry].nationalBase) document.querySelector("#region").insertAdjacentHTML("beforeend", `<option value="national">Nessuna (solo canali nazionali)</option>`)
document.querySelector("#region").insertAdjacentHTML("beforeend", Object.keys(countries[selectedCountry].regions).map(group => `<optgroup label="${group}">
    ${Object.keys(countries[selectedCountry].regions[group]).map(region => `<option value="${region}" ${region === selectedRegion ? "selected" : ""}>${countries[selectedCountry].regions[group][region]}</option>`)}
</optgroup>`));
countryDropdown.addEventListener("change", e => {
    localStorage.setItem("country", e.target.value);
    document.querySelector("#region").innerHTML = "";
    countryDropdown.querySelector("[selected]").removeAttribute("selected");
    countryDropdown.querySelector(`option[value="${e.target.value}"]`).setAttribute("selected", "");
    if (!countries[e.target.value].nationalBase) document.querySelector("#region").insertAdjacentHTML("beforeend", `<option value="national">Nessuna (solo canali nazionali)</option>`)
    document.querySelector("#region").insertAdjacentHTML("beforeend", Object.keys(countries[e.target.value].regions).map(group => `<optgroup label="${group}">
        ${Object.keys(countries[e.target.value].regions[group]).map(region => `<option value="${region}" ${e.target.value === selectedCountry && region === selectedRegion ? "selected" : ""}>${countries[e.target.value].regions[group][region]}</option>`)}
    </optgroup>`));
    updateSelectWidth(document.querySelector("#region"));
    document.querySelector("#save-and-reload").removeAttribute("hidden");
    localStorage.setItem("region", document.querySelector("#region").value);
});
document.querySelectorAll("[data-translation-id], [data-translation-hide]").forEach(el => {
    if (!el.dataset.translationHide) {
        if (el.dataset.translationTarget) el.setAttribute(el.dataset.translationTarget, locale[el.dataset.translationId])
            else el.innerHTML = locale[el.dataset.translationId];
    } else {
        let languages = el.dataset.translationHide.split(", ");
        if (languages.includes(language)) el.remove();
    };
});

await fetch("/config.json")
    .then(response => response.json())
    .then(json => window["zappr"] = json)
    .catch(err => {
        console.warn(`Can't find config (${err}), using the default`);
        window["zappr"] = {
            "config": {
                "channels": {
                    "host": "https://channels.zappr.stream"
                },
                "backend": {
                    "host": {
                        "vercel": "https://vercel-api.zappr.stream",
                        "cloudflare": "https://cloudflare-api.zappr.stream",
                        "alwaysdata": "https://zappr.alwaysdata.net"
                    }
                },
                "logos": {
                    "host": "https://channels.zappr.stream/logos",
                    "optimized": true
                },
                "epg": {
                    "host": "https://epg.zappr.stream"
                },
                "fast": {
                    "host": "https://fast.zappr.stream"
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
        reloadSourceOnError: {},
        eme: {}
    }
});

window.zappr.player = player;
window.zappr.videojs = videojs;

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
      nightAdultChannelsStyle = document.querySelector("#night-adult-channels");

window.zappr.closeModal = () => {
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
                <div class="close" onclick="window.zappr.closeModal()"></div>
            </div>
            <p>${error}</p>
            ${info != undefined ? `
            <div class="technical-info">
                <h3>${locale["errorTechnicalInfo"]}</h3>
                <a onclick="copyInfo()">${locale["errorCopyInfo"]}</a>
            </div>
            <div class="code" onclick="copyInfo()">${info}</div>    
            ` : ""}
            <p id="report-error">${locale["reportError"]}</p>
            <div class="modal-buttons">
                <a class="button primary" href="https://github.com/ZapprTV/channels/issues/new?${urlParams}" target="_blank">
                    ${locale["reportViaGithub"]}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h14v-7h2v7q0 .825-.587 1.413T19 21zm4.7-5.3l-1.4-1.4L17.6 5H14V3h7v7h-2V6.4z"></path></svg>
                </a>
                <a class="button secondary" href="mailto:zappr@francescoro.si?subject=${params.title}&body=${
                    encodeURIComponent(`${locale["errorTechnicalInfo"]}: ${params.info}

${locale["errorEmailFooter"]}

`)
                }" target="_blank">
                    ${locale["reportViaEmail"]}
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

const createModal = async ({ title, text, buttons, id }) => {
    const modalHTML = `<div class="modal" ${id ? `id="${id}-modal"` : ""}>
        <div class="modal-content">
            <div class="modal-title">
                <h1>${title}</h1>
                <div class="close" onclick="window.zappr.closeModal()"></div>
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
const waitForSelector = (selector) => {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) return resolve(document.querySelector(selector));

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document, {
            childList: true,
            subtree: true
        });
    });
};

if (ipLocation != selectedCountry) {
    createModal({
        title: locale["warning"],
        text: locale["geoblockMessage"],
        buttons: language === "it" ? [{
            type: "primary",
            href: "/vpn",
            text: `Scopri le VPN che consigliamo <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h14v-7h2v7q0 .825-.587 1.413T19 21zm4.7-5.3l-1.4-1.4L17.6 5H14V3h7v7h-2V6.4z"></path></svg>`,
            newtab: true
        }] : []
    });
};
if (isFirstVisit) {
    createModal({
        title: locale["welcomeTitle"],
        text: locale["welcomeText"],
        id: "welcome"
    })
};
if (new URLSearchParams(location.search).get("androidtv") != null) {
    document.querySelector("#save-and-reload").removeAttribute("hidden");
    document.body.classList.add("androidtv");
    document.querySelector("#tv-style").media = "";
    waitForSelector(".channel").then(el => el.focus());

    window.addEventListener("keydown", e => {
        if (document.activeElement.classList.contains("channel-program") || document.activeElement.classList.contains("channel")) document.activeElement.closest(".channel").scrollIntoView({ block: "center" });
        if (document.activeElement.classList.contains("hbbtv-enabler") && (e.key === "Enter" || e.key === " ")) {
            document.activeElement.nextElementSibling.classList.toggle("clicked");
        };
        if (window.location.hash != "#canPressBack") window.location.hash = "canPressBack";
        if (!document.querySelector("#settings").classList.contains("visible")) {
            if (e.key === "Enter" || e.key === " " || e.key === "MediaPlayPause") {
                if (document.querySelector("#channels-column").style.width === "0%") {
                    if (player.paused()) player.play()
                    else player.pause()
                } else if (document.querySelector("#channels-column").style.width != "0%" && e.key != "MediaPlayPause") {
                    if (document.querySelector(":focus") != null) document.querySelector(":focus").click();
                };
            } else if ((e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "MediaRewind" || e.key === "MediaFastForward") && document.querySelector("#channels-column").style.width === "0%") {
                player.userActive(true);
                if (e.key === "ArrowLeft" || e.key === "MediaRewind") player.currentTime(player.currentTime() - 5)
                else if (e.key === "ArrowRight" || e.key === "MediaFastForward") player.currentTime(player.currentTime() + 5);
            } else if (e.key === "ArrowRight" && document.querySelector("#channels-column").style.width != "0%" && document.querySelector("iframe") === null && document.querySelector("#hide-player").media === "not all") {
                document.querySelector("#channels-column").style.width = "0%";
                document.querySelector("#channels-column").style.transform = "translateX(-33.3333vw)";
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                if (document.querySelector(".channel.watching") != null && document.querySelector("#channels-column").style.width === "0%") {
                    if (document.querySelector(".channel.watching .channel-program")) document.querySelector(".channel.watching .channel-program").focus()
                        else document.querySelector(".channel.watching").focus();
                };
                document.querySelector("#channels-column").style.width = "33.3333%";
                document.querySelector("#channels-column").style.transform = "translateX(0)";
            };
        } else {
            if (e.key === "Enter" || e.key === " ") {
                if (document.querySelector(":focus") != null) document.querySelector(":focus").click()
            };
        };
    });
    window.addEventListener("hashchange", e => {
        if (new URL(e.oldURL).hash === "#canPressBack" && new URL(e.newURL).hash === "") {
            if (document.querySelector("#channels-column").style.width != "0%") {
                document.querySelector("#settings").classList.toggle("visible");
                document.querySelector("#channels").classList.toggle("tv-settings-open");
                if (!document.querySelector("#channels-column").classList.contains("epg-visible")) {
                    document.querySelector("#epg").classList.add("is-hidden");
                };
                document.querySelector("#channels-column").classList.add("overflow-visible");
                if (document.querySelector(":focus") != null) document.querySelector(":focus").blur();
            } else if (document.querySelector("#channels-column").style.width === "0%") {
                if (document.querySelector(".channel.watching") != null) {
                    if (document.querySelector(".channel.watching .channel-program")) document.querySelector(".channel.watching .channel-program").focus()
                        else document.querySelector(".channel.watching").focus();
                };
                document.querySelector("#channels-column").style.width = "33.3333%";
                document.querySelector("#channels-column").style.transform = "translateX(0)";
            };
            window.location.hash = "canPressBack";
        };
    });

    player.on("play", () => {
        document.querySelector("#channels-column").style.width = "0%";
        document.querySelector("#channels-column").style.transform = "translateX(-33.3333vw)";
    });

    document.querySelector("#region").outerHTML = `<div class="region national"><input type="radio" value="national" id="national" name="region"><label for="national">Nessuna (solo canali nazionali)</label></div><div id="region">${document.querySelector("#region").innerHTML}</div>`;
    document.querySelectorAll("#region option").forEach(el => {
        if (el.value === "national") el.remove()
        else el.outerHTML = `<div class="region"><input type="radio" value="${el.value}" id="${el.value}" name="region"><label for="${el.value}">${el.innerText}</label></div>`
    });
    document.querySelectorAll("#region optgroup").forEach(el => {
        el.outerHTML = `<div class="region-group"><span class="region-group-name">${el.label}</span><div class="regions">${el.innerHTML}</div></div>`
    });
};

const loadStream = async ({ type, url, api = false, name, lcn, logo, fullLogo, radio = false, http = false, feed = false, drm = null, fallbackType = null, fallbackURL = null, fallbackAPI = false, timeshift = 0 }) => {
    if (api) {
        url = `${window["zappr"].config.backend.host[api]}/api?${url}`;
    };

    if (type === "audio" || radio === "true") {
        if (overlays.querySelector("#radio-overlay") === null) {
            overlays.insertAdjacentHTML("beforeend", `<div id="radio-overlay">
                <img src="${fullLogo}">
                <div id="radio-overlay-info">
                    <span id="radio-overlay-playing">${locale["nowPlaying"]}</span>
                    <h1 id="radio-overlay-radio">${name}</h1>
                </div>
            </div>`);
        } else {
            overlays.querySelector("#radio-overlay").outerHTML = `<div id="radio-overlay">
                <img src="${fullLogo}">
                <div id="radio-overlay-info">
                    <span id="radio-overlay-playing">${locale["nowPlaying"]}</span>
                    <h1 id="radio-overlay-radio">${name}</h1>
                </div>
            </div>`;
        };
        overlays.classList.add("radio-overlay");
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
            });

            overlays.insertAdjacentElement("beforeend", fullscreenButtonContainer);
        };
        document.querySelector(".vjs-fullscreen-control").style.opacity = "0";
    } else if (overlays.querySelector("#radio-overlay") != null) {
        overlays.classList.remove("radio-overlay");
        overlays.querySelector("#radio-overlay").remove();
        document.querySelector(".vjs-fullscreen-control").style.opacity = "1";
    };

    window.zappr.closeModal();

    if (timeshift) {
        player.on("loadeddata", () => {
            player.currentTime(player.currentTime() - timeshift * 3600);
            player.off("loadeddata");
        });
    };
    player.off("error");
    player.on("error", async () => {
        window.zappr.closeModal();
        if (!feed && fallbackType === null) {
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
                        href: "javascript:window.zappr.closeModal();",
                        text: "Annulla"
                    }]
                });
            } else if (player.error().code === 4) {
                let httpError;

                await fetch(player.src())
                    .then(response => httpError = `${response.status} ${response.statusText}`)
                    .catch(() => {});

                createErrorModal({
                    title: locale["channelError"],
                    error: `${locale["cantLoad"]} <b>${name}</b> <i>(${url})</i> ${locale["formatServerError"]}${httpError ? `: <b>${httpError}</b>` : ` ${locale["unknownSuffix"]}.`}`,
                    params: {
                        template: `error-${language}.yml`,
                        title: `${lcn} - ${name}: ${locale["formatServerErrorTitle"]} (${httpError ? httpError : locale["unknownSuffix"]})`,
                        name: name,
                        lcn: lcn,
                        info: `MEDIA_ERR_SRC_NOT_SUPPORTED: ${httpError ? httpError : `${locale["unknownErrorInfo"]}.`}`
                    }
                });
            } else if (player.error().code === 3) {
                let videojsLog = videojs.log.history().slice(Math.max(videojs.log.history().length - 50, 1)).map(el => el.map(key => typeof key === "object" ? JSON.stringify(key) : key).join(" ")).join("\n");

                createErrorModal({
                    title: locale["channelError"],
                    error: `${locale["cantLoad"]} <b>${name}</b> <i>(${url})</i> ${locale["decodingError"]}.`,
                    info: videojsLog,
                    params: {
                        template: `error-${language}.yml`,
                        title: `${lcn} - ${name}: ${locale["decodingErrorTitle"]}`,
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
                    title: locale["channelError"],
                    error: `${locale["cantLoad"]} <b>${name}</b> <i>(${url})</i> ${locale["serverError"]}${httpError ? `: <b>${httpError}</b>` : ` ${locale["unknownSuffix"]}`}.`,
                    params: {
                        template: `error-${language}.yml`,
                        title: `${lcn} - ${name}: ${locale["serverErrorTitle"]} (${httpError ? httpError : locale["unknownSuffix"]})`,
                        name: name,
                        lcn: lcn,
                        info: `MEDIA_ERR_NETWORK: ${httpError ? httpError : `${locale["unknownErrorInfo"]}.`}`
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
                    title: locale["channelError"],
                    error: `${locale["cantLoad"]} <b>${name}</b> <i>(${url})</i> ${locale["unknownError"]}.`,
                    info: `${httpStatus ? `HTTP: ${httpStatus} - ` : ""}Video.js (${errors[player.error().code]}): ${videojsLog}`,
                    params: {
                        template: `error-${language}.yml`,
                        title: `${lcn} - ${name}: ${locale["unknownErrorTitle"]}`,
                        name: name,
                        lcn: lcn,
                        info: `${httpStatus ? `HTTP: ${httpStatus} - ` : ""}Video.js (${errors[player.error().code]}): ${videojsLog}`
                    }
                });
            };
        } else if (fallbackType != null && fallbackURL != null) {
            loadStream({
                type: fallbackType,
                url: fallbackURL,
                name: name,
                lcn: lcn,
                logo: logo,
                api: fallbackAPI
            });
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
                    artist: locale["nowPlaying"],
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
            window.zappr.popupPlayer.close();
            break;
            
    };

    if (type === "popup") {
        player.reset();
        window.zappr.popupPlayer = window.open(
            url,
            "popupWindow",
            new URLSearchParams({
                left: document.querySelector("#channels-column").offsetWidth,
                top: window.outerHeight - window.innerHeight,
                width: window.innerWidth - document.querySelector("#channels-column").offsetWidth,
                height: window.innerHeight - (window.outerHeight - window.innerHeight)
            }).toString().replaceAll("&", ",")
        );

        if (!window.zappr.popupPlayer) {
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
                    href: "javascript:window.zappr.closeModal();",
                    text: "Chiudi"
                }]
            });
        };
        window.addEventListener("unload", () => window.zappr.popupPlayer.close());
        document.querySelector("#overlays").insertAdjacentHTML("afterbegin", `<a href="#" id="reopen-window"><svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24"><path fill="#fff" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6q.425 0 .713.288T12 4t-.288.713T11 5H5v14h14v-6q0-.425.288-.712T20 12t.713.288T21 13v6q0 .825-.587 1.413T19 21zM19 6.4L10.4 15q-.275.275-.7.275T9 15t-.275-.7t.275-.7L17.6 5H15q-.425 0-.712-.288T14 4t.288-.712T15 3h5q.425 0 .713.288T21 4v5q0 .425-.288.713T20 10t-.712-.288T19 9z"/></svg>Riapri player</a>`);
        document.querySelector("#reopen-window").addEventListener("click", () => {
            if (window.zappr.popupPlayer.closed) document.querySelector(".channel.watching").click()
            else window.zappr.popupPlayer.focus();
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
                        : "",
                    keySystems: drm ? drm : {}
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
                iframe.allow = "autoplay *; encrypted-media *;";
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

const loadChannel = async ({ type, url, api = false, name, lcn, logo, fullLogo, radio = false, http = false, license = false, licenseDetails = null, feed = false, fallbackType = null, fallbackURL = null, fallbackAPI = false, timeshift = 0 }) => {
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
                await fetch(`https://www.la7.it/appPlayer/liveUrlWithFailPerApp.php?channel=${parameter}&v=${Date.now()}`)
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
                break;

            case "filmon":
                const sessionKey = await fetch("https://www.filmon.com/api/init?app_id=android-native&channelProvider=ipad&app_secret=wis9Ohmu7i")
                    .then(response => response.json())
                    .then(json => json.session_key);

                await fetch(`https://eu-api.filmon.com/api/channel/${parameter}?session_key=${sessionKey}&quality=low`)
                    .then(response => response.json())
                    .then(json => {
                        loadStream({
                            type: type,
                            url: json.streams[0].url,
                            name: name,
                            lcn: lcn,
                            logo: logo
                        });
                        setTimeout(() => {
                            if (document.querySelector(".watching").dataset.url === url) {
                                loadChannel({
                                    type: type,
                                    url: url,
                                    name: name,
                                    lcn: lcn,
                                    logo: logo
                                });
                            };
                        }, ((json.expire_time - DateTime.now().toSeconds()) * 1000) - 3000);
                    });
                break;

            case "acdsolutions":
                window.acdSolutionsPlay = (url) => {
                    loadStream({
                        type: type,
                        url: url,
                        name: name,
                        lcn: lcn,
                        logo: logo
                    });
                };
                const acdSolutionsScript = document.createElement("script");
                acdSolutionsScript.setAttribute("src", `https://catchup.acdsolutions.it/jstag/videoplayerLiveFluid/TV?ch=${parameter}&vID=%27%29%3B%7D%7D%29%7D%3B%20window.acdSolutionsPlay%28videoElement_playerElement.querySelector%28%22source%22%29.src%29%3B%20%7D%20catch%20%7B%7D%3B%20%2F%2F`);
                acdSolutionsScript.setAttribute("async", true);
                acdSolutionsScript.addEventListener("load", () => {
                    acdSolutionsScript.remove();
                    delete window.acdSolutionsPlay;
                });
                document.head.appendChild(acdSolutionsScript);
                break;
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

            case "rai-akamai":
                if (ipLocation === selectedCountry) {
                    let auth;
                    if (window.zappr.raiAkamai != undefined && window.zappr.raiAkamai.expiration - Math.floor(Date.now() / 1000) > 10) {
                        auth = window.zappr.raiAkamai.auth;
                    } else {
                        await fetch(`${window["zappr"].config.backend.host["alwaysdata"]}/rai-akamai`, { method: "POST" })
                            .then(response => response.text())
                            .then(search => auth = search);
                        
                        window.zappr.raiAkamai = {
                            auth: auth,
                            expiration: parseInt(new URLSearchParams(auth).get("hdnea").split("~").filter(el => el.startsWith("exp"))[0].split("=")[1])
                        };
                    };
    
                    loadStream({
                        type: type,
                        url: `${url}${auth}`,
                        name: name,
                        lcn: lcn,
                        logo: logo,
                        fallbackType: fallbackType,
                        fallbackURL: fallbackURL,
                        fallbackAPI: fallbackAPI
                    });
                } else {
                    loadStream({
                        type: type,
                        url: url,
                        name: name,
                        lcn: lcn,
                        logo: logo,
                        api: api
                    });
                };
                break;

            case "clearkey":
                const kid = licenseDetails.split(":")[0];
                const key = licenseDetails.split(":")[1];
                loadStream({
                    type: "iframe",
                    url: `clearkey/?${new URLSearchParams({
                        kid: kid,
                        key: key,
                        url: url
                    }).toString()}`,
                    name: name,
                    lcn: lcn,
                    logo: logo,
                    fallbackType: fallbackType,
                    fallbackURL: fallbackURL,
                    fallbackAPI: fallbackAPI
                });
        };
    } else {
        await loadStream({ type: type, url: url, api: api, name: name, lcn: lcn, logo: logo, fullLogo: fullLogo, radio: radio, http: http, feed: feed, fallbackType: fallbackType, fallbackURL: fallbackURL, fallbackAPI: fallbackAPI, timeshift: timeshift })
    };
};

const getChannelLogoURL = (logo, optimized) => {
    const config = zappr.config.logos;

    if (logo.startsWith("http://") || logo.startsWith("https://")) return logo
    else {
        if (optimized === false) {
            return `${config.host}/${selectedCountry}/${logo}${logo.endsWith(".svg") ? "" : ".png"}`;
        } else {
            return `${config.host}/${selectedCountry}/${config.optimized ? "optimized/": ""}${logo}${logo.endsWith(".svg") ? "" : (config.optimized ? ".webp" : ".png")}`;
        }
    };
};


const getChannelsListURL = (path) => {
    const config = zappr.config.channels;

    return `${config.host}/${path}.json`;
};

const getEPGURL = (path) => {
    const config = zappr.config.epg;

    return `${config.host}/${path}.json`;
};

const getFASTChannelsURL = (path) => {
    const config = zappr.config.fast;

    return `${config.host}/${path}/channels.json`;
};

zappr.ratios = await fetch(`${zappr.config.logos.host}/${selectedCountry}/_ratios.json`)
    .then(response => response.json())
    .catch(() => { return {} });

const addChannels = (channels) => {
    if (window.location.search === "?amazon-appstore") {
        channels.filter(el => el.lcn === 7 || el.lcn === 29).forEach(el => {
            channels.splice(channels.indexOf(el), 1);
        });
    };
    channels.forEach(channel => {
        const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isGeoblocked = ipLocation != selectedCountry;

        channelslist.insertAdjacentHTML("beforeend", `
            ${channel.categorySeparator === undefined
                ? `${channel.hbbtv ? `<div class="hbbtv-container">` : ""}
                    <div class="${channel.hbbtvapp ? "hbbtv-app" : ""}${channel.url && channel.url.includes("pluto.tv") ? "pluto-channel" : ""} ${channel.hbbtvmosaic ? "hbbtv-enabler hbbtv-mosaic": "channel"} ${channel.adult === true ? "adult" : channel.adult === "night" ? "adult at-night" : ""}" data-name="${channel.name}" data-lowercase-name="${encodeURIComponent(channel.name.toLowerCase())}" data-logo="${getChannelLogoURL(channel.logo)}" data-full-logo="${getChannelLogoURL(channel.logo, false)}" ${channel.radio ? `data-radio="${channel.radio}"` : ""} ${channel.type != undefined && (!isGeoblocked || !channel.geoblock) ? `data-type="${channel.type}"` : ""} ${channel.type != undefined && typeof channel.geoblock === "object" && channel.geoblock && isGeoblocked ? `data-type="${channel.geoblock.type}"` : ""} ${channel.url != undefined && (!isGeoblocked || !channel.geoblock) ? `data-url="${channel.url}"` : ""} ${channel.url != undefined && typeof channel.geoblock === "object" && channel.geoblock && isGeoblocked ? `data-url="${channel.geoblock.url}"` : ""} data-lcn="${channel.lcn}" ${channel.seek != undefined ? `data-seek="${channel.seek}"` : ""} ${channel.disabled ? `disabled data-disabled="${channel.disabled}"` : ""} ${!channel.disabled && channel.http && isiOS ? `disabled data-disabled="http-ios"` : ""} ${!channel.disabled && channel.geoblock && isGeoblocked && typeof channel.geoblock === "boolean" ? `disabled data-disabled="geoblock"` : ""} ${channel.api && (!isGeoblocked || !channel.geoblock) ? `data-api="${channel.api}"` : ""} ${typeof channel.geoblock === "object" && channel.geoblock && isGeoblocked && channel.geoblock.api != undefined ? `data-api="${channel.geoblock.api}"` : ""} ${channel.cssfix ? `data-cssfix="${channel.cssfix}"` : ""} ${channel.http ? `data-http="true"` : ""} ${channel.license != undefined && (!isGeoblocked || !channel.geoblock) ? `data-license="${channel.license}"` : ""} ${channel.license === undefined && typeof channel.geoblock === "object" && channel.geoblock.license && isGeoblocked ? `data-license="${channel.geoblock.license}"` : ""} ${channel.licensedetails != undefined && (!isGeoblocked || !channel.geoblock) ? `data-license-details="${channel.licensedetails}"` : ""} ${channel.licensedetails === undefined && typeof channel.geoblock === "object" && channel.geoblock.licensedetails && isGeoblocked ? `data-license-details="${channel.geoblock.licensedetails}"` : ""} ${channel.feed ? `data-feed="${channel.feed}"` : ""} ${channel.fallback ? `data-fallback-type="${channel.fallback.type}" data-fallback-url="${channel.fallback.url}"` : ""} ${channel.fallback && channel.fallback.api ? `data-fallback-api="${channel.fallback.api}"` : ""} ${channel.epg ? `data-epg-source="${channel.epg.source}" data-epg-id="${channel.epg.id}"` : ""} ${channel.manualRestart ? `data-manual-restart-source="${channel.manualRestart.source}" data-manual-restart-id="${channel.manualRestart.id}"` : ""} ${channel.timeshift ? `data-timeshift="${channel.timeshift}"` : ""}>
                        <div class="channel-info">
                            <div class="lcn">${channel.lcn}</div>
                            <img class="logo${channel.logo.startsWith("http://") || channel.logo.startsWith("https://") ? " fast-logo" : ""}${channel.logo.includes("tvpdotcomdynamiclogopeu.samsungcloud.tv") ? " samsung-logo" : ""}" src="${getChannelLogoURL(channel.logo)}" crossorigin="anonymous" loading="lazy" style="--ratio: ${zappr.ratios && zappr.ratios[channel.logo] ? zappr.ratios[channel.logo] : "0.75"};">
                            <div class="channel-title-subtitle">
                                <div class="channel-name">${channel.name}</div>
                                ${channel.subtitle ? `<div class="channel-subtitle">${channel.subtitle}</div>` : ""}
                                ${channel.hbbtvmosaic ? `<div class="channel-subtitle">${locale["hbbtvMosaic"]}</div>` : ""}
                                ${channel.feed && !channel.subtitle ? `<div class="channel-subtitle">${locale["not247"]}</div>` : ""}
                                ${channel.epg ? `<div class="channel-program" title="${locale["viewFullEPG"]}"></div>` : ""}
                            </div>
                            ${channel.hd ? `<div class="hd"></div>` : ""}
                            ${channel.uhd ? `<div class="uhd"></div>` : ""}
                            ${channel.type === "audio" || channel.radio ? `<div class="radio"></div>` : ""}
                            ${channel.ondemand ? `<div class="ondemand"></div>` : ""}
                            ${channel.type === "popup" ? `<div class="external"></div>` : ""}
                            ${channel.adult === true ? `<div class="adult-marker"></div>`
                                : channel.adult === "night" ? `<div class="adult-marker at-night"></div>` : ""}
                        </div>
                        ${channel.hbbtvmosaic ? `<div class="hbbtv-enabler-arrow">&gt;</div>` : ""}
                        ${channel.epg ? `
                            <div class="channel-program-progress" title="${locale["viewFullEPG"]}"></div>
                            <div class="channel-program-progress-background" title="${locale["viewFullEPG"]}"></div>
                            <div class="channel-program-times" title="${locale["viewFullEPG"]}">
                                <div class="channel-program-start-time"></div>
                                <div class="channel-program-end-time"></div>
                            </div>
                        ` : ""}
                    </div>

                    ${channel.hbbtv && !channel.hbbtvmosaic ? `<div class="hbbtv-enabler">
                        <div class="hbbtv-enabler-arrow">&gt;</div>
                        <div class="hbbtv-enabler-text">${locale["viewHbbTVChannels"]}</div>
                    </div>` : ""}
                    ${channel.hbbtv ? `<div class="hbbtv-channels">
                        ${channel.hbbtv.map(subchannel =>
                            subchannel.categorySeparator === undefined
                                ? `<div class="channel ${subchannel.hbbtvapp ? "hbbtv-app" : ""} ${subchannel.adult === true ? "adult" : subchannel.adult === "night" ? "adult at-night" : ""}" data-name="${subchannel.name}" data-lowercase-name="${encodeURIComponent(subchannel.name.toLowerCase())}" data-logo="${getChannelLogoURL(subchannel.logo)}" data-full-logo="${getChannelLogoURL(subchannel.logo, false)}" ${subchannel.radio ? `data-radio="${subchannel.radio}"` : ""} ${subchannel.type != undefined ? `data-type="${subchannel.type}"` : ""} ${subchannel.url != undefined ? `data-url="${subchannel.url}"` : ""} data-lcn="${channel.lcn}.${subchannel.sublcn}" ${subchannel.seek ? `data-seek="${subchannel.seek}"` : ""} ${subchannel.disabled ? `disabled data-disabled="${subchannel.disabled}"` : ""} ${!subchannel.disabled && subchannel.http && isiOS ? `disabled data-disabled="http-ios"` : ""} ${!subchannel.disabled && subchannel.geoblock && isGeoblocked && typeof subchannel.geoblock === "boolean"? `disabled data-disabled="geoblock"` : ""} ${subchannel.api && (!isGeoblocked || !subchannel.geoblock) ? `data-api="${subchannel.api}"` : ""} ${typeof subchannel.geoblock === "object" && subchannel.geoblock && isGeoblocked && subchannel.geoblock.api != undefined ? `data-api="${subchannel.geoblock.api}"` : ""} ${subchannel.cssfix ? `data-cssfix="${subchannel.cssfix}"` : ""} ${subchannel.http ? `data-http="true"` : ""} ${subchannel.license ? `data-license="${subchannel.license}"` : ""} ${subchannel.licensedetails ? `data-license-details="${subchannel.licensedetails}"` : ""} ${subchannel.feed ? `data-feed="${subchannel.feed}"` : ""} ${subchannel.fallback ? `data-fallback-type="${subchannel.fallback.type}" data-fallback-url="${subchannel.fallback.url}"` : ""} ${subchannel.fallback && subchannel.fallback.api ? `data-fallback-api="${subchannel.fallback.api}"` : ""} ${subchannel.epg ? `data-epg-source="${subchannel.epg.source}" data-epg-id="${subchannel.epg.id}"` : ""}>
                                    <div class="channel-info">
                                        <div class="lcn">${channel.lcn}.${subchannel.sublcn}</div>
                                        <img class="logo" src="${getChannelLogoURL(subchannel.logo)}" data-full="${getChannelLogoURL(subchannel.logo, false)}" crossorigin="anonymous" loading="lazy" style="--ratio: ${zappr.ratios && zappr.ratios[subchannel.logo] ? zappr.ratios[subchannel.logo] : "0.75"};">
                                        <div class="channel-title-subtitle">
                                            <div class="channel-name">${subchannel.name}</div>
                                            ${subchannel.subtitle != null ? `<div class="channel-subtitle">${subchannel.subtitle}</div>` : ""}
                                            ${subchannel.feed && !subchannel.subtitle ? `<div class="channel-subtitle">${locale["not247"]}</div>` : ""}
                                            ${subchannel.epg ? `<div class="channel-program" title="${locale["viewFullEPG"]}"></div>` : ""}
                                        </div>
                                        ${subchannel.hd ? `<div class="hd"></div>` : ""}
                                        ${subchannel.uhd ? `<div class="uhd"></div>` : ""}
                                        ${subchannel.type === "audio" || subchannel.radio ? `<div class="radio"></div>` : ""}
                                        ${subchannel.ondemand ? `<div class="ondemand"></div>` : ""}
                                        ${subchannel.type === "popup" ? `<div class="external"></div>` : ""}
                                        ${subchannel.adult === true ? `<div class="adult-marker"></div>`
                                            : subchannel.adult === "night" ? `<div class="adult-marker at-night"></div>` : ""}
                                    </div>
                                    ${subchannel.epg ? `
                                        <div class="channel-program-progress" title="${locale["viewFullEPG"]}"></div>
                                        <div class="channel-program-progress-background" title="${locale["viewFullEPG"]}"></div>
                                        <div class="channel-program-times" title="${locale["viewFullEPG"]}">
                                            <div class="channel-program-start-time"></div>
                                            <div class="channel-program-end-time"></div>
                                        </div>
                                    ` : ""}
                                </div>`
                                : `<div class="category">${subchannel.categorySeparator}</div>`
                        ).join("")}
                    </div>` : ""}
                ${channel.hbbtv ? `</div>` : ""}`
                : `<h1 id="${channel.id}" class="channel-category">${channel.categorySeparator}</h1>`
            }
        `);
    });
};

await fetch(getChannelsListURL(`${countries[selectedCountry].location}/national`))
    .then(response => response.json())
    .then(nationalChannels => {
        window.zappr.nationalChannels = nationalChannels.channels;
    });

if (new URLSearchParams(location.search).get("androidtv") != null && localStorage.getItem("region") === "national") document.querySelector(`input[value="national"]`).checked = true;
if (localStorage.getItem("region") != null && localStorage.getItem("region") != "national") {
    if (new URLSearchParams(location.search).get("androidtv") === null) document.querySelector("select").value = localStorage.getItem("region")
    else document.querySelector(`input[value="${localStorage.getItem("region")}"]`).checked = true;

    await fetch(getChannelsListURL(`${countries[selectedCountry].location}/regional/${localStorage.getItem("region")}`))
        .then(response => response.json())
        .then(json => {
            window.zappr.regionalChannels = json.channels;
            
            window.zappr.channels = window.zappr.nationalChannels.concat(window.zappr.regionalChannels);
            window.zappr.channels.sort((a, b) => a.lcn - b.lcn);
        });
} else {
    window.zappr.channels = window.zappr.nationalChannels;
    if (selectedCountry === "it") window.zappr.channels.filter(ch => ch.lcn === 103)[0].lcn = 3;
};

const setupSourceHeader = () => {
    let previousCategory;
    let nextCategory;
    const scrollFirstCategoryObserver = new IntersectionObserver(() => {
        if (document.querySelector(".channel-category").getBoundingClientRect().y < (window.matchMedia("(max-width: 100vh)").matches && document.querySelector("#hide-player").media === "not all" ? document.querySelector("#tv").getBoundingClientRect().height : 0)) {
            document.querySelector(".source-header").classList.remove("first-source");
            document.querySelector(".source-header .current-source").innerText = document.querySelector(".channel-category").innerText;
            previousCategory = document.querySelector(".channel");
            nextCategory = document.querySelectorAll(".channel-category")[document.querySelectorAll(".channel-category").length - 1];
        } else {
            document.querySelector(".source-header").classList.add("first-source");
            document.querySelector(".source-header .current-source").innerText = locale["mainSource"];
            previousCategory = null;
            nextCategory = document.querySelector(".channel-category");
        };
    }, {
        root: document.querySelector("#channels"),
        threshold: 0.9
    });

    scrollFirstCategoryObserver.observe(document.querySelector(".channel-category"));
    scrollFirstCategoryObserver.observe(document.querySelectorAll(".channel-category")[document.querySelectorAll(".channel-category").length - 1]);
    scrollFirstCategoryObserver.observe(document.querySelector(".channel"));
    scrollFirstCategoryObserver.observe(document.querySelectorAll(".channel")[document.querySelectorAll(".channel").length - 1]);
    
    const scrollLastCategoryObserver = new IntersectionObserver(() => {
        if (document.querySelectorAll(".channel-category")[document.querySelectorAll(".channel-category").length - 1].getBoundingClientRect().y < (window.matchMedia("(max-width: 100vh)").matches && document.querySelector("#hide-player").media === "not all" ? document.querySelector("#tv").getBoundingClientRect().height : 0)) {
            document.querySelector(".source-header").classList.add("last-source");
            document.querySelector(".source-header .current-source").innerText = document.querySelectorAll(".channel-category")[document.querySelectorAll(".channel-category").length - 1].innerText;
            previousCategory = document.querySelector(".channel-category");
            nextCategory = null;
        } else {
            document.querySelector(".source-header").classList.remove("last-source");
            if (document.querySelector(".channel-category").getBoundingClientRect().y < (window.matchMedia("(max-width: 100vh)").matches && document.querySelector("#hide-player").media === "not all" ? document.querySelector("#tv").getBoundingClientRect().height : 0)) {
                document.querySelector(".source-header .current-source").innerText = document.querySelector(".channel-category").innerText;
                previousCategory = document.querySelector(".channel");
                nextCategory = document.querySelectorAll(".channel-category")[document.querySelectorAll(".channel-category").length - 1];
            };
        };
    }, {
        root: document.querySelector("#channels"),
        threshold: 0.9
    });
    scrollLastCategoryObserver.observe(document.querySelector(".channel-category"))
    scrollLastCategoryObserver.observe(document.querySelectorAll(".channel-category")[document.querySelectorAll(".channel-category").length - 1]);
    scrollLastCategoryObserver.observe(document.querySelector(".channel"));
    scrollLastCategoryObserver.observe(document.querySelectorAll(".channel")[document.querySelectorAll(".channel").length - 1]);

    document.querySelector(".source-header .previous").addEventListener("click", () => {
        if (previousCategory) previousCategory.scrollIntoView({ block: "start", behavior: "smooth" });
        document.querySelector("#channels-column").scrollIntoView();
    });
    document.querySelector(".source-header .next").addEventListener("click", () => {
        if (nextCategory) nextCategory.scrollIntoView({ block: "start", behavior: "smooth" });
        document.querySelector("#channels-column").scrollIntoView();
    });
};

const setupChannelElements = () => {
    document.querySelectorAll(".channel").forEach(el => {
        if (el.dataset.disabled != undefined) {
            el.title = returnErrorMessage(el.dataset.disabled);
        };
        el.addEventListener("click", async e => {
            if (((!["channel-program", "channel-program-progress", "channel-program-progress-background", "channel-program-times"].includes(e.target.className) && e.target.nodeName != "B") || new URLSearchParams(location.search).get("androidtv") != null) && el.dataset.disabled === undefined) {
                currentlyPlaying = el;

                if (state.schedule != {}) {
                    createScheduler("").remove();
                };

                if (document.querySelector(".watching") != null) {
                    document.querySelector(".watching").classList.remove("watching");
                };
                if (document.querySelector(".watching-hbbtv") != null) {
                    document.querySelector(".watching-hbbtv").classList.remove("watching-hbbtv");
                };
                el.classList.add("watching");

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
                if (el.classList.contains("pluto-channel")) {
                    overlays.classList.add("pluto-channel");
                } else if (overlays.classList.contains("pluto-channel") && !el.classList.contains("pluto-channel")) {
                    overlays.classList.remove("pluto-channel");
                };

                if (el.dataset.lcn.includes(".")) {
                    el.closest(".hbbtv-container").querySelector(".channel").classList.add("watching-hbbtv");
                    if (!el.closest(".hbbtv-container").querySelector(".hbbtv-enabler").classList.contains("clicked")) {
                        el.closest(".hbbtv-container").querySelector(".hbbtv-enabler").classList.add("clicked");
                    };
                };
                
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
                    fullLogo: el.dataset.fullLogo,
                    radio: el.dataset.radio,
                    http: el.dataset.http,
                    license: el.dataset.license,
                    licenseDetails: el.dataset.licenseDetails,
                    feed: el.dataset.feed,
                    fallbackType: el.dataset.fallbackType,
                    fallbackURL: el.dataset.fallbackUrl,
                    fallbackAPI: el.dataset.fallbackApi,
                    timeshift: el.dataset.timeshift
                });
            } else if (((["channel-program", "channel-program-progress", "channel-program-progress-background", "channel-program-times"].includes(e.target.className) || e.target.nodeName === "B") && new URLSearchParams(location.search).get("androidtv") === null)) {
                document.querySelector("#epg-channel").innerText = el.dataset.name;
                document.querySelector("#channels-column").classList.add("epg-visible");
                document.querySelectorAll(".epg-items").forEach(el => el.remove());
                document.querySelector("#channels-column").classList.remove("overflow-visible");
                document.querySelector("#epg").classList.remove("is-hidden");
                document.querySelector("#epg").classList.remove("long-channel-name");
                document.querySelector("#epg").dataset.epgSource = el.dataset.epgSource;
                document.querySelector("#epg").dataset.epgId = el.dataset.epgId;
                const epgByDays = window.zappr.epg[el.dataset.epgSource][el.dataset.epgId].reduce((accumulator, entry) => {
                    const startDate = entry.startTime.iso.split("T")[0];
                    const endDate = entry.endTime.iso.split("T")[0];
                    if (!accumulator[startDate]) accumulator[startDate] = [];
                    accumulator[startDate].push(entry);
                    if (!accumulator[endDate]) accumulator[endDate] = [];
                    accumulator[endDate].push(entry);
                    return accumulator;
                }, {});
                Object.keys(epgByDays).forEach(day => {
                    epgByDays[day] = [...new Set(epgByDays[day])];
                    if (epgByDays[day].length <= 1) delete epgByDays[day];
                });
                if (Object.keys(epgByDays).length > 1) document.querySelector("#epg-date").className = "first-day"
                    else document.querySelector("#epg-date").className = "first-day last-day";
                for (const day in epgByDays) {
                    document.querySelector("#epg").insertAdjacentHTML("beforeend", `<div class="epg-items" data-date="${day}">
                        ${epgByDays[day].map(entry => {
                            const now = Date.now();
                            const expandable = entry.image && entry.description && entry.description.length > 75 ? true :
                                !entry.image && entry.description && entry.description.length > 145 ? true : false;

                            return `<div class="epg-item-container${expandable ? " expandable" : ""}${entry.startTime.unix <= now && entry.endTime.unix >= now ? " on-air" : ""}${!entry.image ? " no-image" : ""}" ${entry.image ? `style="background-image: url('${entry.image}');"` : ""} data-start-time="${entry.startTime.unix}">
                                <div class="epg-item">
                                    ${entry.image ? `<img src="${entry.image}" class="epg-image" onerror="this.parentElement.parentElement.classList.add('no-image'); this.remove();">` : ""}
                                    <div class="epg-info">
                                        <span class="epg-start-time">${DateTime.fromMillis(entry.startTime.unix).toFormat("HH:mm")}</span>
                                        <h1 class="epg-name">${entry.name}${entry.season ? ` <b>S${entry.season}</b>` : " "}${entry.episode ? `<b>E${entry.episode}</b>` : ""}${entry.rating && entry.rating.label != "6+" ? `<span class="epg-rating" style="background-color: ${entry.rating.background}; color: ${entry.rating.text};">${entry.rating.label}</span>` : ""}</h1>
                                        ${entry.subtitle ? `<h3 class="epg-subtitle">${entry.subtitle}</h3>` : ""}
                                        ${entry.description ? `<div class="epg-description">
                                            <p>${entry.description}</p>
                                        </div>` : ""}
                                        <div class="epg-buttons">${entry.link ? `<a class="epg-watch" href="${entry.link}"><img src="${new URL("/assets/icons/play.svg", import.meta.url)}">Guarda</a>` : ""}</div>
                                    </div>
                                </div>
                            </div>`
                        }).join("")}
                    </div>`);
                    if (document.querySelector(".epg-item-container.on-air") === null) document.querySelector(`.epg-items[data-date="${day}"]`).remove();
                };
                updateRestartablePrograms(true);
                document.querySelector(".epg-item-container.on-air").closest(".epg-items").classList.add("has-on-air");
                document.querySelector(".epg-item-container.on-air").closest(".epg-items").classList.add("active");
                document.querySelectorAll(".epg-item-container.expandable .epg-description").forEach(el => {
                    el.addEventListener("click", () => {
                        el.closest(".epg-item-container").classList.toggle("expanded");
                    });
                });
                document.querySelector(".epg-items").animate({
                    left: "0"
                }, {
                    duration: 0, fill: "forwards", easing: "ease"
                });
                document.querySelector(".epg-item-container.on-air").scrollIntoView({ block: "center" });
                document.querySelector("#channels").scrollIntoView();
                document.querySelector("#channels-column").scrollIntoView();
                document.querySelector("#epg-date span").innerText = DateTime.fromFormat(document.querySelector(".epg-items.has-on-air").dataset.date, "yyyy-MM-dd").setLocale(language).toLocaleString(DateTime.DATE_FULL);
                if (document.querySelector("#epg-channel").offsetTop > 16) document.querySelector("#epg").classList.add("long-channel-name");
                mediumZoom(".epg-image:not(.no-image)", { background: "rgba(0, 0, 0, 0.8)", margin: window.matchMedia("(max-width: 100vh)").matches ? 16 : 160 });
            } else if (el.dataset.disabled != undefined) {
                alert(returnErrorMessage(el.dataset.disabled));
            };
        });
    });
    document.querySelectorAll(".hbbtv-enabler").forEach(el => {
        el.addEventListener("click", () => el.classList.toggle("clicked"));
    });
};

fetch(getFASTChannelsURL(selectedCountry))
    .then(response => response.json())
    .then(async fastChannels => {
        if (ipLocation != selectedCountry) {
            fastChannels.channels = fastChannels.channels.filter(el => (el.url && !el.url.includes("pluto.tv") || (el.id && el.id != "plutotv")));
        };
        addChannels(fastChannels.channels);
        setupSourceHeader();
        setupChannelElements();
    })
    .catch(e => {
        console.warn(`Can't find FAST channels: ${e.stack}`);
        document.querySelector(".source-header").remove();
        setupChannelElements();
    });

document.querySelector("#loading").classList.add("loaded");
document.querySelector("#loading").animate({
    opacity: 0
}, {
    duration: 250,
    easing: "ease",
    fill: "forwards"
});
addChannels(window.zappr.channels);

const returnErrorMessage = (errorCode) => {
    return ({
        "not-working": locale["disabledNotWorking"],
        "http-ios": "Questo è un canale HTTP, una tipologia di canale che non è visibile su iOS.",
        "geoblock": locale["disabledGeoblock"]
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
            href: "javascript:window.zappr.closeModal();",
            text: "Annulla"
        }]
    });

    document.querySelector(".modal .button.primary").addEventListener("click", () => {
        window.sessionStorage.setItem(`${night ? "nightAdult" : "adult"}ChannelConfirmation`, true);
        window.zappr.closeModal();
        document.querySelector(".channel.watching").click();
    });
};

const state = {
    schedule: {},
    timeouts: new Map(),
    playingRegional: false
};
  
const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
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
            return new Date(program.day + " " + program.from);
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
    nextDate.setHours(...program.from.split(":"), 0, 0);
    return nextDate;
};

const scheduleProgram = (program) => {
    if (isProgramActive(program)) {
        const now = new Date();
        const endTime = new Date(now.toDateString() + " " + program.to);
        const timeUntilEnd = endTime.getTime() - now.getTime();
        
        const endTimeoutId = setTimeout(() => {
            loadStream({
                type: "hls",
                url: window.zappr.channels.filter(el => el.lcn === 103)[0].url,
                name: "Rai 3",
                lcn: 103,
                logo: getChannelLogoURL("rai3.svg")
            });
            scheduleProgram(program);
        }, timeUntilEnd);
        
        state.timeouts.set(`${program.title}-end`, endTimeoutId);
        loadStream({
            type: window.zappr.channels.filter(el => el.lcn === 3)[0].type,
            url: window.zappr.channels.filter(el => el.lcn === 3)[0].url,
            name: window.zappr.channels.filter(el => el.lcn === 3)[0].name,
            lcn: 3,
            logo: getChannelLogoURL("rai3.svg")
        });
        state.playingRegional = true;
        return;
    } else if (!state.playingRegional) {
        loadStream({
            type: "hls",
            url: window.zappr.channels.filter(el => el.lcn === 103)[0].url,
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
            type: window.zappr.channels.filter(el => el.lcn === 3)[0].type,
            url: window.zappr.channels.filter(el => el.lcn === 3)[0].url,
            name: window.zappr.channels.filter(el => el.lcn === 3)[0].name,
            lcn: 3,
            logo: getChannelLogoURL("rai3.svg")
        });
        state.playingRegional = true;
        
        const endTime = new Date(nextAirTime.toDateString() + " " + program.to);
        const timeUntilEnd = endTime.getTime() - nextAirTime.getTime();
        
        const endTimeoutId = setTimeout(() => {
            loadStream({
                type: "hls",
                url: window.zappr.channels.filter(el => el.lcn === 103)[0].url,
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

const addAutoRestart = (el, startTime, manual) => {
    if (!el.querySelector(".epg-restart")) {
        el.querySelector(".epg-buttons").insertAdjacentHTML("beforeend", `<div class="epg-restart${manual ? " manual": ""}"><img src="${new URL("/assets/icons/restart.svg", import.meta.url)}">Restart</div>`);
        el.querySelector(".epg-restart").addEventListener("click", () => {
            player.currentTime(player.liveTracker.liveCurrentTime() - ((DateTime.now().ts - startTime) / 1000) + 10);
            el.classList.add("restart-soon");
            setTimeout(() => {
                el.classList.remove("restart-soon");
            }, 10000);
        });
    } else el.querySelector(".epg-restart").remove();
};

let manualRestart = {
    fetchCache: {},
    run: async (channel, source, data) => {
        let seekToStart = () => {};
        switch (source) {
            case "mediaset":
                const restartInfo = await fetch(`${data.restartUrl}?auto=true&balance=true&format=SMIL&formats=MPEG-DASH,MPEG4,M3U&tracking=true&assetTypes=HD,browser,widevine,geoIT|geoNo:HD,browser,geoIT|geoNo:HD,geoIT|geoNo:SD,browser,widevine,geoIT|geoNo:SD,browser,geoIT|geoNo:SD,geoIT|geoNo`)
                    .then(response => response.text())
                    .then(smil => new DOMParser().parseFromString(smil, "text/xml"));
                
                const restartURL = restartInfo.querySelector("ref").getAttribute("src").replaceAll("manifest_hr.mpd", "manifest.mpd");
                if (restartURL.includes("widevine")) {
                    const authToken = await fetch("https://api-ott-prod-fe.mediaset.net/PROD/play/idm/anonymous/login/v2.0", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "appName": "web//mediasetplay-web/5.11.8-f16d93c",
                            "client_id": "994957a4-c91e-4e18-8236-f50c1b8e707f"
                        })
                    })
                        .then(response => response.json())
                        .then(json => json.response.beToken);

                    const releasePID = restartInfo.querySelector("param").getAttribute("value").split("|").filter(el => el.startsWith("pid="))[0].split("=")[1];
                    await loadStream({ type: "dash", url: restartURL, name: `${channel.dataset.name} (restart)`, lcn: channel.dataset.lcn, logo: channel.dataset.logo, drm: {
                        "com.widevine.alpha": `https://widevine.entitlement.theplatform.eu/wv/web/ModularDrm/getRawWidevineLicense?releasePid=${releasePID}&account=http://access.auth.theplatform.com/data/Account/2702976343&schema=1.0&token=${authToken}`
                    } });

                } else {
                    const hlsRestartInfo = await fetch(`${data.restartUrl}?auto=true&balance=true&format=SMIL&formats=MPEG4,M3U&tracking=true&assetTypes=HD,browser,geoIT|geoNo:HD,browser,geoIT|geoNo:HD,geoIT|geoNo:SD,browser,geoIT|geoNo:SD,browser,geoIT|geoNo:SD,geoIT|geoNo`)
                        .then(response => response.text())
                        .then(smil => new DOMParser().parseFromString(smil, "text/xml"));

                    const hlsRestartURL = hlsRestartInfo.querySelector("ref").getAttribute("src");
                    await loadStream({ type: "hls", url: hlsRestartURL, name: `${channel.dataset.name} (restart)`, lcn: channel.dataset.lcn, logo: channel.dataset.logo });
                };
                seekToStart = () => {
                    if (player.liveTracker.isLive()) player.currentTime(0);
                    player.off("loadeddata", seekToStart);
                };
                player.on("loadeddata", seekToStart);
                break;

            case "la7":
                await fetch(`https://www.la7.it/getVideoInfoHbbtv?nid=${data}`)
                    .then(response => response.json())
                    .then(async json => {
                        if (json.node.field_geolock_italia?.und[0]?.value === "1") {
                            alert("Il restart per questo programma non è disponibile al di fuori dell'Italia.")
                        } else if (json.node.field_drm?.und[0]?.value === "1") {
                            alert("Il restart per questo programma è protetto da DRM e non può essere riprodotto.")
                        } else await loadStream({ type: "direct", url: json.video.urlMP4, name: `${channel.dataset.name} (restart)`, lcn: channel.dataset.lcn, logo: channel.dataset.logo });
                    });
                break;

            case "sky":
                await loadStream({ type: "hls", url: data.url, name: `${channel.dataset.name} (restart)`, lcn: channel.dataset.lcn, logo: channel.dataset.logo });
                seekToStart = () => {
                    if (player.liveTracker.isLive()) player.currentTime(player.liveTracker.liveCurrentTime() - ((DateTime.now().ts - data.startTime) / 1000) + 10);
                    player.off("loadeddata", seekToStart);
                };
                player.on("loadeddata", seekToStart);
                break;

            case "wbd":
                const startTime = DateTime.fromMillis(data.startTime);
                const chunkStart = startTime.set({
                    minutes: Math.floor(startTime.minute / data.epgChunkSize) * data.epgChunkSize,
                    seconds: 0,
                    milliseconds: 0
                });
                const chunkEnd = chunkStart.plus({ minutes: data.epgChunkSize });

                const epgChunk = await fetch(`${data.epgEndpoint}/${data.id}/${chunkStart.ts}-${chunkEnd.ts}.json`)
                    .then(response => response.json());

                const programs = epgChunk.data.schedule.filter(el => el.segmentNo && el.segmentNo === 1);
                if (programs.length >= 1) {
                    let playoutStartTime = parseInt(programs.reduce((previous, current) => Math.abs(current.startts - DateTime.now().ts) < Math.abs(previous.startts - DateTime.now().ts) ? current : previous).startts) / 1000;

                    const authToken = await fetch("https://public.aurora.enhanced.live/token?realm=it")
                        .then(response => response.json())
                        .then(json => json.data.attributes.token);

                    const dashURL = await fetch("https://public.aurora.enhanced.live/playback/v3/channelPlaybackInfo", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${authToken}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            deviceInfo: {
                                adBlocker: false,
                                drmSupported: false,
                                hdrCapabilities: ["SDR"],
                                hwDecodingCapabilities: [],
                                soundCapabilities: ["STEREO"]
                            },
                            wisteriaProperties: {
                                device: {
                                    browser: {
                                        name: "chrome",
                                        version: "38"
                                    },
                                    type: "hbbtv"
                                },
                                platform: "hbbtv"
                            },
                            channelId: data.restartID
                        })
                    })
                        .then(response => response.json())
                        .then(json => json.data.attributes.streaming[0].url);

                    const canRestart = await fetch(`${dashURL}&aws.manifestsettings=start:${playoutStartTime}`)
                        .then(response => response.ok);

                    if (canRestart) {
                        await loadStream({ type: "dash", url: `${dashURL}&aws.manifestsettings=start:${playoutStartTime}`, name: `${channel.dataset.name} (restart)`, lcn: channel.dataset.lcn, logo: channel.dataset.logo });
                        seekToStart = () => {
                            if (player.liveTracker.isLive()) player.currentTime(data.buffer / 1000);
                            player.off("loadeddata", seekToStart);
                        };
                        player.on("loadeddata", seekToStart);
                    } else {
                        alert("Impossibile effettuare il restart. Se il programma è iniziato da poco prova ad aspettare qualche minuto.");
                    };
                } else {
                    alert("Impossibile effettuare il restart. Se il programma è iniziato da poco prova ad aspettare qualche minuto.");
                };
                
                break;

        };
    },
    addButton: (el, channel, source, data) => {
        el.querySelector(".epg-buttons").insertAdjacentHTML("beforeend", `<div class="epg-restart manual"><img src="${new URL("/assets/icons/restart.svg", import.meta.url)}">Restart</div>`);
        el.querySelector(".epg-restart").addEventListener("click", async () => {
            await manualRestart.run(channel, source, data);
            el.classList.add("restart-soon");
            setTimeout(() => {
                el.classList.remove("restart-soon");
            }, 10000);
        });
    },
    check: async (channel, els) => {
        for (const el in els) {
            const source = channel.dataset.manualRestartSource;
            const id = channel.dataset.manualRestartId;
            const startTime = DateTime.fromMillis(parseInt(els[el].dataset.startTime));
            const rangeStart = startTime.minus({ minutes: 2.5 }).ts;
            const rangeEnd = startTime.plus({ minutes: 2.5 }).ts;
            let json;

            switch (source) {
                case "rai":
                    if (ipLocation === selectedCountry) {
                        if (els[el].classList.contains("on-air")) {
                            const onAirStartTime = await fetch(`https://www.raiplay.it/palinsesto/onAir.json`)
                                .then(response => response.json())
                                .then(json => DateTime.fromISO(json.on_air.filter(el => el.palinsesto_url === id)[0].currentItem.tech_datetime_en).toMillis() + 25000);
                            addAutoRestart(els[el], onAirStartTime, true);
                        } else if (startTime.ts >= DateTime.now().ts - ((player.seekable().end(0) - player.seekable().start(0)) * 1000) && startTime.ts <= DateTime.now().ts) addAutoRestart(els[el], startTime.ts, true);
                    };
                    break;

                case "mediaset":
                    if (ipLocation === selectedCountry) {
                        if (manualRestart.fetchCache[source] && manualRestart.fetchCache[source][id]) json = manualRestart.fetchCache[source][id];
                        else {
                            json = await fetch(`https://static-api.mediaset.net/apigw/nownext/${id}.json`)
                                .then(response => response.json());
                            manualRestart.fetchCache[source] = {};
                            manualRestart.fetchCache[source][id] = json;
                        };

                        if (els[el].classList.contains("on-air") && json.response.currentListing.mediasetlisting$restartAllowed) manualRestart.addButton(els[el], channel, source, json.response.currentListing);
                    };
                    break;

                case "la7":
                    if (manualRestart.fetchCache[source] && manualRestart.fetchCache[source][id]) json = manualRestart.fetchCache[source][id];
                    else {
                        json = await fetch(`https://www.la7.it/la7it_palinsesto_service_getrepliche/${id}?s=hbbtv`)
                            .then(response => response.json());
                        manualRestart.fetchCache[source] = {};
                        manualRestart.fetchCache[source][id] = json;
                    };

                    json[Object.keys(json)[0]].forEach(entry => {
                        let entryStartHour = entry.ora.split(" ")[0];
                        let entryStartTime = DateTime.fromFormat(entry.data, "dd/MM/yyyy").setZone("Europe/Rome").startOf("day").set({
                            hour: entryStartHour.split(":")[0],
                            minutes: entryStartHour.split(":")[1]
                        }).ts;
                        if (entryStartTime.hour < 6) entryStartTime = entryStartTime.plus({ days: 1 });
                        if (entryStartTime >= rangeStart && entryStartTime <= rangeEnd) manualRestart.addButton(els[el], channel, source, entry.nid);
                        else if (startTime.ts >= DateTime.now().ts - ((player.seekable().end(0) - player.seekable().start(0)) * 1000) && startTime.ts <= DateTime.now().ts && !els[el].classList.contains("on-air")) addAutoRestart(els[el], startTime.ts, true);
                    });
                    
                    if (els[el].classList.contains("on-air")) {
                        const onAirStartTime = await fetch(`https://static.iltrovatore.it/StreamingStatus/${id}.rivedi2.txt`)
                            .then(response => response.text())
                            .then(text => DateTime.fromFormat(text.split("\t")[0], "yyyy.MM.dd-hh.mm.ss").toMillis());
                        addAutoRestart(els[el], onAirStartTime, true);
                    };
                    break;

                case "sky":
                    if (ipLocation === selectedCountry) {
                        if (manualRestart.fetchCache[source] && manualRestart.fetchCache[source][id]) json = manualRestart.fetchCache[source][id];
                        else {
                            json = await fetch(`https://hbbtv.sky.it/api/playout/${id}/enhanced`)
                                .then(response => response.json());
                            manualRestart.fetchCache[source] = {};
                            manualRestart.fetchCache[source][id] = json;
                        };
    
                        json.epgList.filter(entry => entry.isRestartable).forEach(entry => {
                            let entryStartTime = DateTime.fromISO(entry.epgEventStart).setZone("Europe/Rome").ts;
                            if (entryStartTime >= rangeStart && entryStartTime <= rangeEnd && !entry.restartUrl.includes("undefined") && entryStartTime < DateTime.now().ts) manualRestart.addButton(els[el], channel, source, {
                                url: entry.restartUrl,
                                startTime: startTime.ts
                            });
                        });
                    };
                    break;

                case "wbd":
                    if (ipLocation === selectedCountry) {
                        if (manualRestart.fetchCache[source] && manualRestart.fetchCache[source][id]) json = manualRestart.fetchCache[source][id];
                        else {
                            let channelModulesURL = await fetch(`https://datahub.enhanced.tools/live/it/${id}.json`)
                                .then(response => response.json())
                                .then(json => json.containers[0].configUrl.replaceAll("http://", "https://"));

                            let channelModules = await fetch(channelModulesURL)
                                .then(response => response.json());
                            let channelConfigURL = channelModules.bundles.filter(el => el.javascript.module === "galaxy")[0].javascript.configUrl.replaceAll("http://", "https://");
                            let channelConfig = await fetch(channelConfigURL)
                                .then(response => response.json());

                            let startOverWindow = parseInt(channelConfig.startOverWindow) * 1000;
                            let restartID = channelConfig.launchers.filter(el => el.style === "restart")[0].interactiveItem.action.payload.id;

                            let epgConfig = await fetch(`https://datahub.enhanced.tools/configs/bundles/epg/config.json`)
                                .then(response => response.json());
                                
                            json = {
                                startOverWindow: startOverWindow,
                                epgConfig: epgConfig,
                                restartID: restartID,
                                channelID: channelModules.currentChannel.name
                            };

                            manualRestart.fetchCache[source] = {};
                            manualRestart.fetchCache[source][id] = json;
                        };
    
                        if (startTime.ts > DateTime.now().ts - json.startOverWindow && startTime.ts < DateTime.now().ts && els[el].classList.contains("on-air")) {
                            manualRestart.addButton(els[el], channel, source, {
                                buffer: parseInt(json.epgConfig.channelDelay),
                                epgEndpoint: new URL(json.epgConfig.epgApiEndpoint).origin,
                                epgChunkSize: parseInt(json.epgConfig.epgChunkSize),
                                id: json.channelID,
                                restartID: json.restartID,
                                startTime: startTime.ts
                            });
                        };
                    };
                    break;
            };
        };
    },
};

const updateRestartablePrograms = async (manual = false) => {
    if (manual) manualRestart.fetchCache = {};  
    document.querySelectorAll(".epg-restart:not(.manual)").forEach(el => el.remove());
    if (document.querySelector(".channel.watching") && document.querySelector(".channel.watching").dataset.epgSource && document.querySelector("#channels-column").classList.contains("epg-visible") && document.querySelector(`#epg[data-epg-source="${document.querySelector(".channel.watching").dataset.epgSource}"][data-epg-id="${document.querySelector(".channel.watching").dataset.epgId}"]`)) {
        document.querySelectorAll(".epg-item-container").forEach(el => {
            if ((parseInt(el.dataset.startTime) >= DateTime.now().ts - ((player.seekable().end(0) - player.seekable().start(0)) * 1000) && parseInt(el.dataset.startTime) <= DateTime.now().ts) && !document.querySelector(".channel.watching").dataset.manualRestartSource) {
                addAutoRestart(el, parseInt(el.dataset.startTime));
            };
        });
        if (manual) await manualRestart.check(document.querySelector(".channel.watching"), Array.from(document.querySelectorAll(".epg-item-container")));
    };
};

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
        if (e.code === "Escape" && document.querySelector(".modal") != null && document.querySelector(".modal").classList.contains("is-visible")) window.zappr.closeModal();

        if (["Backspace", "Delete", "NumpadEnter", "Enter", "Escape", "PageUp", "PageDown"].includes(e.code) || e.key === "." || e.code.startsWith("Digit") || (e.code.startsWith("Numpad") && e.code.length === 7)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
        };
        const lcnTypingElement = document.querySelector("#lcn-typing"),
            lcnTypedElement = document.querySelector("#lcn-typed"),
            controlsElement = document.querySelector("#controls");
        
        let matchedChannel = window.zappr.channels.filter(ch => ch.lcn === parseInt(lcnTypedElement.innerText));

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
            await fetch(locale["newsURL"])
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
                                        <span class="news-date">${DateTime.fromRFC2822(post.querySelector("pubDate").textContent).setLocale(language).toLocaleString()}</span>
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
    const target = e;
    if (target.children.length >= 1) {
        let tempSelect = document.createElement("select"),
            tempOption = document.createElement("option");
      
        if (target.querySelector("[selected]")) {
            tempOption.textContent = target.querySelector("[selected]").text;
        } else {
            tempOption.textContent = target.querySelector("option").text;
        }
        tempSelect.style.cssText += `
            visibility: hidden;
            position: fixed;
        `;
        tempSelect.appendChild(tempOption);
        target.after(tempSelect);
        
        const tempSelectWidth = tempSelect.getBoundingClientRect().width;
        target.style.width = `${tempSelectWidth}px`;
        tempSelect.remove();

        target.innerHTML = target.innerHTML;
    };
};

document.querySelector("#region").addEventListener("change", e => {
    if (document.querySelector("#region [selected]")) document.querySelector("#region [selected]").removeAttribute("selected");
    document.querySelector(`#region option[value="${e.target.value}"]`).setAttribute("selected", "");
    document.querySelector("#save-and-reload").removeAttribute("hidden");
    localStorage.setItem("region", document.querySelector("#region").value);
});

if (new URLSearchParams(location.search).get("androidtv") === null) {
    document.querySelectorAll("#settings select").forEach(el => {
        updateSelectWidth(el);
        el.addEventListener("change", e => updateSelectWidth(e.target))
    });
};

document.querySelector("#save-and-reload").addEventListener("click", () => {
    localStorage.setItem("region", new URLSearchParams(location.search).get("androidtv") === null ? document.querySelector("#region").value : document.querySelector("#region input:checked").value);
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

window.zappr.copyInfo = () => {
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
}
#channels-column .source-header {
    transform: translateY(calc(-2.25rem - 1px));
    user-select: none;
    pointer-events: none;
}` : "";
});
document.querySelector("#search-icon").addEventListener("click", () => {
    if (!document.querySelector("#channels-column").classList.contains("search-visible")) document.querySelector("input").focus();
    document.querySelector("#channels-column").classList.toggle("search-visible");
});

const updateCurrentlyPlayingEPG = async () => {
    for (const channel in Array.from(document.querySelectorAll(".channel[data-epg-source]"))) {
        const currentChannel = document.querySelectorAll(".channel[data-epg-source]")[channel];
        const epgSource = currentChannel.dataset.epgSource;
        const epgID = currentChannel.dataset.epgId;
        if (window.zappr.epg && window.zappr.epg[epgSource] && window.zappr.epg[epgSource][epgID]) {
            const now = Date.now();
            const nowOnAir = window.zappr.epg[epgSource][epgID].filter(entry => entry.startTime.unix <= now && entry.endTime.unix >= now)[0];
            if (nowOnAir) {
                currentChannel.classList.remove("epg-disabled");
                currentChannel.querySelector(".channel-program").innerHTML = `${nowOnAir.name}${nowOnAir.season ? ` <b>S${nowOnAir.season}</b>` : " "}${nowOnAir.episode ? `<b>E${nowOnAir.episode}</b>` : ""}`;
    
                currentChannel.querySelector(".channel-program-start-time").innerText = DateTime.fromMillis(nowOnAir.startTime.unix).toFormat("HH:mm");
                currentChannel.querySelector(".channel-program-end-time").innerText = DateTime.fromMillis(nowOnAir.endTime.unix).toFormat("HH:mm");
    
                const progressPercentage = ((now - nowOnAir.startTime.unix) / (nowOnAir.endTime.unix - nowOnAir.startTime.unix)) * 100;
                currentChannel.querySelector(".channel-program-progress").style.width = `${progressPercentage}%`;

                if (document.querySelector(`#epg[data-epg-source="${epgSource}"][data-epg-id="${epgID}"] .epg-item-container.on-air`) != null) document.querySelector(`#epg[data-epg-source="${epgSource}"][data-epg-id="${epgID}"] .epg-item-container.on-air`).classList.remove("on-air");
                if (document.querySelector(`#epg[data-epg-source="${epgSource}"][data-epg-id="${epgID}"] .epg-item-container[data-start-time="${nowOnAir.startTime.unix}"]`) != null) document.querySelector(`#epg[data-epg-source="${epgSource}"][data-epg-id="${epgID}"] .epg-item-container[data-start-time="${nowOnAir.startTime.unix}"]`).classList.add("on-air");
            } else currentChannel.classList.add("epg-disabled");
        } else currentChannel.classList.add("epg-disabled");
        await updateRestartablePrograms();
    };
};

fetch(getEPGURL(`${countries[selectedCountry].location}/national`))
    .then(response => response.json())
    .then(async json => {
        window.zappr.nationalEPG = json;

        if (localStorage.getItem("region") != null && localStorage.getItem("region") != "national") {
            await fetch(getEPGURL(`${countries[selectedCountry].location}/regional/${localStorage.getItem("region")}`))
                .then(response => response.json())
                .then(json => {
                    window.zappr.regionalEPG = json;
                    window.zappr.epg = merge({}, window.zappr.nationalEPG, window.zappr.regionalEPG);
                })
                .catch(() => window.zappr.epg = window.zappr.nationalEPG);
        } else {
            window.zappr.epg = window.zappr.nationalEPG;
        };

        updateCurrentlyPlayingEPG();
        const now = DateTime.now();
        const nextQuarter = Math.ceil(now.second / 15) * 15;
        const secondTarget = nextQuarter === 60 ? now.plus({ minutes: 1 }).set({ second: 0, millisecond: 0 }) : now.set({ second: nextQuarter, millisecond: 0 });
        const delay = secondTarget.ts - now.ts;
        setTimeout(() => {
            updateCurrentlyPlayingEPG();
            setInterval(updateCurrentlyPlayingEPG, 15000);
        }, delay);
        document.querySelector(".toast-notification-container").classList.remove("visible");
        setTimeout(() => document.querySelector(".toast-notification-container").setAttribute("hidden", ""), 500);
    })
    .catch(e => {
        console.warn(`Can't find EPG: ${e.stack}`);
        document.querySelector(".toast-notification-container").setAttribute("hidden", "");
        updateCurrentlyPlayingEPG();
        const now = DateTime.now();
        const nextQuarter = Math.ceil(now.second / 15) * 15;
        const secondTarget = nextQuarter === 60 ? now.plus({ minutes: 1 }).set({ second: 0, millisecond: 0 }) : now.set({ second: nextQuarter, millisecond: 0 });
        const delay = secondTarget.ts - now.ts;
        setTimeout(() => {
            updateCurrentlyPlayingEPG();
            setInterval(updateCurrentlyPlayingEPG, 15000);
        }, delay);
        window.zappr.epg = {};
    });

setTimeout(() => document.querySelector(".toast-notification-container").classList.add("visible"), 1000);
setInterval(async () => {
    window.zappr.nationalEPG = await fetch(getEPGURL(`${countries[selectedCountry].location}/national`))
        .then(response => response.json());

    if (localStorage.getItem("region") != null && localStorage.getItem("region") != "national") {
        await fetch(getEPGURL(`${countries[selectedCountry].location}/regional/${localStorage.getItem("region")}`))
            .then(response => response.json())
            .then(json => {
                window.zappr.regionalEPG = json;
                window.zappr.epg = merge({}, window.zappr.nationalEPG, window.zappr.regionalEPG);
            });
    } else {
        window.zappr.epg = window.zappr.nationalEPG;
    };
}, 3600000);

document.querySelector("#epg-exit").addEventListener("click", () => {
    document.querySelector("#channels-column").classList.remove("epg-visible");
    document.querySelector("#channels-column").classList.remove("epg-expanded");
});
document.querySelector("#epg-resize").addEventListener("click", () => document.querySelector("#channels-column").classList.toggle("epg-expanded"));
document.querySelector("#epg-next-day").addEventListener("click", () => {
    const active = document.querySelector(".epg-items.active");
    const next = active.nextElementSibling;

    active.animate({
        left: "-100%"
    }, {
        duration: 750, fill: "forwards", easing: "ease"
    });
    if (next != null) {
        if (next.nextElementSibling === null) document.querySelector("#epg-date").classList.add("last-day");
            else document.querySelector("#epg-date").classList.remove("last-day");
        if (next.previousElementSibling && next.previousElementSibling.id === "epg-header") document.querySelector("#epg-date").classList.add("first-day");
            else document.querySelector("#epg-date").classList.remove("first-day");

        next.animate({
            left: "0"
        }, {
            duration: 750, fill: "forwards", easing: "ease"
        });
        next.classList.add("active");
        active.classList.remove("active");
        document.querySelector("#epg-date span").animate({
            transform: "translateX(-25%)", opacity: 0
        }, {
            duration: 500, fill: "forwards", easing: "ease"
        });
        setTimeout(() => {
            document.querySelector("#epg-date span").innerText = DateTime.fromFormat(next.dataset.date, "yyyy-MM-dd").setLocale(language).toLocaleString(DateTime.DATE_FULL);
            document.querySelector("#epg-date span").animate([
                { transform: "translateX(25%)", opacity: 0 },
                { transform: "translateX(0)", opacity: 1 }
            ],
            {
                duration: 500, fill: "forwards", easing: "ease"
            });
        }, 250);
    };
});
document.querySelector("#epg-previous-day").addEventListener("click", () => {
    const active = document.querySelector(".epg-items.active");
    const prev = active.previousElementSibling;

    active.animate({
        left: "100%"
    }, {
        duration: 750, fill: "forwards", easing: "ease"
    });
    if (prev != null) {
        if (prev.nextElementSibling === null) document.querySelector("#epg-date").classList.add("last-day");
            else document.querySelector("#epg-date").classList.remove("last-day");
        if (prev.previousElementSibling && prev.previousElementSibling.id === "epg-header") document.querySelector("#epg-date").classList.add("first-day");
            else document.querySelector("#epg-date").classList.remove("first-day");

        prev.animate({
            left: "0"
        }, {
            duration: 750, fill: "forwards", easing: "ease"
        });
        active.classList.remove("active");
        prev.classList.add("active");
        document.querySelector("#epg-date span").animate({
            transform: "translateX(25%)", opacity: 0
        }, {
            duration: 500, fill: "forwards", easing: "ease"
        });
        setTimeout(() => {
            document.querySelector("#epg-date span").innerText = DateTime.fromFormat(prev.dataset.date, "yyyy-MM-dd").setLocale(language).toLocaleString(DateTime.DATE_FULL);
            document.querySelector("#epg-date span").animate([
                { transform: "translateX(-25%)", opacity: 0 },
                { transform: "translateX(0%)", opacity: 1 }
            ],
            {
                duration: 500, fill: "forwards", easing: "ease"
            });
        }, 250);
    };
});

document.querySelectorAll(".hbbtv-channels").forEach(el => {
    el.style.cssText = `--scroll-height: ${el.scrollHeight}px;`;
});
if (new URLSearchParams(location.search).get("lcn") != null) {
    selectChannel(new URLSearchParams(location.search).get("lcn"));
};

if (window.self !== window.top && document.referrer && new URL(document.referrer).hostname.endsWith("kritere.com")) {
    document.querySelector("#loading").remove();
    document.querySelector(".columns").outerHTML = `<div id="block-message">
        <h2>Questo sito sta incorporando Zappr, un sito gratuito per guardare la TV italiana online, coprendone il nome e traendo profitto dalle pubblicità su questa pagina.</h2>
        <div class="button primary">Clicca qui per passare alla versione vera di Zappr, senza pubblicità e a schermo intero.</div>
        <span>(amministratori del sito, potete continuare a incorporare Zappr solo se rimuovete la barra che ne copre il nome e se rimuovete le pubblicità da questa pagina)</span>
    </div>`;
    window.addEventListener("click", () => window.open("https://zappr.stream", "_blank"));
};