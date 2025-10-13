// ===== VARIABLES GLOBALES =====
// Enregistre si l'utilisateur a dit qu'il savait trier
let utilisateurSaitTrier = false;

// ===== FONCTIONS DE NAVIGATION =====

// Quand l'utilisateur clique sur "Oui"
function choisirOui() {
    utilisateurSaitTrier = true;

    // Changer le titre
    document.getElementById('titre').textContent = "D'accord on va vérifier ça, dans quelle poubelle jettes-tu une bouteille en plastique?";

    // Cacher les boutons de la page initiale et afficher le quiz
    document.getElementById('page-initiale').classList.add('hide');
    document.getElementById('page-quiz').classList.remove('hide');
}

// Quand l'utilisateur clique sur "Non"
function choisirNon() {
    utilisateurSaitTrier = false;

    // Changer le titre
    document.getElementById('titre').textContent = "Alors on va apprendre ensemble";

    // Cacher la page initiale et afficher l'apprentissage
    document.getElementById('page-initiale').classList.add('hide');
    document.getElementById('page-apprentissage').style.display = 'block';
}

// ===== FONCTION DE VÉRIFICATION DES RÉPONSES =====

function verifierReponse(couleur, bouton) {
    const zoneMessage = document.getElementById('zone-message');
    const tousBoutons = document.querySelectorAll('#page-quiz .bouton-poubelle');

    // Désactiver tous les boutons pendant l'animation
    tousBoutons.forEach(btn => btn.style.pointerEvents = 'none');

    // Si c'est la bonne réponse (jaune pour une bouteille plastique)
    if (couleur === 'jaune') {
        // Ajouter l'animation de succès au bouton
        bouton.classList.add('bouton-correct');

        // Attendre un peu puis afficher le message de succès
        setTimeout(() => {
            zoneMessage.innerHTML = `
                        <div class="message message-correct">
                            🎉 Bravo, c'est la bonne réponse !
                        </div>
                        <button class="bouton-suivant" onclick="etapeSuivante()">Suivant</button>
                    `;
        }, 600);
    }
    // Si c'est une mauvaise réponse
    else {
        // Ajouter l'animation d'erreur (tremblement + rayure)
        bouton.classList.add('bouton-incorrect');

        // Choisir le message selon la couleur
        let texteMessage = '';
        if (couleur === 'bleue') {
            texteMessage = '🤔 Presque ! La poubelle bleue est pour le verre.';
        } else {
            texteMessage = '😊 Pas tout à fait ! La poubelle noire est pour les déchets ménagers.';
        }

        // Attendre un peu puis afficher le message d'erreur
        setTimeout(() => {
            zoneMessage.innerHTML = `
                        <div class="message message-incorrect">
                            ${texteMessage}
                        </div>
                    `;

            // Réactiver les boutons non rayés après 1 seconde
            setTimeout(() => {
                tousBoutons.forEach(btn => {
                    if (!btn.classList.contains('bouton-incorrect')) {
                        btn.style.pointerEvents = 'auto';
                    }
                });
            }, 1000);

            // Faire disparaître le message après 5 secondes
            setTimeout(() => {
                zoneMessage.innerHTML = '';
            }, 5000);
        }, 500);
    }
}

// ===== FONCTION POUR L'ÉTAPE SUIVANTE =====
// Pour l'instant cette fonction fait rien
function etapeSuivante() {
    console.log('Passage à la question suivante...');
}

// ===== FONCTION DE RETOUR À L'ACCUEIL =====
// Réinitialise tout et retourne à la première page
function retourAccueil() {
    // Remettre le titre initial
    document.getElementById('titre').textContent = "Sais-tu trier les déchets ?";

    // Afficher la page initiale
    document.getElementById('page-initiale').classList.remove('hide');

    // Cacher les autres pages
    document.getElementById('page-quiz').classList.add('hide');
    document.getElementById('page-apprentissage').style.display = 'none';

    // Effacer les messages
    document.getElementById('zone-message').innerHTML = '';

    // Réinitialiser tous les boutons du quiz
    const tousBoutons = document.querySelectorAll('#page-quiz .bouton-poubelle');
    tousBoutons.forEach(btn => {
        btn.classList.remove('bouton-incorrect', 'bouton-correct');
        btn.style.pointerEvents = 'auto';
    });

    // Réinitialiser la variable
    utilisateurSaitTrier = false;
}

// ===== FONCTION APRÈS L'APPRENTISSAGE =====
// Retour au début après avoir cliqué sur "J'ai compris"
function retourDebut() {
    document.getElementById('titre').textContent = "Sais-tu trier les déchets ?";
    document.getElementById('page-apprentissage').style.display = 'none';
    document.getElementById('page-initiale').classList.remove('hide');
    document.getElementById('page-quiz').classList.add('hide');
}