<h2 align="center">ATTENZIONE: ZAPPR È ANCORA IN BETA.</h2>
<div align="center"><b>Inoltre, questa è la repo del frontend di Zappr. Per le liste dei canali e i loghi vedere <a href="https://github.com/ZapprTV/channels">ZapprTV/channels</a>.</b></div>
<br><br>
<div align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="readme-assets/logo-dark.svg" />
        <source media="(prefers-color-scheme: light)" srcset="readme-assets/logo-light.svg" />
        <img alt="Zappr" src="readme-assets/logo-light.svg" width="50%" />
    </picture>
    <br>
    <b><i>Guarda facilmente il digitale terrestre italiano, nazionale e locale.</i></b>
</div>
<br>
<img width="100%" src="readme-assets/demo.gif">
<h1 align="center">🎉 Provalo subito su <a href="https://zappr.stream">zappr.stream</a>! 🎉</h1>

### _[Salta alle informazioni sullo sviluppo](#informazioni-sullo-sviluppo-locale)_

Con Zappr, puoi vedere facilmente il digitale terrestre, nazionale e della tua regione, gratuitamente e senza dover configurare niente! Non serve più andare a rintracciare liste e client IPTV fino a trovare qualcosa che funziona *abbastanza* bene - adesso guardare la TV in streaming è **facile**!

- 🗃 **Tutto ben organizzato** - Tutti i canali hanno la stessa numerazione che hanno sul digitale terrestre, sono tutti in ordine e hanno il proprio logo vicino.
- 📍 **Non solo canali nazionali** - Zappr ti permette di vedere i canali della tua regione con un click: basta selezionare la tua regione nelle impostazioni e i canali locali _(compresa la tua versione regionale di Rai 3!)_ verranno aggiunti all'elenco.
- 📲 **E neanche solo i canali più famosi!** - Se un canale TV ha uno streaming ed è visibile tramite il digitale terrestre, è su Zappr. Non sono presenti solo i canali principali o i più guardati - su Zappr c'è tutto. Anche i canali visibili solo tramite HbbTV.
- 📻 **Non solo TV, ma anche radio** - Su Zappr puoi anche ascoltare le varie radio presenti sul digitale terrestre. 
- ⏪ **Non solo in diretta** - Puoi mettere in pausa tutti i canali, e la maggior parte dei canali ti permette anche di andare avanti e indietro. Inoltre, puoi guardare dei contenuti on-demand - RaiPlay e RaiPlay Sound sono direttamente integrati all'interno di Zappr, rispettivamente ai canali `201` e `203`.
- 🌐 **Non solo i soliti tipi di streaming** - Visto che Zappr è una web app e non si basa su un media player tradizionale, sono visibili anche alcuni canali non visibili sulla maggior parte dei client IPTV, come quelli protetti da DRM, quelli trasmessi su Twitch, YouTube, ecc.
- ⚡️ **Inoltre, è tutto veloce...** - Zappr carica i canali molto più velocemente che su molti client IPTV, e ha una navigazione reattiva e scattante. Non serve neanche usare il mouse per fare zapping: puoi usare i tasti `PageDown` e `PageUp` per andare avanti o indietro di un canale, oppure puoi scrivere la numerazione di un canale e poi premere `Invio` per raggiungerlo rapidamente.
- 🧑‍💻️ **...e facile da estendere!** - Il 100% del codice di Zappr è open source, e contribuire è facile, soprattutto per quanto riguarda le liste dei canali: sono tutte in formato JSON e documentate da un JSON Schema.

Se vuoi usare subito Zappr, è già pronto all'uso su [zappr.stream](https://zappr.stream). Se invece vuoi lavorarci sopra...

# Informazioni sullo sviluppo locale
## Prepara l'ambiente di sviluppo
1. Clona la repo: `git clone https://github.com/ZapprTV/Zappr`
2. Installa le dipendenze: `npm install` (o `pnpm install`)
3. Modifica il file `config.json` se necessario

Il file `config.json` è il file dove, oltre agli URL delle API, sono anche presenti gli URL delle liste dei canali e ai loghi. Di default sono presenti quelli hostati da Zappr (`channels.zappr.stream`), ma se ti serve utilizzare una copia locale, clona la repo relativa:

`git clone https://github.com/ZapprTV/channels`

E poi modifica `config.json` per farlo puntare alla tua versione locale:
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

## Passaggi successivi
Se vuoi solo avviare un server locale per motivi di test, esegui `npm run dev` (o `pnpm run dev`).

Se invece vuoi eseguire una build, che verrà poi posizionata nella cartella `dist/`, esegui `npm run build` (o `pnpm run build`).
- La build userà la stessa configurazione che hai specificato in `config.json`, e di default includerà solo i file del frontend nella cartella della build. Se vuoi includere anche i file delle liste dei canali e dei loghi, aggiungi l'argomento da riga di comando `--bundleChannels`.
    - `--bundleChannels` di default scarica le liste dei canali e i loghi da `https://github.com/ZapprTV/channels`, ma se vuoi che le scarichi da un'altra repo Git oppure che le copi da una cartella locale, specifica il nome della cartella / l'URL della repo Git **(con .git alla fine)** nell'argomento `--channelsURL`.
        - Per esempio, `--channelsURL=Canali` copierà la cartella locale `Canali` e la inserirà nella build, mentre `--channelsURL=https://github.com/Utente123/Canali.git` clonerà la repo GitHub `Utente123/Canali` e la inserirà nella build.
    - **IMPORTANTE**: Per specificare gli argomenti da riga di comando con NPM bisogna scrivere `--` prima dei vari argomenti.
        - Quindi, per esempio, invece di scrivere `npm run build --bundleChannels` serve scrivere `npm run build -- --bundleChannels`.
        - **Questo problema non si presenta con PNPM.** Se stai usando PNPM va bene anche, per esempio, `pnpm run build --bundleChannels`.