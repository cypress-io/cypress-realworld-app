# Ticketing automatique des échecs de CI

Le job `report-ci-failure` de [.github/workflows/ci.yml](../.github/workflows/ci.yml)
s'exécute quand un des jobs de test échoue (`if: failure()`). Il :

1. Crée une issue labellisée `urgent`, `ci-failure`, `severity:high`, `source:ci`
   (ou commente le ticket existant si un échec est déjà ouvert pour la même branche,
   pour éviter le spam).
2. Ajoute le ticket au board [M1 CI/CD — DevSecOps Board](https://github.com/users/prenom-nom/projects/11)
   (project #11, compte personnel `prenom-nom`) et renseigne les champs
   `Severity` et `Source`.

## Pourquoi un secret dédié

L'étape 1 utilise le `GITHUB_TOKEN` par défaut (scope `issues: write`, suffisant
pour créer une issue dans le repo). L'étape 2 a besoin de l'API GraphQL
**Projects (v2)**, qui est une ressource au niveau du compte utilisateur et non
du repo : `GITHUB_TOKEN` n'y a jamais accès, quelle que soit la permission
déclarée dans le workflow. Il faut donc un Personal Access Token classique
avec les scopes `repo` + `project`, stocké comme secret de repo `PROJECTS_TOKEN`.

Si ce secret est absent, l'étape 2 est simplement ignorée : le ticket est bien
créé, mais pas synchronisé au board (un warning apparaît dans les logs du run).

## Mise en place

1. Créer un PAT classique sur https://github.com/settings/tokens avec les
   scopes `repo` et `project`.
2. L'enregistrer comme secret sur ce repo, **depuis ton propre terminal**
   (ne jamais partager la valeur du token dans un chat ou un outil tiers) :

   ```bash
   gh secret set PROJECTS_TOKEN --repo prenom-nom/ci-cd-kube
   ```

   `gh` te demandera de coller la valeur du token de façon masquée.

## Identifiants figés dans le workflow

Le script hardcode volontairement les IDs du board (créé une seule fois) :

| Élément               | ID                               |
| --------------------- | -------------------------------- |
| Project               | `PVT_kwHOBXl7n84Bh5q8` (#11)     |
| Champ Severity        | `PVTSSF_lAHOBXl7n84Bh5q8zhgzo7o` |
| Option Severity: High | `6a116782`                       |
| Champ Source          | `PVTSSF_lAHOBXl7n84Bh5q8zhgzo7s` |
| Option Source: CI     | `38a4a3de`                       |

Si le board est recréé, régénérer ces IDs avec `gh project field-list 11 --owner prenom-nom --format json`.
