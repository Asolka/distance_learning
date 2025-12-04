/* ============================================================
   ENGLISH QUEST - Script principal
   ============================================================
   Table des matières :
   1. Variables globales & configuration
   2. Initialisation (événements DOM)
   3. Gestion des niveaux (génération, chemins SVG)
   4. Dialogue & navigation
   5. Ritual (date + météo)
   6. Exercices (matching, etc.)
   7. Fonctions utilitaires
   ============================================================ */

/* ============================================================
   1. VARIABLES GLOBALES & CONFIGURATION
   ============================================================ */

// État du joueur
let nomJoueur = '';
let niveauxCompletes = [];
let niveauActuel = 0;
let exerciceTermine = false;

// Mode admin (débloque tout)
let modeAdmin = false;
let konamiIndex = 0;
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

/* ============================================================
   ÉCRAN DE CHARGEMENT
   ============================================================ */
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBar = document.getElementById('loadingBar');
    const loadingBarContainer = document.querySelector('.loading-bar-container');
    const loadingText = document.querySelector('.loading-text');
    const loadingLogo = document.querySelector('.loading-logo');
    const headerLogo = document.getElementById('headerLogo');
    
    let progress = 0;
    const duration = 2000; // 2 secondes
    const interval = 20; // Update every 20ms
    const increment = 100 / (duration / interval);
    
    const loadingInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            loadingBar.style.width = '100%';
            clearInterval(loadingInterval);
            
            // Cacher la barre et le texte
            setTimeout(() => {
                loadingBarContainer.classList.add('hidden');
                loadingText.classList.add('hidden');
                
                // Animer le logo vers le haut
                setTimeout(() => {
                    loadingLogo.classList.add('moving');
                    
                    // Une fois l'animation terminée, cacher l'écran et montrer le header logo
                    setTimeout(() => {
                        headerLogo.classList.add('visible');
                        loadingScreen.classList.add('hidden');
                    }, 800);
                }, 300);
            }, 200);
        } else {
            loadingBar.style.width = progress + '%';
        }
    }, interval);
});

// Configuration des niveaux du jeu
const niveaux = [
    // Ritual d'ouverture
    { id: 0, type: 'ritual', nom: 'Ritual', emoji: '📅' },
    
    // Bloc 1 : Lesson + Exercices
    { id: 1, type: 'cours', nom: 'Lesson 1', emoji: '📖' },
    { id: 2, type: 'exercice', nom: 'Exercise 1.1', emoji: '✏️' },
    { id: 3, type: 'exercice', nom: 'Exercise 1.2', emoji: '✏️' },
    { id: 4, type: 'exercice', nom: 'Exercise 1.3', emoji: '✏️' },
    
    // Bloc 2
    { id: 5, type: 'cours', nom: 'Lesson 2', emoji: '📖' },
    { id: 6, type: 'exercice', nom: 'Exercise 2.1', emoji: '✏️' },
    { id: 7, type: 'exercice', nom: 'Exercise 2.2', emoji: '✏️' },
    { id: 8, type: 'exercice', nom: 'Exercise 2.3', emoji: '✏️' },
    
    // Bloc 3
    { id: 9, type: 'cours', nom: 'Lesson 3', emoji: '📖' },
    { id: 10, type: 'exercice', nom: 'Exercise 3.1', emoji: '✏️' },
    { id: 11, type: 'exercice', nom: 'Exercise 3.2', emoji: '✏️' },
    { id: 12, type: 'exercice', nom: 'Exercise 3.3', emoji: '✏️' },
    
    // Évaluation finale
    { id: 13, type: 'evaluation', nom: 'Evaluation', emoji: '🏆' }
];

// Traductions pour la date
const JOURS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MOIS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ============================================================
   2. INITIALISATION (ÉVÉNEMENTS DOM)
   ============================================================ */

// Références aux éléments DOM
const inputPrenom = document.getElementById('inputPrenom');
const btnCommencer = document.getElementById('btnCommencer');

// Active/désactive le bouton selon le contenu du champ
inputPrenom.addEventListener('input', (e) => {
    btnCommencer.disabled = e.target.value.trim().length === 0;
});

// Permet de valider avec Entrée
inputPrenom.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && inputPrenom.value.trim()) {
        commencerJeu();
    }
});

// Clic sur le bouton "Play!"
btnCommencer.addEventListener('click', commencerJeu);

// Initialiser le speaker de la page d'accueil
document.addEventListener('DOMContentLoaded', () => {
    const texteAccueil = document.getElementById('texteAccueil');
    const toggleAccueil = document.getElementById('toggleAccueil');
    const bubbleAccueil = document.getElementById('bubbleAccueil');
    
    if (texteAccueil) {
        const message = "Hello, Welcome! Passons du temps ensemble pour une leçon d'anglais, tu verras ce sera amusant ! What is your name ?";
        typeWriter(texteAccueil, message);
    }
    
    if (toggleAccueil && bubbleAccueil) {
        toggleAccueil.addEventListener('click', () => {
            bubbleAccueil.classList.toggle('minimized');
            toggleAccueil.textContent = bubbleAccueil.classList.contains('minimized') ? '+' : '-';
            toggleAccueil.title = bubbleAccueil.classList.contains('minimized') ? 'Ouvrir' : 'Reduire';
        });
    }
});

/**
 * Démarre le jeu : cache l'accueil, affiche la carte de progression
 */
function commencerJeu() {
    nomJoueur = inputPrenom.value.trim();
    
    // Masquer le speaker koala de la page d'accueil avec animation
    const speakerAccueil = document.getElementById('speakerAccueil');
    if (speakerAccueil) {
        speakerAccueil.classList.remove('show');
        setTimeout(() => speakerAccueil.remove(), 300);
    }
    
    document.getElementById('pageAccueil').classList.add('cache');
    document.getElementById('carteProgression').style.display = 'block';
    document.getElementById('titreBienvenue').textContent = `Welcome ${nomJoueur}! 🎉`;
    
    genererNiveaux();
}

/* ============================================================
   3. GESTION DES NIVEAUX (GÉNÉRATION, CHEMINS SVG)
   ============================================================ */

/**
 * Génère tous les niveaux sur la carte de progression
 */
function genererNiveaux() {
    const conteneur = document.getElementById('conteneurNiveaux');
    conteneur.innerHTML = '';
    
    // Positions horizontales en alternance
    const positionsX = ['20%', '70%', '40%', '65%'];
    let yPosition = 50;
    const ESPACEMENT_NORMAL = 200;
    const ESPACEMENT_BLOC = 300;
    
    niveaux.forEach((niveau, index) => {
        const div = document.createElement('div');
        div.className = `niveau niveau-${niveau.type}`;
        div.id = `niveau-${niveau.id}`;
        
        // Positionnement selon le type
        if (niveau.type === 'ritual') {
            // Ritual : centré en haut
            div.style.cssText = `left: 50%; top: ${yPosition}px; transform: translateX(-50%)`;
            yPosition += 350;
        } else if (niveau.type === 'evaluation') {
            // Évaluation : centrée en bas
            div.style.cssText = `left: 50%; top: ${yPosition + 200}px; transform: translateX(-50%)`;
        } else {
            // Autres niveaux : alternance gauche/droite
            const posIndex = index % positionsX.length;
            div.style.cssText = `left: ${positionsX[posIndex]}; top: ${yPosition}px; transform: translateX(-50%)`;
            
            // Espacement avant le prochain niveau
            if (index < niveaux.length - 1) {
                const niveauSuivant = niveaux[index + 1];
                yPosition += (niveauSuivant.type === 'cours' || niveauSuivant.type === 'evaluation')
                    ? ESPACEMENT_BLOC
                    : ESPACEMENT_NORMAL;
            }
        }
        
        // Déterminer l'état du niveau
        const estComplete = niveauxCompletes.includes(niveau.id);
        const estProchainNiveau = determinerSiProchainNiveau(niveau, index);
        
        // Appliquer le style et le contenu selon l'état
        if (estComplete) {
            div.classList.add('niveau-complete');
            div.innerHTML = `
                <span class="numero-niveau">${niveau.emoji}</span>
                <span class="nom-niveau">${niveau.nom}</span>
                <div class="icone-complete">✓</div>
            `;
        } else if (estProchainNiveau) {
            div.classList.add('niveau-actif');
            div.innerHTML = `
                <span class="numero-niveau">${niveau.emoji}</span>
                <span class="nom-niveau">${niveau.nom}</span>
            `;
        } else {
            div.classList.add('niveau-verrouille');
            div.innerHTML = `<span class="icone-verrouille">🔒</span>`;
        }
        
        div.addEventListener('click', () => ouvrirNiveau(niveau.id));
        conteneur.appendChild(div);
    });
    
    conteneur.style.minHeight = `${yPosition + 600}px`;
    
    // Dessiner les chemins après un court délai (attendre le rendu)
    setTimeout(dessinerChemins, 100);
}

/**
 * Détermine si un niveau est le prochain à débloquer
 */
function determinerSiProchainNiveau(niveau, index) {
    if (niveau.type === 'ritual') {
        return !niveauxCompletes.includes(0);
    }
    if (niveau.type === 'evaluation') {
        // L'évaluation est disponible si tous les exercices sont terminés
        const idsExercices = niveaux.filter(n => n.type === 'exercice').map(n => n.id);
        return idsExercices.every(id => niveauxCompletes.includes(id));
    }
    // Pour les autres : disponible si tous les précédents sont complétés
    return niveauxCompletes.length === index;
}

/**
 * Dessine les chemins SVG entre les niveaux
 */
function dessinerChemins() {
    const svg = document.getElementById('cheminNiveaux');
    svg.innerHTML = '';
    
    for (let i = 1; i < niveaux.length - 1; i++) {
        const niveauCourant = niveaux[i];
        const niveauSuivant = niveaux[i + 1];
        
        // Pas de chemin vers évaluation ou avant un cours (espace entre blocs)
        if (niveauSuivant.type === 'evaluation' || niveauSuivant.type === 'cours') {
            continue;
        }
        
        const el1 = document.getElementById(`niveau-${niveauCourant.id}`);
        const el2 = document.getElementById(`niveau-${niveauSuivant.id}`);
        
        if (el1 && el2) {
            const rect1 = el1.getBoundingClientRect();
            const rect2 = el2.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();
            
            // Coordonnées centre des niveaux
            const x1 = rect1.left + rect1.width / 2 - svgRect.left;
            const y1 = rect1.top + rect1.height / 2 - svgRect.top;
            const x2 = rect2.left + rect2.width / 2 - svgRect.left;
            const y2 = rect2.top + rect2.height / 2 - svgRect.top;
            
            // Courbe de Bézier avec point de contrôle aléatoire
            const controlX = x1 + (Math.random() - 0.5) * 100;
            const controlY = (y1 + y2) / 2;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`);
            path.setAttribute('stroke', niveauxCompletes.includes(niveauCourant.id) ? '#38ef7d' : '#95a5a6');
            path.setAttribute('stroke-width', '20');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-linecap', 'round');
            path.style.filter = 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))';
            
            svg.appendChild(path);
        }
    }
}

// Redessiner les chemins lors du redimensionnement
window.addEventListener('resize', dessinerChemins);

/* ============================================================
   SYSTÈME ADMIN (Code Konami : ↑↑↓↓←→←→BA)
   ============================================================ */

// Écouter le code Konami
document.addEventListener('keydown', (e) => {
    if (e.key === KONAMI_CODE[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === KONAMI_CODE.length) {
            activerModeAdmin();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

/**
 * Active le mode admin - débloque tous les niveaux
 */
function activerModeAdmin() {
    modeAdmin = true;
    
    // Débloquer tous les niveaux
    niveauxCompletes = niveaux.map(n => n.id);
    
    // Afficher notification
    afficherNotificationAdmin('🔓 Mode Admin activé ! Tous les niveaux débloqués.');
    
    // Régénérer les niveaux
    genererNiveaux();
}

/**
 * Désactive le mode admin - remet tout à zéro
 */
function desactiverModeAdmin() {
    modeAdmin = false;
    niveauxCompletes = [];
    
    afficherNotificationAdmin('🔒 Mode Admin désactivé. Progression réinitialisée.');
    
    genererNiveaux();
}

/**
 * Affiche une notification admin temporaire
 */
function afficherNotificationAdmin(message) {
    // Supprimer notification existante
    const existante = document.querySelector('.admin-notification');
    if (existante) existante.remove();
    
    const notif = document.createElement('div');
    notif.className = 'admin-notification';
    notif.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.appendChild(notif);
    
    // Animation d'entrée
    requestAnimationFrame(() => notif.classList.add('show'));
    
    // Auto-suppression après 4 secondes
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

/**
 * Passe directement au niveau suivant (admin only)
 */
function skipNiveau() {
    if (!modeAdmin) return;
    
    const container = document.getElementById('dialogueContainer');
    container.style.display = 'none';
    removeSpeakerFloat();
    
    completerNiveau(niveauActuel);
}

/* ============================================================
   4. DIALOGUE & NAVIGATION
   ============================================================ */

/**
 * Ouvre un niveau (si débloqué)
 */
function ouvrirNiveau(id) {
    const niveauEl = document.getElementById(`niveau-${id}`);
    
    // Ignorer si verrouillé
    if (niveauEl.classList.contains('niveau-verrouille')) return;
    
    niveauActuel = id;
    exerciceTermine = false;
    
    const niveauData = niveaux.find(n => n.id === id);
    
    // Afficher le contenu selon le type
    switch (niveauData.type) {
        case 'ritual':
            afficherRitual();
            break;
        default:
            afficherDialogue(id);
    }
}

/**
 * Affiche le dialogue pour cours, exercice ou évaluation
 */
function afficherDialogue(niveauId) {
    const container = document.getElementById('dialogueContainer');
    const texteDialogue = document.getElementById('texteDialogue');
    const zoneExercice = document.getElementById('zoneExercice');
    const btnContinuer = document.getElementById('btnContinuer');
    const dialogueBox = document.querySelector('.dialogue-box');
    
    // Ajouter/supprimer bouton skip admin
    let btnSkip = document.querySelector('.btn-skip-admin');
    if (modeAdmin) {
        if (!btnSkip) {
            btnSkip = document.createElement('button');
            btnSkip.className = 'btn-skip-admin';
            btnSkip.textContent = 'Skip ⏭';
            btnSkip.onclick = skipNiveau;
            dialogueBox.appendChild(btnSkip);
        }
    } else if (btnSkip) {
        btnSkip.remove();
    }
    
    const niveau = niveaux.find(n => n.id === niveauId);
    
    // Déterminer quel personnage utiliser
    // Chat pour toutes les leçons et exercices, Professeur Panda uniquement pour le ritual
    const estLeconOuExercice = niveau.type === 'cours' || niveau.type === 'exercice';
    
    if (estLeconOuExercice) {
        changerPersonnage('chat');
    } else {
        changerPersonnage('koala');
    }
    
    // Textes et comportements selon le type
    const contenus = {
        cours: () => {
            if (niveauId === 1) {
                // Leçon 1 : La vie quotidienne
                texteDialogue.textContent = `Parlons de la vie quotidienne !`;
                zoneExercice.style.display = 'block';
                zoneExercice.innerHTML = `
                    <div class="lesson-content">
                        <h3>🌅 La vie quotidienne</h3>
                        
                        <div class="lesson-highlight">
                            <p>Qu'est-ce que la <strong>vie quotidienne</strong> ?</p>
                            <p>Il s'agit de toutes les <strong>actions</strong> que tu fais pendant ta journée !</p>
                        </div>
                        
                        <p>Tu vas apprendre à décrire ces actions <strong>en anglais</strong>. Par exemple :</p>
                        
                        <div class="lesson-example">
                            <div class="example-label">Quelques actions du quotidien</div>
                            <div class="example-comparison">
                                <div class="example-item">
                                    <div class="country">🍽️</div>
                                    <div class="time">Eat</div>
                                </div>
                                <div class="example-item">
                                    <div class="country">😴</div>
                                    <div class="time">Sleep</div>
                                </div>
                                <div class="example-item">
                                    <div class="country">🎮</div>
                                    <div class="time">Play</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="lesson-tip">
                            Ce soir en rentrant chez toi, tu pourras raconter à tes parents ta journée en anglais !
                        </div>
                        
                        <p style="text-align: center; font-size: 1.2em; margin-top: 15px;"><strong>Allons-y ! 🚀</strong></p>
                    </div>
                `;
            } else if (niveauId === 5) {
                // Leçon 2 : Lire l'heure en anglais
                texteDialogue.textContent = `Apprenons ensemble à lire l'heure en anglais !`;
                zoneExercice.style.display = 'block';
                zoneExercice.innerHTML = `
                    <div class="lesson-content">
                        <h3>🕐 L'heure en anglais</h3>
                        
                        <div class="lesson-highlight">
                            <p>En <strong>France</strong>, nous utilisons un système de <strong>24 heures</strong>.</p>
                            <p>En <strong>Angleterre</strong>, c'est un système de <strong>12 heures</strong> !</p>
                        </div>
                        
                        <p>Les anglais ont une manière différente de parler du matin et de l'après-midi. Ils utilisent les abréviations <strong>AM</strong> et <strong>PM</strong>.</p>
                        
                        <div class="lesson-tip">
                            <strong>AM</strong> = le matin, jusqu'à midi<br>
                            Astuce : <strong>A</strong>vant-<strong>M</strong>idi
                        </div>
                        
                        <div class="lesson-tip">
                            <strong>PM</strong> = de midi jusqu'au soir<br>
                            Astuce : <strong>P</strong>assé-<strong>M</strong>idi
                        </div>
                        
                        <div class="lesson-example">
                            <div class="example-label">Exemple : 2h de l'après-midi</div>
                            <div class="example-comparison">
                                <div class="example-item">
                                    <div class="country">🇫🇷 France</div>
                                    <div class="time">14:00</div>
                                </div>
                                <div class="example-item">
                                    <div class="country">🇬🇧 Angleterre</div>
                                    <div class="time">2:00 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (niveauId === 9) {
                // Leçon 3 : Mélange vie quotidienne + heures
                texteDialogue.textContent = `Voici la dernière leçon !`;
                zoneExercice.style.display = 'block';
                zoneExercice.innerHTML = `
                    <div class="lesson-content">
                        <h3>🎯 Le grand mélange !</h3>
                        
                        <div class="lesson-highlight">
                            <p>Maintenant que tu es un <strong>expert</strong> sur la vie quotidienne et les heures anglaises, faisons un <strong>mélange des deux</strong> !</p>
                        </div>
                        
                        <div class="lesson-example">
                            <div class="example-label">Ce que tu as appris</div>
                            <div class="example-comparison">
                                <div class="example-item">
                                    <div class="country">🌅</div>
                                    <div class="time">Vie quotidienne</div>
                                </div>
                                <div class="example-item">
                                    <div class="country">🕐</div>
                                    <div class="time">Heures anglaises</div>
                                </div>
                            </div>
                        </div>
                        
                        <p style="text-align: center; margin-top: 20px;">Je vais te proposer plusieurs exercices mélangeant tout ce que tu viens de voir.</p>
                        
                        <div class="lesson-tip">
                            Tu es prêt ? Montre-moi ce que tu sais faire !
                        </div>
                        
                        <p style="text-align: center; font-size: 1.3em; margin-top: 15px;"><strong>C'est parti ! 🚀</strong></p>
                    </div>
                `;
            } else {
                // Autres leçons : contenu à venir
                texteDialogue.textContent = `${niveau.nom}. Contenu à venir...`;
                zoneExercice.style.display = 'none';
            }
            btnContinuer.style.display = 'block';
            exerciceTermine = true;
            removeSpeakerFloat();
        },
        exercice: () => {
            if (niveauId === 2) {
                // Exercice 1.1 : matching mots/images
                texteDialogue.textContent = `Premier exercice: tu as des images d'actions d'une journée, et les phrases en anglais. Relie la bonne phrase avec la bonne image, à toi de jouer !`;
                afficherExercice1_1();
                exerciceTermine = false;
                removeSpeakerFloat();
                createSpeakerFloat('Monsieur Chat', texteDialogue.textContent, 'chat');
            } else if (niveauId === 3) {
                // Exercice 1.2 : texte à trous
                texteDialogue.textContent = `Deuxième exercice: lis les phrases en anglais et complète la traduction française avec le bon verbe. Clique sur une étiquette puis sur le trou pour la placer !`;
                afficherExercice1_2();
                exerciceTermine = false;
                removeSpeakerFloat();
                createSpeakerFloat('Monsieur Chat', texteDialogue.textContent, 'chat');
            } else if (niveauId === 4) {
                // Exercice 1.3 : drag & drop audio
                texteDialogue.textContent = `Troisième exercice: écoute les phrases en anglais en cliquant sur le bouton, puis fais glisser la bonne image vers le son correspondant !`;
                afficherExercice1_3();
                exerciceTermine = false;
                removeSpeakerFloat();
                createSpeakerFloat('Monsieur Chat', texteDialogue.textContent, 'chat');
            } else if (niveauId === 6) {
                // Exercice 2.1 : AM/PM soleil/lune
                texteDialogue.textContent = `Voyons ensemble si tu as bien compris. Voici un premier exercice ! Tu as des heures anglaises et deux images : un soleil (pour le matin), et une lune (pour l'après-midi). Clique sur la bonne image en fonction de l'heure, est-ce le matin ou l'après-midi ?`;
                afficherExercice2_1();
                exerciceTermine = false;
                removeSpeakerFloat();
                createSpeakerFloat('Monsieur Chat', texteDialogue.textContent, 'chat');
            } else if (niveauId === 7) {
                // Exercice 2.2 : Audio AM/PM
                texteDialogue.textContent = `Augmente le son de ton appareil numérique et sois attentif ! Voyons ensemble si tu as compris la différence entre heure française et heure anglaise. Tu vas entendre des phrases françaises (avec l'heure en français!). Tu as ensuite des cases avec les abréviations AM et PM. À toi de cocher la bonne case en fonction de ce que tu entends en français !`;
                afficherExercice2_2();
                exerciceTermine = false;
                removeSpeakerFloat();
                createSpeakerFloat('Monsieur Chat', texteDialogue.textContent, 'chat');
            } else if (niveauId === 8) {
                // Exercice 2.3 : Frise chronologique
                texteDialogue.textContent = `Associons les heures anglaises au temps de la journée ! Regarde bien la frise devant toi. Elle est séparée en deux avec un côté AM et un côté PM ! Tu as des petites vignettes avec l'heure anglaise. À toi de placer les heures anglaises au bon endroit sur la frise. Sois le plus précis possible !`;
                afficherExercice2_3();
                exerciceTermine = false;
                removeSpeakerFloat();
                createSpeakerFloat('Monsieur Chat', texteDialogue.textContent, 'chat');
            } else {
                // Exercices non implémentés
                texteDialogue.textContent = `Exercice ${niveau.nom}. Contenu à venir...`;
                zoneExercice.style.display = 'none';
                btnContinuer.style.display = 'block';
                exerciceTermine = true;
                removeSpeakerFloat();
                createSpeakerFloat('Monsieur Chat', texteDialogue.textContent, 'chat');
            }
        },
        evaluation: () => {
            texteDialogue.textContent = "Évaluation finale à venir...";
            zoneExercice.style.display = 'none';
            btnContinuer.style.display = 'block';
            exerciceTermine = true;
            removeSpeakerFloat();
        }
    };
    
    // Exécuter le contenu correspondant
    contenus[niveau.type]?.();
    container.style.display = 'flex';
}

// Bouton "Continuer" : ferme le dialogue et valide le niveau
document.getElementById('btnContinuer').addEventListener('click', () => {
    const container = document.getElementById('dialogueContainer');
    const btnContinuer = document.getElementById('btnContinuer');
    
    container.style.display = 'none';
    removeSpeakerFloat();
    btnContinuer.textContent = 'Continue →';
    
    if (exerciceTermine) {
        completerNiveau(niveauActuel);
    }
});

// Bouton "Retour" : ferme le dialogue sans valider
document.getElementById('btnRetour').addEventListener('click', () => {
    const container = document.getElementById('dialogueContainer');
    const zoneExercice = document.getElementById('zoneExercice');
    const btnContinuer = document.getElementById('btnContinuer');
    
    container.style.display = 'none';
    removeSpeakerFloat();
    
    // Réinitialiser l'interface
    zoneExercice.style.display = 'none';
    zoneExercice.innerHTML = '';
    btnContinuer.style.display = 'none';
    btnContinuer.textContent = 'Continue →';
});

/**
 * Marque un niveau comme terminé
 */
function completerNiveau(id) {
    if (!niveauxCompletes.includes(id)) {
        niveauxCompletes.push(id);
        
        // Si c'est le ritual (id 0), afficher le message du koala
        if (id === 0) {
            afficherMessagePanda();
        } else {
            genererNiveaux();
        }
    }
}

/**
 * Affiche le message central du koala après le ritual
 */
function afficherMessagePanda() {
    const overlay = document.createElement('div');
    overlay.className = 'koala-message-overlay';
    overlay.id = 'koalaMessageOverlay';
    
    overlay.innerHTML = `
        <div class="koala-message-box">
            <div class="personnage-dialogue">
                <img src="assets/koala.png" alt="Professeur Panda">
            </div>
            <div class="bubble">
                <div class="nom-personnage">Professeur Panda</div>
                <div class="texte-dialogue">
                    On va travailler ensemble aujourd'hui sur deux thèmes qui te concernent ! 
                    On parlera de la vie quotidienne, de ce que tu fais toute la journée ! 
                    Ensuite, on apprendra ensemble à lire l'heure anglaise ! 
                    C'est parti ! Je laisse la parole à Monsieur Chat pour t'expliquer la première leçon ! 
                    A bientôt !
                </div>
                <button class="bouton-continuer" id="btnPandaContinuer">Continue →</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Animation d'apparition
    requestAnimationFrame(() => overlay.classList.add('show'));
    
    // Événement sur le bouton continuer
    document.getElementById('btnPandaContinuer').addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.remove();
            genererNiveaux();
        }, 400);
    });
}

/**
 * Ferme le dialogue sans valider
 */
function fermerDialogue() {
    document.getElementById('dialogueContainer').style.display = 'none';
    removeSpeakerFloat();
}

/* ============================================================
   5. RITUAL (DATE + MÉTÉO)
   ============================================================ */

/**
 * Affiche l'écran du ritual quotidien
 */
function afficherRitual() {
    const container = document.getElementById('dialogueContainer');
    const zoneExercice = document.getElementById('zoneExercice');
    const texteDialogue = document.getElementById('texteDialogue');
    const btnContinuer = document.getElementById('btnContinuer');
    const dialogueBox = document.querySelector('.dialogue-box');
    
    // Utiliser le koala pour le ritual
    changerPersonnage('koala');
    
    // Ajouter/supprimer bouton skip admin
    let btnSkip = document.querySelector('.btn-skip-admin');
    if (modeAdmin) {
        if (!btnSkip) {
            btnSkip = document.createElement('button');
            btnSkip.className = 'btn-skip-admin';
            btnSkip.textContent = 'Skip ⏭';
            btnSkip.onclick = skipNiveau;
            dialogueBox.appendChild(btnSkip);
        }
    } else if (btnSkip) {
        btnSkip.remove();
    }
    
    // Date du jour
    const aujourdhui = new Date();
    const jourActuel = JOURS[aujourdhui.getDay() === 0 ? 6 : aujourdhui.getDay() - 1];
    const dateActuelle = aujourdhui.getDate();
    const moisActuel = MOIS[aujourdhui.getMonth()];
    
    // Sauvegarder pour la vérification
    window.dateActuelle = {
        jour: jourActuel,
        date: dateActuelle,
        mois: moisActuel,
        suffixe: getSuffixe(dateActuelle)
    };
    
    texteDialogue.textContent = "Avant de commencer la séance, dis moi la date du jour ! Choisis le jour, le numéro d'aujourd'hui, le suffixe et le mois ! Ensuite, dis moi, quel temps fait-il aujourd'hui?";
    zoneExercice.style.display = 'block';
    btnContinuer.style.display = 'none';
    
    // Générer le HTML du ritual
    zoneExercice.innerHTML = genererHTMLRitual();
    
    // Afficher le speaker flottant avec le koala
    removeSpeakerFloat();
    createSpeakerFloat('Professeur Panda', texteDialogue.textContent, 'koala');
    container.style.display = 'flex';
}

/**
 * Génère le HTML pour les sélecteurs de date et météo
 */
function genererHTMLRitual() {
    // Options pour les selects
    const optionsJours = JOURS.map(j => `<option value="${j}">${j}</option>`).join('');
    const optionsDates = Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
    const optionsSuffixes = ['st', 'nd', 'rd', 'th'].map(s => `<option value="${s}">${s}</option>`).join('');
    const optionsMois = MOIS.map(m => `<option value="${m}">${m}</option>`).join('');
    
    // Options météo
    const meteos = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'];
    const meteosHTML = meteos.map(m => `
        <div class="meteo-option" role="button" tabindex="0" 
             onclick="selectionnerMeteo(this)" 
             onkeydown="if(event.key==='Enter'||event.key===' ') selectionnerMeteo(this)">
            <img src="assets/${m}.png" alt="${m}">
            <span class="meteo-label">${m.charAt(0).toUpperCase() + m.slice(1)}</span>
        </div>
    `).join('');
    
    return `
        <div class="ritual-container">
            <div class="ritual-titre">What's the date today?</div>
            <div class="date-selecteurs">
                <select id="selectJour"><option value="">Day</option>${optionsJours}</select>
                <span class="virgule">,</span>
                <select id="selectDate"><option value="">-</option>${optionsDates}</select>
                <select id="selectSuffixe"><option value="">-</option>${optionsSuffixes}</select>
                <select id="selectMois"><option value="">Month</option>${optionsMois}</select>
            </div>
            <div id="messageDate"></div>
            
            <div class="meteo-container">
                <div class="meteo-titre">What's the weather like today?</div>
                <div class="meteo-options">${meteosHTML}</div>
            </div>
            
            <button class="bouton-valider-date" onclick="verifierDate()">Vérifier !</button>
        </div>
    `;
}

/**
 * Retourne le suffixe ordinal anglais (st, nd, rd, th)
 */
function getSuffixe(date) {
    if (date >= 11 && date <= 13) return 'th';
    switch (date % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

/**
 * Sélectionne une option météo
 */
function selectionnerMeteo(el) {
    if (!el) return;
    
    const options = el.closest('.meteo-options')?.querySelectorAll('.meteo-option');
    if (!options) return;
    
    // Désélectionner toutes les options
    options.forEach(opt => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-pressed', 'false');
    });
    
    // Sélectionner l'option cliquée
    el.classList.add('selected');
    el.setAttribute('aria-pressed', 'true');
    
    // Sauvegarder la sélection
    const label = el.querySelector('.meteo-label');
    window.selectedMeteo = label?.textContent.trim() || null;
}

/**
 * Vérifie la date saisie par l'utilisateur
 */
function verifierDate() {
    const selects = {
        jour: document.getElementById('selectJour'),
        date: document.getElementById('selectDate'),
        suffixe: document.getElementById('selectSuffixe'),
        mois: document.getElementById('selectMois')
    };
    const messageDiv = document.getElementById('messageDate');
    
    // Vérifier que la météo est sélectionnée
    if (!window.selectedMeteo) {
        messageDiv.innerHTML = creerMessageFeedback('warning', '⚠️ Please select the weather before checking!');
        return;
    }
    
    // Valeurs saisies
    const valeurs = {
        jour: selects.jour.value,
        date: parseInt(selects.date.value),
        suffixe: selects.suffixe.value,
        mois: selects.mois.value
    };
    
    // Vérifier chaque champ
    let toutCorrect = true;
    const corrections = {
        jour: valeurs.jour === window.dateActuelle.jour,
        date: valeurs.date === window.dateActuelle.date,
        suffixe: valeurs.suffixe === window.dateActuelle.suffixe,
        mois: valeurs.mois === window.dateActuelle.mois
    };
    
    // Appliquer les classes correct/incorrect
    Object.keys(selects).forEach(key => {
        selects[key].classList.remove('correct', 'incorrect');
        selects[key].classList.add(corrections[key] ? 'correct' : 'incorrect');
        if (!corrections[key]) toutCorrect = false;
    });
    
    // Afficher le résultat
    if (toutCorrect) {
        messageDiv.innerHTML = creerMessageFeedback('success', "🎉 Perfect!");
        exerciceTermine = true;
        setTimeout(() => {
            document.getElementById('btnContinuer').style.display = 'block';
        }, 800);
    } else {
        messageDiv.innerHTML = creerMessageFeedback('error', '❌ Quelque chose ne va pas, essaye encore !');
    }
}

/**
 * Crée un message de feedback stylisé
 */
function creerMessageFeedback(type, texte) {
    const couleurs = {
        success: '#2ecc71, #27ae60',
        error: '#e74c3c, #c0392b',
        warning: '#f39c12, #f1c40f'
    };
    return `<div class="message-date" style="background: linear-gradient(135deg, ${couleurs[type]}); color: white;">${texte}</div>`;
}

/* ============================================================
   6. EXERCICES (MATCHING, ETC.)
   ============================================================ */

/**
 * Exercice 1.1 : relier les mots aux images
 */
function afficherExercice1_1() {
    const zoneExercice = document.getElementById('zoneExercice');
    const btnContinuer = document.getElementById('btnContinuer');
    
    zoneExercice.style.display = 'block';
    btnContinuer.style.display = 'none';
    
    // Paires mot/image
    const pairs = [
        { key: 'eat', word: 'Eat', img: 'assets/eat.png' },
        { key: 'sleep', word: 'Sleep', img: 'assets/sleep.png' },
        { key: 'work', word: 'Work', img: 'assets/work.png' },
        { key: 'wake', word: 'Wake up', img: 'assets/wake.png' },
        { key: 'play', word: 'Play', img: 'assets/play.png' },
        { key: 'brush', word: 'Brush my teeth', img: 'assets/brush.png' }
    ];
    
    // Mélanger les éléments
    const shuffledPairs = shuffle([...pairs]);
    const leftImages = shuffledPairs.slice(0, 3);
    const rightImages = shuffledPairs.slice(3, 6);
    const words = shuffle([...pairs]);
    
    // Structure HTML
    zoneExercice.innerHTML = `
        <div class="match-container">
            <div class="match-left"></div>
            <div class="match-center"></div>
            <div class="match-right"></div>
        </div>
        <div id="messageMatch" class="message-match"></div>
    `;
    
    const leftCol = zoneExercice.querySelector('.match-left');
    const centerCol = zoneExercice.querySelector('.match-center');
    const rightCol = zoneExercice.querySelector('.match-right');
    const messageDiv = document.getElementById('messageMatch');
    
    // Créer les blocs image et mot
    leftImages.forEach(p => leftCol.appendChild(creerBlocImage(p)));
    words.forEach(p => centerCol.appendChild(creerBlocMot(p)));
    rightImages.forEach(p => rightCol.appendChild(creerBlocImage(p)));
    
    // État du matching - peut sélectionner soit un mot soit une image en premier
    let selectedElement = null;
    let selectedType = null; // 'word' ou 'image'
    const matchedKeys = new Set();
    const total = pairs.length;
    
    /**
     * Tente de faire correspondre un mot et une image
     */
    function tryMatch(wordEl, imageEl) {
        const wordKey = wordEl.dataset.key;
        const imageKey = imageEl.dataset.key;
        
        if (matchedKeys.has(wordKey) || matchedKeys.has(imageKey)) return;
        
        if (wordKey === imageKey) {
            // Bonne réponse
            matchedKeys.add(wordKey);
            wordEl.classList.add('matched');
            imageEl.classList.add('matched');
            
            if (matchedKeys.size === total) {
                exerciceTermine = true;
                messageDiv.innerHTML = creerMessageFeedback('success', '🎉 Perfect!');
                setTimeout(() => btnContinuer.style.display = 'block', 400);
            }
        } else {
            // Mauvaise réponse
            wordEl.classList.add('match-wrong');
            imageEl.classList.add('match-wrong');
            setTimeout(() => {
                wordEl.classList.remove('match-wrong');
                imageEl.classList.remove('match-wrong');
            }, 600);
        }
    }
    
    /**
     * Désélectionne l'élément actuel
     */
    function clearSelection() {
        if (selectedElement) {
            selectedElement.classList.remove('selected');
            selectedElement = null;
            selectedType = null;
        }
    }
    
    // Événements sur les mots
    zoneExercice.querySelectorAll('.match-word').forEach(wordEl => {
        wordEl.addEventListener('click', () => {
            if (matchedKeys.has(wordEl.dataset.key)) return;
            
            if (selectedType === 'image') {
                // Une image est déjà sélectionnée, on tente le match
                tryMatch(wordEl, selectedElement);
                clearSelection();
            } else if (selectedType === 'word' && selectedElement === wordEl) {
                // Clic sur le même mot : désélectionner
                clearSelection();
            } else {
                // Sélectionner ce mot
                clearSelection();
                selectedElement = wordEl;
                selectedType = 'word';
                wordEl.classList.add('selected');
            }
        });
    });
    
    // Événements sur les images
    zoneExercice.querySelectorAll('.match-image').forEach(imageEl => {
        imageEl.addEventListener('click', () => {
            if (matchedKeys.has(imageEl.dataset.key)) return;
            
            if (selectedType === 'word') {
                // Un mot est déjà sélectionné, on tente le match
                tryMatch(selectedElement, imageEl);
                clearSelection();
            } else if (selectedType === 'image' && selectedElement === imageEl) {
                // Clic sur la même image : désélectionner
                clearSelection();
            } else {
                // Sélectionner cette image
                clearSelection();
                selectedElement = imageEl;
                selectedType = 'image';
                imageEl.classList.add('selected');
            }
        });
    });
}

/**
 * Crée un bloc image pour le matching
 */
function creerBlocImage(pair) {
    const div = document.createElement('div');
    div.className = 'match-image';
    div.dataset.key = pair.key;
    div.tabIndex = 0;
    
    const img = document.createElement('img');
    img.src = pair.img;
    img.alt = pair.key;
    div.appendChild(img);
    
    return div;
}

/**
 * Crée un bloc mot pour le matching
 */
function creerBlocMot(pair) {
    const div = document.createElement('div');
    div.className = 'match-word';
    div.dataset.key = pair.key;
    div.tabIndex = 0;
    
    const txt = document.createElement('div');
    txt.className = 'word-text';
    txt.textContent = pair.word;
    div.appendChild(txt);
    
    return div;
}

/**
 * Exercice 1.2 : Texte à trous - compléter les traductions françaises
 */
function afficherExercice1_2() {
    const zoneExercice = document.getElementById('zoneExercice');
    const btnContinuer = document.getElementById('btnContinuer');
    
    zoneExercice.style.display = 'block';
    btnContinuer.style.display = 'none';
    
    // Phrases avec leurs traductions et le verbe attendu
    const phrases = [
        { english: "I wake up at 7.", french: "Je me _ à 7h.", answer: "lève" },
        { english: "I brush my teeth.", french: "Je me _ les dents.", answer: "brosse" },
        { english: "I eat my breakfast in the morning.", french: "Je _ mon petit-déjeuner le matin.", answer: "mange" },
        { english: "I do my homework after school.", french: "Je _ mes devoirs après l'école.", answer: "fais" },
        { english: "I play a game with my friends.", french: "Je _ à un jeu avec mes amis.", answer: "joue" },
        { english: "I watch TV with my family.", french: "Je _ la télé avec ma famille.", answer: "regarde" },
        { english: "I take a shower after sport.", french: "Je _ une douche après le sport.", answer: "prends" }
    ];
    
    // Verbes disponibles (mélangés)
    const verbes = shuffle(["mange", "joue", "brosse", "prends", "regarde", "lève", "fais"]);
    
    // Construire le HTML
    let phrasesHTML = '';
    phrases.forEach((p, index) => {
        // Découper la phrase française autour du "_"
        const parts = p.french.split('_');
        phrasesHTML += `
            <div class="fill-phrase" data-index="${index}" data-answer="${p.answer}">
                <div class="fill-english">${p.english}</div>
                <div class="fill-french">
                    <span>${parts[0]}</span>
                    <span class="fill-gap" data-index="${index}"></span>
                    <span>${parts[1]}</span>
                </div>
            </div>
        `;
    });
    
    let labelsHTML = verbes.map(v => `
        <div class="fill-label" data-verb="${v}">${v}</div>
    `).join('');
    
    zoneExercice.innerHTML = `
        <div class="fill-container">
            ${phrasesHTML}
        </div>
        <div class="fill-labels" id="fillLabels">
            ${labelsHTML}
        </div>
        <button class="ampm-verify-btn" id="btnVerifierFill">Vérifier ✓</button>
        <div id="messageFill" class="message-match"></div>
    `;
    
    // État de l'exercice
    let selectedLabel = null;
    const messageDiv = document.getElementById('messageFill');
    const labelsContainer = document.getElementById('fillLabels');
    
    // Événements sur les étiquettes
    zoneExercice.querySelectorAll('.fill-label').forEach(label => {
        label.addEventListener('click', () => {
            if (label.classList.contains('used')) return;
            
            // Désélectionner l'ancienne étiquette
            if (selectedLabel) {
                selectedLabel.classList.remove('selected');
            }
            
            // Sélectionner ou désélectionner
            if (selectedLabel === label) {
                selectedLabel = null;
            } else {
                selectedLabel = label;
                label.classList.add('selected');
            }
        });
    });
    
    // Événements sur les trous
    zoneExercice.querySelectorAll('.fill-gap').forEach(gap => {
        gap.addEventListener('click', () => {
            const index = parseInt(gap.dataset.index);
            
            // Si le trou est déjà validé correct, ne rien faire
            if (gap.classList.contains('correct')) return;
            
            // Si aucune étiquette sélectionnée, ne rien faire
            if (!selectedLabel) return;
            
            const verb = selectedLabel.dataset.verb;
            
            // Si le trou contient déjà un verbe, le remettre dans les étiquettes
            if (gap.textContent) {
                const oldVerb = gap.textContent;
                const oldLabel = zoneExercice.querySelector(`.fill-label[data-verb="${oldVerb}"]`);
                if (oldLabel) {
                    oldLabel.classList.remove('used');
                }
            }
            
            // Placer le verbe dans le trou
            gap.textContent = verb;
            gap.classList.add('filled');
            gap.classList.remove('wrong');
            
            // Marquer l'étiquette comme utilisée
            selectedLabel.classList.add('used');
            selectedLabel.classList.remove('selected');
            selectedLabel = null;
        });
    });
    
    // Bouton vérifier
    document.getElementById('btnVerifierFill').addEventListener('click', () => {
        let toutCorrect = true;
        let toutRempli = true;
        
        zoneExercice.querySelectorAll('.fill-gap').forEach(gap => {
            // Si déjà validé, passer
            if (gap.classList.contains('correct')) return;
            
            const index = parseInt(gap.dataset.index);
            const answer = phrases[index].answer;
            const verb = gap.textContent;
            
            // Retirer les classes d'erreur
            gap.classList.remove('wrong');
            gap.closest('.fill-phrase').classList.remove('error');
            
            if (!verb) {
                // Pas de verbe placé
                toutRempli = false;
                toutCorrect = false;
                gap.closest('.fill-phrase').classList.add('error');
            } else if (verb === answer) {
                // Bonne réponse
                gap.classList.add('correct');
            } else {
                // Mauvaise réponse
                gap.classList.add('wrong');
                gap.closest('.fill-phrase').classList.add('error');
                toutCorrect = false;
                
                // Remettre le verbe dans les étiquettes après l'animation
                const oldLabel = zoneExercice.querySelector(`.fill-label[data-verb="${verb}"]`);
                setTimeout(() => {
                    gap.textContent = '';
                    gap.classList.remove('filled', 'wrong');
                    gap.closest('.fill-phrase')?.classList.remove('error');
                    if (oldLabel) {
                        oldLabel.classList.remove('used');
                    }
                }, 600);
            }
        });
        
        // Vérifier si tout est validé
        const totalGaps = zoneExercice.querySelectorAll('.fill-gap').length;
        const correctGaps = zoneExercice.querySelectorAll('.fill-gap.correct').length;
        
        if (!toutRempli) {
            messageDiv.innerHTML = creerMessageFeedback('warning', '⚠️ Remplis tous les trous avant de vérifier !');
        } else if (correctGaps === totalGaps) {
            messageDiv.innerHTML = creerMessageFeedback('success', '🎉 Perfect!');
            exerciceTermine = true;
            setTimeout(() => btnContinuer.style.display = 'block', 400);
        } else if (toutCorrect) {
            messageDiv.innerHTML = creerMessageFeedback('success', '🎉 Perfect!');
            exerciceTermine = true;
            setTimeout(() => btnContinuer.style.display = 'block', 400);
        } else {
            messageDiv.innerHTML = creerMessageFeedback('error', '❌ Certaines réponses sont incorrectes, essaye encore !');
        }
    });
}

/**
 * Exercice 1.3 : Drag & Drop Audio - Associer sons et images
 */
function afficherExercice1_3() {
    const zoneExercice = document.getElementById('zoneExercice');
    const btnContinuer = document.getElementById('btnContinuer');
    
    zoneExercice.style.display = 'block';
    btnContinuer.style.display = 'none';
    
    // Associations son -> image
    const associations = [
        { sound: '1.3_brush', image: 'brush' },
        { sound: '1.3_playf', image: 'playf' },
        { sound: '1.3_school', image: 'school' },
        { sound: '1.3_story', image: 'story' },
        { sound: '1.3_toys', image: 'play' },
        { sound: '1.3_watch', image: 'tv' }
    ];
    
    // Mélanger les sons et les images séparément
    const soundsShuffled = shuffle([...associations]);
    const imagesShuffled = shuffle([...associations]);
    
    // Créer le HTML des zones de drop (avec boutons audio)
    let rowsHTML = soundsShuffled.map((item, index) => `
        <div class="audio-match-row" data-sound="${item.sound}" data-expected="${item.image}">
            <button class="audio-btn" data-sound="${item.sound}" title="Écouter">
                🔊
            </button>
            <div class="drop-zone" data-sound="${item.sound}"></div>
        </div>
    `).join('');
    
    // Créer le HTML des images draggables
    let imagesHTML = imagesShuffled.map(item => `
        <div class="drag-image" draggable="true" data-image="${item.image}">
            <img src="assets/${item.image}.png" alt="${item.image}">
        </div>
    `).join('');
    
    zoneExercice.innerHTML = `
        <div class="audio-match-container">
            ${rowsHTML}
        </div>
        <div class="drag-images-container" id="dragImagesContainer">
            ${imagesHTML}
        </div>
        <div id="messageAudioMatch" class="message-match"></div>
    `;
    
    // Fixer la hauteur de la zone exercice pour éviter le redimensionnement
    zoneExercice.style.minHeight = zoneExercice.offsetHeight + 'px';
    
    const messageDiv = document.getElementById('messageAudioMatch');
    const dragContainer = document.getElementById('dragImagesContainer');
    let correctCount = 0;
    const total = associations.length;
    
    // Audio actuellement en cours
    let currentAudio = null;
    
    // Événements sur les boutons audio
    zoneExercice.querySelectorAll('.audio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const soundName = btn.dataset.sound;
            
            // Arrêter l'audio en cours
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                document.querySelectorAll('.audio-btn').forEach(b => b.classList.remove('playing'));
            }
            
            // Jouer le nouveau son
            currentAudio = new Audio(`sounds/${soundName}.wav`);
            btn.classList.add('playing');
            
            currentAudio.play();
            currentAudio.onended = () => {
                btn.classList.remove('playing');
            };
        });
    });
    
    // Drag & Drop
    let draggedElement = null;
    
    // Événements sur les images draggables
    zoneExercice.querySelectorAll('.drag-image').forEach(img => {
        img.addEventListener('dragstart', (e) => {
            // Ne pas permettre de drag si dans une zone correcte
            const parentZone = img.closest('.drop-zone');
            if (parentZone && parentZone.classList.contains('correct')) {
                e.preventDefault();
                return;
            }
            
            draggedElement = img;
            img.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        img.addEventListener('dragend', () => {
            if (draggedElement) {
                draggedElement.classList.remove('dragging');
                draggedElement = null;
            }
            // Retirer tous les drag-over
            zoneExercice.querySelectorAll('.drop-zone').forEach(zone => {
                zone.classList.remove('drag-over');
            });
        });
    });
    
    // Événements sur les drop zones
    zoneExercice.querySelectorAll('.drop-zone').forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!zone.classList.contains('correct')) {
                zone.classList.add('drag-over');
            }
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            if (!draggedElement || zone.classList.contains('correct')) return;
            
            const imageKey = draggedElement.dataset.image;
            const row = zone.closest('.audio-match-row');
            const expectedImage = row.dataset.expected;
            
            // Si la zone contient déjà une image, la remettre dans le conteneur
            const existingImage = zone.querySelector('.drag-image');
            if (existingImage) {
                dragContainer.appendChild(existingImage);
                // Si c'était correct, décrémenter le compteur
                if (zone.classList.contains('correct')) {
                    correctCount--;
                }
                zone.classList.remove('correct', 'wrong');
            }
            
            // Placer l'image dans la zone
            zone.appendChild(draggedElement);
            
            // Vérifier si c'est correct
            if (imageKey === expectedImage) {
                zone.classList.add('correct');
                zone.classList.remove('wrong');
                correctCount++;
                
                // Vérifier si tout est complété
                if (correctCount === total) {
                    exerciceTermine = true;
                    messageDiv.innerHTML = creerMessageFeedback('success', '🎉 Perfect!');
                    setTimeout(() => btnContinuer.style.display = 'block', 400);
                }
            } else {
                zone.classList.add('wrong');
                
                // Remettre l'image dans le conteneur après l'animation
                setTimeout(() => {
                    zone.classList.remove('wrong');
                    if (zone.contains(draggedElement)) {
                        dragContainer.appendChild(draggedElement);
                    }
                }, 600);
            }
            
            draggedElement.classList.remove('dragging');
            draggedElement = null;
        });
    });
    
    // Permettre de remettre une image dans le conteneur
    dragContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    dragContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedElement) {
            // Vérifier si l'image vient d'une zone correcte
            const parentZone = draggedElement.closest('.drop-zone');
            if (parentZone && parentZone.classList.contains('correct')) {
                return; // Ne pas permettre de retirer une image correcte
            }
            
            if (parentZone) {
                parentZone.classList.remove('correct', 'wrong');
            }
            dragContainer.appendChild(draggedElement);
            draggedElement.classList.remove('dragging');
            draggedElement = null;
        }
    });
}

/**
 * Exercice 2.1 : AM/PM - Soleil ou Lune
 */
function afficherExercice2_1() {
    const zoneExercice = document.getElementById('zoneExercice');
    const btnContinuer = document.getElementById('btnContinuer');
    
    zoneExercice.style.display = 'block';
    btnContinuer.style.display = 'none';
    
    // Heures à afficher avec leur réponse (am = soleil, pm = lune)
    const heures = [
        { time: '5:00 PM', answer: 'pm' },
        { time: '10:00 PM', answer: 'pm' },
        { time: '8:00 AM', answer: 'am' },
        { time: '7:00 PM', answer: 'pm' },
        { time: '12:00 PM', answer: 'pm' },
        { time: '11:00 AM', answer: 'am' },
        { time: '9:00 AM', answer: 'am' },
        { time: '10:00 AM', answer: 'am' },
        { time: '8:00 PM', answer: 'pm' },
        { time: '12:00 AM', answer: 'am' }
    ];
    
    // Mélanger les heures
    const heuresMelangees = shuffle([...heures]);
    
    // Construire le HTML
    let rowsHTML = heuresMelangees.map((h, index) => `
        <div class="ampm-row" data-index="${index}" data-answer="${h.answer}">
            <div class="ampm-time">${h.time}</div>
            <div class="ampm-choices">
                <div class="ampm-choice" data-choice="am" tabindex="0">
                    <img src="assets/sun.png" alt="Matin (AM)">
                </div>
                <div class="ampm-choice" data-choice="pm" tabindex="0">
                    <img src="assets/moon.png" alt="Après-midi (PM)">
                </div>
            </div>
        </div>
    `).join('');
    
    zoneExercice.innerHTML = `
        <div class="ampm-container">
            ${rowsHTML}
        </div>
        <button class="ampm-verify-btn" id="btnVerifierAmPm">Vérifier ✓</button>
        <div id="messageAmPm" class="message-match"></div>
    `;
    
    const messageDiv = document.getElementById('messageAmPm');
    
    // Événements sur les choix (soleil/lune)
    zoneExercice.querySelectorAll('.ampm-choice').forEach(choice => {
        choice.addEventListener('click', () => {
            const row = choice.closest('.ampm-row');
            
            // Si déjà validé correct, ne rien faire
            if (row.classList.contains('validated')) return;
            
            // Désélectionner les autres choix de cette ligne
            row.querySelectorAll('.ampm-choice').forEach(c => {
                c.classList.remove('selected', 'wrong');
            });
            row.classList.remove('error');
            
            // Sélectionner ce choix
            choice.classList.add('selected');
        });
    });
    
    // Bouton vérifier
    document.getElementById('btnVerifierAmPm').addEventListener('click', () => {
        let toutCorrect = true;
        let toutRempli = true;
        
        zoneExercice.querySelectorAll('.ampm-row').forEach(row => {
            // Si déjà validé correct, on passe
            if (row.classList.contains('validated')) return;
            
            const answer = row.dataset.answer;
            const selected = row.querySelector('.ampm-choice.selected');
            
            // Réinitialiser les classes d'erreur
            row.querySelectorAll('.ampm-choice').forEach(c => {
                c.classList.remove('wrong');
            });
            row.classList.remove('error');
            
            if (!selected) {
                // Pas de sélection
                toutRempli = false;
                toutCorrect = false;
                row.classList.add('error');
            } else if (selected.dataset.choice === answer) {
                // Bonne réponse - on la valide définitivement
                selected.classList.remove('selected');
                selected.classList.add('correct');
                row.classList.add('validated');
            } else {
                // Mauvaise réponse - on montre l'erreur mais on laisse modifiable
                selected.classList.add('wrong');
                row.classList.add('error');
                toutCorrect = false;
                
                // Retirer la classe wrong après l'animation pour permettre de re-sélectionner
                setTimeout(() => {
                    selected.classList.remove('wrong', 'selected');
                }, 600);
            }
        });
        
        // Vérifier si tout est validé
        const totalRows = zoneExercice.querySelectorAll('.ampm-row').length;
        const validatedRows = zoneExercice.querySelectorAll('.ampm-row.validated').length;
        
        if (!toutRempli) {
            messageDiv.innerHTML = creerMessageFeedback('warning', '⚠️ Sélectionne une réponse pour chaque heure !');
        } else if (validatedRows === totalRows) {
            messageDiv.innerHTML = creerMessageFeedback('success', '🎉 Perfect!');
            exerciceTermine = true;
            setTimeout(() => btnContinuer.style.display = 'block', 400);
        } else if (toutCorrect) {
            messageDiv.innerHTML = creerMessageFeedback('success', '🎉 Perfect!');
            exerciceTermine = true;
            setTimeout(() => btnContinuer.style.display = 'block', 400);
        } else {
            messageDiv.innerHTML = creerMessageFeedback('error', '❌ Certaines réponses sont incorrectes, essaye encore !');
        }
    });
}

/**
 * Exercice 2.2 : Audio AM/PM - Écouter et choisir AM ou PM
 */
function afficherExercice2_2() {
    const zoneExercice = document.getElementById('zoneExercice');
    const btnContinuer = document.getElementById('btnContinuer');
    
    zoneExercice.style.display = 'block';
    btnContinuer.style.display = 'none';
    
    // Associations audio -> réponse
    const associations = [
        { sound: '2.2_7h', answer: 'am' },
        { sound: '2.2_12h', answer: 'pm' },
        { sound: '2.2_17h', answer: 'pm' },
        { sound: '2.2_8h', answer: 'am' },
        { sound: '2.2_15h', answer: 'pm' },
        { sound: '2.2_21h', answer: 'pm' },
        { sound: '2.2_10h', answer: 'am' },
        { sound: '2.2_16h', answer: 'pm' },
        { sound: '2.2_18h', answer: 'pm' },
        { sound: '2.2_14h', answer: 'pm' }
    ];
    
    // Mélanger les associations
    const shuffledAssociations = shuffle([...associations]);
    
    // Créer le HTML
    let rowsHTML = shuffledAssociations.map((item, index) => `
        <div class="audio-ampm-row" data-index="${index}" data-answer="${item.answer}" data-sound="${item.sound}">
            <button class="audio-btn" data-sound="${item.sound}" title="Écouter">
                🔊
            </button>
            <div class="audio-ampm-choices">
                <div class="audio-ampm-choice" data-choice="am">AM</div>
                <div class="audio-ampm-choice" data-choice="pm">PM</div>
            </div>
        </div>
    `).join('');
    
    zoneExercice.innerHTML = `
        <div class="audio-ampm-container">
            ${rowsHTML}
        </div>
        <button class="ampm-verify-btn" id="btnVerifierAudioAmPm">Vérifier ✓</button>
        <div id="messageAudioAmPm" class="message-match"></div>
    `;
    
    const messageDiv = document.getElementById('messageAudioAmPm');
    
    // Audio actuellement en cours
    let currentAudio = null;
    
    // Événements sur les boutons audio
    zoneExercice.querySelectorAll('.audio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const soundName = btn.dataset.sound;
            
            // Arrêter l'audio en cours
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                document.querySelectorAll('.audio-btn').forEach(b => b.classList.remove('playing'));
            }
            
            // Jouer le nouveau son
            currentAudio = new Audio(`sounds/${soundName}.wav`);
            btn.classList.add('playing');
            
            currentAudio.play();
            currentAudio.onended = () => {
                btn.classList.remove('playing');
            };
        });
    });
    
    // Événements sur les choix AM/PM
    zoneExercice.querySelectorAll('.audio-ampm-choice').forEach(choice => {
        choice.addEventListener('click', () => {
            const row = choice.closest('.audio-ampm-row');
            
            // Si déjà validé, ne rien faire
            if (row.classList.contains('validated')) return;
            
            // Désélectionner les autres choix de cette ligne
            row.querySelectorAll('.audio-ampm-choice').forEach(c => {
                c.classList.remove('selected', 'wrong');
            });
            row.classList.remove('error');
            
            // Sélectionner ce choix
            choice.classList.add('selected');
        });
    });
    
    // Bouton vérifier
    document.getElementById('btnVerifierAudioAmPm').addEventListener('click', () => {
        let toutCorrect = true;
        let toutRempli = true;
        
        zoneExercice.querySelectorAll('.audio-ampm-row').forEach(row => {
            // Si déjà validé, on passe
            if (row.classList.contains('validated')) return;
            
            const answer = row.dataset.answer;
            const selected = row.querySelector('.audio-ampm-choice.selected');
            
            // Réinitialiser les classes d'erreur
            row.querySelectorAll('.audio-ampm-choice').forEach(c => {
                c.classList.remove('wrong');
            });
            row.classList.remove('error');
            
            if (!selected) {
                // Pas de sélection
                toutRempli = false;
                toutCorrect = false;
                row.classList.add('error');
            } else if (selected.dataset.choice === answer) {
                // Bonne réponse - on la valide définitivement
                selected.classList.remove('selected');
                selected.classList.add('correct');
                row.classList.add('validated');
            } else {
                // Mauvaise réponse - on montre l'erreur mais on laisse modifiable
                selected.classList.add('wrong');
                row.classList.add('error');
                toutCorrect = false;
                
                // Retirer la classe wrong après l'animation pour permettre de re-sélectionner
                setTimeout(() => {
                    selected.classList.remove('wrong', 'selected');
                }, 600);
            }
        });
        
        // Vérifier si tout est validé
        const totalRows = zoneExercice.querySelectorAll('.audio-ampm-row').length;
        const validatedRows = zoneExercice.querySelectorAll('.audio-ampm-row.validated').length;
        
        if (!toutRempli) {
            messageDiv.innerHTML = creerMessageFeedback('warning', '⚠️ Sélectionne une réponse pour chaque audio !');
        } else if (validatedRows === totalRows) {
            messageDiv.innerHTML = creerMessageFeedback('success', '🎉 Perfect!');
            exerciceTermine = true;
            setTimeout(() => btnContinuer.style.display = 'block', 400);
        } else if (toutCorrect) {
            messageDiv.innerHTML = creerMessageFeedback('success', '🎉 Perfect!');
            exerciceTermine = true;
            setTimeout(() => btnContinuer.style.display = 'block', 400);
        } else {
            messageDiv.innerHTML = creerMessageFeedback('error', '❌ Certaines réponses sont incorrectes, essaye encore !');
        }
    });
}

/**
 * Exercice 2.3 : Frise chronologique AM/PM
 */
function afficherExercice2_3() {
    const zoneExercice = document.getElementById('zoneExercice');
    const btnContinuer = document.getElementById('btnContinuer');
    
    zoneExercice.style.display = 'block';
    btnContinuer.style.display = 'none';
    
    // Heures à placer avec leur côté correct
    const heures = [
        { time: '1:00 PM', side: 'pm' },
        { time: '8:00 AM', side: 'am' },
        { time: '8:00 PM', side: 'pm' },
        { time: '3:00 PM', side: 'pm' },
        { time: '7:00 AM', side: 'am' },
        { time: '7:00 PM', side: 'pm' },
        { time: '9:00 AM', side: 'am' },
        { time: '9:00 PM', side: 'pm' },
        { time: '10:00 AM', side: 'am' },
        { time: '12:00 PM', side: 'pm' }
    ];
    
    // Mélanger les heures
    const shuffledHeures = shuffle([...heures]);
    
    // Créer les étiquettes d'heures
    let hoursHTML = shuffledHeures.map(h => `
        <div class="frise-hour" draggable="true" data-time="${h.time}" data-answer="${h.side}">
            ${h.time}
        </div>
    `).join('');
    
    zoneExercice.innerHTML = `
        <div class="frise-container">
            <div class="frise-timeline">
                <div class="frise-side frise-side-am" data-side="am">
                    <span class="frise-icon frise-icon-am">☀️</span>
                </div>
                <div class="frise-separator"></div>
                <div class="frise-side frise-side-pm" data-side="pm">
                    <span class="frise-icon frise-icon-pm">🌙</span>
                </div>
            </div>
            <div class="frise-hours-container" id="friseHoursContainer">
                ${hoursHTML}
            </div>
        </div>
        <button class="ampm-verify-btn" id="btnVerifierFrise">Vérifier ✓</button>
        <div id="messageFrise" class="message-match"></div>
    `;
    
    const messageDiv = document.getElementById('messageFrise');
    const hoursContainer = document.getElementById('friseHoursContainer');
    
    // Drag & Drop
    let draggedElement = null;
    
    // Événements sur les heures draggables
    zoneExercice.querySelectorAll('.frise-hour').forEach(hour => {
        hour.addEventListener('dragstart', (e) => {
            // Ne pas permettre de drag si correct
            if (hour.classList.contains('correct')) {
                e.preventDefault();
                return;
            }
            
            draggedElement = hour;
            hour.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        hour.addEventListener('dragend', () => {
            if (draggedElement) {
                draggedElement.classList.remove('dragging');
                draggedElement = null;
            }
            // Retirer tous les drag-over
            zoneExercice.querySelectorAll('.frise-side').forEach(side => {
                side.classList.remove('drag-over');
            });
        });
    });
    
    // Événements sur les côtés de la frise (zones de drop)
    zoneExercice.querySelectorAll('.frise-side').forEach(side => {
        side.addEventListener('dragover', (e) => {
            e.preventDefault();
            side.classList.add('drag-over');
        });
        
        side.addEventListener('dragleave', () => {
            side.classList.remove('drag-over');
        });
        
        side.addEventListener('drop', (e) => {
            e.preventDefault();
            side.classList.remove('drag-over');
            
            if (!draggedElement) return;
            
            // Si l'heure est déjà correcte, ne rien faire
            if (draggedElement.classList.contains('correct')) return;
            
            // Retirer les classes d'erreur précédentes
            draggedElement.classList.remove('wrong');
            
            // Placer l'heure dans ce côté
            side.appendChild(draggedElement);
            
            draggedElement.classList.remove('dragging');
            draggedElement = null;
        });
    });
    
    // Permettre de remettre une heure dans le conteneur
    hoursContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    hoursContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedElement && !draggedElement.classList.contains('correct')) {
            draggedElement.classList.remove('wrong');
            hoursContainer.appendChild(draggedElement);
            draggedElement.classList.remove('dragging');
            draggedElement = null;
        }
    });
    
    // Bouton vérifier
    document.getElementById('btnVerifierFrise').addEventListener('click', () => {
        let toutCorrect = true;
        let toutPlace = true;
        
        zoneExercice.querySelectorAll('.frise-hour').forEach(hour => {
            // Si déjà correct, passer
            if (hour.classList.contains('correct')) return;
            
            const answer = hour.dataset.answer;
            const parentSide = hour.closest('.frise-side');
            
            // Retirer les classes d'erreur
            hour.classList.remove('wrong');
            
            if (!parentSide) {
                // Pas encore placé
                toutPlace = false;
                toutCorrect = false;
            } else if (parentSide.dataset.side === answer) {
                // Bonne réponse
                hour.classList.add('correct');
            } else {
                // Mauvaise réponse
                hour.classList.add('wrong');
                toutCorrect = false;
                
                // Remettre dans le conteneur après l'animation
                setTimeout(() => {
                    hour.classList.remove('wrong');
                    hoursContainer.appendChild(hour);
                }, 600);
            }
        });
        
        // Vérifier si tout est correct
        const totalHours = zoneExercice.querySelectorAll('.frise-hour').length;
        const correctHours = zoneExercice.querySelectorAll('.frise-hour.correct').length;
        
        if (!toutPlace) {
            messageDiv.innerHTML = creerMessageFeedback('warning', '⚠️ Place toutes les heures sur la frise !');
        } else if (correctHours === totalHours) {
            messageDiv.innerHTML = creerMessageFeedback('success', '🎉 Perfect!');
            exerciceTermine = true;
            setTimeout(() => btnContinuer.style.display = 'block', 400);
        } else if (toutCorrect) {
            messageDiv.innerHTML = creerMessageFeedback('success', '🎉 Perfect!');
            exerciceTermine = true;
            setTimeout(() => btnContinuer.style.display = 'block', 400);
        } else {
            messageDiv.innerHTML = creerMessageFeedback('error', '❌ Certaines heures sont mal placées, essaye encore !');
        }
    });
}

/* ============================================================
   7. FONCTIONS UTILITAIRES
   ============================================================ */

/**
 * Mélange un tableau (Fisher-Yates)
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Récupère le nom du personnage depuis le DOM
 */
function getNomPersonnage() {
    return document.getElementById('nomPersonnage')?.textContent || 'Monsieur Chat';
}

/**
 * Change le personnage affiché (koala ou chat)
 * @param {string} type - 'koala' ou 'chat'
 */
function changerPersonnage(type) {
    const persoEl = document.getElementById('personnageDialogue');
    const nomEl = document.getElementById('nomPersonnage');
    
    if (type === 'koala') {
        persoEl.querySelector('img').src = 'assets/koala.png';
        persoEl.querySelector('img').alt = 'Professeur Panda';
        nomEl.textContent = 'Professeur Panda';
    } else {
        persoEl.querySelector('img').src = 'assets/cat.png';
        persoEl.querySelector('img').alt = 'Monsieur Chat';
        nomEl.textContent = 'Monsieur Chat';
    }
}

/**
 * Crée une bulle flottante avec le personnage (en bas à gauche)
 * @param {string} nom - Nom du personnage
 * @param {string} texte - Texte à afficher
 * @param {string} type - 'koala' ou 'chat' (défaut: 'chat')
 */
function createSpeakerFloat(nom, texte, type = 'chat') {
    removeSpeakerFloat();
    
    if (document.querySelector('.speaker-float')) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'speaker-float';
    
    // Créer l'avatar selon le type
    const imgSrc = type === 'koala' ? 'assets/koala.png' : 'assets/cat.png';
    const imgAlt = type === 'koala' ? 'Professeur Panda' : 'Monsieur Chat';
    
    wrapper.innerHTML = `
        <div class="personnage-dialogue">
            <img src="${imgSrc}" alt="${imgAlt}">
            <button class="bubble-toggle" title="Reduire">-</button>
        </div>
        <div class="bubble">
            <div class="nom-personnage">${nom || imgAlt}</div>
            <div class="texte-dialogue" id="speakerTexte"></div>
        </div>
    `;
    
    document.body.appendChild(wrapper);
    
    // Masquer les éléments dupliqués dans la boîte principale
    document.querySelector('.dialogue-box')?.classList.add('hide-speaker');
    document.getElementById('dialogueContainer')?.classList.add('hide-left-chat');
    
    // Animation d'apparition
    requestAnimationFrame(() => wrapper.classList.add('show'));
    
    // Effet machine à écrire
    const texteEl = wrapper.querySelector('#speakerTexte');
    typeWriter(texteEl, texte);
    
    // Bouton toggle pour réduire/agrandir la bulle
    const toggleBtn = wrapper.querySelector('.bubble-toggle');
    const bubble = wrapper.querySelector('.bubble');
    
    toggleBtn.addEventListener('click', () => {
        bubble.classList.toggle('minimized');
        toggleBtn.textContent = bubble.classList.contains('minimized') ? '+' : '-';
        toggleBtn.title = bubble.classList.contains('minimized') ? 'Ouvrir' : 'Reduire';
    });
}

/**
 * Effet machine à écrire
 * @param {HTMLElement} element - Élément où écrire
 * @param {string} texte - Texte à afficher
 * @param {number} vitesse - Vitesse en ms par caractère (défaut: 30)
 */
function typeWriter(element, texte, vitesse = 30) {
    let index = 0;
    element.innerHTML = '<span class="typewriter-cursor"></span>';
    
    // Stocker l'ID de l'intervalle pour pouvoir l'arrêter
    const intervalId = setInterval(() => {
        if (index < texte.length) {
            // Insérer le caractère avant le curseur
            const cursor = element.querySelector('.typewriter-cursor');
            if (cursor) {
                cursor.insertAdjacentText('beforebegin', texte.charAt(index));
            }
            index++;
        } else {
            // Fin du texte, retirer le curseur après un délai
            clearInterval(intervalId);
            setTimeout(() => {
                const cursor = element.querySelector('.typewriter-cursor');
                if (cursor) cursor.remove();
            }, 1000);
        }
    }, vitesse);
    
    // Stocker l'intervalle pour pouvoir l'arrêter si nécessaire
    element.dataset.typewriterInterval = intervalId;
}

/**
 * Supprime la bulle flottante du personnage
 */
function removeSpeakerFloat() {
    // Supprimer tous les speaker-float (sauf celui de l'accueil)
    document.querySelectorAll('.speaker-float:not(.speaker-accueil)').forEach(el => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 300);
    });
    
    // Réafficher les éléments masqués
    const dialogueBox = document.querySelector('.dialogue-box');
    const dialogueContainer = document.getElementById('dialogueContainer');
    
    if (dialogueBox) {
        dialogueBox.classList.remove('hide-speaker');
    }
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hide-left-chat');
    }
}
