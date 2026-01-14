export default {
    it: {
        languageName: "Italiano",
        language: "Lingua",
        country: "Nazione",
        region: "Regione",
        loading: "Caricamento...",
        mainSource: "DTT",
        previousSource: "Sorgente precedente",
        nextSource: "Sorgente successiva",
        epgExit: "Esci",
        epgHeaderText: `Guida TV di <span id="epg-channel"></span>`,
        epgPreviousDay: "Giorno precedente",
        epgNextDay: "Giorno successivo",
        epgResize: "Espandi EPG",
        searchChannel: "Cerca canale...",
        installPWA: "Installa",
        tvChangeRegion: "per cambiare regione",
        saveAndReload: "Salva e ricarica",
        infoTooltip: `Zappr è il nuovo modo di guardare la TV. Guarda la maggior parte dei canali nazionali e locali del tuo paese, online, gratuitamente e senza configurazioni complesse.
        <br><br>
        <a href="https://ko-fi.com/FrancescoRosi" target="_blank" class="tooltip-link" id="donation-link">Invia una donazione :)</a>
        <a href="https://github.com/ZapprTV" target="_blank" id="github-link" class="tooltip-link">Visualizza il codice sorgente su GitHub</a>
        <div class="tooltip-link" id="news-links">Rimani aggiornato sulle ultime novità seguendoci su <a href="https://www.facebook.com/ZapprTV" target="_blank">Facebook</a>, <a href="https://x.com/ZapprStream" target="_blank">Twitter</a> o <a href="https://mastodon.uno/@zappr" target="_blank">Mastodon</a></div>
        <a href="mailto:zappr@francescoro.si" class="tooltip-link" id="email-link">Contattaci via email</a>`,
        playerLanguageCSS: `:root {
            --videojs-plyr-quality-text: "Qualità";
            --videojs-plyr-captions-text: "Sottotitoli";
            --videojs-plyr-audiotracks-text: "Traccia audio";
            --videojs-plyr-subtitles-disabled-text: "Disattivati";
            --videojs-plyr-settings-text: "Impostazioni";
            --videojs-plyr-playback-speed-text: "Velocità";
        }
        .epg-item-container::after {
            content: "Il programma richiesto inizierà a breve" !important;
        }
        .epg-item-container.on-air .epg-start-time::before {
            content: "IN ONDA" !important;
        }
        #news.news-not-loaded .tooltip-content-box:after {
            content: "Caricamento..." !important;
        }`,
        lcnTyping: "Invio per confermare<br>o Esc per annullare",
        errorTechnicalInfo: "Informazioni tecniche",
        errorCopyInfo: "Copia",
        reportError: "Per favore segnala questo errore via GitHub o email. Cliccando su uno dei pulsanti qui sotto le informazioni principali dell'errore verranno compilate automaticamente.",
        reportViaGithub: "Segnala tramite GitHub",
        reportViaEmail: "Segnala tramite email",
        errorEmailFooter: "Per favore specifica qui sotto se il canale funziona da altre parti (su altri siti o in HbbTV) e su che browser dà errore:",
        nowPlaying: "In riproduzione",
        channelError: "Errore canale",
        cantLoad: "Impossibile caricare",
        unknownSuffix: "sconosciuto",
        unknownErrorInfo: "Errore sconosciuto",
        formatServerError: "per un problema di formato/server",
        formatServerErrorTitle: "Errore formato/server",
        decodingError: "per un problema di decoding",
        decodingErrorTitle: "Errore decoding",
        serverError: "per un problema di server",
        serverErrorTitle: "Errore server",
        unknownError: "per un errore sconosciuto",
        unknownErrorTitle: "Errore sconosciuto",
        hbbtvMosaic: "Mosaico HbbTV",
        not247: "Non sempre attivo",
        viewFullEPG: "Clicca per vedere l'EPG completa",
        viewHbbTVChannels: "Visualizza canali HbbTV",
        disabledNotWorking: "Lo streaming di questo canale non funziona al momento.",
        disabledGeoblock: "Questo canale è visibile solo nel suo paese di origine.",
        warning: "Attenzione!",
        geoblockMessage: "La nazione del tuo indirizzo IP non corrisponde a quella della nazione scelta. Ciò significa che alcuni canali non saranno visibili.<br><br>Per evitare completamente questi blocchi geografici, usa una VPN.",
        welcomeTitle: "Ti diamo il benvenuto a Zappr!",
        welcomeText: "Zappr ti permette di guardare facilmente e gratuitamente il digitale terrestre, nazionale e locale <span class=\"italic\">(ricordati di impostare la tua regione nelle impostazioni!)</span>, e i canali di Samsung TV Plus e Pluto TV.<br><br>Per iniziare a vedere un canale, cliccaci sopra o scrivi la sua numerazione sulla tua tastiera e premi <b>Invio</b>. Per fare zapping, invece, puoi usare i tasti <b>PageDown</b> e <b>PageUp</b> per scorrere tra i canali.<br><br>Infine, se un canale ha la guida TV, puoi cliccare sopra al nome del programma in onda per visionare la guida TV completa fino a 7 giorni dal giorno corrente.<br><br>Questo è quanto. <b>Buona visione!</b>",
        newsInstructions: "Clicca su un titolo per leggere la notizia completa, oppure clicca su un'immagine per ingrandirla.",
        newsHosting: `Hosting del feed fornito da <a href="https://mastodon.uno" target="_blank">mastodon.uno</a> :)`,
        newsURL: "https://mastodon.uno/@zappr.rss",
        epgLoading: "L'EPG sarà disponibile a breve"
    },
    en: {
        languageName: "English",
        language: "Language",
        country: "Country",
        region: "Region",
        loading: "Loading...",
        mainSource: "Freeview",
        previousSource: "Previous source",
        nextSource: "Next source",
        epgExit: "Exit",
        epgHeaderText: `TV guide for <span id="epg-channel"></span>`,
        epgPreviousDay: "Previous day",
        epgNextDay: "Next day",
        epgResize: "Expand EPG",
        searchChannel: "Search for a channel...",
        installPWA: "Install",
        tvChangeRegion: "to switch regions",
        saveAndReload: "Save and reload",
        infoTooltip: `Zappr is the new way to watch TV. Watch most of your country's national and local channels, online, for free and without any complicated setup.
        <br><br>
        <a href="https://ko-fi.com/FrancescoRosi" target="_blank" class="tooltip-link" id="donation-link">Send a donation :)</a>
        <a href="https://github.com/ZapprTV" target="_blank" id="github-link" class="tooltip-link">View the source code on GitHub</a>
        <div class="tooltip-link" id="news-links">Stay up to date with the latest by following us on <a href="https://x.com/ZapprStreamUK" target="_blank">Twitter</a> or <a href="https://mastodonapp.uk/@zappr" target="_blank">Mastodon</a></div>
        <a href="mailto:zappr@francescoro.si" class="tooltip-link" id="email-link">Contact us via email</a>`,
        playerLanguageCSS: `.epg-item-container::after {
            content: "The requested programme will start shortly" !important;
        }
        .epg-item-container.on-air .epg-start-time::before {
            content: "ON AIR" !important;
        }
        #news.news-not-loaded .tooltip-content-box:after {
            content: "Loading..." !important;
        }`,
        lcnTyping: "Enter to confirm<br>or Esc to cancel",
        errorTechnicalInfo: "Technical info",
        errorCopyInfo: "Copy",
        reportError: "Please report this error via GitHub or email. By clicking on one of the buttons down below, the error's main info will be included automatically.",
        reportViaGithub: "Report via GitHub",
        reportViaEmail: "Report via email",
        errorEmailFooter: "Please specify down below if the channel works elsewhere (on other websites or apps) and on what browsers it errors out:",
        nowPlaying: "Now playing",
        channelError: "Channel error",
        cantLoad: "Failed to load",
        unknownSuffix: "unknown to Zappr",
        unknownErrorInfo: "Unknown error",
        formatServerError: "because of a format/server problem",
        formatServerErrorTitle: "Format/server error",
        decodingError: "because of a decoding problem",
        decodingErrorTitle: "Decoding error",
        serverError: "because of a server error",
        serverErrorTitle: "Server error",
        unknownError: "because of an unknown error",
        unknownErrorTitle: "Unknown error",
        hbbtvMosaic: "Channel mosaic",
        not247: "Not 24/7",
        viewFullEPG: "Click to view the full EPG",
        viewHbbTVChannels: "View additional IP channels",
        disabledNotWorking: "This channel's streaming isn't working at the moment.",
        disabledGeoblock: "This channel is only visible in its country of origin.",
        warning: "Warning!",
        geoblockMessage: "Your IP address' country doesn't match the country you chose. This means some channels won't be visible.<br><br>To get around geoblocks, use a VPN.",
        welcomeTitle: "Welcome to Zappr!",
        welcomeText: "Zappr allows you to watch your country's free-to-air channels, national and local <span class=\"italic\">(remember to set your country and region in the settings!)</span>.<br><br>To start watching a channel, click on it or type its channel number on your keyboard and press <b>Enter</b>. To zap between channels, use the <b>PageDown</b> and <b>PageUp</b> keys.<br><br>That's all for now. <b>Enjoy!</b>",
        newsInstructions: "Click on a title to read the full post, or click on an image to view it in full.",
        newsHosting: `Feed hosting provided by <a href="https://mastodonapp.uk" target="_blank">mastodonapp.uk</a> :)`,
        newsURL: "https://mastodonapp.uk/@zappr.rss",
        epgLoading: "EPG will be available shortly"
    }
}