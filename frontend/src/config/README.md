# Configuration Mock Data

## Utilisation

Pour switcher entre **mock data** et **vraie data**, il suffit de modifier un seul booléen dans le fichier de configuration.

### Comment faire ?

Ouvrez le fichier `frontend/src/config/dataConfig.ts` et changez :

```typescript
export const USE_MOCK_DATA = true; // utiliser mock data
// ou
export const USE_MOCK_DATA = false; // utiliser vraie data (API)
```

### Fichiers affectés

Les composants suivants utilisent maintenant ce système :

- **EloGraph.tsx** - Affichage du graphique de winrate
- **HeaderPlayerInfos.tsx** - Infos du joueur en header
- **StatsCards.tsx** - Cartes de statistiques
- **LastMatches.tsx** - Historique des derniers matchs
- **Dashboard.tsx** - Page principale du dashboard

### Comment ça marche ?

Chaque composant utilise une condition unique basée sur `USE_MOCK_DATA` :

```typescript
// Dans les appels API
const data = USE_MOCK_DATA ? mockData : await api.fetch();
```

C'est aussi simple que ça ! Plus besoin de commenter/décommenter plusieurs lignes. 🎯
