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

const plyr = new Plyr("#plyr", {
    fullscreen: {
        iosNative: true
    }
});
plyr.on("enterfullscreen", () => screen.orientation.lock("landscape-primary").catch(() => {}));
plyr.on("exitfullscreen", () => screen.orientation.lock("natural").catch(() => {}));

const player = (document.querySelector("#plyr")),
      channelslist = (document.querySelector("#channels")),
      plyrContainer = (document.querySelector(".plyr")),
      plyrHideControls = (document.querySelector("#hide-controls")),
      iframeControls = (document.querySelector("#iframe-controls")),
      iframe = (document.querySelector("iframe")),
      hideProgress = (document.querySelector("#hide-progress")),
      nightAdultChannelsStyle = document.querySelector("#night-adult-channels");

plyrContainer.insertAdjacentHTML("beforeend", `<div id="lcn-typing">
    <div id="lcn-typed"></div>
    <div id="controls">
        Invio per confermare<br>
        o Esc per annullare
    </div>
</div>`);

const createErrorModal = async (title, error, info, params) => {
    let urlParams = new URLSearchParams(params).toString();
    const modalHTML = `<div class="modal">
        <div class="modal-content">
            <div class="modal-title">
                <h1>${title}</h1>
                <div class="close" onclick="closeModal()"></div>
            </div>
            <p>${error}</p>
            <div class="technical-info">
                <h3>Informazioni tecniche</h3>
                <a onclick="copyInfo()">Copia</a>
            </div>
            <div class="code" onclick="copyInfo()">${info}</div>
            <p id="report-error">Per favore segnala questo errore via GitHub o email. Cliccando su uno dei pulsanti qui sotto le informazioni principali dell'errore verranno compilate automaticamente.</p>
            <div class="modal-buttons">
                <a class="button primary" href="https://github.com/ZapprTV/channels/issues/new?${urlParams}" target="_blank">Segnala tramite GitHub</a>
                <a class="button secondary" href="mailto:zappr@francescoro.si?subject=${params.title}&body=${
                    encodeURIComponent(`Informazioni tecniche: ${params.info}

Per favore specifica qui sotto se il canale funziona da altre parti (su altri siti o in HbbTV) e su che browser dà errore:

`)
                }" target="_blank">Segnala tramite email</a>
            </div>
        </div>
    </div>`;

    if (document.querySelector(".modal") === null) {
        document.body.insertAdjacentHTML("beforeend", modalHTML);
    } else {
        (document.querySelector(".modal")).outerHTML = modalHTML;
    };

    await new Promise(resolve => setTimeout(resolve, 500));

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

const loadStream = async (type, url, seek, api, name, lcn, logo, http, ondemand) => {
    if (api) {
        url = `${window["zappr"].config.backend.host[api]}/api?${url}`;
    };

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
        case "youtube":
        case "iframe":
            plyrHideControls.media = "not all";
            document.querySelector("iframe").remove();
            break;
            
        case "direct":
            plyr.toggleControls();
            player.src = "";
            break;

        case "http":
            document.querySelector("#reopen-window").remove();
            document.querySelector(".plyr > button").classList.remove("is-hidden");
            httpPlayer.close();
            break;
            
    }

    if (http) {
        const httpPlayerURL = `${window.zappr.config.httpPlayer.host}?${new URLSearchParams({
            type: type,
            url: url,
            name: name,
            lcn: lcn,
            logo: img.src
        }).toString()}`;
        window.httpPlayer = window.open(
            httpPlayerURL,
            "httpWindow",
            new URLSearchParams({
                left: document.querySelector("#channels-column").offsetWidth,
                top: window.outerHeight - window.innerHeight,
                width: document.querySelector("#tv").offsetWidth,
                height: window.innerHeight - (window.outerHeight - window.innerHeight)
            }).toString().replaceAll("&", ",")
        );

        if (!httpPlayer) {
            createModal(
                "Accesso ai popup negato",
                `Il tuo browser non ha permesso a Zappr di aprire una finestra popup per la visione di <b>${name}</b>. Per vedere il canale, devi dare il permesso a Zappr di poter aprire finestre popup, oppure puoi aprire la finestra sottoforma di una nuova scheda e vedere il canale lì.`,
                [{
                    type: "primary",
                    href: httpPlayerURL,
                    newtab: true,
                    text: "Apri in una nuova finestra"
                },
                {
                    type: "secondary",
                    href: "javascript:closeModal();",
                    text: "Chiudi"
                }]
            );
        };
        window.addEventListener("unload", () => httpPlayer.close());
        document.querySelector("#tv").insertAdjacentHTML("afterbegin", `<a href="#" id="reopen-window"><svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24"><path fill="#fff" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6q.425 0 .713.288T12 4t-.288.713T11 5H5v14h14v-6q0-.425.288-.712T20 12t.713.288T21 13v6q0 .825-.587 1.413T19 21zM19 6.4L10.4 15q-.275.275-.7.275T9 15t-.275-.7t.275-.7L17.6 5H15q-.425 0-.712-.288T14 4t.288-.712T15 3h5q.425 0 .713.288T21 4v5q0 .425-.288.713T20 10t-.712-.288T19 9z"/></svg>Riapri player</a>`);
        document.querySelector("#reopen-window").addEventListener("click", () => {
            if (httpPlayer.closed) document.querySelector(".channel.watching").click()
            else httpPlayer.focus();
        });
        document.querySelector(".plyr > button").classList.add("is-hidden");

        currentType = "http";
    } else {
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
                    hls.on(Hls.Events.ERROR, (event, data) => {
                        if (lcn != 7) {
                            createErrorModal(
                                "Errore canale (HLS)",
                                `Impossibile caricare <b>${name}</b> <i>(${data.response.url})</i>: ${data.response.code} ${data.response.text}`,
                                JSON.stringify(data),
                                {
                                    template: "hls.yml",
                                    labels: "Errore,HLS",
                                    title: `${lcn} - ${name}: ${data.response.code} ${data.response.text}`,
                                    name: name,
                                    lcn: lcn,
                                    info: JSON.stringify(data)
                                }
                            );
                        };
                    });
                    hls.loadSource(url);
                    hls.attachMedia(player);
                };
                player.play();
                break;

            case "dash":
                window.dash = dashjs.MediaPlayer().create();
                dash.initialize(player, url, true);
                dash.on("error", event => createErrorModal(
                    "Errore canale (DASH)",
                    `Impossibile caricare <b>${name}</b> <i>(${url})</i>: ${event.error.data.response.status} ${event.error.data.response.statusText}`,
                    JSON.stringify(event),
                    {
                        template: "dash.yml",
                        labels: "Errore,DASH",
                        title: `${lcn} - ${name}: ${event.error.data.response.status} ${event.error.data.response.statusText}`,
                        name: name,
                        lcn: lcn,
                        info: JSON.stringify(event)
                    })
                );
                
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
                plyrHideControls.media = "";
                player.play();
                new Twitch.Player(plyrContainer, {
                    width: "100%",
                    height: "100%",
                    channel: url,
                    parent: ["twitch.tv"]
                });
                break;

            case "youtube":
                plyrHideControls.media = "";
                player.play();
                const youtubeIFrame = document.createElement("iframe");
                if (url.startsWith("UC") && url.length > 11) {
                    youtubeIFrame.src = `https://www.youtube-nocookie.com/embed/live_stream?channel=${url}&autoplay=1&modestbranding=1&rel=0&hl=it-it`;
                } else {
                    youtubeIFrame.src = `https://www.youtube-nocookie.com/embed/${url}?autoplay=1&modestbranding=1&rel=0&hl=it-it`;
                };
                youtubeIFrame.allowFullscreen = true;
                youtubeIFrame.allow = "autoplay";
                plyrContainer.insertAdjacentElement("afterbegin", youtubeIFrame);
                break;

            case "iframe":
                plyrHideControls.media = "";
                player.play();
                const iframe = document.createElement("iframe");
                iframe.src = url;
                iframe.allowFullscreen = true;
                iframe.allow = "autoplay";
                iframe.scrolling = "no";
                plyrContainer.insertAdjacentElement("afterbegin", iframe);
                break;

            case "direct":
                player.addEventListener("error", e => {
                    if (currentType === "direct") {
                        createErrorModal(
                            "Errore canale (Diretto)",
                            `Impossibile caricare <b>${name}</b> <i>(${url})</i>.`,
                            "Nessun'informazione disponibile",
                            {
                                template: "diretto.yml",
                                labels: "Errore,Diretto",
                                title: `${lcn} - ${name}`,
                                name: name,
                                lcn: lcn,
                                info: url
                            }
                        );
                    };
                });
                player.src = url;
                player.play();
        };
        currentType = type;
    };

    if (seek === "false" || type === "dash" || type === "flv" || (type === "direct" && ondemand != "true")) {
        hideProgress.media = "";
    } else {
        hideProgress.media = "not all";
    };
};

const loadChannel = async (type, url, seek, api, name, lcn, logo, http, license, ondemand) => {
    if (url.startsWith("zappr://")) {
        const parameter = url.split("/")[3];
        switch(url.split("/")[2]) {

            case "sky":
                await fetch(`https://apid.sky.it/vdp/v1/getLivestream?id=${parameter}&isMobile=false`)
                    .then(response => response.json())
                    .then(json => {
                        loadStream(type, json.streaming_url, seek, false, name, lcn, logo, false, false);
                    });
                break;

            case "la7-hbbtv":
                await fetch(`https://www.la7.it/appPlayer/liveUrlWithFailPerApp.php?channel=${parameter}`)
                    .then(response => response.json())
                    .then(json => {
                        loadStream(type, json.main, seek, false, name, lcn, logo, false, false);
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
                        loadStream(type, json.srcs[0].uniqueStreamer, seek, false, name, lcn, logo, false, false);
                    });
                break;

        };
    } else if (license != undefined) {
        switch(license) {
            
            case "xdevel-wms":
                await fetch("https://play.xdevel.com/was")
                    .then(response => response.json())
                    .then(json => {
                        loadStream(type, `${url}?wmsAuthSign=${json.was}`, seek, false, name, lcn, logo, false, false);
                    });
                break;

        };
    } else await loadStream(type, url, seek, api, name, lcn, logo, http, ondemand);
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
    channels.forEach(channel => {
        channelslist.insertAdjacentHTML("beforeend", `
            ${channel.hbbtv ? `<div class="hbbtv-container">` : ""}
                <div class="${channel.hbbtvapp ? "hbbtv-app" : ""} ${channel.hbbtvmosaic ? "hbbtv-enabler hbbtv-mosaic": "channel"} ${channel.adult === true ? "adult" : channel.adult === "night" ? "adult at-night" : ""}" data-name="${channel.name}" data-logo="${getChannelLogoURL(channel.logo)}" ${channel.type != undefined ? `data-type="${channel.type}"` : ""} ${channel.url != undefined ? `data-url="${channel.url}"` : ""} data-lcn="${channel.lcn}" ${channel.seek != undefined ? `data-seek="${channel.seek}"` : ""} ${channel.disabled ? `disabled data-disabled="${channel.disabled}"` : ""} ${channel.api ? `data-api="${channel.api}"` : ""} ${channel.cssfix ? `data-cssfix="${channel.cssfix}"` : ""} ${channel.http ? `data-http="true"` : ""} ${channel.license ? `data-license="${channel.license}"` : ""} ${channel.ondemand ? `data-ondemand="${channel.ondemand}"` : ""}>
                    <div class="lcn">${channel.lcn}</div>
                    <img class="logo" src="${getChannelLogoURL(channel.logo)}" crossorigin="anonymous">
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
                            ? `<div class="channel ${subchannel.adult === true ? "adult" : subchannel.adult === "night" ? "adult at-night" : ""}" data-name="${subchannel.name}" data-logo="${getChannelLogoURL(subchannel.logo)}" ${subchannel.type != undefined ? `data-type="${subchannel.type}"` : ""} ${subchannel.url != undefined ? `data-url="${subchannel.url}"` : ""} data-lcn="${channel.lcn}.${subchannel.sublcn}" ${subchannel.seek ? `data-seek="${subchannel.seek}"` : ""} ${subchannel.disabled ? `disabled data-disabled="${subchannel.disabled}"` : ""} ${subchannel.api ? `data-api="${subchannel.api}"` : ""} ${subchannel.cssfix ? `data-cssfix="${subchannel.cssfix}"` : ""} ${subchannel.http ? `data-http="true"` : ""} ${subchannel.license ? `data-license="${subchannel.license}"` : ""} ${subchannel.ondemand ? `data-ondemand="${subchannel.ondemand}"` : ""}>
                                <div class="lcn">${channel.lcn}.${subchannel.sublcn}</div>
                                <img class="logo" src="${getChannelLogoURL(subchannel.logo)}" crossorigin="anonymous">
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
        .then(json => {
            window.regionalChannels = json.channels;
            
            window.channels = nationalChannels.channels.concat(regionalChannels);
            window.channels.sort((a, b) => a.lcn - b.lcn);
        });
} else {
    window.channels = nationalChannels.channels;
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
            loadStream("dash", channels.filter(el => el.lcn === 103)[0].url, false, false, "Rai 3", 103, getChannelLogoURL("rai3.svg"), false);
            scheduleProgram(program);
        }, timeUntilEnd);
        
        state.timeouts.set(`${program.title}-end`, endTimeoutId);
        loadStream("dash", channels.filter(el => el.lcn === 3)[0].url, false, false, channels.filter(el => el.lcn === 3)[0].name, 3, getChannelLogoURL("rai3.svg"), false);
        state.playingRegional = true;
        return;
    } else if (!state.playingRegional) {
        loadStream("dash", channels.filter(el => el.lcn === 103)[0].url, false, false, "Rai 3", 103, getChannelLogoURL("rai3.svg"), false);
    };

    const nextAirTime = getNextAirTime(program);
    if (!nextAirTime) return;

    const timeUntilAir = nextAirTime.getTime() - new Date().getTime();
    if (timeUntilAir <= 0) return;

    const timeoutId = setTimeout(() => {
        loadStream("dash", channels.filter(el => el.lcn === 3)[0].url, false, false, channels.filter(el => el.lcn === 3)[0].name, 3, getChannelLogoURL("rai3.svg"), false);
        state.playingRegional = true;
        
        const endTime = new Date(nextAirTime.toDateString() + ' ' + program.to);
        const timeUntilEnd = endTime.getTime() - nextAirTime.getTime();
        
        const endTimeoutId = setTimeout(() => {
            loadStream("dash", channels.filter(el => el.lcn === 103)[0].url, false, false, "Rai 3", 103, getChannelLogoURL("rai3.svg"), false);
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
                plyrContainer.classList.add("hbbtv-app");
            } else if (plyrContainer.classList.contains("hbbtv-app") && !el.classList.contains("hbbtv-app")) {
                plyrContainer.classList.remove("hbbtv-app");
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
            await loadChannel(el.dataset.type, el.dataset.url, el.dataset.seek, el.dataset.api, el.dataset.name, el.dataset.lcn, el.dataset.logo, el.dataset.http, el.dataset.license, el.dataset.ondemand);
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

    if ((lcnTypedElement.innerText.includes(".") && matchedChannel[0] != undefined && matchedChannel[0].hbbtv && matchedChannel[0].hbbtv.filter(subch => subch.sublcn == lcnTypedElement.innerText.split(".")[1]).length === 0) || (lcnTypedElement.innerText.includes(".") && matchedChannel[0] != undefined && !matchedChannel[0].hbbtv)) {
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


window["closeModal"] = () => {
    document.querySelector(".modal").classList.remove("is-visible");
};

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

// https://stackoverflow.com/a/60949881
Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))).then(() => {
    document.querySelector("#loading").classList.add("loaded");
    document.querySelectorAll(".hbbtv-channels").forEach(el => {
        el.style.cssText = `--scroll-height: ${el.scrollHeight}px;`;
    });
});