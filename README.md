# Voix — application de vote pour Netlify

Application complète : page publique responsive, formulaire libre nom/prénom, résultats en barres, administration protégée. Aucun vote fictif n’est inclus.

## 1. Déployer (méthode recommandée, sans installer Node sur votre poste)

1. Décompressez le ZIP.
2. Créez un dépôt GitHub privé, puis utilisez **Add file → Upload files** pour envoyer le CONTENU du dossier `vote-netlify` à la racine du dépôt. Conservez les dossiers `public`, `lib`, `scripts`, `netlify` et le fichier `netlify.toml`. N’envoyez pas le ZIP lui-même.
3. Dans Netlify, créez un projet en important ce dépôt.
4. Laissez Netlify lire `netlify.toml` : commande `npm run build`, dossier publié `public`, fonctions `netlify/functions`, Node 22.
5. Déployez. La page publique fonctionne même avant la configuration de l’administration.
6. Configurez les deux variables ci-dessous dans les variables d’environnement du projet Netlify, disponibles pour les **Functions**. Relancez ensuite un déploiement.
7. Ouvrez `/admin.html`, connectez-vous et remplacez les textes provisoires.

**Un simple glisser-déposer du ZIP ou du dossier public dans Netlify Drop n’installe pas les fonctions serveur.** Le stockage des votes exige les fonctions incluses.

Autre possibilité, sur un ordinateur disposant de Node 22.12 ou supérieur et de Netlify CLI : `npm ci`, `netlify login`, `netlify init`, puis `netlify deploy --build --prod`. Sélectionnez le bon projet et configurez les secrets avant la mise en service.

## 2. Configurer le mot de passe

Le ZIP ne contient aucun mot de passe de production.

Le petit générateur fourni fonctionne aussi avec Node 16.14, sans dépendance ni installation :

```sh
node scripts/hash-password.mjs
```

Saisissez un mot de passe long (12 caractères minimum ; sa saisie est visible dans le terminal). Le script produit :

- `ADMIN_PASSWORD_HASH` : empreinte scrypt du mot de passe ; copiez toute la valeur, y compris `scrypt:`.
- `SESSION_SECRET` : secret aléatoire qui signe les sessions ; copiez toute la valeur.

Ajoutez ces variables dans Netlify, uniquement côté serveur, puis redéployez. Ne placez jamais le mot de passe ni ces valeurs dans les fichiers publics ou le dépôt. Modifier SESSION_SECRET invalide les sessions existantes. Modifier le hash seul ne ferme pas les sessions déjà ouvertes : changez également SESSION_SECRET en cas de révocation.

## 3. Utilisation

- Chaque navigateur reçoit un identifiant aléatoire dans un cookie HttpOnly. Le serveur en conserve une empreinte pour bloquer un second vote. Le navigateur mémorise également qu’il a voté en localStorage.
- Un nom et un prénom sont exigés ; aucun renseignement sur le votant n’est demandé.
- Casse, accents, apostrophes, tirets et espaces sont normalisés pour regrouper une même réponse. Exemple : « Élise Martin » et « elise martin » partagent une barre.
- Les variantes proches sont proposées au votant, qui confirme une réponse existante ou conserve son nouveau nom. Aucune fusion automatique des noms proches.
- Le formulaire demande confirmation avant le vote définitif. Une fois enregistré, le vote n’est pas modifiable.
- Les pourcentages sont calculés sur le total des votes conservés, avec une décimale. Leur somme affichée peut légèrement différer de 100 % à cause des arrondis.
- Les résultats se rafraîchissent toutes les 20 secondes lorsque la page est visible et le formulaire fermé. Un bouton permet l’actualisation manuelle.

## 4. Administration

- Modifier le sujet, le texte de présentation et le libellé du bouton.
- Clôturer le vote ; les résultats restent visibles. Décocher permet de le rouvrir.
- Supprimer une réponse et tous ses votes, après confirmation. Les votants concernés restent bloqués pour cette consultation.
- Remettre à zéro toutes les réponses et tous les votes. Les textes et le statut ouvert/clôturé sont conservés ; tous les navigateurs peuvent voter à nouveau si le vote est ouvert.
- Les changements concurrents sont refusés : si un vote survient entre le chargement de l’administration et l’enregistrement, actualisez les données et recommencez. Les champs non enregistrés sont alors abandonnés.
- Session administrateur de 8 heures ; 10 tentatives de connexion maximum par adresse IP sur 15 minutes (y compris les connexions réussies). Les réseaux partagés partagent cette limite.

## 5. Architecture et limites

Frontend statique HTML/CSS/JavaScript sans framework. Fonction Netlify `api.mjs`. Stockage dans un **site-wide store Netlify Blobs** nommé `voix-v1`, avec lecture forte et écritures conditionnelles ETag pour éviter les pertes de votes concurrents. Les votes restent présents lors des nouveaux déploiements sur le même projet.

Cette application convient à une consultation simple de volume modéré. Elle n’est pas un scrutin officiel : le contrôle par navigateur est contournable en effaçant les données du site, en navigation privée ou en changeant de navigateur. Il ne bloque pas les robots. Les noms saisis deviennent immédiatement publics, sans modération préalable. Le formulaire affiche cette publication par son contexte et sa confirmation.

Le stockage utilise un document unique, donc la contention augmente avec le trafic. Après plusieurs conflits simultanés, le serveur demande de réessayer. Pour une très forte affluence, prévoir une base transactionnelle et une protection anti-abus adaptées.

Aucun outil publicitaire ou de mesure d’audience n’est intégré. L’hébergement peut produire ses propres journaux techniques. À la clôture, les résultats et empreintes navigateur restent conservés jusqu’à la remise à zéro. Prévoyez votre information des utilisateurs et votre durée de conservation selon le contexte de votre consultation.

## 6. Vérifier / prévisualiser

Avec Node 22.12 ou supérieur :

```sh
npm ci
npm test
npm run build
npm run dev
```

L’aperçu local est sur http://localhost:8888. Ses données sont EN MÉMOIRE : elles disparaissent à l’arrêt, et ne sont pas les données Netlify. Pour activer uniquement une administration de démonstration locale :

```sh
npm run dev -- --demo
```

Mot de passe de démonstration : `Demo-local-2026`. Ce mode n’est jamais utilisé par les fonctions de production.

La vérification visuelle automatisée en navigateur n’a pas pu être exécutée dans l’environnement de réalisation (téléchargement de Chromium indisponible). Le rendu responsive doit donc être vérifié sur votre navigateur avant ouverture.

Les tests automatisés couvrent les doublons, votes concurrents, noms proches, validation, contrôle d’origine, administration, clôture, suppression, remise à zéro et limitation des connexions. Le stockage Netlify réel reste à vérifier après déploiement : votez depuis deux navigateurs, contrôlez les résultats, connectez-vous à l’administration et remettez à zéro avant l’ouverture publique.

## Références techniques

- Netlify Blobs : https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- Fonctions Netlify : https://docs.netlify.com/build/functions/overview/
