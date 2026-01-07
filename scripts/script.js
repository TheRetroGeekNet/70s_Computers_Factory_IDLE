/**
 * 70's COMPUTERS FACTORY IDLE - Script principal
 * Ce fichier gère toute la logique du jeu, l'interface utilisateur et les interactions
 * Chaque section est clairement commentée et modularisée pour faciliter la maintenance
 */

// =============================================
// 1. INITIALISATION DU JEU AU CHARGEMENT DU DOM
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    /**
     * 1.1. Récupération des éléments DOM essentiels
     * On stocke tous les éléments importants dans un objet pour un accès facile
     */
    const elements = {
        input: document.getElementById('command-input'),       // Champ de saisie des commandes
        output: document.getElementById('output-area'),       // Zone d'affichage des messages
        gameYear: document.getElementById('game-year'),       // Affichage de l'année
        gameMonth: document.getElementById('game-month'),     // Affichage du mois
        moneyDisplay: document.getElementById('money'),       // Affichage de l'argent
        computerCount: document.getElementById('computer'),   // Affichage des PC fabriqués
        pcPanel: document.querySelector('#side-column #pc-panel'), // Panneau de visualisation des machines
        sideColumn: document.getElementById('side-column')   // Colonne latérale
    };

    // Vérification que tous les éléments essentiels sont présents
    if (!elements.output || !elements.input) {
        console.error("Élément manquant dans HTML !");
        return;
    }

    // =============================================
    // 2. CONFIGURATION INITIALE DU JEU
    // =============================================
    /**
     * 2.1. État du jeu
     * Cet objet centralise toutes les données du jeu
     */
    const gameState = {
        year: 1970,                   // Année actuelle dans le jeu
        month: 1,                     // Mois actuel (1-12)
        cash: 1000000,                // Argent disponible
        ownedBrands: [],              // Marques possédées par le joueur
        brandsData: {},               // Données de toutes les marques
        productionData: {},           // Données de production par marque/machine
        activeEvents: {},             // Événements historiques actifs
        currentVisualization: {       // Index pour la visualisation des machines
            brandIndex: 0,
            machineIndex: 0
        },
        sessionId: "guest",           // Identifiant de session
        soundEnabled: true,           // Activation des sons
        currentScreen: "main",        // Écran actuel (main, buy, sell, etc.)
        achievements: {               // Succès du jeu
            firstBrand: {
                unlocked: false,
                name: "Premier pas",
                description: "Acheter votre première marque"
            },
            millionaire: {
                unlocked: false,
                name: "Millionnaire",
                description: "Atteindre 1 million de dollars"
            }
        },
        totalComputersProduced: 0,    // Nombre total de PC fabriqués
        userInteracted: false,        // L'utilisateur a-t-il interagi avec la page ?
        productionInterval: null      // Intervalle pour la production continue
    };

    /**
     * 2.2. Configuration des sons
     * On utilise des URLs externes pour les effets sonores
     */
    const sounds = {
        success: createAudio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'),
        error: createAudio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-lose-2029.mp3'),
        type: createAudio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'),
        boot: createAudio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3'),
        click: createAudio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3')
    };

    /**
     * 2.3. Création d'un objet Audio
     * @param {string} src - URL du fichier audio
     * @returns {HTMLAudioElement} - Élément audio prêt à être joué
     */
    function createAudio(src) {
        const audio = new Audio();
        audio.src = src;
        audio.load(); // Chargement immédiat du son
        return audio;
    }

    /**
     * 2.4. Liste des marques disponibles dans le jeu
     * Inclut maintenant le Commodore 64
     */
    const brandsList = [
        "apple", "atari", "commodore", "exidy", "heathkit",
        "ibm", "magnavox", "mits", "ohio_scientific", "osborne",
        "processor_tech", "sinclair", "tandy", "texas_instruments", "vector_graphic"
    ];

    /**
     * 2.5. Mappage des images des ordinateurs
     * Ajout du Commodore 64
     */
    const wikipediaImages = {
        'apple_i': 'data/images/computers/apple_i.jpg',
        'apple_ii': 'data/images/computers/apple_ii.jpg',
        'commodore_64': 'data/images/computers/commodore_64.jpg', // Nouveau
        'commodore_pet': 'data/images/computers/commodore_pet.jpg',
        'commodore_vic20': 'data/images/computers/commodore_vic20.jpg',
        'atari_2600': 'data/images/computers/atari_2600.jpg',
        'atari_800': 'data/images/computers/atari_800.jpg',
        'exidy_sorcerer': 'data/images/computers/exidy_sorcerer.jpg',
        'heathkit_h8': 'data/images/computers/heathkit_h8.jpg',
        'magnavox_odyssey2': 'data/images/computers/magnavox_odyssey2.jpg',
        'altair_8800': 'data/images/computers/altair_8800.jpg',
        'challenger_1p': 'data/images/computers/challenger_1p.jpg',
        'processor_tech_sol20': 'data/images/computers/processor_tech_sol20.jpg',
        'sinclair_zx80': 'data/images/computers/sinclair_zx80.jpg',
        'trs80_model_i': 'data/images/computers/trs80_model_i.jpg',
        'trs80_model_ii': 'data/images/computers/trs80_model_ii.jpg',
        'ti_99_4': 'data/images/computers/ti_99_4.jpg',
        'vector_1': 'data/images/computers/vector_1.jpg',
        'ibm_5100': 'data/images/computers/ibm_5100.jpg'
    };

    // =============================================
    // 3. FONCTIONS UTILITAIRES
    // =============================================
    /**
     * 3.1. Jouer un son
     * @param {string} name - Nom du son à jouer (clé dans l'objet sounds)
     */
    function playSound(name) {
        if (gameState.soundEnabled && sounds[name] && gameState.userInteracted) {
            try {
                sounds[name].currentTime = 0; // Réinitialise le son
                sounds[name].play().catch(e => console.warn("Erreur audio:", e));
            } catch (e) {
                console.warn("Erreur audio:", e);
            }
        }
    }

    /**
     * 3.2. Afficher un message dans le terminal
     * @param {string} msg - Message à afficher
     * @param {boolean} isSystem - Est-ce un message système ?
     */
    function print(msg = '', isSystem = false) {
        const line = document.createElement('div');
        line.className = isSystem ? 'system' : '';

        // Remplacement des balises pour un affichage texte
        const formattedMsg = msg
            .replace(/<success>/g, '[SUCCESS] ')
            .replace(/<\/success>/g, '')
            .replace(/<error>/g, '[ERROR] ')
            .replace(/<\/error>/g, '')
            .replace(/<info>/g, '[INFO] ')
            .replace(/<\/info>/g, '')
            .replace(/<b>/g, '')
            .replace(/<\/b>/g, '')
            .replace(/<code>/g, '`')
            .replace(/<\/code>/g, '`');

        line.textContent = formattedMsg;
        elements.output.appendChild(line);
        elements.output.scrollTop = elements.output.scrollHeight;
        playSound('type');
    }

    /**
     * 3.3. Afficher un menu avec des options numérotées
     * @param {string} title - Titre du menu
     * @param {string[]} options - Liste des options
     */
    function printMenu(title, options) {
        print(`\n=== ${title.toUpperCase()} ===`);
        options.forEach((option, index) => {
            print(`${index + 1}) ${option}`);
        });
        print("\nEntrez le numéro de votre choix ou 'back' pour revenir en arrière:");
    }

    /**
     * 3.4. Effet de frappe au clavier pour les messages
     * @param {string} msg - Message à afficher caractère par caractère
     * @param {number} speed - Vitesse de frappe (ms entre chaque caractère)
     * @returns {Promise} - Promise qui se résout quand l'animation est terminée
     */
    function printTyping(msg, speed = 20) {
        return new Promise(resolve => {
            let i = 0;
            const line = document.createElement('div');
            elements.output.appendChild(line);
            const timer = setInterval(() => {
                if (i < msg.length) {
                    line.textContent += msg.charAt(i);
                    i++;
                    elements.output.scrollTop = elements.output.scrollHeight;
                    playSound('type');
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, speed);
        });
    }

    /**
     * 3.5. Mettre à jour l'interface utilisateur
     * Met à jour tous les éléments affichés à l'écran
     */
    function updateInterface() {
        // Mise à jour de la date
        if (elements.gameYear) elements.gameYear.textContent = gameState.year;
        if (elements.gameMonth) elements.gameMonth.textContent = getMonthName(gameState.month);

        // Mise à jour des statistiques principales
        updateMainStatsPanel();

        // Mise à jour du visualiseur de machines
        updateMachineVisualization();
    }

    /**
     * 3.6. Mettre à jour le panneau des statistiques principales
     * Affiche l'argent et le nombre de PC fabriqués
     */
    function updateMainStatsPanel() {
        let statsPanel = document.getElementById('main-stats-panel');

        // Création du panneau s'il n'existe pas
        if (!statsPanel) {
            statsPanel = document.createElement('div');
            statsPanel.id = 'main-stats-panel';
            const container = document.querySelector('.main-container') ||
                             document.querySelector('#game-container') ||
                             document.body;
            container.insertBefore(statsPanel, container.firstChild);
        }

        // Formatage des nombres (sans K/M pour les PC fabriqués)
        const cashDisplay = formatNumber(gameState.cash);
        const computersDisplay = gameState.totalComputersProduced.toLocaleString(); // Nombre entier sans formatage

        statsPanel.innerHTML = `
            <div class="stats-container">
                <div class="stat-item magic-number" id="cash-display">
                    <div class="stat-label">ARGENT</div>
                    <div class="stat-value">$${cashDisplay}</div>
                </div>

                <div class="stat-item magic-number highlighted" id="computers-display">
                    <div class="stat-label">PC FABRIQUÉS</div>
                    <div class="stat-value">${computersDisplay}</div>
                </div>

                <div class="date-display">
                    <div class="date-item">
                        <div class="date-label">ANNÉE</div>
                        <div class="date-value">${gameState.year}</div>
                    </div>
                    <div class="date-item">
                        <div class="date-label">MOIS</div>
                        <div class="date-value">${getMonthName(gameState.month)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 3.7. Formater un nombre pour l'affichage
     * @param {number} num - Nombre à formater
     * @returns {string} - Nombre formaté
     */
    function formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
        if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
        if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
        if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
        return num.toLocaleString();
    }

    /**
     * 3.8. Obtenir le nom du mois en français
     * @param {number} month - Numéro du mois (1-12)
     * @returns {string} - Nom du mois
     */
    function getMonthName(month) {
        const months = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];
        return months[month - 1];
    }

    /**
     * 3.9. Mettre à jour le visualiseur de machines
     * Affiche la machine actuellement sélectionnée
     */
    function updateMachineVisualization() {
        const brands = Object.values(gameState.brandsData);
        if (brands.length === 0) return;

        const brandIndex = gameState.currentVisualization.brandIndex;
        const machineIndex = gameState.currentVisualization.machineIndex;

        const brand = brands[brandIndex];
        const machine = brand.machines[machineIndex];

        if (!machine) return;

        // Mise à jour des informations de la machine
        document.getElementById('machine-name').textContent = machine.name;
        document.getElementById('machine-description').textContent = machine.description || 'Aucune description disponible';

        // Indicateur de possession
        const owned = gameState.ownedBrands.includes(brand.id);
        const light = document.getElementById('brand-owned-light');
        const status = document.getElementById('ownership-status');

        if (light) light.style.backgroundColor = owned ? '#0f0' : '#f00';
        if (status) status.textContent = `Marque: ${owned ? 'Possédée' : 'Non possédée'}`;

        // Image de la machine
        const img = document.getElementById('current-machine-image');
        if (img) {
            img.src = wikipediaImages[machine.id] || 'data/images/computers/default.png';
            img.alt = machine.name;
        }
    }

    // =============================================
    // 4. GESTION DES ÉCRANS ET MENUS
    // =============================================
    /**
     * 4.1. Afficher le menu principal
     */
    function showMainMenu() {
        gameState.currentScreen = "main";
        print("\n=== MENU PRINCIPAL ===");
        print("1) Acheter une marque (buy)");
        print("2) Vendre une marque (sell)");
        print("3) Lister les marques (list)");
        print("4) Gérer la production (build)");
        print("5) Améliorer une machine (upgrade)");
        print("6) Passer au mois suivant (next)");
        print("7) Voir les statistiques (stats)");
        print("8) Événements historiques (events)");
        print("9) Sauvegarder/Charger (save/load)");
        print("10) Aide (help)");
        print("11) Quitter (exit)");
        print("\nEntrez le numéro ou le nom de la commande:");
    }

    /**
     * 4.2. Afficher l'écran d'aide
     */
    function showHelpScreen() {
        gameState.currentScreen = "help";
        print("\n=== AIDE ===");
        print("Voici les commandes disponibles:\n");

        const commands = [
            { cmd: "help", desc: "Affiche cette aide" },
            { cmd: "buy", desc: "Acheter une marque (ex: buy apple)" },
            { cmd: "sell", desc: "Vendre une marque (ex: sell ibm)" },
            { cmd: "list", desc: "Lister les marques/machines" },
            { cmd: "build", desc: "Produire des machines (ex: build apple apple_i 10)" },
            { cmd: "upgrade", desc: "Améliorer une machine (ex: upgrade apple apple_i)" },
            { cmd: "next", desc: "Passer au mois suivant" },
            { cmd: "stats", desc: "Voir les statistiques" },
            { cmd: "events", desc: "Voir les événements historiques" },
            { cmd: "login", desc: "Se connecter (ex: login pseudo)" },
            { cmd: "logout", desc: "Se déconnecter" },
            { cmd: "save", desc: "Sauvegarder la partie" },
            { cmd: "load", desc: "Charger une partie" },
            { cmd: "clear", desc: "Effacer le terminal" },
            { cmd: "exit", desc: "Quitter le jeu" },
            { cmd: "info", desc: "Afficher les infos d'une marque (ex: info apple)" }
        ];

        commands.forEach(cmd => {
            print(`- ${cmd.cmd}: ${cmd.desc}`);
        });
        print("\nTapez 'back' pour revenir au menu principal");
    }

    /**
     * 4.3. Afficher les événements historiques
     */
    function showEvents() {
        gameState.currentScreen = "events";
        print("\n=== ÉVÉNEMENTS HISTORIQUES ===");

        const currentDate = `${gameState.year}-${String(gameState.month).padStart(2, '0')}`;
        let hasEvents = false;

        Object.values(gameState.brandsData).forEach(brand => {
            brand.machines.forEach(machine => {
                if (machine.events) {
                    machine.events.forEach(event => {
                        if (event.date === currentDate && !gameState.activeEvents[event.title]) {
                            gameState.activeEvents[event.title] = event;
                            hasEvents = true;
                            print(`[${event.date}] ${event.title}`);
                            print(`- ${event.description}`);

                            if (event.choices && event.choices.length > 0) {
                                print("Choix disponibles:");
                                event.choices.forEach(choice => {
                                    print(`  ${choice.id}) ${choice.description}`);
                                });
                            }
                            print("");
                        }
                    });
                }
            });
        });

        if (!hasEvents) {
            print("Aucun événement historique ce mois-ci.");
        }

        print("Tapez 'back' pour revenir au menu principal");
    }

    /**
     * 4.4. Afficher l'écran d'achat de marques
     */
    function showBuyScreen() {
        gameState.currentScreen = "buy";
        const brands = Object.values(gameState.brandsData);
        print("\n=== ACHETER UNE MARQUE ===");

        brands.forEach((brand, index) => {
            const owned = gameState.ownedBrands.includes(brand.id) ? '✓' : '✗';
            const price = 500000;
            print(`${index + 1}) ${brand.name} (${brand.year}) [${owned}] - $${price.toLocaleString()}`);
        });

        print("\nEntrez le numéro de la marque à acheter ou 'back' pour revenir en arrière");
    }

    /**
     * 4.5. Afficher l'écran de vente de marques
     */
    function showSellScreen() {
        gameState.currentScreen = "sell";
        if (gameState.ownedBrands.length === 0) {
            print("[ERROR] Vous ne possédez aucune marque à vendre.");
            return showMainMenu();
        }

        print("\n=== VENDRE UNE MARQUE ===");
        gameState.ownedBrands.forEach((brandId, index) => {
            const brand = gameState.brandsData[brandId];
            print(`${index + 1}) ${brand.name} - $300,000`);
        });

        print("\nEntrez le numéro de la marque à vendre ou 'back' pour revenir en arrière");
    }

    /**
     * 4.6. Afficher l'écran de listage
     */
    function showListScreen() {
        gameState.currentScreen = "list";
        print("\n=== LISTER LES ÉLÉMENTS ===");
        print("1) Toutes les marques");
        print("2) Vos marques possédées");
        print("3) Machines d'une marque (utilisez 'info <marque>')");
        print("\nEntrez le numéro de votre choix ou 'back' pour revenir en arrière");
    }

    /**
     * 4.7. Afficher les informations d'une marque
     * @param {string} brandId - ID de la marque
     */
    function showBrandInfo(brandId) {
        if (!brandId) {
            print("[ERROR] Veuillez spécifier une marque (ex: info apple)");
            return;
        }

        const brand = gameState.brandsData[brandId];
        if (!brand) {
            print(`[ERROR] Marque "${brandId}" introuvable.`);
            return;
        }

        print(`\n=== INFORMATIONS SUR ${brand.name.toUpperCase()} ===`);
        print(`Fondation: ${brand.year || 'Inconnue'}`);
        print(`Description: ${brand.description || 'Aucune description disponible'}`);

        if (brand.logo) {
            print(`Logo: ${brand.logo}`);
        }

        print("\nMachines:");
        brand.machines.forEach(machine => {
            const production = gameState.productionData[brand.id][machine.id].production;
            print(`- ${machine.name} (${machine.year}) - ${production > 0 ? '✓ EN PRODUCTION' : '✗'}`);
        });

        print("\nTapez 'back' pour revenir au menu principal");
    }

    /**
     * 4.8. Afficher les statistiques détaillées
     */
    function showStats() {
        print("\n=== STATISTIQUES ===");
        print(`- Année: ${gameState.year}`);
        print(`- Mois: ${getMonthName(gameState.month)}`);
        print(`- Argent: $${gameState.cash.toLocaleString()}`);
        print(`- Marques possédées: ${gameState.ownedBrands.length}/15`);
        print(`- Ordinateurs produits: ${gameState.totalComputersProduced.toLocaleString()}`);

        let totalProduction = 0;
        let totalProfit = 0;
        let totalReliability = 0;
        let totalPopularity = 0;
        let machineCount = 0;

        gameState.ownedBrands.forEach(brandId => {
            const brand = gameState.brandsData[brandId];
            brand.machines.forEach(machine => {
                const production = gameState.productionData[brand.id][machine.id].production;
                if (production > 0) {
                    totalProduction += production;
                    const effectiveProduction = Math.floor(
                        production *
                        (machine.stats.reliability / 100) *
                        (machine.stats.popularity / 100)
                    );
                    totalProfit += effectiveProduction * machine.stats.profit;
                    totalReliability += machine.stats.reliability;
                    totalPopularity += machine.stats.popularity;
                    machineCount++;
                }
            });
        });

        if (machineCount > 0) {
            print("\nStatistiques de production:");
            print(`- Machines en production: ${machineCount}`);
            print(`- Unités produites/mois: ${totalProduction.toLocaleString()}`);
            print(`- Bénéfice estimé/mois: $${totalProfit.toLocaleString()}`);
            print(`- Fiabilité moyenne: ${Math.round(totalReliability / machineCount)}%`);
            print(`- Popularité moyenne: ${Math.round(totalPopularity / machineCount)}%`);
        }

        print("\nSuccès débloqués:");
        Object.values(gameState.achievements).forEach(achievement => {
            print(`- ${achievement.unlocked ? '✓' : '✗'} ${achievement.name}: ${achievement.description}`);
        });

        print("\nTapez 'back' pour revenir au menu principal");
    }

    // =============================================
    // 5. GESTION DES COMMANDES
    // =============================================
    /**
     * 5.1. Traiter une commande entrée par l'utilisateur
     * @param {string} inputCmd - Commande entrée par l'utilisateur
     */
    async function handleCommand(inputCmd) {
        const args = inputCmd.trim().toLowerCase().split(' ').filter(Boolean);
        if (args.length === 0) return;

        const command = args[0];
        const arg1 = args[1];
        const arg2 = args[2];
        const arg3 = args[3];

        // Gestion des commandes numériques pour les menus
        if (!isNaN(command)) {
            const num = parseInt(command);
            switch(gameState.currentScreen) {
                case "main":
                    return handleMainMenu(num);
                case "buy":
                    return handleBuyMenu(num);
                case "sell":
                    return handleSellMenu(num);
                case "list":
                    return handleListMenu(num);
                default:
                    print(`[ERROR] Commande numérique inconnue dans ce contexte`);
            }
            return;
        }

        // Gestion des commandes textuelles
        switch (command) {
            case 'buy': return showBuyScreen();
            case 'sell': return showSellScreen();
            case 'list': return showListScreen();
            case 'build':
                if (!arg1 || !arg2) {
                    print("[ERROR] Usage: build <marque> <machine> [quantité]");
                    return;
                }
                const quantity = arg3 ? parseInt(arg3) : 1;
                return buildMachine(arg1, arg2, quantity);
            case 'upgrade':
                if (!arg1 || !arg2) {
                    print("[ERROR] Usage: upgrade <marque> <machine>");
                    return;
                }
                return upgradeMachine(arg1, arg2);
            case 'next': return advanceMonth();
            case 'stats': return showStats();
            case 'events': return showEvents();
            case 'save': return saveGame();
            case 'load': return loadGame();
            case 'help': return showHelpScreen();
            case 'exit': return exitGame();
            case 'back': return showMainMenu();
            case 'clear': return elements.output.innerHTML = '';
            case 'login': return login(arg1);
            case 'logout': return logout();
            case 'info': return showBrandInfo(arg1);
            case 'choose':
                if (!arg1) {
                    print("[ERROR] Usage: choose <id>");
                    return;
                }
                return handleEventChoice(arg1);
            default: print(`[ERROR] Commande inconnue: ${command}`);
        }
    }

    /**
     * 5.2. Traiter un choix dans le menu principal
     * @param {number} choice - Numéro du choix
     */
    function handleMainMenu(choice) {
        switch(choice) {
            case 1: showBuyScreen(); break;
            case 2: showSellScreen(); break;
            case 3: showListScreen(); break;
            case 4: print("[INFO] Utilisez: build <marque> <machine> [quantité]"); break;
            case 5: print("[INFO] Utilisez: upgrade <marque> <machine>"); break;
            case 6: advanceMonth(); break;
            case 7: showStats(); break;
            case 8: showEvents(); break;
            case 9: saveGame(); break;
            case 10: showHelpScreen(); break;
            case 11: exitGame(); break;
            default: print(`[ERROR] Choix invalide: ${choice}`);
        }
    }

    /**
     * 5.3. Traiter un choix dans le menu d'achat
     * @param {number} choice - Numéro du choix
     */
    function handleBuyMenu(choice) {
        const brands = Object.values(gameState.brandsData);
        if (choice < 1 || choice > brands.length) {
            print(`[ERROR] Choix invalide: ${choice}`);
            return;
        }
        buyBrand(brands[choice - 1].id);
    }

    /**
     * 5.4. Traiter un choix dans le menu de vente
     * @param {number} choice - Numéro du choix
     */
    function handleSellMenu(choice) {
        if (gameState.ownedBrands.length === 0) {
            print("[ERROR] Vous ne possédez aucune marque");
            return showMainMenu();
        }

        if (choice < 1 || choice > gameState.ownedBrands.length) {
            print(`[ERROR] Choix invalide: ${choice}`);
            return;
        }

        const brandId = gameState.ownedBrands[choice - 1];
        sellBrand(brandId);
    }

    /**
     * 5.5. Traiter un choix dans le menu de listage
     * @param {number} choice - Numéro du choix
     */
    function handleListMenu(choice) {
        switch(choice) {
            case 1: listAllBrands(); break;
            case 2: listOwnedBrands(); break;
            case 3: print("[INFO] Utilisez 'info <marque>' pour voir les machines"); break;
            default: print(`[ERROR] Choix invalide: ${choice}`);
        }
    }

    /**
     * 5.6. Lister toutes les marques disponibles
     */
    function listAllBrands() {
        print("\n=== TOUTES LES MARQUES ===");
        Object.values(gameState.brandsData).forEach(brand => {
            const owned = gameState.ownedBrands.includes(brand.id) ? '✓' : '✗';
            print(`- ${brand.name} (${brand.year}) [${owned}]`);
        });
        print("\nTapez 'back' pour revenir au menu principal");
    }

    /**
     * 5.7. Lister les marques possédées par le joueur
     */
    function listOwnedBrands() {
        if (gameState.ownedBrands.length === 0) {
            print("[ERROR] Vous ne possédez aucune marque");
            return showMainMenu();
        }

        print("\n=== VOS MARQUES ===");
        gameState.ownedBrands.forEach(brandId => {
            const brand = gameState.brandsData[brandId];
            print(`- ${brand.name} (${brand.year})`);
        });
        print("\nTapez 'back' pour revenir au menu principal");
    }

    // =============================================
    // 6. FONCTIONS PRINCIPALES DU JEU
    // =============================================
    /**
     * 6.1. Démarrer le jeu
     */
    async function startGame() {
        // Configuration du fond d'usine
        document.body.style.backgroundImage = "url('data/images/background.png')";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.backgroundPosition = "center";

        print("[SUCCESS] 🎮 70s COMPUTERS FACTORY - DÉMARRAGE", true);
        print("[INFO] Cliquez n'importe où pour activer les sons", true);

        await loadBrandsData();
        initializeMachineVisualizer();
        startContinuousProduction();
        await trgOsBoot();
        showMainMenu();

        setupNavigationButtons();
    }

    /**
     * 6.2. Configurer les boutons de navigation
     */
    function setupNavigationButtons() {
        document.getElementById('prev-brand')?.addEventListener('click', () => navigateBrands(-1));
        document.getElementById('next-brand')?.addEventListener('click', () => navigateBrands(1));
        document.getElementById('prev-machine')?.addEventListener('click', () => navigateMachines(-1));
        document.getElementById('next-machine')?.addEventListener('click', () => navigateMachines(1));
    }

    /**
     * 6.3. Charger les données des marques
     */
    async function loadBrandsData() {
        try {
            const response = await fetch('data/brands/brands.json');
            if (!response.ok) throw new Error('Échec du chargement des marques');
            const brands = await response.json();

            for (const brand of brands) {
                try {
                    const brandResponse = await fetch(`data/brands/${brand.id}.json`);
                    if (brandResponse.ok) {
                        const brandData = await brandResponse.json();
                        gameState.brandsData[brand.id] = brandData;
                        gameState.productionData[brand.id] = {};
                        brandData.machines.forEach(machine => {
                            gameState.productionData[brand.id][machine.id] = {
                                production: 0,
                                upgrades: []
                            };
                        });
                    }
                } catch (e) {
                    console.warn(`Impossible de charger ${brand.id}.json`, e);
                }
            }
            updateInterface();
        } catch (error) {
            console.error('Erreur:', error);
            print('[ERROR] Erreur: Impossible de charger les données des marques');
        }
    }

    /**
     * 6.4. Animation de démarrage du système
     */
    async function trgOsBoot() {
        const logo = `
      ████████╗██████╗  ██████╗
      ╚══██╔══╝██╔══██╗██╔════╝
         ██║   ██████╔╝██║  ███╗
         ██║   ██╔══██╗██║   ██║
         ██║   ██║  ██║╚██████╔╝
         ╚═╝   ╚═╝  ╚═╝ ╚═════╝

      70's COMPUTERS FACTORY IDLE
        `;

        await printTyping(logo, 8);
        await new Promise(r => setTimeout(r, 800));

        const bootLines = [
            "Starting TRG OS v1.0 Kernel",
            "Initializing memory management",
            "Mounting root filesystem",
            "Loading device drivers",
            "Starting CRT display subsystem",
            "Initializing idle production engine",
            "Loading brands database",
            "Initializing machine visualizer"
        ];

        for (const line of bootLines) {
            print(`[  OK  ] ${line}`);
            await new Promise(r => setTimeout(r, 100));
        }

        print("[  OK  ] TRG OS fully loaded");
        await new Promise(r => setTimeout(r, 300));
    }

    /**
     * 6.5. Initialiser le visualiseur de machines
     */
    function initializeMachineVisualizer() {
        if (!elements.pcPanel) return;

        elements.pcPanel.innerHTML = `
            <h3>Machine Actuelle</h3>
            <div id="machine-visualizer">
                <div class="machine-info">
                    <h3 id="machine-name">Sélectionnez une machine</h3>
                    <p id="machine-description">Utilisez les boutons ci-dessous</p>
                    <div class="ownership-indicator">
                        <div class="indicator-light" id="brand-owned-light"></div>
                        <span id="ownership-status">Marque: Non possédée</span>
                    </div>
                </div>
                <div class="computer-screen">
                    <img id="current-machine-image" src="data/images/computers/default.png" alt="Computer">
                </div>
                <div class="navigation-buttons">
                    <div class="brand-nav">
                        <button id="prev-brand" class="nav-btn">← Marque</button>
                        <button id="next-brand" class="nav-btn">→ Marque</button>
                    </div>
                    <div class="machine-nav">
                        <button id="prev-machine" class="nav-btn">↑ Modèle</button>
                        <button id="next-machine" class="nav-btn">↓ Modèle</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 6.6. Naviguer entre les marques
     * @param {number} direction - Direction de navigation (-1 pour précédent, 1 pour suivant)
     */
    function navigateBrands(direction) {
        const brands = Object.values(gameState.brandsData);
        if (brands.length === 0) return;

        gameState.currentVisualization.brandIndex = Math.max(0,
            Math.min(brands.length - 1, gameState.currentVisualization.brandIndex + direction)
        );
        gameState.currentVisualization.machineIndex = 0;
        updateMachineVisualization();
        playSound('click');
    }

    /**
     * 6.7. Naviguer entre les machines d'une marque
     * @param {number} direction - Direction de navigation (-1 pour précédent, 1 pour suivant)
     */
    function navigateMachines(direction) {
        const brands = Object.values(gameState.brandsData);
        if (brands.length === 0) return;

        const brand = brands[gameState.currentVisualization.brandIndex];
        if (!brand || brand.machines.length === 0) return;

        gameState.currentVisualization.machineIndex = Math.max(0,
            Math.min(brand.machines.length - 1, gameState.currentVisualization.machineIndex + direction)
        );
        updateMachineVisualization();
        playSound('click');
    }

    // =============================================
    // 7. FONCTIONS DE JEU
    // =============================================
    /**
     * 7.1. Passer au mois suivant
     */
    function advanceMonth() {
        gameState.month++;
        if (gameState.month > 12) {
            gameState.month = 1;
            gameState.year++;
        }

        let monthlyProfit = 0;
        let computersProduced = 0;

        gameState.ownedBrands.forEach(brandId => {
            const brand = gameState.brandsData[brandId];
            brand.machines.forEach(machine => {
                const production = gameState.productionData[brand.id][machine.id].production;
                if (production > 0) {
                    const effectiveProduction = Math.floor(
                        production *
                        (machine.stats.reliability / 100) *
                        (machine.stats.popularity / 100)
                    );
                    monthlyProfit += effectiveProduction * machine.stats.profit;
                    computersProduced += effectiveProduction;
                }
            });
        });

        if (Math.random() > 0.8) {
            const bonusProfit = Math.floor(monthlyProfit * 0.2);
            monthlyProfit += bonusProfit;
            print(`[BONUS] Vous avez reçu un bonus de $${bonusProfit.toLocaleString()}!`);
        }

        gameState.cash += monthlyProfit;

        print(`[INFO] Vous avez produit ${computersProduced.toLocaleString()} PC ce mois-ci.`);
        print(`[INFO] Vous avez gagné $${monthlyProfit.toLocaleString()} ce mois-ci.`);

        checkHistoricalEvents();
        checkAchievements();
        updateInterface();
        showMainMenu();
    }

    /**
     * 7.2. Lancer la production d'une machine
     * @param {string} brandId - ID de la marque
     * @param {string} machineId - ID de la machine
     * @param {number} quantity - Quantité à produire
     */
    function buildMachine(brandId, machineId, quantity = 1) {
        const brand = gameState.brandsData[brandId];
        if (!brand) {
            print(`[ERROR] Marque "${brandId}" introuvable.`);
            return;
        }

        if (!gameState.ownedBrands.includes(brandId)) {
            print(`[ERROR] Vous ne possédez pas la marque "${brand.name}".`);
            return;
        }

        const machine = brand.machines.find(m => m.id === machineId || m.name.toLowerCase() === machineId.replace(/_/g, ' '));
        if (!machine) {
            print(`[ERROR] Machine "${machineId}" introuvable pour la marque "${brand.name}".`);
            return;
        }

        gameState.productionData[brand.id][machine.id].production += quantity;
        print(`[SUCCESS] Production de ${quantity} ${machine.name} lancée.`);
        startRealTimeProduction(brand.id, machine.id, quantity);
        updateInterface();
    }

    /**
     * 7.3. Démarrer la production en temps réel
     * @param {string} brandId - ID de la marque
     * @param {string} machineId - ID de la machine
     * @param {number} initialQuantity - Quantité initiale
     */
    function startRealTimeProduction(brandId, machineId, initialQuantity) {
        const brand = gameState.brandsData[brandId];
        const machine = brand.machines.find(m => m.id === machineId);

        if (!machine) return;

        const productionPerSecond = Math.max(1, Math.floor(initialQuantity / 10));
        let currentProduction = 0;

        const updateProduction = () => {
            if (currentProduction >= initialQuantity) {
                print(`[PRODUCTION] ${machine.name}: Production terminée!`);
                return;
            }

            currentProduction += productionPerSecond;
            gameState.totalComputersProduced += productionPerSecond;
            updateInterface();

            setTimeout(updateProduction, 1000);
        };

        print(`[PRODUCTION] ${machine.name}: Production en cours...`);
        updateProduction();
    }

    /**
     * 7.4. Démarrer la production continue
     */
    function startContinuousProduction() {
        setInterval(() => {
            gameState.ownedBrands.forEach(brandId => {
                const brand = gameState.brandsData[brandId];
                brand.machines.forEach(machine => {
                    const production = gameState.productionData[brand.id][machine.id].production;
                    if (production > 0) {
                        const productionPerSecond = Math.max(1, Math.floor(
                            production *
                            (machine.stats.reliability / 100) *
                            (machine.stats.popularity / 100) / 30 / 24 / 60 / 60
                        ));

                        gameState.totalComputersProduced += productionPerSecond;
                        updateInterface();
                    }
                });
            });
        }, 1000);
    }

    /**
     * 7.5. Améliorer une machine
     * @param {string} brandId - ID de la marque
     * @param {string} machineId - ID de la machine
     */
    function upgradeMachine(brandId, machineId) {
        const brand = gameState.brandsData[brandId];
        if (!brand) {
            print(`[ERROR] Marque "${brandId}" introuvable.`);
            return;
        }

        if (!gameState.ownedBrands.includes(brandId)) {
            print(`[ERROR] Vous ne possédez pas la marque "${brand.name}".`);
            return;
        }

        const machine = brand.machines.find(m => m.id === machineId || m.name.toLowerCase() === machineId.replace(/_/g, ' '));
        if (!machine) {
            print(`[ERROR] Machine "${machineId}" introuvable pour la marque "${brand.name}".`);
            return;
        }

        const upgradeCost = 10000;
        if (gameState.cash < upgradeCost) {
            print(`[ERROR] Vous n'avez pas assez d'argent pour améliorer cette machine ($${upgradeCost.toLocaleString()} requis).`);
            return;
        }

        gameState.cash -= upgradeCost;
        machine.stats.reliability = Math.min(100, machine.stats.reliability + 5);
        machine.stats.popularity = Math.min(100, machine.stats.popularity + 5);
        gameState.productionData[brand.id][machine.id].upgrades.push({
            type: "general",
            cost: upgradeCost,
            date: `${gameState.year}-${gameState.month}`
        });

        print(`[SUCCESS] Machine "${machine.name}" améliorée!`);
        print(`- Fiabilité: ${machine.stats.reliability}% (+5%)`);
        print(`- Popularité: ${machine.stats.popularity}% (+5%)`);
        updateInterface();
    }

    /**
     * 7.6. Acheter une marque
     * @param {string} brandId - ID de la marque à acheter
     */
    function buyBrand(brandId) {
        const brand = gameState.brandsData[brandId];
        if (!brand) {
            print(`[ERROR] Marque "${brandId}" introuvable.`);
            return;
        }

        if (gameState.ownedBrands.includes(brandId)) {
            print(`[ERROR] Vous possédez déjà la marque "${brand.name}".`);
            return;
        }

        const price = 500000;
        if (gameState.cash < price) {
            print(`[ERROR] Vous n'avez pas assez d'argent pour acheter "${brand.name}" ($${price.toLocaleString()} requis).`);
            return;
        }

        gameState.cash -= price;
        gameState.ownedBrands.push(brandId);
        print(`[SUCCESS] Vous avez acheté "${brand.name}" pour $${price.toLocaleString()}!`);
        updateInterface();
        playSound('success');
        showBuyScreen();
    }

    /**
     * 7.7. Vendre une marque
     * @param {string} brandId - ID de la marque à vendre
     */
    function sellBrand(brandId) {
        const brand = gameState.brandsData[brandId];
        const sellPrice = 300000;

        if (confirm(`Voulez-vous vraiment vendre ${brand.name} pour $${sellPrice.toLocaleString()}?`)) {
            gameState.cash += sellPrice;
            gameState.ownedBrands = gameState.ownedBrands.filter(id => id !== brandId);

            Object.keys(gameState.productionData[brandId]).forEach(machineId => {
                gameState.productionData[brandId][machineId].production = 0;
            });

            print(`[SUCCESS] Vous avez vendu ${brand.name} pour $${sellPrice.toLocaleString()}`);
            updateInterface();
            showSellScreen();
        }
    }

    /**
     * 7.8. Vérifier les événements historiques
     */
    function checkHistoricalEvents() {
        const currentDate = `${gameState.year}-${String(gameState.month).padStart(2, '0')}`;

        Object.values(gameState.brandsData).forEach(brand => {
            brand.machines.forEach(machine => {
                if (machine.events) {
                    machine.events.forEach(event => {
                        if (event.date === currentDate && !gameState.activeEvents[event.title]) {
                            gameState.activeEvents[event.title] = event;
                            print(`[EVENT] ÉVÉNEMENT HISTORIQUE: ${event.title}`);
                            print(`[INFO] ${event.description}`);

                            if (event.choices && event.choices.length > 0) {
                                print("Choix disponibles:");
                                event.choices.forEach(choice => {
                                    print(`- ${choice.id}) ${choice.description}`);
                                });
                                print("Tapez 'choose <id>' pour faire un choix");
                            }
                        }
                    });
                }
            });
        });
    }

    /**
     * 7.9. Traiter un choix d'événement
     * @param {string} choiceId - ID du choix
     */
    function handleEventChoice(choiceId) {
        const currentDate = `${gameState.year}-${String(gameState.month).padStart(2, '0')}`;
        let eventFound = false;

        Object.values(gameState.brandsData).forEach(brand => {
            brand.machines.forEach(machine => {
                if (machine.events) {
                    machine.events.forEach(event => {
                        if (event.date === currentDate && event.choices) {
                            const choice = event.choices.find(c => c.id == choiceId);
                            if (choice) {
                                eventFound = true;
                                if (choice.effects) {
                                    if (choice.effects.production) {
                                        gameState.productionData[brand.id][machine.id].production = choice.effects.production;
                                    }
                                    if (choice.effects.profit) {
                                        machine.stats.profit = choice.effects.profit;
                                    }
                                }
                                print(`[SUCCESS] Vous avez choisi: ${choice.description}`);
                                updateInterface();
                            }
                        }
                    });
                }
            });
        });

        if (!eventFound) {
            print(`[ERROR] Choix invalide: ${choiceId}`);
        }
    }

    /**
     * 7.10. Vérifier les succès
     */
    function checkAchievements() {
        if (gameState.ownedBrands.length > 0 && !gameState.achievements.firstBrand.unlocked) {
            gameState.achievements.firstBrand.unlocked = true;
            print("[SUCCESS] 🏆 Succès débloqué: Premier pas");
        }

        if (gameState.cash >= 1000000 && !gameState.achievements.millionaire.unlocked) {
            gameState.achievements.millionaire.unlocked = true;
            print("[SUCCESS] 🏆 Succès débloqué: Millionnaire");
        }
    }

    // =============================================
    // 8. GESTION DES SAUVEGARDES
    // =============================================
    /**
     * 8.1. Se connecter avec un nom d'utilisateur
     * @param {string} username - Nom d'utilisateur
     */
    function login(username) {
        if (!username) {
            print('[ERROR] Veuillez spécifier un nom d\'utilisateur');
            return;
        }

        gameState.sessionId = username;
        print(`[SUCCESS] Session démarrée pour ${username}`);

        try {
            const saveData = localStorage.getItem(`retro_factory_save_${username}`);
            if (saveData) {
                const data = JSON.parse(saveData);
                Object.assign(gameState, data);
                print(`[SUCCESS] Partie chargée pour ${username}!`);
                updateInterface();
            }
        } catch (e) {
            print('[ERROR] Erreur lors du chargement de la sauvegarde.');
            console.error(e);
        }
    }

    /**
     * 8.2. Se déconnecter
     */
    function logout() {
        gameState.sessionId = "guest";
        print("[SUCCESS] Session terminée");
    }

    /**
     * 8.3. Sauvegarder la partie
     */
    function saveGame() {
        if (gameState.sessionId === "guest") {
            print("[ERROR] Vous devez être connecté pour sauvegarder");
            return;
        }

        try {
            localStorage.setItem(`retro_factory_save_${gameState.sessionId}`, JSON.stringify(gameState));
            print("[SUCCESS] Partie sauvegardée!");
        } catch (e) {
            print("[ERROR] Erreur lors de la sauvegarde");
            console.error(e);
        }
    }

    /**
     * 8.4. Charger une partie
     */
    function loadGame() {
        if (gameState.sessionId === "guest") {
            print("[ERROR] Vous devez être connecté pour charger une partie");
            return;
        }

        try {
            const saveData = localStorage.getItem(`retro_factory_save_${gameState.sessionId}`);
            if (saveData) {
                const data = JSON.parse(saveData);
                Object.assign(gameState, data);
                print(`[SUCCESS] Partie chargée pour ${gameState.sessionId}!`);
                updateInterface();
            } else {
                print("[ERROR] Aucune sauvegarde trouvée");
            }
        } catch (e) {
            print('[ERROR] Erreur lors du chargement de la sauvegarde.');
            console.error(e);
        }
    }

    /**
     * 8.5. Quitter le jeu
     */
    function exitGame() {
        if (confirm("Voulez-vous vraiment quitter le jeu?")) {
            print("[INFO] Merci d'avoir joué!");
            window.close();
        }
    }

    // =============================================
    // 9. INITIALISATION FINALE DU JEU
    // =============================================
    /**
     * 9.1. Gestion de l'entrée utilisateur
     */
    elements.input.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            const value = elements.input.value.trim();
            if (value) {
                print(`> ${value}`);

                try {
                    await handleCommand(value);
                } catch (error) {
                    console.error("Erreur lors du traitement de la commande:", error);
                    print(`[ERROR] Erreur lors de l'exécution de la commande: ${error.message}`);
                }

                elements.input.value = '';
            }
        }
    });

    /**
     * 9.2. Activation des sons après interaction utilisateur
     */
    document.addEventListener('click', () => {
        gameState.userInteracted = true;
        print("[INFO] Sons activés!");
    }, { once: true });

    /**
     * 9.3. Démarrage du jeu
     */
    startGame();
});