// =============================================
// 1. STATISTIQUES GLOBALES
// =============================================
const globalStats = {
  year: {
    name: "Année",
    description: "Année actuelle dans le jeu (1970-1980).",
    example: "1975",
    impact: "Déclenche les événements historiques (ex: lancement de l'Altair 8800 en 1975).",
    value: 1970
  },
  month: {
    name: "Mois",
    description: "Mois actuel (1-12).",
    example: "6 (juin)",
    impact: "Avancement temporel (1 mois = 1 tour).",
    value: 1
  },
  cash: {
    name: "Capital",
    description: "Argent disponible pour investir (en $).",
    example: "$1,000,000",
    impact: "Permet d'acheter des marques (500k$/marque) ou d'investir en R&D.",
    value: 1000000
  },
  ownedBrands: {
    name: "Marques possédées",
    description: "Liste des marques que le joueur possède (max 5).",
    example: "['mits', 'apple']",
    impact: "Limite stratégique : 5 marques max pour éviter la surcharge.",
    value: []
  },
  eventsLog: {
    name: "Historique des événements",
    description: "Liste des événements passés (pannes, lancements, etc.).",
    example: "[]",
    impact: "Affiche les événements en cours dans le terminal.",
    value: []
  }
};

// =============================================
// 2. STATISTIQUES PAR MARQUE/MACHINE
// =============================================
const brandStats = {
  cost: {
    name: "Coût",
    description: "Coût de production par unité (en $).",
    example: "$250 (Altair 8800)",
    impact: "Influence le profit par unité (profit = prix_de_vente - cost).",
    value: 250
  },
  profit: {
    name: "Profit",
    description: "Bénéfice par unité vendue (en $).",
    example: "$147 (Altair 8800)",
    impact: "Calculé comme : profit = prix_de_vente - coût. Détermine les revenus mensuels.",
    value: 147
  },
  reliability: {
    name: "Fiabilité",
    description: "Pourcentage de fiabilité (0-100%). Risque de panne si < 70%.",
    example: "85%",
    impact: "Si < 70%, risque de panne aléatoire (-20% production).",
    value: 85
  },
  popularity: {
    name: "Popularité",
    description: "Pourcentage de popularité (0-100%). Impacte les ventes.",
    example: "70%",
    impact: "Affecte les revenus mensuels (revenu = production × profit × popularity/100).",
    value: 70
  },
  production: {
    name: "Production",
    description: "Nombre d'unités produites par mois.",
    example: "1000 unités/mois (Altair 8800)",
    impact: "Détermine la capacité de production et les revenus mensuels.",
    value: 1000
  }
};

// =============================================
// 3. ÉVÉNEMENTS ET CHOIX STRATÉGIQUES
// =============================================
const eventStats = {
  historicalEvents: {
    name: "Événements historiques",
    description: "Événements liés à des dates spécifiques (ex: lancement de l'Altair 8800 en 1975-01).",
    example: "Lancement de l'Altair 8800 (1975-01)",
    impact: "Déclenche des choix stratégiques (ex: produire 1000 kits/mois).",
    value: []
  },
  randomEvents: {
    name: "Événements aléatoires",
    description: "Événements imprévus (pannes, innovations) avec une probabilité de 10% par mois.",
    example: "Panne de production (-20% production)",
    impact: "Modifie les stats des machines (ex: fiabilité -10%).",
    value: []
  },
  strategicChoices: {
    name: "Choix stratégiques",
    description: "Options proposées lors d'un événement (ex: produire 1000 kits/mois ou vendre des machines montées).",
    example: "Produire 1000 kits/mois (profit élevé, fiabilité standard)",
    impact: "Chaque choix a des effets sur les stats (ex: production +1000, fiabilité +10%).",
    value: []
  }
};

// =============================================
// 4. STATISTIQUES AVANCÉES (CALCULÉES)
// =============================================
const advancedStats = {
  marketGrowth: {
    name: "Croissance du marché",
    description: "Croissance annuelle du marché (+X% par an).",
    example: "5%",
    impact: "Augmente la popularité de toutes les marques chaque année.",
    value: 5
  },
  inflation: {
    name: "Inflation",
    description: "Inflation annuelle (+X% sur les coûts).",
    example: "2%",
    impact: "Augmente le coût de production chaque année.",
    value: 2
  },
  randomEventChance: {
    name: "Probabilité d'événement aléatoire",
    description: "Probabilité d'un événement aléatoire (panne, innovation).",
    example: "10%/mois",
    impact: "1 chance sur 10 par mois de déclencher un événement imprévu.",
    value: 10
  },
  competitorAggressiveness: {
    name: "Agressivité des concurrents",
    description: "Impact sur la popularité si un concurrent lance un produit.",
    example: "5%",
    impact: "Si un concurrent lance un produit, ta popularité baisse de 5%.",
    value: 5
  }
};

// =============================================
// 5. FONCTION POUR AFFICHER LES STATS
// =============================================
function printStats() {
  console.log("STATISTIQUES DU JEU 70s COMPUTERS FACTORY\n\n");

  // Affiche les stats globales
  console.log("=== STATISTIQUES GLOBALES ===");
  Object.values(globalStats).forEach(stat => {
    console.log(`- ${stat.name}: ${stat.description}`);
    console.log(`  Exemple: ${stat.example}`);
    console.log(`  Impact: ${stat.impact}`);
    console.log(`  Valeur par défaut: ${stat.value}\n`);
  });

  // Affiche les stats par marque/machine
  console.log("=== STATISTIQUES PAR MARQUE/MACHINE ===");
  Object.values(brandStats).forEach(stat => {
    console.log(`- ${stat.name}: ${stat.description}`);
    console.log(`  Exemple: ${stat.example}`);
    console.log(`  Impact: ${stat.impact}`);
    console.log(`  Valeur par défaut: ${stat.value}\n`);
  });

  // Affiche les stats d'événements
  console.log("=== ÉVÉNEMENTS ET CHOIX STRATÉGIQUES ===");
  Object.values(eventStats).forEach(stat => {
    console.log(`- ${stat.name}: ${stat.description}`);
    console.log(`  Exemple: ${stat.example}`);
    console.log(`  Impact: ${stat.impact}`);
    console.log(`  Valeur par défaut: ${stat.value}\n`);
  });

  // Affiche les stats avancées
  console.log("=== STATISTIQUES AVANCÉES (CALCULÉES) ===");
  Object.values(advancedStats).forEach(stat => {
    console.log(`- ${stat.name}: ${stat.description}`);
    console.log(`  Exemple: ${stat.example}`);
    console.log(`  Impact: ${stat.impact}`);
    console.log(`  Valeur par défaut: ${stat.value}\n`);
  });
}

// =============================================
// 6. AFFICHAGE DANS LE TERMINAL
// =============================================
function printStatsToTerminal() {
  const statsList = generateStatsList();
  const terminalBody = document.getElementById('terminalBody');
  terminalBody.innerHTML += `<div class="terminal-line">${statsList.replace(/\n/g, '<br>')}</div>`;
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

// =============================================
// 7. EXPORTATION DU MODULE
// =============================================
export {
  globalStats,
  brandStats,
  eventStats,
  advancedStats,
  printStats,
  printStatsToTerminal
};