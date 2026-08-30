# Architecture du pipeline CI/CD — cours

> Document vivant : à mettre à jour dans le même commit que tout changement de workflow.
> Repo : `prenom-nom/ci-cd-kube`. Compte GitHub masqué en `prenom-nom` dans ce document ; le code réel (YAML, secrets, IDs) utilise les vraies valeurs, seule la doc est anonymisée.

## Sommaire

1. [Pourquoi un pipeline et pas un script](#1-pourquoi-un-pipeline-et-pas-un-script)
2. [Déclenchement et concurrency](#2-déclenchement-et-concurrency)
3. [Stage 1 — Validate & Security](#3-stage-1--validate--security)
   - 3.1 [SCA : audit des dépendances](#31-sca--audit-des-dépendances)
   - 3.2 [Détection de secrets (gitleaks)](#32-détection-de-secrets-gitleaks)
   - 3.3 [`install` — checkout et environnement](#33-install--checkout-et-environnement)
   - 3.4 [`install` — qualité statique](#34-install--qualité-statique)
   - 3.5 [`install` — orchestration intelligente des tests unitaires](#35-install--orchestration-intelligente-des-tests-unitaires)
   - 3.6 [`install` — build et artefact](#36-install--build-et-artefact)
4. [Stage 2 — Test (E2E)](#4-stage-2--test-e2e)
   - 4.1 [`component-tests` — tests de composants](#41-component-tests--tests-de-composants-complémentaires-aux-4-jobs-e2e)
5. [Stage 3 — Report](#5-stage-3--report)
6. [Ce qui reste à construire](#6-ce-qui-reste-à-construire)

Chaque section suit la même grille de lecture :

| Rubrique | Ce qu'elle répond |
|---|---|
| **Extrait annoté** | le YAML réellement présent dans [main.yml](../.github/workflows/main.yml) |
| **Vocabulaire** | chaque clé/valeur utilisée et son rôle exact |
| **Pourquoi ce choix** | le problème concret que ça résout |
| **Règle d'or invoquée** | le principe (invariants CI/CD, DevSecOps) dont ça découle |
| **Ce que ça optimise** | la métrique ou le paradigme DevSecOps servi |

---

## 1. Pourquoi un pipeline et pas un script

Un script Bash lancé "à la main" ou en cron reste un artefact **artisanal** : environnement local mouvant, secrets en variables locales, aucune trace persistante en cas de plantage. Un pipeline CI/CD est un **système d'exécution gouverné** : environnement isolé et déclaratif, secrets injectés de façon périmétrée, traçabilité complète (logs, artefacts, audits), déclenché par des événements Git plutôt qu'à la main.

**Règle d'or invoquée** : distinction Script (artisanal) vs Pipeline (industriel) — c'est le fil conducteur de tout ce document. Chaque choix ci-dessous est un pas de plus vers la colonne de droite de ce tableau.

---

## 2. Déclenchement et concurrency

**Extrait annoté**

```yaml
on:
  push:
    branches-ignore:
      - "renovate/**"

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Vocabulaire**

| Clé | Valeur | Rôle |
|---|---|---|
| `on.push` | — | le pipeline se déclenche sur un événement Git (`push`), pas sur une tâche planifiée : c'est le critère "Événements Git" de la colonne "Pipeline" plutôt que "cron" de la colonne "Script". |
| `branches-ignore` | `renovate/**` | exclut les branches créées automatiquement par le bot de mise à jour de dépendances — elles seront testées au moment de leur PR, pas besoin de dupliquer le run à chaque commit du bot. |
| `concurrency.group` | `${{ github.workflow }}-${{ github.ref }}` | un identifiant unique par (workflow, branche). Deux pushs sur la **même** branche partagent le même groupe ; deux branches différentes ont chacune le leur. |
| `concurrency.cancel-in-progress` | `true` | quand un nouveau run démarre dans un groupe où un run est déjà actif, l'ancien est annulé automatiquement. |

**Pourquoi ce choix**

Sans `concurrency`, pousser 3 commits rapprochés sur une branche fait tourner 3 pipelines complets en parallèle, dont 2 deviennent obsolètes avant même de finir (leurs résultats ne comptent plus, seul le dernier commit importe). Ça consomme des minutes GitHub Actions et des slots de parallélisation Cypress Cloud pour rien.

**Règle d'or invoquée**

Le "Fail Fast" du document invariants ("on ne build pas une image si les tests échouent, pour optimiser coûts et temps de calcul") s'applique aussi *entre* les runs, pas seulement *entre* les stages d'un même run.

**Ce que ça optimise**

Réduction du **travail imprévu** (ici : du calcul redondant) — la fiche DevSecOps rappelle que les équipes de haute performance passent 21 % de leur temps sur du travail imprévu contre 27 % pour les autres ; chaque run redondant évité va dans ce sens. Indirectement, ça libère aussi de la capacité de calcul pour réduire le *Change Lead Time* des commits qui, eux, comptent.

---

## 3. Stage 1 — Validate & Security

Trois jobs — `sca`, `secrets-scan`, `install` — sans dépendance entre eux : ils démarrent **en parallèle** dès le déclenchement du workflow (DAG, pas de mode séquentiel par stage). Le Stage 2 (E2E) attendra les trois avant de démarrer — voir §4.

### 3.1 SCA : audit des dépendances

**Extrait annoté**

```yaml
sca:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: yarn
    - run: yarn install --frozen-lockfile
    - run: yarn audit-ci --config .audit-ci.jsonc
```

```jsonc
// .audit-ci.jsonc
{
  "skip-dev": true,
  "high": true,
  "package-manager": "yarn",
  "allowlist": [
    "GHSA-28wg-ghj8-5hjv", // nanoid: ...
    // … 26 entrées au total, une par CVE acceptée en baseline
  ]
}
```

**Vocabulaire**

| Clé | Valeur | Rôle |
|---|---|---|
| `actions/setup-node` | `node-version: 22`, `cache: yarn` | installe Node et active le **cache** (best effort) du dossier `~/.cache/yarn` entre les runs, à partir du hash de `yarn.lock` — accélère sans jamais faire échouer le job si le cache est absent (contrairement à un artefact, voir §3.6). |
| `yarn install --frozen-lockfile` | — | installe exactement les versions figées dans `yarn.lock`, échoue si le lockfile devrait changer — c'est l'invariant de **Reproductibilité** ("même entrée, même sortie") appliqué à l'installation. |
| `audit-ci` | outil (devDependency, épinglé en version exacte `7.1.0`) | wrapper autour de `yarn audit` qui transforme un rapport en **gate** configurable (seuil de sévérité + liste d'exceptions), plutôt que d'interpréter à la main le code de sortie bitmaské de `yarn audit`. |
| `skip-dev` | `true` | n'audite que les dépendances de **production** (`dependencies`, pas `devDependencies`) — c'est ce qui s'exécute réellement en usage, le risque prioritaire pour du SCA. |
| `high` | `true` | fait échouer le job sur toute vulnérabilité **high ou critical** non listée dans `allowlist`. Moderate/low restent visibles dans le rapport mais ne bloquent pas. |
| `allowlist` | 26 identifiants `GHSA-…` | baseline de vulnérabilités **déjà connues et acceptées** (voir §3.1 bis ci-dessous) — tout ce qui n'y figure pas et dépasse le seuil fait échouer le job. |

**Pourquoi ce choix**

Un `yarn audit --groups dependencies` sur ce fork remonte 138 vulnérabilités (18 low, 58 moderate, 53 high, 9 critical en occurrences ; 26 avisories GHSA uniques high/critical), toutes héritées de l'arbre de dépendances de l'upstream `cypress-realworld-app`. Un gate naïf ("bloque sur toute faille critique") aurait rendu le pipeline rouge dès le premier commit — un signal qui devient du bruit n'alerte plus personne. La baseline dans `.audit-ci.jsonc` fige la dette connue et documentée (ticket de suivi dédié, label `source:security`) ; le gate ne réagit qu'à une **régression** — une dépendance mise à jour qui introduit une *nouvelle* faille non encore vue.

**Règle d'or invoquée**

- Fiche DevSecOps, §2.1 : "configure tes outils pour bloquer automatiquement tout déploiement si une faille critique est détectée" — appliqué ici avec une nuance nécessaire pour un projet qui hérite d'une dette existante.
- **Loi de Goodhart** (doc invariants, §7) : un gate qui échoue tout le temps cesse d'être une bonne mesure. La baseline garde le gate *actionnable*.
- Reproductibilité (`--frozen-lockfile`) : jamais d'installation "à la volée" qui dérive du lockfile committé.

**Ce que ça optimise**

*Change Fail Rate* et sécurité de la chaîne d'approvisionnement (Supply Chain) : une dépendance qui introduit une CVE high/critical ne peut plus atteindre `develop` sans passer par une décision explicite (mise à jour du code, ou ajout documenté et tracé à l'allowlist). Réduction du **travail imprévu** : la dette est visible et suivie dans un ticket dédié, plutôt que découverte au hasard plus tard.

### 3.2 Détection de secrets (gitleaks)

**Extrait annoté**

```yaml
secrets-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: gitleaks/gitleaks-action@v2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Vocabulaire**

| Clé | Valeur | Rôle |
|---|---|---|
| `fetch-depth: 0` | — | gitleaks scanne l'**historique complet**, pas seulement le dernier commit — un secret poussé puis "supprimé" dans un commit suivant reste visible dans l'historique Git et doit être détecté (et révoqué, la suppression du commit ne suffit jamais). |
| `gitleaks/gitleaks-action@v2` | — | Action officielle du projet open source `gitleaks` : détecte les motifs de secrets (clés API, tokens, credentials) via des règles regex maintenues par la communauté. Gratuite sans compte pour un dépôt personnel (licence requise uniquement pour les dépôts d'organisation). |
| `GITHUB_TOKEN` | `secrets.GITHUB_TOKEN` | permet à l'action d'annoter le run (statut, résumé) — c'est le token éphémère par défaut du job, pas un secret dédié à créer. |

**Pourquoi ce choix**

Un secret commité (clé AWS, mot de passe base de données) est, selon la fiche DevSecOps, "rien de plus dangereux" — une fois poussé, il doit être considéré compromis même après suppression du commit, tant que l'historique existe. Un scan automatique à chaque push est la seule façon fiable de le détecter avant qu'un humain ne le remarque (ou pire, avant qu'un attaquant ne le trouve).

**Règle d'or invoquée**

Fiche DevSecOps, §2.2 et §4 (Étape 3, "Hygiène des Secrets") : gitleaks y est cité nommément, recommandé en pre-commit *et* en CI — ici on couvre le filet CI, complémentaire d'un hook local que chaque développeur peut ajouter individuellement.

**Ce que ça optimise**

Réduction directe du risque de *Supply Chain Attack* et de fuite de credentials — un secret qui fuite peut compromettre bien plus que ce seul repo (accès prod, comptes tiers). Contribue aussi à l'Observabilité : le job échoue avec un message clair désignant le fichier et la ligne, pas un diagnostic à reconstituer après coup.

### 3.3 `install` — checkout et environnement

**Extrait annoté**

```yaml
install:
  runs-on: ubuntu-latest
  container:
    image: cypress/browsers:22.20.0
    options: --user 1001
  steps:
    - name: Checkout
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
```

**Vocabulaire**

| Clé | Valeur | Rôle |
|---|---|---|
| `runs-on` | `ubuntu-latest` | le **runner** — une machine hébergée (SaaS) fournie par GitHub, provisionnée puis détruite pour ce job uniquement. |
| `container.image` | `cypress/browsers:22.20.0` | le job ne s'exécute pas directement sur le runner mais **dans un conteneur** de cette image (Node + navigateurs préinstallés) — c'est le "Provisionnement de l'environnement" de l'étape Préparation du cycle de vie d'un job. |
| `fetch-depth` | `0` | par défaut `actions/checkout` ne récupère que le dernier commit (`depth: 1`). `0` récupère l'historique complet de toutes les branches — nécessaire plus bas pour que `vitest --changed` puisse comparer avec `origin/develop`. |

**Pourquoi ce choix**

Le runner et le conteneur sont **éphémères** : détruits à la fin du job, aucune trace d'un run ne pollue le suivant. `fetch-depth: 0` a un coût (plus de données à cloner) directement au service d'une fonctionnalité qu'on utilise plus loin — ce n'est jamais gratuit, à ne pas généraliser sans raison.

**Règle d'or invoquée**

Runners éphémères = "standard de l'industrie" contre les attaques de type *poisoned cache* et les fuites de données entre projets (doc invariants, §4) : chaque exécution repart d'une page blanche logicielle.

**Ce que ça optimise**

Sécurité de la chaîne d'approvisionnement (*Supply Chain*) : un job compromis ne peut pas laisser de résidu (secret, artefact malveillant) pour le job suivant, même sur le même runner physique réutilisé par GitHub.

### 3.4 `install` — qualité statique

**Extrait annoté**

```yaml
    - name: Cypress install
      uses: cypress-io/github-action@v6
      with:
        runTests: false
    - run: yarn types
    - run: yarn lint
```

**Vocabulaire**

| Clé | Valeur | Rôle |
|---|---|---|
| `uses` vs `run` | — | `uses` exécute une **Action** réutilisable (package versionné, ici `cypress-io/github-action` en version majeure `v6`) ; `run` exécute une commande shell brute dans le conteneur. |
| `runTests: false` | — | on demande à l'action d'installer les dépendances et le binaire Cypress **sans** lancer de tests — cette étape ne fait que préparer l'environnement pour tout le reste du job. |
| `yarn types` | — | *verbe actif* "typecheck" (`tsc --noEmit`) : détecte les erreurs de typage sans produire de sortie. |
| `yarn lint` | — | *verbe actif* "lint" : règles de style et anti-patterns (ESLint + Prettier). |

**Pourquoi ce choix**

Typecheck et lint sont les contrôles les **moins chers** du pipeline (pas de navigateur, pas de serveur à démarrer) et détectent les erreurs les plus **fréquentes**. Les placer en premier, avant de payer le coût d'un build ou d'un run E2E, c'est du Fail Fast.

**Règle d'or invoquée**

Shift Left (fiche DevSecOps, §1) : "détecter les failles au moment où elles sont créées, plutôt qu'une fois l'application déployée" — une faille de typage détectée ici coûte une correction immédiate ; la même faille découverte en E2E, ou pire en prod, coûte "jusqu'à 100 fois plus cher".

**Ce que ça optimise**

*Change Lead Time* : plus le contrôle qui va bloquer est placé tôt et est rapide à exécuter, plus vite le développeur reçoit un feedback exploitable.

### 3.5 `install` — orchestration intelligente des tests unitaires

**Extrait annoté**

```yaml
    - name: Unit tests (full suite)
      if: github.ref == 'refs/heads/develop'
      run: yarn test:unit:ci

    - name: Unit tests (changed since develop)
      if: github.ref != 'refs/heads/develop'
      run: yarn test:unit:ci --changed origin/develop
```

**Vocabulaire**

| Clé | Valeur | Rôle |
|---|---|---|
| `if` | `github.ref == 'refs/heads/develop'` | condition d'exécution du step, évaluée **avant** de lancer le conteneur de commande. `github.ref` est le nom complet de la référence Git poussée (`refs/heads/<branche>`). |
| `--changed origin/develop` | argument transmis à Vitest | Vitest construit le graphe de dépendances des modules et ne relance que les fichiers de test dont un import (direct ou transitif) a changé depuis `origin/develop`. |

**Pourquoi ce choix**

Sur une branche de travail, l'immense majorité des fichiers du repo n'a pas bougé : relancer 100 % de la suite à chaque push est un travail redondant. Sur `develop`, en revanche, on ne peut pas se permettre un faux négatif du graphe de dépendances (un helper partagé modifié peut casser un test qui ne l'importe pas de façon détectable) — la branche qui fait référence pour tout le monde doit garder le filet de sécurité complet.

**Règle d'or invoquée**

C'est un compromis explicite entre deux invariants qui peuvent entrer en tension : la **Reproductibilité/fiabilité** du filet de sécurité (suite complète) et l'optimisation du **Fail Fast** (ne pas payer un coût inutile). La doc invariants insiste sur le DAG comme "arme de l'optimisation industrielle" — ici on applique le même principe à l'intérieur d'un seul step plutôt qu'entre jobs.

**Ce que ça optimise**

- *Change Lead Time* (DORA Throughput) sur les branches de travail : feedback plus rapide sans attendre la suite complète.
- *Change Fail Rate* préservé sur `develop` : aucune perte de couverture là où ça compte pour la branche de référence.

**⚠️ Loi de Goodhart** : ce découpage sert à aller vite *sans perdre de fiabilité*, pas à réduire la couverture. Si un jour la suite complète devient trop lente même sur `develop`, la réponse n'est pas de généraliser `--changed` partout mais de paralléliser la suite complète (voir §6).

### 3.6 `install` — build et artefact

**Extrait annoté**

```yaml
    - run: yarn build:ci

    - name: Save build folder
      uses: actions/upload-artifact@v4
      with:
        name: build
        if-no-files-found: error
        path: build
```

**Vocabulaire**

| Clé | Valeur | Rôle |
|---|---|---|
| `if-no-files-found` | `error` | si le dossier `build/` est vide ou absent, le step échoue explicitement au lieu de continuer silencieusement avec un artefact vide. |
| `actions/upload-artifact` | — | transmet un **artefact** : un livrable attaché à *cette* exécution précise, téléchargeable par les jobs suivants du même run. |

**Pourquoi ce choix**

Le build ne doit être fait **qu'une seule fois** : chacun des 4 jobs E2E qui suivent a besoin exactement du même bundle applicatif. Le refaire dans chaque job dupliquerait le travail et risquerait une divergence (un job testerait un build légèrement différent d'un autre).

**Règle d'or invoquée**

Le "Duel Cache vs Artefact" (doc invariants, §5) : l'artefact est **obligatoire** ("le job échoue si absent" — cf. `if-no-files-found: error`) et sert à **transmettre** un livrable entre jobs, par opposition au cache qui est *best effort* et sert à **accélérer** en évitant un recalcul (cf. le cache `yarn` du job `sca`, §3.1). Ici on transmet, donc c'est un artefact — pas un cache.

**Ce que ça optimise**

Reproductibilité inter-jobs : les 4 jobs E2E s'exécutent tous sur le *même* build binaire, garanti identique bit à bit, pas 4 builds potentiellement différents.

---

## 4. Stage 2 — Test (E2E)

Quatre jobs quasi identiques : `ui-chrome-tests`, `ui-chrome-mobile-tests`, `ui-firefox-tests`, `ui-firefox-mobile-tests`.

**⚠️ Historique de cette section (retour d'expérience réel, pas théorique)** : la version initiale reprenait telle quelle la config de l'upstream `cypress-io/cypress-realworld-app` — `record: true`, `parallel: true`, `group`, et une matrice `containers: [1, 2, 3, 4, 5]` par navigateur (20 slots au total). Ces options dépendent toutes d'un **compte Cypress Cloud** (dashboard hébergé, replay vidéo, et surtout la distribution dynamique des specs entre containers). Ce fork n'a jamais eu son propre projet Cypress Cloud — un premier run de test réel a fait échouer les 20 jobs simultanément avec `You passed the --record flag but did not provide us your Record Key`. Sans Cypress Cloud pour répartir les specs, faire tourner 5 copies du job aurait simplement rejoué 5 fois l'intégralité des 7 specs UI — aucun gain, juste 5× le coût. La matrice a donc été retirée, pas redimensionnée : sans le service qui la justifie, elle n'a plus de rôle.

**Extrait annoté** (un seul des quatre, les autres ne changent que `browser` et la config viewport)

```yaml
ui-chrome-tests:
  timeout-minutes: 15
  needs: [install, sca, secrets-scan]
  steps:
    - uses: actions/download-artifact@v4
      with:
        name: build
        path: build
    - uses: cypress-io/github-action@v6
      with:
        start: yarn start:ci
        wait-on: "http://localhost:3000"
        browser: chrome
        spec: cypress/tests/ui/*
```

**Vocabulaire**

| Clé | Valeur | Rôle |
|---|---|---|
| `needs: [install, sca, secrets-scan]` | — | déclare une dépendance sur **tout le Stage 1** : ce job n'attend pas seulement le build, mais aussi les deux gates de sécurité. C'est la brique du **DAG** — les 4 jobs E2E démarrent **en parallèle** entre eux dès que les trois jobs du Stage 1 sont verts, ils n'attendent pas l'un l'autre. Ce parallélisme-là (entre les 4 navigateurs) est du DAG GitHub Actions natif — il ne dépend d'aucun service externe, contrairement à l'ancienne matrice de containers. |
| `download-artifact` | `name: build` | récupère l'**artefact** produit par `install` (voir §3.6) — aucun rebuild ici. |
| `cypress-io/github-action@v6` (sans `record`/`parallel`) | — | exécute Cypress **en local**, dans le conteneur du job : les résultats (vidéos, screenshots sur échec) restent sur le runner éphémère, rien n'est envoyé à un service externe. |

**Pourquoi ce choix**

Diviser l'exécution en jobs parallèles par navigateur donne déjà l'essentiel du gain de temps pertinent vu le volume réel (7 specs UI) : un run par navigateur, pas cinq copies redondantes. Attendre le Stage 1 en entier (pas seulement `install`) évite de payer le coût des tests E2E quand un problème de sécurité aurait de toute façon invalidé le run.

**Règle d'or invoquée**

Le DAG plutôt que le mode séquentiel par stage : "un job démarre dès que ses dépendances directes sont satisfaites" (doc invariants, §3). Les 4 navigateurs n'ont aucune dépendance entre eux, seulement vis-à-vis du Stage 1. Fail Fast à l'échelle du pipeline entier : `sca`/`secrets-scan` sont rapides (secondes à quelques minutes) comparés au coût des 4 jobs E2E — les faire gater le Stage 2 coûte très peu et évite de payer le prix fort pour un commit déjà disqualifié. Et surtout : **ne pas ajouter de parallélisme dont le mécanisme d'équilibrage de charge n'existe pas** — une matrice sans service pour la piloter n'optimise rien, elle gaspille des minutes CI.

**Ce que ça optimise**

*Change Lead Time* : un job par navigateur reste rapide (7 specs) sans le surcoût de 5 copies redondantes ni la dépendance à un service tiers non configuré. *Reproductibilité* : le pipeline ne dépend plus d'un secret externe absent, il tourne intégralement avec ce que GitHub Actions fournit nativement.

**Pour aller plus loin plus tard (voir §6)** : si le volume de specs grossit au point qu'un seul job par navigateur devienne trop lent, la bonne réponse est soit un compte Cypress Cloud (gratuit, réintroduit `record`/`parallel`), soit un partitionnement manuel des specs entre plusieurs jobs (`spec: cypress/tests/ui/a*,b*` etc.) — pas de réintroduire une matrice de containers sans mécanisme de répartition derrière.

### 4.1 `component-tests` — tests de composants (complémentaires aux 4 jobs E2E)

**Extrait annoté**

```yaml
component-tests:
  timeout-minutes: 15
  needs: [install, sca, secrets-scan]
  steps:
    - uses: actions/checkout@v4
    - uses: cypress-io/github-action@v6
      with:
        runTests: false
    - run: yarn test:component:ci
```

**Vocabulaire**

| Clé | Valeur | Rôle |
|---|---|---|
| `runTests: false` | — | comme dans `install` (§3.4) : installe dépendances + binaire Cypress sans lancer de tests, laisse le step suivant s'en charger explicitement. |
| `yarn test:component:ci` | → `cypress run --component` | mode **Component Testing** de Cypress : chaque composant React est monté isolément (`cy.mount(...)`) par un petit serveur de dev (Vite), sans navigation dans l'application complète. |
| *(absence de)* `download-artifact` | — | contrairement aux jobs E2E, ce job **n'a pas besoin** du `build` de production : il compile à la volée uniquement les composants testés, pas l'application entière packagée. |

**Pourquoi ce choix**

Ce repo avait déjà 5 fichiers `*.cy.tsx` (à côté des composants source, ex. `src/components/AlertBar.cy.tsx`) et un script `test:component:ci` dans `package.json` — jamais branchés au pipeline. Testés en local : 13 tests sur 5 fichiers en **moins de 20 secondes**, sans boot d'application (`wait-on`, port 3000) contrairement aux jobs E2E qui doivent démarrer tout le serveur avant de pouvoir cliquer sur quoi que ce soit. C'est une couche de test complémentaire, pas un remplacement : le Component Testing valide qu'un composant se comporte bien *isolément* (props, rendu, interactions locales) ; l'E2E valide les parcours *à travers* plusieurs pages/composants connectés. Les deux sont nécessaires pour la haute couverture visée par ce projet.

**Règle d'or invoquée**

Shift Left et rapidité de feedback (fiche DevSecOps, §1) : un composant cassé est détecté en quelques secondes, sans attendre qu'un des 4 jobs E2E navigateur (bien plus lents) le remarque indirectement à travers un parcours complet.

**Ce que ça optimise**

*Change Lead Time* : un signal de correction rapide et ciblé (quel composant, pas juste "le parcours de connexion a cassé quelque part"). Contribue à la couverture globale du projet sans alourdir le chemin critique du pipeline — ce job tourne en parallèle des 4 jobs E2E, pas après.

**Dette découverte en branchant ce job** : un des 13 tests (`TransactionDateRangeFilter.cy.tsx`, test "should render a defined date range filter") échoue de façon reproductible — une assertion de date qui semble dépendre du fuseau horaire de la machine qui l'exécute. Marqué `it.skip(...)` avec renvoi vers un ticket dédié ([issue #3](https://github.com/johan-bouguermouh/m1-cicd/issues/3), label `source:manual`, `severity:medium`, ajouté au board #11) — même logique que la baseline SCA (§3.1) : documenter et suivre plutôt que bloquer aveuglément ou ignorer silencieusement.

---

## 5. Stage 3 — Report

Documentation dédiée : [ci-failure-ticketing.md](ci-failure-ticketing.md) (le pourquoi du secret `PROJECTS_TOKEN`, la procédure de mise en place, les IDs figés du board).

**Extrait annoté** (permissions et déclenchement)

```yaml
report-ci-failure:
  needs: [sca, secrets-scan, install, ui-chrome-tests, ui-chrome-mobile-tests, ui-firefox-tests, ui-firefox-mobile-tests, component-tests]
  if: failure()
  permissions:
    issues: write
    contents: read
```

**Vocabulaire**

| Clé | Valeur | Rôle |
|---|---|---|
| `needs` | liste des 8 jobs précédents (Stage 1 + Stage 2) | ce job attend la fin de **tous** les jobs, qu'ils réussissent ou échouent (par défaut `needs` sans autre condition n'exécute le job suivant que si tout a réussi — voir ligne suivante). |
| `if: failure()` | — | fonction spéciale des GitHub Actions : renvoie `true` si **au moins un** des jobs listés dans `needs` a échoué. Sans elle, ce job ne se déclencherait jamais (le comportement par défaut est d'annuler les jobs dépendants d'un job en échec). |
| `permissions` | `issues: write`, `contents: read` | **restreint** explicitement les droits du `GITHUB_TOKEN` généré pour ce job à seulement ce dont il a besoin — créer/commenter des issues et lire le code. Par défaut, sans ce bloc, le token hériterait des permissions globales du repo (souvent plus larges). |

**Pourquoi ce choix**

`if: failure()` est la seule façon d'exécuter un job *parce que* les autres ont échoué — sans ça, `needs` bloquerait ce job exactement comme les autres. La liste `needs` couvre désormais aussi `sca` et `secrets-scan` : un échec de gate sécurité génère un ticket exactement comme un échec de test.

**Règle d'or invoquée**

Le principe de moindre privilège appliqué aux `permissions` prolonge, au niveau du token GitHub, la même logique que la "ségrégation des secrets par environnement" du doc invariants (§6) : un job qui n'a besoin que d'écrire des issues ne doit jamais détenir un token capable, par exemple, de pousser du code ou de modifier les settings du repo.

**Ce que ça optimise**

- **Sécurité / supply chain** : réduit la surface d'attaque si ce job (ou une des Actions tierces qu'il utilise) était compromis.
- **Traçabilité et Instability (DORA)** : chaque ticket créé porte l'URL du run et le SHA du commit (voir le corps du ticket dans le script) — ce qui permet, une fois fermé, de calculer le *Failed Deployment Recovery Time* directement à partir des timestamps `created_at`/`closed_at` de l'issue, sans instrumentation supplémentaire. Le mécanisme anti-doublon (commenter un ticket existant plutôt qu'en ouvrir un nouveau pour la même branche) capture par ailleurs les événements de *Deployment Rework Rate*.

**Culture blameless** : le corps du ticket mentionne `@{context.actor}` (qui a déclenché le run) de façon factuelle, jamais accusatoire — cohérent avec la Culture Générative (typologie de Westrum) évoquée dans la fiche DevSecOps : l'alerte sert à apprendre, pas à désigner un responsable.

**Prérequis découvert en pratique** : GitHub désactive les Issues par défaut sur un dépôt forké (`has_issues: false`). Sans les réactiver explicitement (`gh repo edit --enable-issues`), ce job échoue silencieusement à la création du ticket — à vérifier en premier si `report-ci-failure` ne produit jamais de ticket alors qu'il tourne.

---

## 6. Ce qui reste à construire

Points identifiés mais volontairement non traités à ce stade, pour rester incrémental :

- **Compte Cypress Cloud** (§4) — délibérément non configuré pour l'instant (voir l'historique de la section) ; à reconsidérer si le volume de specs grossit au point qu'un partitionnement manuel des jobs E2E ne suffise plus.
- **SAST "logique de code"** (fiche DevSecOps, §2.2) — `sca` et `secrets-scan` couvrent les dépendances et les secrets, mais pas l'analyse statique du code applicatif lui-même (ex. CodeQL) ; à évaluer.
- **Mesure active des métriques DORA** — les données existent (timestamps d'issues, labels) mais rien ne les agrège pour l'instant ; à traiter une fois le pipeline complet, comme convenu.
- **Cache explicite des dépendances dans `install`** — `cypress-io/github-action` gère déjà un cache implicite de `node_modules`/du binaire Cypress par défaut ; à vérifier/documenter plutôt qu'à dupliquer (le job `sca`, lui, a déjà un cache explicite via `actions/setup-node`).
