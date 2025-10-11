let userKnowsRecycling = false;

function handleYes() {
    userKnowsRecycling = true;
    document.getElementById('title').textContent = "D'accord on va vérifier ça, dans quelle poubelle jettes-tu une bouteille ?";
    document.getElementById('initial-buttons').classList.add('hidden');
    document.getElementById('quiz-section').classList.remove('hidden');
}

function handleNo() {
    userKnowsRecycling = false;
    document.getElementById('title').textContent = "Alors on va apprendre ensemble";
    document.getElementById('initial-buttons').classList.add('hidden');
    document.getElementById('learning-section').style.display = 'block';
}

function checkAnswer(color, button) {
    const feedbackContainer = document.getElementById('feedback-container');
    const allButtons = document.querySelectorAll('#quiz-section .btn-poubelle');

    // Désactiver tous les boutons pour éviter les clics multiples
    allButtons.forEach(btn => btn.style.pointerEvents = 'none');

    if (color === 'jaune') {
        // Bonne réponse
        button.classList.add('btn-correct');

        setTimeout(() => {
            feedbackContainer.innerHTML = `
                        <div class="feedback-message feedback-correct">
                            🎉 Bravo, c'est la bonne réponse !
                        </div>
                        <button class="btn-next" onclick="nextStep()">Suivant</button>
                    `;
        }, 600);
    } else {
        // Mauvaise réponse - le bouton reste rayé
        button.classList.add('btn-wrong');

        let message = '';
        if (color === 'bleue') {
            message = '🤔 Presque ! La poubelle bleue est pour le verre. Une bouteille en plastique va dans la poubelle jaune !';
        } else {
            message = '😊 Pas tout à fait ! Une bouteille en plastique est recyclable, elle va dans la poubelle jaune !';
        }

        setTimeout(() => {
            feedbackContainer.innerHTML = `
                        <div class="feedback-message feedback-wrong">
                            ${message}
                        </div>
                    `;

            // Réactiver seulement les boutons non rayés après 1 seconde
            setTimeout(() => {
                allButtons.forEach(btn => {
                    if (!btn.classList.contains('btn-wrong')) {
                        btn.style.pointerEvents = 'auto';
                    }
                });
            }, 1000);

            // Faire disparaître le message après 5 secondes
            setTimeout(() => {
                feedbackContainer.innerHTML = '';
            }, 5000);
        }, 500);
    }
}

function nextStep() {
    // Pour l'instant, cette fonction ne fait rien
    // Tu pourras ajouter la logique pour la suite du quiz ici
    console.log('Passage à l\'étape suivante...');
}

function goHome() {
    // Réinitialiser tout
    document.getElementById('title').textContent = "Sais-tu trier les déchets ?";
    document.getElementById('initial-buttons').classList.remove('hidden');
    document.getElementById('quiz-section').classList.add('hidden');
    document.getElementById('learning-section').style.display = 'none';
    document.getElementById('feedback-container').innerHTML = '';

    // Réinitialiser les boutons
    const allButtons = document.querySelectorAll('#quiz-section .btn-poubelle');
    allButtons.forEach(btn => {
        btn.classList.remove('btn-wrong', 'btn-correct');
        btn.style.pointerEvents = 'auto';
    });

    userKnowsRecycling = false;
}

function backToStart() {
    document.getElementById('title').textContent = "Sais-tu trier les déchets ?";
    document.getElementById('learning-section').style.display = 'none';
    document.getElementById('initial-buttons').classList.remove('hidden');
    document.getElementById('quiz-section').classList.add('hidden');
}