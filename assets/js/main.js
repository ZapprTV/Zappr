import Plyr from "../../node_modules/@zappr/plyr/dist/plyr.min.mjs";

await fetch("/config.json")
    .then(response => response.json())
    .then(json => window["zappr"] = json)
    .catch(err => {
        console.log(`Impossibile trovare config (${err}), in uso quella di default`);
        window["zappr"] = {
            config: {
                channels: {
                    path: "https://channels.zappr.stream"
                },
                backend: {
                    enabled: true,
                    host: "https://api.zappr.stream"
                },
                logos: {
                    host: "https://zappr.imgix.net",
                    imgix: true,
                    optimized: true
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

new Plyr("#plyr");

const player = (document.querySelector("#plyr")),
      channelslist = (document.querySelector("#channels")),
      plyrContainer = (document.querySelector(".plyr")),
      plyrControls = (document.querySelector(".plyr__controls")),
      plyrWrapper = (document.querySelector(".plyr__video-wrapper")),
      iframeControls = (document.querySelector("#iframe-controls")),
      iframe = (document.querySelector("iframe")),
      hideProgress = (document.querySelector("#hide-progress")),
      nightAdultChannelsStyle = document.querySelector("#night-adult-channels"),
      stretchTo169 = document.querySelector("#stretch-to-16-9"),
      raiplaySoundFix = document.querySelector("#raiplay-sound-fix");

plyrContainer.insertAdjacentHTML("beforeend", `<div id="lcn-typing">
    <div id="lcn-typed"></div>
    <div id="controls">
        Invio per confermare<br>
        o Esc per annullare
    </div>
</div>`);

const createErrorModal = async (title, error, info) => {
    const modalHTML = `<div class="modal">
        <div class="modal-content">
            <div class="modal-title">
                <h1>${title}</h1>
                <div class="close" onclick="closeModal()"></div>
            </div>
            <p>${error}</p>
            <div class="technical-info">
                <h3>Informazioni tecniche</h3>
                <a>Copia</a>
            </div>
            <div class="code">${info}</div>
            <p id="report-error">Per favore segnala questo errore, aprendo un'issue su GitHub o inviando un'email a mail@zappr.stream.</p>
            <div class="modal-buttons">
                <a class="button primary" href="https://github.com/ZapprTV/frontend/issues/new" target="_blank">Segnala tramite issue</a>
                <a class="button secondary" href="mailto:mail@zappr.stream" target="_blank">Segnala tramite email</a>
            </div>
        </div>
    </div>`;

    if (document.querySelector(".modal") === null) {
        document.body.insertAdjacentHTML("beforeend", modalHTML);
    } else {
        (document.querySelector(".modal")).outerHTML = modalHTML;
    };

    await new Promise(resolve => setTimeout(resolve, 1));

    (document.querySelector(".modal")).classList.add("is-visible");
};

const createModal = async (title, text, buttons) => {
    const modalHTML = `<div class="modal">
        <div class="modal-content">
            <div class="modal-title">
                <h1>${title}</h1>
                <div class="close" onclick="closeModal()"></div>
            </div>
            <p>${text}</p>
            <div class="modal-buttons">
                ${buttons.map(button => `<a class="button ${button.type}" href="${button.href}" ${button.newtab ? `target="_blank"` : ""}>${button.text}</a>`).join(" ")}
            </div>
        </div>
    </div>`;

    if (document.querySelector(".modal") === null) {
        document.body.insertAdjacentHTML("beforeend", modalHTML);
    } else {
        (document.querySelector(".modal")).outerHTML = modalHTML;
    };

    await new Promise(resolve => setTimeout(resolve, 1));

    (document.querySelector(".modal")).classList.add("is-visible");
};

const loadStream = async (type, url, seek, specialFetchType) => {
    if (specialFetchType != undefined && specialFetchType.startsWith("api")) {
        if (specialFetchType === "api-direct") {
            url = `${window["zappr"].config.backend.host}/?${url}`;
        } else {
            await fetch(`${window["zappr"].config.backend.host}/?${url}`)
                .then(async response => {
                    if (response.ok) {
                        url = response.url;
                    } else {
                        return response.json();
                    };
                })
                .then(errorResponse => {
                    if (errorResponse != undefined) createErrorModal("Errore API", errorResponse.error, errorResponse.info);
                });
        };
    }

    switch(currentType) {

        case "hls":
            hls.destroy();
            break;

        case "dash":
            dash.reset();
            break;

        case "flv":
            mpegtsPlayer.destroy();
            break;

        case "twitch":
        case "iframe":
            plyrControls.classList.remove("is-hidden");
            plyrWrapper.classList.remove("is-hidden");
            iframeControls.media = "not all";
            document.querySelector("iframe").remove();
            
    }

    switch(type) {

        case "hls":
            if (!Hls.isSupported()) {
                player.src = url;
            } else {
                if (typeof(hls) != "undefined" && hls.url != null) {
                    hls.detachMedia();
                } else {
                    window.hls = new Hls();
                };
                hls.loadSource(url);
                hls.attachMedia(player);
            };
            player.play();
            break;

        case "dash":
            window.dash = dashjs.MediaPlayer().create();
            dash.initialize(player, url, true);
            break;

        case "flv":
            window.mpegtsPlayer = mpegts.createPlayer({
                type: "flv",
                isLive: true,
                url: url
            });

            mpegtsPlayer.attachMediaElement(player)
            mpegtsPlayer.load();
            mpegtsPlayer.play();
            break;

        case "twitch":
            plyrControls.classList.add("is-hidden");
            plyrWrapper.classList.add("is-hidden");
            player.play();
            new Twitch.Player(plyrContainer, {
                width: "100%",
                height: "100%",
                channel: url,
                parent: ["twitch.tv"]
            });
            break;

        case "iframe":
            plyrWrapper.classList.add("is-hidden");
            player.play();
            const iframe = document.createElement("iframe");
            iframe.src = url;
            iframeControls.media = "";
            plyrContainer.insertAdjacentElement("afterbegin", iframe);
            break;

        case "direct":
            player.src = url;
            player.play();
    }

    currentType = type;

    hideProgress.media = seek === "false" ? "" : "not all";
};

const loadChannel = async (type, url, seek, specialFetchType) => {
    if (url.startsWith("zappr://")) {
        const parameter = url.split("/")[3];
        switch(url.split("/")[2]) {

            case "sky":
                await fetch(`https://apid.sky.it/vdp/v1/getLivestream?id=${parameter}&isMobile=false`)
                    .then((response) => response.json())
                    .then((json) => {
                        loadStream(type, json.streaming_url, seek);
                    });
                break;

        };
    } else await loadStream(type, url, seek, specialFetchType);
};

const getChannelLogoURL = (logo) => {
    const config = zappr.config.logos;

    if (config.bundle.enabled || config.remote.enabled) {
        return `${config.bundle.enabled ? config.bundle.host : config.remote.host}/${config.optimized ? "optimized/": ""}${logo}${logo.endsWith(".svg") ? "" : (config.optimized ? ".webp" : ".png")}`;
    } else if (config.imgix.enabled) {
        return `${config.imgix.host}/${logo}${logo.endsWith(".svg") ? "" : ".webp"}?w=80`
    };
};


const getChannelsListURL = (path) => {
    const config = zappr.config.channels;

    return `${config.bundle.enabled ? config.bundle.host : config.remote.host}/${path}.json`;
};

const addChannels = (channels) => {
    channels.forEach(channel => {
        channelslist.insertAdjacentHTML("beforeend", `
            ${channel.hbbtv ? `<div class="hbbtv-container">` : ""}
                <div class="${channel.hbbtvapp ? "hbbtv-app" : ""} ${channel.hbbtvmosaic ? "hbbtv-enabler hbbtv-mosaic": "channel"} ${channel.adult === true ? "adult" : channel.adult === "night" ? "adult at-night" : ""}" data-name="${channel.name}" data-type="${channel.type}" data-url="${channel.url}" data-lcn="${channel.lcn}" ${channel.seek != undefined ? `data-seek="${channel.seek}"` : ""} ${channel.disabled ? `disabled data-disabled="${channel.disabled}"` : ""} ${channel.api ? `data-specialFetchType="api-${channel.api}"` : ""} ${channel.stretch ? `data-stretch="${channel.stretch}"` : ""}>
                    <div class="lcn">${channel.lcn}</div>
                    <img class="logo" src="${getChannelLogoURL(channel.logo)}">
                    <div class="channel-title-subtitle">
                        <div class="channel-name">${channel.name}</div>
                        ${channel.subtitle ? `<div class="channel-subtitle">${channel.subtitle}</div>` : ""}
                        ${channel.hbbtvmosaic ? `<div class="channel-subtitle">Mosaico HbbTV</div>` : ""}
                    </div>
                    ${channel.hd ? `<div class="hd"></div>` : ""}
                    ${channel.uhd ? `<div class="uhd"></div>` : ""}
                    ${channel.radio ? `<div class="radio"></div>` : ""}
                    ${channel.ondemand ? `<div class="ondemand"></div>` : ""}
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
                            ? `<div class="channel ${subchannel.adult === true ? "adult" : subchannel.adult === "night" ? "adult at-night" : ""}" data-name="${subchannel.name}" data-type="${subchannel.type}" data-url="${subchannel.url}" data-lcn="${channel.lcn}.${subchannel.sublcn}" ${subchannel.seek ? `data-seek="${subchannel.seek}"` : ""} ${subchannel.disabled ? `disabled data-disabled="${subchannel.disabled}"` : ""} ${subchannel.api ? `data-specialFetchType="api-${subchannel.api}"` : ""} ${subchannel.stretch ? `data-stretch="${subchannel.stretch}"` : ""}>
                                <div class="lcn">${channel.lcn}.${subchannel.sublcn}</div>
                                <img class="logo" src="${getChannelLogoURL(subchannel.logo)}">
                                <div class="channel-title-subtitle">
                                    <div class="channel-name">${subchannel.name}</div>
                                    ${subchannel.subtitle != null ? `<div class="channel-subtitle">${subchannel.subtitle}</div>` : ""}
                                </div>
                                ${subchannel.hd ? `<div class="hd"></div>` : ""}
                                ${subchannel.uhd ? `<div class="uhd"></div>` : ""}
                                ${subchannel.radio ? `<div class="radio"></div>` : ""}
                                ${subchannel.ondemand ? `<div class="ondemand"></div>` : ""}
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
        .then(channels => {
            window.regionalChannels = channels;
            
            window.channels = nationalChannels.concat(regionalChannels);
            window.channels.sort((a, b) => a.lcn - b.lcn);
        });
} else {
    window.channels = nationalChannels;
    channels.filter(ch => ch.lcn === 103)[0].lcn = 3;
}
addChannels(channels);

const returnErrorMessage = (errorCode) => {
    return ({
        "not-working": "Lo streaming di questo canale non funziona al momento."
    })[errorCode];
};

const adultChannelConfirmation = async (night = false) => {
    createModal("Attenzione!",
        `${night ? `In questa fascia oraria (23:00 - 07:00), questo canale potrebbe trasmettere contenuti vietati ai minori di 18 anni.`
            : `Questo canale trasmette contenuti vietati ai minori di 18 anni.`}
            <br><br>Cliccando sul pulsante <b>Continua</b> qui sotto, confermi di essere consapevole della natura del materiale trasmesso e di avere l'età necessaria per poter guardarlo. Inoltre, accetti di assumerti la piena responsabilità della visione di questo canale, esonerando Zappr e i suoi affiliati da qualsiasi conseguenza derivante da un uso improprio o non autorizzato.<br><br><b>Continuare?</b>`,
        [{
            type: "primary",
            href: "#",
            text: "Continua"
        },
        {
            type: "secondary",
            href: "javascript:closeModal();",
            text: "Annulla"
        }]
    );

    document.querySelector(".modal .button.primary").addEventListener("click", () => {
        window.sessionStorage.setItem(`${night ? "nightAdult" : "adult"}ChannelConfirmation`, true);
        closeModal();
        document.querySelector(".channel.watching").click();
    });
};

document.querySelectorAll(".channel").forEach(el => {
    if (el.dataset.disabled != undefined) {
        el.title = returnErrorMessage(el.dataset.disabled);
        el.addEventListener("click", () => alert(returnErrorMessage(el.dataset.disabled)));
    } else {
        el.addEventListener("click", async () => {
            currentlyPlaying = el;
            if (el.dataset.stretch === "true") {
                stretchTo169.media = "";
            } else {
                stretchTo169.media = "not all";
            };

            if (el.classList.contains("hbbtv-app")) {
                document.querySelector(".plyr").classList.add("hbbtv-app");
            } else {
                document.querySelector(".plyr").classList.remove("hbbtv-app")
            };

            if (el.dataset.name === "RaiPlay Sound") {
                raiplaySoundFix.media = "";
            } else {
                raiplaySoundFix.media = "not all";
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
            await loadChannel(el.dataset.type, el.dataset.url, el.dataset.seek, el.dataset.specialfetchtype)
        });
    };
});
document.querySelectorAll(".hbbtv-enabler").forEach(el => {
    el.addEventListener("click", () => el.classList.toggle("clicked"));
});

const selectChannel = (channel, zapping) => {
    if (typeof(channel) === "number" || typeof(channel) === "string") targetedChannel = document.querySelector(`.channel[data-lcn="${channel}"]`);
    else if (typeof(channel) === "object") targetedChannel = channel;

    if (targetedChannel === null) targetedChannel = document.querySelector(`.hbbtv-enabler[data-lcn="${channel}"]`);
    setTimeout(() => {
        targetedChannel.scrollIntoView({
            block: "center",
            behavior: "smooth"
        });
    }, targetedChannel != undefined && targetedChannel.dataset.lcn.includes(".") ? 250 : 0)
    targetedChannel.classList.add("highlighted");
    setTimeout(() => {
        targetedChannel.classList.remove("highlighted");
    }, 2500);

    if (zapping && targetedChannel.previousElementSibling != null && targetedChannel.nextElementSibling != null) {
        targetedChannel.previousElementSibling.classList.remove("highlighted");
        targetedChannel.nextElementSibling.classList.remove("highlighted");
    };

    targetedChannel.focus();
    targetedChannel.click();
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
    if (["Backspace", "Delete", "NumpadEnter", "Enter", "Escape", "PageUp", "PageDown"].includes(e.code) || e.key === "." || e.code.startsWith("Digit") || (e.code.startsWith("Numpad") && e.code.length === 7)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
    };
    const lcnTypingElement = document.querySelector("#lcn-typing"),
          lcnTypedElement = document.querySelector("#lcn-typed"),
          controlsElement = document.querySelector("#controls");
    
    let matchedChannel = channels.filter(ch => ch.lcn === parseInt(lcnTypedElement.innerText));

    if (lcnTypedElement.innerText.includes(".") && matchedChannel[0] != undefined && matchedChannel[0].hbbtv.filter(subch => subch.sublcn == lcnTypedElement.innerText.split(".")[1]).length === 0) {
        matchedChannel = [];
    };

    if (!multipleChannelSelection && e.code.startsWith("Digit") || (e.code.startsWith("Numpad") && e.code.length === 7) || e.key === ".") {
        typingLCN = true;
        lcnTypingElement.style.display = "block";
        if (!(e.key === "." && lcnTypedElement.innerText.includes("."))) {
            lcnTypedElement.innerText += e.code.startsWith("Digit") || e.key === "." ? e.key  : e.code.replaceAll("Numpad", "");
        };
    };

    if (typingLCN) {
        switch(e.code) {
            case "Backspace":
            case "Delete":
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

window.addEventListener("keydown", keydownHandler);
plyrContainer.addEventListener("keydown", keydownHandler);

document.querySelector('[data-plyr="fullscreen"]').addEventListener("focus", () => {
    document.querySelector('[data-plyr="fullscreen"]').blur();
});

document.querySelectorAll(".tooltip").forEach(el => {
    el.addEventListener("click", () => {
        document.querySelector(el.dataset.target).classList.toggle("visible");
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

window["closeModal"] = () => {
    document.querySelector(".modal").classList.remove("is-visible");
};

// https://stackoverflow.com/a/60949881
Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))).then(() => {
    document.querySelectorAll(".hbbtv-channels").forEach(el => {
        el.style.cssText = `--scroll-height: ${el.scrollHeight}px;`;
    });
    document.querySelector("#loading").classList.add("loaded");
});