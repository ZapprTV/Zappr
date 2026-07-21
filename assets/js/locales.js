const listIcon = (await import("/assets/icons/list.svg?url")).default;
export default {
    it: {
        languageName: "Italiano",
        language: "Lingua",
        country: "Nazione",
        region: "Regione",
        noRegion: "Nessuna (solo canali nazionali)",
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
        <a href="https://trustpilot.com/evaluate/zappr.stream" target="_blank" id="trustpilot-link" class="tooltip-link">Recensisci Zappr su Trustpilot</a>
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
        }
        #my-list .list:after {
            content: "✓ Selezionata";
        }`,
        lcnTyping: "Invio per confermare<br>o Esc per annullare",
        errorTechnicalInfo: "Informazioni tecniche",
        errorCopyInfo: "Copia",
        errorCopiedInfo: "Copiato!",
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
        continue: "Continua",
        cancel: "Annulla",
        warning: "Attenzione!",
        geoblockMessage: "La nazione del tuo indirizzo IP non corrisponde a quella della nazione scelta. Ciò significa che alcuni canali non saranno visibili.<br><br>Per evitare completamente questi blocchi geografici, usa una VPN.",
        welcomeTitle: "Ti diamo il benvenuto a Zappr!",
        welcomeText: `Zappr ti permette di guardare facilmente e gratuitamente il digitale terrestre, nazionale e locale <span class="italic">(ricordati di impostare la tua regione nelle impostazioni!)</span>, e i canali di Samsung TV Plus e Pluto TV.<br><br>Per iniziare a guardare un canale, cliccaci sopra o scrivi la sua numerazione sulla tua tastiera e premi <b>Invio</b>. Per fare zapping, invece, puoi usare i tasti <b>PageDown</b> e <b>PageUp</b> per scorrere tra i canali.<br><br>Se un canale ha la guida TV, puoi cliccare sopra al nome del programma in onda per visionare la guida TV completa fino a 7 giorni dal giorno corrente.<br><br>Infine, se vuoi personalizzare la lista dei canali, assemblando una lista dei preferiti o creandone di nuove con i canali che vuoi tu, proprio come in un client IPTV, puoi fare ciò con la funzione <b>My List</b>, a cui puoi accedere cliccando l'icona <img src="${listIcon}"> nella barra inferiore.<br><br>Questo è quanto. <b>Buona visione!</b>`,
        newsInstructions: "Clicca su un titolo per leggere la notizia completa, oppure clicca su un'immagine per ingrandirla.",
        newsHosting: `Hosting del feed fornito da <a href="https://mastodon.uno" target="_blank">mastodon.uno</a> :)`,
        newsURL: "https://mastodon.uno/@zappr.rss",
        epgLoading: "L'EPG sarà disponibile a breve",
        unreportableErrorDASHiOS: "Molto probabilmente il tuo dispositivo non supporta lo streaming di questo canale. Prova su un altro dispositivo.",
        unreportableErrorFAST: "Gli streaming di questi canali vengono aggiornati automaticamente ogni giorno. Riprova più tardi o tra 24 ore.",
        search: "Cerca",
        news: "Notizie",
        info: "Info",
        settings: "Impostazioni",
        save: "Salva",
        saveList: "Salva lista",
        watch: "Guarda",
        selectBaseList: "Seleziona una lista base",
        officialZapprList: "Lista ufficiale di Zappr",
        listPublisherDonate: "<b>$</b> Dona",
        favoritesBaseList: "Preferiti",
        shareList: "Condividi lista",
        editList: "Modifica lista",
        addList: "Aggiungi una lista...",
        createListManually: "Crea manualmente...",
        insertListURL: "Inserisci URL...",
        selectAdditionalLists: "Seleziona una o più liste aggiuntive",
        baseList: "Lista base",
        additionalLists: "Liste aggiuntive",
        howDoesMyListWork: "Come funziona My List?",
        myListExplanation: "My List ti permette di personalizzare la lista dei canali di Zappr. Scegli una lista base, che fungerà da sorgente principale di canali, e arricchiscila con quante liste aggiuntive desideri. I canali delle liste aggiuntive verranno integrati con quelli della lista base.",
        addChannel: "Aggiungi un canale...",
        listEditorInfo: "Info",
        listEditorChannels: "Canali",
        disabledRegionSettings: "Queste impostazioni sono disponibili solo con la lista base ufficiale di Zappr (o dei preferiti).",
        multipleChannelSelectionText: (matchedChannel) => `<b>Premi ${matchedChannel.map((channel, index) => `${index + 1} per ${channel.name}`).join(",<br>")}<br>oppure Esc per annullare</b>`,
        popupReopenPlayer: "Riapri player",
        popupAccessDeniedTitle: "Accesso ai popup negato",
        popupAccessDeniedText: (channel) => `Il tuo browser non ha permesso a Zappr di aprire una finestra popup per la visione di <b>${name}</b>. Per vedere il canale, devi dare il permesso a Zappr di poter aprire finestre popup, oppure puoi aprire la finestra sottoforma di una nuova scheda e vedere il canale lì.`,
        openInNewWindow: "Apri in una nuova scheda",
        closeModal: "Chiudi",
        couldntFetchSchema: "Attenzione: Zappr non riesce a verificare la conformità della lista selezionata al formato previsto per le liste dei canali. Pertanto, per la tua sicurezza, abbiamo ripristinato la lista dei canali predefinita.",
        notSchemaCompliantOnLoading: (errors) => `Attenzione: Il formato della lista base dei canali che hai scelto non è valido. Pertanto, abbiamo ripristinato la lista dei canali predefinita.\n\nErrori:\n${errors}`,
        couldntFetchSchemaAdditionalList: (list) => `Attenzione: Zappr non riesce a verificare la conformità di una delle liste aggiuntive che hai selezionato al formato previsto per le liste dei canali. Pertanto, per la tua sicurezza, l'abbiamo disattivata.\n\nLista: ${list}`,
        notSchemaCompliantAdditionalList: (list, errors) => `Attenzione: Il formato di una delle liste dei canali aggiuntive che hai scelto non è valido. Pertanto, l'abbiamo disattivata.\n\nLista: ${list}\nErrori:\n${errors}`,
        couldntFetchChannelList: "Impossibile recuperare lista dei canali",
        alreadyAddedRemoteList: "Hai già una lista con questo URL",
        listFormatInvalid: "Formato della lista non valido",
        nightAdultChannelModalText: "In questa fascia oraria (23:00 - 07:00), questo canale potrebbe trasmettere contenuti vietati ai minori di 18 anni.",
        fullyAdultChannelModalText: "Questo canale trasmette contenuti vietati ai minori di 18 anni.",
        adultChannelModalText: "Cliccando sul pulsante <b>Continua</b> qui sotto, confermi di essere consapevole della natura del materiale trasmesso e di avere l'età necessaria per poter guardarlo. Inoltre, accetti di assumerti la piena responsabilità della visione di questo canale, esonerando Zappr e i suoi affiliati da qualsiasi conseguenza derivante da un uso improprio o non autorizzato.<br><br><b>Continuare?</b>",
        untitledList: "Lista senza nome",
        deleteList: "Elimina lista",
        favoritesListEmpty: "La lista dei preferiti è vuota! Aggiungi dei canali ai preferiti cliccando l'icona della matita.",
        deleteListConfirmation: "Sei sicuro di voler eliminare questa lista?",
        deleteChannelConfirmation: "Sei sicuro di voler eliminare questo canale?",
        listNameInputLabel: "&nbsp;Nome",
        listNameInput: "Nome della lista",
        listIconInputLabel: "Icona",
        listIconInput: "URL di un'immagine PNG/SVG",
        listEPGInputLabel: "&nbsp;&nbsp;EPG",
        listEPGInput: "URL del file JSON dell'EPG",
        channel: "Canale",
        clickChannelToFavorite: "Clicca su un canale per aggiungerlo ai preferiti",
        invalidURL: "URL non valido.",
        localList: "Lista locale",
        saveChannel: "Salva canale",
        useEmoji: "Usa emoji",
        listURLCopied: `È stato copiato con successo l'URL della lista!\nPer importarla altrove, clicca sull'icona di My List, poi su "Aggiungi una lista..." e, nella casella di testo "Inserisci URL...", inserisci l'URL appena copiato.\nPuoi importare questa lista sia come lista base che come lista aggiuntiva.`,
        myListTemporaryPromoTooltipTitle: "Prova <i>My List</i>, la nuova funzione di Zappr",
        myListTemporaryPromoTooltipText: `<span>Personalizza la lista dei canali a tuo piacimento.</span>
        <span>Assembla la lista dei tuoi canali preferiti, o creane di nuove con i canali che desideri. Proprio come in un client IPTV.</span>`,
        additionalChannelFavoritingDisabled: "Puoi aggiungere solo canali della lista base ufficiale di Zappr ai preferiti.",
        selectFavoritesFromOfficialBaseList: "Seleziona i tuoi canali preferiti dalla lista ufficiale di Zappr",
        disabledClearkeyiOS: "Questo canale non è visibile su iOS perché non supporta il DRM ClearKey.",
        channelEditorSchema: {
            _groups: {
                "basic-channel-info": "Info canale",
                "stream-info": "Info stream"
            },
            lcn: ["LCN"],
            logo: ["Logo", "URL di un'immagine PNG/SVG"],
            name: ["Nome", "Nome canale"],
            subtitle: ["Sottotitolo", "Sottotitolo canale"],
            hd: ["HD"],
            uhd: ["4K"],
            radio: ["Canale radio?", {
                true: "Canale radio senza traccia video",
                video: "Canale radio con traccia video statica"
            }],
            ondemand: ["Video on-demand"],
            type: ["Tipo", {
                hls: "HLS (.m3u8)",
                dash: "DASH (.mpd)",
                twitch: "Twitch (username canale)",
                youtube: "YouTube (ID canale/video)",
                iframe: "IFrame/embed (URL)",
                audio: "Audio",
                direct: "Diretto (.mp4, .mkv, ecc.)",
                popup: "Finestra popup (URL)"
            }],
            url: ["URL", "URL stream"],
            http: ["Visibile solo\ntramite HTTP?"],
            license: ["Licenza", {
                "xdevel-wms": "Xdevel WMS Auth Sign",
                clearkey: "ClearKey",
                widevine: "Widevine (URL licenza)"
            }],
            licensedetails: ["Dettagli licenza", "Stringa o JSON"],
            hbbtvapp: ["App HbbTV?"],
            api: ["API", {
                vercel: "API Vercel",
                cloudflare: "API Cloudflare"
            }],
            cssfix: ["Fix CSS", {
                "streamshow-embed": "Embed StreamShow (embed.streamshow.net)",
                stretch: "Stretcha da 4:3 a 16:9",
                "squashed-height": "Stretcha da 64:27 a 16:9",
                "very-squashed-height": "Stretcha da 32:9 a 16:9",
                "five-two-squashed-height": "Stretcha da 5:2 a 16:9",
                "center-iframe": "Centra IFrame/embed",
                "servizistreaming-embed": "Embed di ServiziStreaming.it",
                "livetvuk-embed": "Embed di LiveTVUK.com",
                "native-hls-720p-iframe": "Ingrandisci video in 720p dentro un IFrame/embed",
                letterbox: "Stream in letterbox"
            }],
            "epg.source": ["Sorgente EPG", "ID sorgente EPG"],
            "epg.id": ["ID EPG", "ID del canale nella sorgente EPG"],
            timeshift: ["Ore di timeshift"]
        }
    },
    en: {
        languageName: "English",
        language: "Language",
        country: "Country",
        region: "Region",
        noRegion: "None (only national channels)",
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
        <a href="https://trustpilot.com/evaluate/zappr.stream" target="_blank" id="trustpilot-link" class="tooltip-link">Review Zappr on Trustpilot</a>
        <a href="https://github.com/ZapprTV" target="_blank" id="github-link" class="tooltip-link">View the source code on GitHub</a>
        <div class="tooltip-link" id="news-links">Stay up to date with the latest by following us on <a href="https://www.facebook.com/ZapprTV" target="_blank">Facebook</a>, <a href="https://x.com/ZapprStream" target="_blank">Twitter</a> or <a href="https://mastodon.uno/@zappr" target="_blank">Mastodon</a></div>
        <a href="mailto:zappr@francescoro.si" class="tooltip-link" id="email-link">Contact us via email</a>`,
        playerLanguageCSS: `.epg-item-container::after {
            content: "The requested programme will start shortly" !important;
        }
        .epg-item-container.on-air .epg-start-time::before {
            content: "ON AIR" !important;
        }
        #news.news-not-loaded .tooltip-content-box:after {
            content: "Loading..." !important;
        }
        #my-list .list:after {
            content: "✓ Selected";
        }`,
        lcnTyping: "Enter to confirm<br>or Esc to cancel",
        errorTechnicalInfo: "Technical info",
        errorCopyInfo: "Copy",
        errorCopiedInfo: "Copied!",
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
        continue: "Continue",
        cancel: "Cancel",
        warning: "Warning!",
        geoblockMessage: "Your IP address' country doesn't match the country you chose. This means some channels won't be visible.<br><br>To get around geoblocks, use a VPN.",
        welcomeTitle: "Welcome to Zappr!",
        welcomeText: `Zappr allows you to watch your country's free-to-air channels, national and local <span class="italic">(remember to set your country and region in the settings!)</span>.<br><br>To start watching a channel, click on it or type its channel number on your keyboard and press <b>Enter</b>. To zap between channels, use the <b>PageDown</b> and <b>PageUp</b> keys.<br><br>If a channel has a TV guide, you can click on the name of the program currently airing to view the channel's complete TV guide for up to 7 days from the current day.<br><br>Finally, if you want to customize the channel list, by putting together a list of your favorite channels or creating new lists with the channels you want, just like in an IPTV client, you can do that with the <b>My List</b> feature, which you can access by clicking on the <img src="${listIcon}"> icon in the bottom bar.<br><br>That's all for now. <b>Enjoy!</b>`,
        newsInstructions: "Click on a title to read the full post, or click on an image to view it in full.",
        newsHosting: `Feed hosting provided by <a href="https://mastodon.uno" target="_blank">mastodon.uno</a> :)`,
        newsURL: "https://mastodon.uno/@zappr.rss",
        epgLoading: "EPG will be available shortly",
        unreportableErrorDASHiOS: "Your device most likely doesn't support this type of livestream. Try on another device.",
        unreportableErrorFAST: "The links of these channels' livestreams are automatically updated every day. Try again later or in 24 hours.",
        search: "Search",
        news: "News",
        info: "Info",
        settings: "Settings",
        save: "Save",
        saveList: "Save list",
        watch: "Watch",
        selectBaseList: "Select a base list",
        officialZapprList: "Official Zappr list",
        listPublisherDonate: "<b>$</b> Donate",
        favoritesBaseList: "Favorites",
        shareList: "Share list",
        editList: "Edit list",
        addList: "Add a list...",
        createListManually: "Create manually...",
        insertListURL: "Insert URL...",
        selectAdditionalLists: "Select one or more additional lists",
        baseList: "Base list",
        additionalLists: "Additional lists",
        howDoesMyListWork: "How does My List work?",
        myListExplanation: "My List allows you to personalize Zappr's channel list. Choose a base list, which will serve as your main source of channels, and enhance it with as many additional lists as you like. The channels from the additional lists will be combined with those from the base list.",
        addChannel: "Add a channel...",
        listEditorInfo: "Info",
        listEditorChannels: "Channels",
        disabledRegionSettings: "These settings are only available with Zappr's official base list (or the favorites list).",
        multipleChannelSelectionText: (matchedChannel) => `<b>Press ${matchedChannel.map((channel, index) => `${index + 1} for ${channel.name}`).join(",<br>")}<br>or Esc to cancel</b>`,
        popupReopenPlayer: "Reopen player",
        popupAccessDeniedTitle: "Popup access denied",
        popupAccessDeniedText: (channel) => `Your browser didn't allow Zappr to open a popup window to watch <b>${name}</b>. To watch this channel, you must allow Zappr to open popup windows or open the window as a new tab in your browser and watch the channel there.`,
        openInNewWindow: "Open in new tab",
        closeModal: "Close",
        couldntFetchSchema: "Warning: Zappr wasn't able to verify the selected list's compliance with the channel list schema. Therefore, for your safety, we've re-enabled the default base channel list.",
        notSchemaCompliantOnLoading: (errors) => `Warning: The format of the base channel list you selected is invalid. Therefore, for your safety, we've re-enabled the default channel list.\n\nErrors:\n${errors}`,
        couldntFetchSchemaAdditionalList: (list) => `Warning: Zappr wasn't able to verify the compliance of one of your selected additional lists with the channel list schema. Therefore, for your safety, we've disabled it.\n\nList: ${list}`,
        notSchemaCompliantAdditionalList: (list, errors) => `Warning: The format of one of your selected additional lists is invalid. Therefore, for your safety, we've disabled it.\n\nList: ${list}\nErrors:\n${errors}`,
        couldntFetchChannelList: "Couldn't fetch channel list",
        alreadyAddedRemoteList: "You already have a list with this URL",
        listFormatInvalid: "List format invalid",
        nightAdultChannelModalText: "In this timeslot (23:00 - 07:00), this channel might broadcast 18+ content.",
        fullyAdultChannelModalText: "This channel broadcasts 18+ content.",
        adultChannelModalText: "Clicking on <b>Continue</b> down below, you confirm that you are aware of the nature of the material being broadcast and that you are of legal age to view it. Furthermore, you agree to assume full responsibility for viewing this channel, releasing Zappr and its affiliates from any liability arising from improper or unauthorized use.<br><br><b>Do you wish to continue?</b>",
        untitledList: "Untitled list",
        deleteList: "Delete list",
        favoritesListEmpty: "The favorites list is empty! Favorite some channels by clicking on the pencil icon.",
        deleteListConfirmation: "Are you sure you want to delete this list?",
        deleteChannelConfirmation: "Are you sure you want to delete this channel?",
        listNameInputLabel: "&nbsp;Name",
        listNameInput: "List name",
        listIconInputLabel: "&nbsp;Icon",
        listIconInput: "URL of a PNG/SVG image",
        listEPGInputLabel: "&nbsp;&nbsp;EPG",
        listEPGInput: "URL of the EPG JSON file",
        channel: "Channel",
        clickChannelToFavorite: "Click on a channel to favorite it",
        invalidURL: "Invalid URL.",
        localList: "Local list",
        saveChannel: "Save channel",
        useEmoji: "Use emoji",
        listURLCopied: `The list's URL has been copied successfully!\nTo import it elsewhere, click on the My List icon, then on "Add a list...", and in the "Insert URL..." textbox, insert the URL that's just been copied into your clipboard.\nYou can import this list either as a base list or as an additional list.`,
        myListTemporaryPromoTooltipTitle: "Try <i>My List</i>, Zappr's new feature",
        myListTemporaryPromoTooltipText: `<span>Customize the channel list to your liking.</span>
        <span>Put together a list of your favorite channels, or create new lists with the channels you want. Just like in an IPTV client.</span>`,
        additionalChannelFavoritingDisabled: "You can only favorite channels from Zappr's official base list.",
        selectFavoritesFromOfficialBaseList: "Select your favorite channels from Zappr's official base list",
        disabledClearkeyiOS: "This channel is not visible on iOS due to its lack of support for ClearKey DRM.",
        channelEditorSchema: {
            _groups: {
                "basic-channel-info": "Channel info",
                "stream-info": "Stream info"
            },
            lcn: ["LCN"],
            logo: ["Logo", "URL of a PNG/SVG image"],
            name: ["Name", "Channel name"],
            subtitle: ["Subtitle", "Channel subtitle"],
            hd: ["HD"],
            uhd: ["4K"],
            radio: ["Radio channel?", {
                true: "Radio channel without a video track",
                video: "Radio channel with a static video track"
            }],
            ondemand: ["On-demand video"],
            type: ["Type", {
                hls: "HLS (.m3u8)",
                dash: "DASH (.mpd)",
                twitch: "Twitch (channel username)",
                youtube: "YouTube (channel/video ID)",
                iframe: "IFrame/embed (URL)",
                audio: "Audio",
                direct: "Direct (.mp4, .mkv, etc.)",
                popup: "Popup window (URL)"
            }],
            url: ["URL", "Stream URL"],
            http: ["Only visible\nthrough HTTP?"],
            license: ["License", {
                "xdevel-wms": "Xdevel WMS Auth Sign",
                clearkey: "ClearKey",
                widevine: "Widevine (license URL)"
            }],
            licensedetails: ["License details", "JSON or string"],
            hbbtvapp: ["HbbTV app?"],
            api: ["API", {
                vercel: "Vercel API",
                cloudflare: "Cloudflare API"
            }],
            cssfix: ["CSS fix", {
                "streamshow-embed": "StreamShow embed (embed.streamshow.net)",
                stretch: "Stretch from 4:3 to 16:9",
                "squashed-height": "Stretch from 64:27 to 16:9",
                "very-squashed-height": "Stretch from 32:9 to 16:9",
                "five-two-squashed-height": "Stretch from 5:2 to 16:9",
                "center-iframe": "Center IFrame/embed",
                "servizistreaming-embed": "ServiziStreaming.it embed",
                "livetvuk-embed": "LiveTVUK.com embed",
                "native-hls-720p-iframe": "Make a 720p video inside an IFrame/embed full size",
                letterbox: "Letterbox stream"
            }],
            "epg.source": ["EPG source", "ID of the EPG source"],
            "epg.id": ["EPG ID", "ID of the channel in the EPG source"],
            timeshift: ["Timeshift hours"]
        }
    },
    fr: {
        languageName: "Français",
        language: "Langue",
        country: "Pays",
        region: "Région",
        noRegion: "Aucune (chaînes nationales uniquement)",
        loading: "Chargement...",
        mainSource: "TNT",
        previousSource: "Source précédente",
        nextSource: "Source suivante",
        epgExit: "Quitter",
        epgHeaderText: `Programme TV de <span id="epg-channel"></span>`,
        epgPreviousDay: "Jour précédent",
        epgNextDay: "Jour suivant",
        epgResize: "Agrandir l'EPG",
        searchChannel: "Rechercher une chaîne...",
        installPWA: "Installer",
        tvChangeRegion: "pour changer de région",
        saveAndReload: "Enregistrer et recharger",
        infoTooltip: `Zappr est la nouvelle façon de regarder la télévision. Regardez les chaînes nationales et locales de votre pays, en ligne, gratuitement et sans configuration compliquée.
        <br><br>
        <a href="https://ko-fi.com/FrancescoRosi" target="_blank" class="tooltip-link" id="donation-link">Faire un don :)</a>
        <a href="https://trustpilot.com/evaluate/zappr.stream" target="_blank" id="trustpilot-link" class="tooltip-link">Évaluez Zappr sur Trustpilot</a>
        <a href="https://github.com/ZapprTV" target="_blank" id="github-link" class="tooltip-link">Afficher le code source sur GitHub</a>
        <div class="tooltip-link" id="news-links">Restez informé des dernières actualités en nous suivant sur <a href="https://www.facebook.com/ZapprTV" target="_blank">Facebook</a>, <a href="https://x.com/ZapprStream" target="_blank">Twitter</a> ou <a href="https://mastodon.uno/@zappr" target="_blank">Mastodon</a></div>
        <a href="mailto:zappr@francescoro.si" class="tooltip-link" id="email-link">Contactez-nous par email</a>`,
        playerLanguageCSS: `:root {
            --videojs-plyr-quality-text: "Qualité";
            --videojs-plyr-captions-text: "Sous-titres";
            --videojs-plyr-audiotracks-text: "Piste audio";
            --videojs-plyr-subtitles-disabled-text: "Désactivés";
            --videojs-plyr-settings-text: "Paramètres";
            --videojs-plyr-playback-speed-text: "Vitesse";
        }
        .epg-item-container::after {
            content: "Le programme demandé commencera bientôt" !important;
        }
        .epg-item-container.on-air .epg-start-time::before {
            content: "EN DIRECT" !important;
        }
        #news.news-not-loaded .tooltip-content-box:after {
            content: "Chargement..." !important;
        }
        #my-list .list:after {
            content: "✓ Sélectionnée";
        }`,
        lcnTyping: "Entrée pour confirmer<br>ou Échap pour annuler",
        errorTechnicalInfo: "Informations techniques",
        errorCopyInfo: "Copier",
        errorCopiedInfo: "Copié !",
        reportError: "Merci de signaler cette erreur via GitHub ou par email. En cliquant sur l'un des boutons ci-dessous, les principales informations de l'erreur seront automatiquement incluses.",
        reportViaGithub: "Signaler via GitHub",
        reportViaEmail: "Signaler par email",
        errorEmailFooter: "Merci de préciser ci-dessous si la chaîne fonctionne ailleurs (sur d'autres sites ou applications) et sur quel navigateur l'erreur se produit :",
        nowPlaying: "En cours de lecture",
        channelError: "Erreur de chaîne",
        cantLoad: "Impossible de charger",
        unknownSuffix: "inconnu",
        unknownErrorInfo: "Erreur inconnue",
        formatServerError: "en raison d'un problème de format/serveur ",
        formatServerErrorTitle: "Erreur de format/serveur",
        decodingError: "en raison d'un problème de décodage",
        decodingErrorTitle: "Erreur de décodage",
        serverError: "en raison d'un problème de serveur",
        serverErrorTitle: "Erreur de serveur",
        unknownError: "en raison d'une erreur inconnue",
        unknownErrorTitle: "Erreur inconnue",
        hbbtvMosaic: "Mosaïque HbbTV",
        not247: "Pas toujours actif",
        viewFullEPG: "Cliquez ici pour voir l'EPG complet",
        viewHbbTVChannels: "Afficher les chaînes HbbTV",
        disabledNotWorking: "Le streaming de cette chaîne ne fonctionne pas actuellement.",
        disabledGeoblock: "Cette chaîne n'est visible que dans son pays d'origine.",
        continue: "Continuer",
        cancel: "Annuler",
        warning: "Attention !",
        geoblockMessage: "Le pays de votre adresse IP ne correspond pas au pays choisi. Cela signifie que certaines chaînes ne seront pas visibles.<br><br>Pour contourner ces restrictions géographiques, utilisez un VPN.",
        welcomeTitle: "Bienvenue sur Zappr !",
        welcomeText: `Zappr vous permet de regarder facilement et gratuitement la télévision numérique terrestre, nationale et locale <span class="italic">(n'oublie pas de sélectionner ta région dans les paramètres !)</span>, ainsi que les chaînes de Samsung TV Plus et Pluto TV.<br><br>Pour commencer à regarder une chaîne, cliquez dessus ou tapez son numéro sur votre clavier et appuyez sur <b>Entrée</b>. Pour zapper, utilisez les touches <b>PageDown</b> et <b>PageUp</b> pour parcourir les chaînes.<br><br>Si une chaîne dispose d'un guide TV, vous pouvez cliquer sur le nom de l'émission en cours pour consulter le programme complète jusqu'à 7 jours à compter du jour actuel.<br><br>Enfin, si vous souhaitez personnaliser la liste des chaînes, en composant une liste de favoris ou en créant de nouvelles listes avec les chaînes de votre choix, tout comme dans un client IPTV, vous pouvez le faire grâce à la fonction <b>My List</b>, accessible en cliquant sur l'icône <img src="${listIcon}"> dans la barre inférieure.<br><br>C'est tout. <b>Bon visionnage !</b>`,
        newsInstructions: "Cliquez sur un titre pour lire l'article complet, ou cliquez sur une image pour l'agrandir.",
        newsHosting: `Hébergement du flux fourni par <a href="https://mastodon.uno" target="_blank">mastodon.uno</a> :)`,
        newsURL: "https://mastodon.uno/@zappr.rss",
        epgLoading: "L'EPG sera bientôt disponible",
        unreportableErrorDASHiOS: "Il est très probable que votre appareil ne prenne pas en charge ce type de flux en direct. Essayez sur un autre appareil.",
        unreportableErrorFAST: "Les flux de ces chaînes sont mis à jour automatiquement chaque jour. Réessayez plus tard ou dans 24 heures.",
        search: "Rechercher",
        news: "Actualités",
        info: "Infos",
        settings: "Paramètres",
        save: "Enregistrer",
        saveList: "Enregistrer la liste",
        watch: "Regarder",
        selectBaseList: "Sélectionner une liste de base",
        officialZapprList: "Liste officielle de Zappr",
        listPublisherDonate: "<b>$</b> Faire un don",
        favoritesBaseList: "Favoris",
        shareList: "Partager la liste",
        editList: "Modifier la liste",
        addList: "Ajouter une liste...",
        createListManually: "Créer manuellement...",
        insertListURL: "Insérer une URL...",
        selectAdditionalLists: "Sélectionner une ou plusieurs listes supplémentaires",
        baseList: "Liste de base",
        additionalLists: "Listes supplémentaires",
        howDoesMyListWork: "Comment fonctionne My List ?",
        myListExplanation: "My List vous permet de personnaliser la liste des chaînes de Zappr. Choisissez une liste de base, qui servira de source principale de chaînes, et enrichissez-la avec autant de listes supplémentaires que vous le souhaitez. Les chaînes des listes supplémentaires seront intégrées à celles de la liste de base.",
        addChannel: "Ajouter une chaîne...",
        listEditorInfo: "Infos",
        listEditorChannels: "Chaînes",
        disabledRegionSettings: "Ces paramètres ne sont disponibles qu'avec la liste de base officielle de Zappr (ou la liste des favoris).",
        multipleChannelSelectionText: (matchedChannel) => `<b>Appuyez sur ${matchedChannel.map((channel, index) => `${index + 1} pour ${channel.name}`).join(",<br>")}<br>ou sur Échap pour annuler</b>`,
        popupReopenPlayer: "Rouvrir le lecteur",
        popupAccessDeniedTitle: "Accès aux popups refusé",
        popupAccessDeniedText: (channel) => `Votre navigateur n'a pas autorisé Zappr à ouvrir une fenêtre popup pour regarder <b>${name}</b>. Pour regarder cette chaîne, vous devez autoriser Zappr à ouvrir des fenêtres popup, ou ouvrir la fenêtre sous forme de nouvel onglet et regarder la chaîne à cet endroit.`,
        openInNewWindow: "Ouvrir dans un nouvel onglet",
        closeModal: "Fermer",
        couldntFetchSchema: "Attention : Zappr n'a pas pu vérifier la conformité de la liste sélectionnée avec le schéma de liste de chaînes. Par conséquent, par votre sécurité, nous avons réactivé la liste de chaînes par défaut.",
        notSchemaCompliantOnLoading: (errors) => `Attention : Le format de la liste de base de chaînes que vous avez sélectionnée n'est pas valide. Par conséquent, par votre sécurité, nous avons réactivé la liste de chaînes par défaut.\n\nErreurs :\n${errors}`,
        couldntFetchSchemaAdditionalList: (list) => `Attention : Zappr n'a pas pu vérifier la conformité d'une de vos listes supplémentaires sélectionnées avec le schéma de liste de chaînes. Par conséquent, par votre sécurité, nous l'avons désactivée.\n\nListe : ${list}`,
        notSchemaCompliantAdditionalList: (list, errors) => `Attention : Le format d'une de vos listes de chaînes supplémentaires sélectionnées n'est pas valide. Par conséquent, nous l'avons désactivée.\n\nListe : ${list}\nErreurs :\n${errors}`,
        couldntFetchChannelList: "Impossible de récupérer la liste des chaînes",
        alreadyAddedRemoteList: "Vous avez déjà une liste avec cette URL",
        listFormatInvalid: "Format de liste invalide",
        nightAdultChannelModalText: "Pendant cette plage horaire (23h00 - 07h00), cette chaîne pourrait diffuser des contenus interdits aux moins de 18 ans.",
        fullyAdultChannelModalText: "Cette chaîne diffuse des contenus interdits aux moins de 18 ans.",
        adultChannelModalText: "En cliquant sur <b>Continuer</b> ci-dessous, vous confirmez avoir conscience de la nature du contenu diffusé et avoir l'âge légal requis pour le visionner. En outre, vous acceptez d'assumer l'entière responsabilité du visionnage de cette chaîne, dégageant Zappr et ses affiliés de toute responsabilité découlant d'un usage inapproprié ou non autorisé.<br><br><b>Souhaitez-vous continuer ?</b>",
        untitledList: "Liste sans titre",
        deleteList: "Supprimer la liste",
        favoritesListEmpty: "La liste des favoris est vide ! Ajoutez des chaînes à vos favoris en cliquant sur l'icône du crayon.",
        deleteListConfirmation: "Êtes-vous sûr de vouloir supprimer cette liste ?",
        deleteChannelConfirmation: "Êtes-vous sûr de vouloir supprimer cette chaîne ?",
        listNameInputLabel: "&nbsp;&nbsp;Nom",
        listNameInput: "Nom de la liste",
        listIconInputLabel: "Icône",
        listIconInput: "URL d'une image PNG/SVG",
        listEPGInputLabel: "&nbsp;&nbsp;EPG",
        listEPGInput: "URL du fichier JSON de l'EPG",
        channel: "Chaîne",
        clickChannelToFavorite: "Cliquez sur une chaîne pour l'ajouter aux favoris",
        invalidURL: "URL invalide.",
        localList: "Liste locale",
        saveChannel: "Enregistrer la chaîne",
        useEmoji: "Emoji",
        listURLCopied: `L'URL de la liste a été copiée avec succès !\nPour l'importer ailleurs, cliquez sur l'icône My List, puis sur « Ajouter une liste... », et dans le champ « Insérer une URL... », collez l'URL qui vient d'être copiée dans votre presse-papiers.\nVous pouvez importer cette liste soit comme liste de base, soit comme liste supplémentaire.`,
        myListTemporaryPromoTooltipTitle: "Essayez <i>My List</i>, la nouvelle fonctionnalité de Zappr",
        myListTemporaryPromoTooltipText: `<span>Personnalisez la liste des chaînes à votre convenance.</span>
        <span>Composez la liste de vos chaînes préférées, ou créez de nouvelles listes avec les chaînes de votre choix. Tout comme dans un client IPTV.</span>`,
        additionalChannelFavoritingDisabled: "Vous ne pouvez ajouter aux favoris que des chaînes de la liste de base officielle de Zappr.",
        selectFavoritesFromOfficialBaseList: "Sélectionnez vos chaînes préférées dans la liste officielle de Zappr",
        disabledClearkeyiOS: "Cette chaîne n'est pas visible sur iOS car elle ne prend pas en charge le DRM ClearKey.",
        channelEditorSchema: {
            _groups: {
                "basic-channel-info": "Infos chaîne",
                "stream-info": "Infos flux"
            },
            lcn: ["LCN"],
            logo: ["Logo", "URL d'une image PNG/SVG"],
            name: ["Nom", "Nom de la chaîne"],
            subtitle: ["Sous-titre", "Sous-titre de la chaîne"],
            hd: ["HD"],
            uhd: ["4K"],
            radio: ["Chaîne radio ?", {
                true: "Chaîne radio sans piste vidéo",
                video: "Chaîne radio avec piste vidéo statique"
            }],
            ondemand: ["Vidéo à la demande"],
            type: ["Type", {
                hls: "HLS (.m3u8)",
                dash: "DASH (.mpd)",
                twitch: "Twitch (username de la chaîne)",
                youtube: "YouTube (ID chaîne/vidéo)",
                iframe: "IFrame/embed (URL)",
                audio: "Audio",
                direct: "Direct (.mp4, .mkv, etc.)",
                popup: "Fenêtre popup (URL)"
            }],
            url: ["URL", "URL du flux"],
            http: ["Visible\nuniquement\nvia HTTP ?"],
            license: ["Licence", {
                "xdevel-wms": "Xdevel WMS Auth Sign",
                clearkey: "ClearKey",
                widevine: "Widevine (URL de licence)"
            }],
            licensedetails: ["Détails de licence", "Chaîne de caractères ou JSON"],
            hbbtvapp: ["App HbbTV ?"],
            api: ["API", {
                vercel: "API Vercel",
                cloudflare: "API Cloudflare"
            }],
            cssfix: ["Correctif CSS", {
                "streamshow-embed": "Embed StreamShow (embed.streamshow.net)",
                stretch: "Étirer de 4:3 à 16:9",
                "squashed-height": "Étirer de 64:27 à 16:9",
                "very-squashed-height": "Étirer de 32:9 à 16:9",
                "five-two-squashed-height": "Étirer de 5:2 à 16:9",
                "center-iframe": "Centrer l'IFrame/embed",
                "servizistreaming-embed": "Embed de ServiziStreaming.it",
                "livetvuk-embed": "Embed de LiveTVUK.com",
                "native-hls-720p-iframe": "Agrandir la vidéo 720p dans un IFrame/embed en plein format",
                letterbox: "Flux en letterbox"
            }],
            "epg.source": ["Source EPG", "ID de la source EPG"],
            "epg.id": ["ID EPG", "ID de la chaîne dans la source EPG"],
            timeshift: ["Heures de timeshift"]
        }
    }
}