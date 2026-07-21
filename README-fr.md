<div align="center">
    <a href="README.md">Italiano</a> | <a href="README-en.md">English</a> | <b>Français</b>
</div>
<div align="center"><b>Ceci est le dépôt du frontend de Zappr. Pour les listes de chaînes et les logos, consultez <a href="https://github.com/ZapprTV/channels">ZapprTV/channels</a>.</b></div>
<br><br>
<div align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="readme-assets/logo-dark.svg" />
        <source media="(prefers-color-scheme: light)" srcset="readme-assets/logo-light.svg" />
        <img alt="Zappr" src="readme-assets/logo-light.svg" width="50%" />
    </picture>
    <br>
    <b><i>Regardez facilement la TNT, nationale et locale.</i></b>
</div>
<br>
<video src="https://github.com/user-attachments/assets/4b3f3346-2d0a-4d5c-8ca8-8c5fa108715d"></video>
<h1 align="center">🎉 Essayez-le tout de suite sur <a href="https://zappr.stream">zappr.stream</a> ! 🎉</h1>

### _[Aller directement aux informations sur le développement](#informations-sur-le-developpement-local)_

Avec Zappr, vous pouvez facilement regarder la TNT, nationale et de votre région, gratuitement et sans aucune configuration ! Plus besoin de chercher des listes et des clients IPTV jusqu'à en trouver un qui fonctionne *plus ou moins* bien - désormais, regarder la télévision en streaming est **facile** !

- 🗃 **Tout est bien organisé** - Toutes les chaînes ont la même numérotation que sur la TNT, elles sont toutes dans l'ordre et chacune possède son propre logo à côté.
- 📍 **Pas seulement les chaînes nationales** - Zappr vous permet de voir les chaînes de votre région en un clic : il suffit de sélectionner votre région dans les paramètres et les chaînes locales _(y compris ta version locale de France 3 !)_ seront ajoutées à la liste.
- 📲 **Et pas seulement les chaînes les plus connues !** - Si une chaîne TV dispose d'un streaming et est visible via la TNT, elle est sur Zappr. On n'y trouve pas seulement les chaînes principales ou les plus regardées - sur Zappr, il y a tout.
- 🌐 **Pas seulement les types de streaming habituels** - Puisque Zappr est une web app et ne repose pas sur un lecteur multimédia traditionnel, on peut aussi y voir certaines chaînes non visibles sur la plupart des clients IPTV, comme celles protégées par DRM, celles diffusées sur Twitch, YouTube, etc.
- ⚡️ **De plus, tout est rapide...** - Zappr charge les chaînes bien plus vite que de nombreux clients IPTV, et propose une navigation réactive et fluide. Pas besoin d'utiliser la souris pour zapper : vous pouvez utiliser les touches `PageDown` et `PageUp` pour avancer ou reculer d'une chaîne, ou bien saisir le numéro d'une chaîne puis appuyer sur `Entrée` pour y accéder rapidement.
- 🧑‍💻️ **...et facile à étendre !** - 100% du code de Zappr est open source, et y contribuer est facile, notamment en ce qui concerne les listes de chaînes : elles sont toutes au format JSON et documentées par un schéma JSON.

Si vous voulez utiliser Zappr tout de suite, il est déjà prêt à l'emploi sur [zappr.stream](https://zappr.stream). Si vous voulez plutôt travailler dessus...

# Informations sur le développement local
## Préparer l'environnement de développement
1. Clonez le dépôt : `git clone https://github.com/ZapprTV/Zappr`
2. Installez les dépendances : `npm install` (ou `pnpm install`)
3. Modifiez le fichier `public/config.json` si nécessaire

Le fichier `public/config.json` est le fichier où, en plus des URL des API, se trouvent aussi les URL des listes de chaînes et des logos. Par défaut, ce sont celles hébergées par Zappr (`channels.zappr.stream`), mais si vous devez utiliser une copie locale, clonez le dépôt correspondant :

`git clone https://github.com/ZapprTV/channels`

Puis modifiez `public/config.json` pour qu'il pointe vers votre version locale :
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

## Étapes suivantes
Si vous voulez simplement démarrer un serveur local pour des tests, exécutez `npm run dev` (ou `pnpm run dev`).

Si vous voulez plutôt effectuer un build, qui sera ensuite placé dans le dossier `dist/`, exécutez `npm run build` (ou `pnpm run build`).
- Le build utilisera la même configuration que celle spécifiée dans `config.json`, et par défaut n'inclura que les fichiers du frontend dans le dossier du build. Si vous voulez aussi inclure les fichiers des listes de chaînes et des logos, ajoutez l'argument en ligne de commande `--bundleChannels`.
    - Par défaut, `--bundleChannels` télécharge les listes de chaînes et les logos depuis `https://github.com/ZapprTV/channels`, mais si vous voulez qu'il les télécharge depuis un autre dépôt Git ou qu'il les copie depuis un dossier local, indiquez le nom du dossier / l'URL du dépôt Git **(se terminant par .git)** dans l'argument `--channelsURL`.
        - Par exemple, `--channelsURL=Chaines` copiera le dossier local `Chaines` et l'insérera dans le build, tandis que `--channelsURL=https://github.com/Utilisateur123/Chaines.git` clonera le dépôt GitHub `Utilisateur123/Chaines` et l'insérera dans le build.
    - **IMPORTANT** : Pour spécifier des arguments en ligne de commande avec NPM, il faut écrire `--` avant les différents arguments.
        - Ainsi, par exemple, au lieu d'écrire `npm run build --bundleChannels`, il faut écrire `npm run build -- --bundleChannels`.
        - **Ce problème ne se pose pas avec PNPM.** Si vous utilisez PNPM, il est également possible d'écrire, par exemple, `pnpm run build --bundleChannels`.