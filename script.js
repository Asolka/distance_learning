let nomJoueur = '';
let niveauxCompletes = [];
let niveauActuel = 0;
let exerciceTermine = false;

const niveaux = [
    { id: 0, type: 'ritual', nom: 'Ritual', emoji: '📅' },

    // Bloc 1
    { id: 1, type: 'cours', nom: 'Lesson 1', emoji: '📚' },
    { id: 2, type: 'exercice', nom: 'Exercise 1.1', emoji: '✏️' },
    { id: 3, type: 'exercice', nom: 'Exercise 1.2', emoji: '✏️' },
    { id: 4, type: 'exercice', nom: 'Exercise 1.3', emoji: '✏️' },

    // Bloc 2
    { id: 5, type: 'cours', nom: 'Lesson 2', emoji: '📖' },
    { id: 6, type: 'exercice', nom: 'Exercise 2.1', emoji: '📝' },
    { id: 7, type: 'exercice', nom: 'Exercise 2.2', emoji: '📝' },
    { id: 8, type: 'exercice', nom: 'Exercise 2.3', emoji: '📝' },

    // Bloc 3
    { id: 9, type: 'cours', nom: 'Lesson 3', emoji: '📕' },
    { id: 10, type: 'exercice', nom: 'Exercise 3.1', emoji: '✍️' },
    { id: 11, type: 'exercice', nom: 'Exercise 3.2', emoji: '✍️' },
    { id: 12, type: 'exercice', nom: 'Exercise 3.3', emoji: '✍️' },

    { id: 13, type: 'evaluation', nom: 'Evaluation', emoji: '🏆' }
];

const jours = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mois = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const inputPrenom = document.getElementById('inputPrenom');
const btnCommencer = document.getElementById('btnCommencer');

inputPrenom.addEventListener('input', (e) => {
    btnCommencer.disabled = e.target.value.trim().length === 0;
});

inputPrenom.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && inputPrenom.value.trim().length > 0) {
        commencerJeu();
    }
});

btnCommencer.addEventListener('click', commencerJeu);

function commencerJeu() {
    nomJoueur = inputPrenom.value.trim();
    document.getElementById('pageAccueil').classList.add('cache');
    document.getElementById('carteProgression').style.display = 'block';
    document.getElementById('titreBienvenue').textContent = `Welcome ${nomJoueur}! 🎉`;

    genererNiveaux();
}

function genererNiveaux() {
    const conteneur = document.getElementById('conteneurNiveaux');
    conteneur.innerHTML = '';

    const positionsX = ['20%', '70%', '40%', '65%'];
    let yPosition = 50; // Position du Ritual
    const espacementNormal = 200;
    const espacementBloc = 300;

    niveaux.forEach((niveau, index) => {
        const div = document.createElement('div');
        div.className = `niveau niveau-${niveau.type}`;
        div.id = `niveau-${niveau.id}`;

        if (niveau.type === 'ritual') {
            // Ritual en haut au centre
            div.style.left = '50%';
            div.style.top = `${yPosition}px`;
            div.style.transform = 'translateX(-50%)';
            yPosition += 350; // Espace après le ritual
        } else if (niveau.type === 'evaluation') {
            // Évaluation en bas au centre
            div.style.left = '50%';
            div.style.top = `${yPosition + 200}px`;
            div.style.transform = 'translateX(-50%)';
        } else {
            // Tous les autres niveaux en alternance
            const posIndex = index % positionsX.length;
            div.style.left = positionsX[posIndex];
            div.style.top = `${yPosition}px`;
            div.style.transform = 'translateX(-50%)';

            // Vérifier si on doit ajouter un espace après ce niveau
            if (index < niveaux.length - 1) {
                const niveauSuivant = niveaux[index + 1];
                // Si le prochain est un cours ou l'évaluation, on ajoute un grand espace
                if (niveauSuivant.type === 'cours' || niveauSuivant.type === 'evaluation') {
                    yPosition += espacementBloc;
                } else {
                    yPosition += espacementNormal;
                }
            }
        }

        const estComplete = niveauxCompletes.includes(niveau.id);
        let estProchainNiveau;

        if (niveau.type === 'ritual') {
            estProchainNiveau = !niveauxCompletes.includes(0);
        } else if (niveau.type === 'evaluation') {
            const exercicesIds = niveaux.filter(n => n.type === 'exercice').map(n => n.id);
            estProchainNiveau = exercicesIds.every(id => niveauxCompletes.includes(id));
        } else {
            estProchainNiveau = (niveauxCompletes.length === index);
        }

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

    // Dessiner les chemins après un court délai
    setTimeout(() => {
        dessinerChemins();
    }, 100);
}

function dessinerChemins() {
    const svg = document.getElementById('cheminNiveaux');
    svg.innerHTML = '';

    // Dessiner les chemins entre les niveaux (sauf le ritual et pas vers l'évaluation)
    for (let i = 1; i < niveaux.length - 1; i++) {
        const niveauActuel = niveaux[i];
        const niveauSuivant = niveaux[i + 1];

        // Ne pas dessiner de chemin si :
        // - Le suivant est une évaluation
        // - Le suivant est un cours (car on veut un espace entre les blocs)
        if (niveauSuivant.type === 'evaluation' || niveauSuivant.type === 'cours') {
            continue;
        }

        const niveau1 = document.getElementById(`niveau-${niveauActuel.id}`);
        const niveau2 = document.getElementById(`niveau-${niveauSuivant.id}`);

        if (niveau1 && niveau2) {
            const rect1 = niveau1.getBoundingClientRect();
            const rect2 = niveau2.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();

            const x1 = rect1.left + rect1.width / 2 - svgRect.left;
            const y1 = rect1.top + rect1.height / 2 - svgRect.top;
            const x2 = rect2.left + rect2.width / 2 - svgRect.left;
            const y2 = rect2.top + rect2.height / 2 - svgRect.top;

            const controlX = x1 + (Math.random() - 0.5) * 100;
            const controlY = (y1 + y2) / 2;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
            path.setAttribute('d', d);

            const estComplete = niveauxCompletes.includes(niveauActuel.id);
            path.setAttribute('stroke', estComplete ? '#38ef7d' : '#95a5a6');
            path.setAttribute('stroke-width', '20');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-linecap', 'round');
            path.style.filter = 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))';

            svg.appendChild(path);
        }
    }
}

window.addEventListener('resize', () => {
    dessinerChemins();
});

function ouvrirNiveau(id) {
    const niveau = document.getElementById(`niveau-${id}`);

    if (niveau.classList.contains('niveau-verrouille')) {
        return;
    }

    niveauActuel = id;
    exerciceTermine = false;

    const niveauData = niveaux.find(n => n.id === id);

    if (niveauData.type === 'ritual') {
        afficherRitual();
    } else {
        afficherDialogue(id);
    }
}

function afficherRitual() {
    const container = document.getElementById('dialogueContainer');
    const zoneExercice = document.getElementById('zoneExercice');
    const texteDialogue = document.getElementById('texteDialogue');
    const btnContinuer = document.getElementById('btnContinuer');

    const aujourdhui = new Date();
    const jourActuel = jours[aujourdhui.getDay() === 0 ? 6 : aujourdhui.getDay() - 1];
    const dateActuelle = aujourdhui.getDate();
    const moisActuel = mois[aujourdhui.getMonth()];

    texteDialogue.textContent = "Faisons notre rituel quotidien : Quelle est la date aujourd'hui ?";
    zoneExercice.style.display = 'block';

    let suffixeHTML = '<option value="">-</option>';
    ['st', 'nd', 'rd', 'th'].forEach(suf => {
        suffixeHTML += `<option value="${suf}">${suf}</option>`;
    });

    let joursHTML = '<option value="">Day</option>';
    jours.forEach(jour => {
        joursHTML += `<option value="${jour}">${jour}</option>`;
    });

    let datesHTML = '<option value="">-</option>';
    for (let i = 1; i <= 31; i++) {
        datesHTML += `<option value="${i}">${i}</option>`;
    }

    let moisHTML = '<option value="">Month</option>';
    mois.forEach(m => {
        moisHTML += `<option value="${m}">${m}</option>`;
    });

    zoneExercice.innerHTML = `
                <div class="ritual-container">
                    <div class="ritual-titre">What's the date today?</div>
                    <div class="date-selecteurs">
                        <select id="selectJour">${joursHTML}</select>
                        <span class="virgule">,</span>
                        <select id="selectDate">${datesHTML}</select>
                        <select id="selectSuffixe">${suffixeHTML}</select>
                        <select id="selectMois">${moisHTML}</select>
                    </div>
                    <button class="bouton-valider-date" onclick="verifierDate()">Check!</button>
                    <div id="messageDate"></div>
                </div>
            `;

    btnContinuer.style.display = 'none';
    container.style.display = 'flex';

    window.dateActuelle = {
        jour: jourActuel,
        date: dateActuelle,
        mois: moisActuel,
        suffixe: getSuffixe(dateActuelle)
    };
}

function getSuffixe(date) {
    if (date >= 11 && date <= 13) return 'th';
    switch (date % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function verifierDate() {
    const selectJour = document.getElementById('selectJour');
    const selectDate = document.getElementById('selectDate');
    const selectSuffixe = document.getElementById('selectSuffixe');
    const selectMois = document.getElementById('selectMois');
    const messageDiv = document.getElementById('messageDate');

    const jourChoisi = selectJour.value;
    const dateChoisie = parseInt(selectDate.value);
    const suffixeChoisi = selectSuffixe.value;
    const moisChoisi = selectMois.value;

    let toutCorrect = true;

    selectJour.classList.remove('correct', 'incorrect');
    selectDate.classList.remove('correct', 'incorrect');
    selectSuffixe.classList.remove('correct', 'incorrect');
    selectMois.classList.remove('correct', 'incorrect');

    if (jourChoisi === window.dateActuelle.jour) {
        selectJour.classList.add('correct');
    } else {
        selectJour.classList.add('incorrect');
        toutCorrect = false;
    }

    if (dateChoisie === window.dateActuelle.date) {
        selectDate.classList.add('correct');
    } else {
        selectDate.classList.add('incorrect');
        toutCorrect = false;
    }

    if (suffixeChoisi === window.dateActuelle.suffixe) {
        selectSuffixe.classList.add('correct');
    } else {
        selectSuffixe.classList.add('incorrect');
        toutCorrect = false;
    }

    if (moisChoisi === window.dateActuelle.mois) {
        selectMois.classList.add('correct');
    } else {
        selectMois.classList.add('incorrect');
        toutCorrect = false;
    }

    if (toutCorrect) {
        messageDiv.innerHTML = '<div class="message-date" style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white;">🎉 Perfect! That\'s the correct date!</div>';
        exerciceTermine = true;
        setTimeout(() => {
            document.getElementById('btnContinuer').style.display = 'block';
        }, 800);
    } else {
        messageDiv.innerHTML = '<div class="message-date" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white;">❌ Something is wrong, try again!</div>';
    }
}

function afficherDialogue(niveauId) {
    const container = document.getElementById('dialogueContainer');
    const texteDialogue = document.getElementById('texteDialogue');
    const zoneExercice = document.getElementById('zoneExercice');
    const btnContinuer = document.getElementById('btnContinuer');

    const niveau = niveaux.find(n => n.id === niveauId);

    if (niveau.type === 'cours') {
        texteDialogue.textContent = `Voici la leçon ${niveau.nom}. Contenu à venir...`;
        zoneExercice.style.display = 'none';
        btnContinuer.style.display = 'block';
        exerciceTermine = true;
    } else if (niveau.type === 'exercice') {
        texteDialogue.textContent = `Exercice ${niveau.nom}. Contenu à venir...`;
        zoneExercice.style.display = 'none';
        btnContinuer.style.display = 'block';
        exerciceTermine = true;
    } else if (niveau.type === 'evaluation') {
        texteDialogue.textContent = "Évaluation finale à venir...";
        zoneExercice.style.display = 'none';
        btnContinuer.style.display = 'block';
        exerciceTermine = true;
    }

    container.style.display = 'flex';
}

document.getElementById('btnContinuer').addEventListener('click', () => {
    const container = document.getElementById('dialogueContainer');
    const btnContinuer = document.getElementById('btnContinuer');

    if (exerciceTermine) {
        container.style.display = 'none';
        btnContinuer.textContent = 'Continue →';
        completerNiveau(niveauActuel);
    } else {
        container.style.display = 'none';
    }
});

function completerNiveau(id) {
    if (!niveauxCompletes.includes(id)) {
        niveauxCompletes.push(id);
        genererNiveaux();
    }
}

function fermerDialogue() {
    document.getElementById('dialogueContainer').style.display = 'none';
}