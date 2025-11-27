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

    texteDialogue.textContent = "Commençons par la date d'aujourd'hui !";
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
                    <div id="messageDate"></div>

                    <div class="meteo-container">
                        <div class="meteo-titre">What's the weather like today ?</div>
                        <div class="meteo-options">
                            <!-- Ordre demandé: sunny, cloudy, rainy, stormy, snowy -->
                            <div class="meteo-option" role="button" tabindex="0" onclick="selectionnerMeteo(this)" onkeydown="if(event.key==='Enter'||event.key===' '){selectionnerMeteo(this)}">
                                <img src="assets/sunny.png" alt="Sunny">
                                <span class="meteo-label">Sunny</span>
                            </div>
                            <div class="meteo-option" role="button" tabindex="0" onclick="selectionnerMeteo(this)" onkeydown="if(event.key==='Enter'||event.key===' '){selectionnerMeteo(this)}">
                                <img src="assets/cloudy.png" alt="Cloudy">
                                <span class="meteo-label">Cloudy</span>
                            </div>
                            <div class="meteo-option" role="button" tabindex="0" onclick="selectionnerMeteo(this)" onkeydown="if(event.key==='Enter'||event.key===' '){selectionnerMeteo(this)}">
                                <img src="assets/rainy.png" alt="Rainy">
                                <span class="meteo-label">Rainy</span>
                            </div>
                            <div class="meteo-option" role="button" tabindex="0" onclick="selectionnerMeteo(this)" onkeydown="if(event.key==='Enter'||event.key===' '){selectionnerMeteo(this)}">
                                <img src="assets/stormy.png" alt="Stormy">
                                <span class="meteo-label">Stormy</span>
                            </div>
                            <div class="meteo-option" role="button" tabindex="0" onclick="selectionnerMeteo(this)" onkeydown="if(event.key==='Enter'||event.key===' '){selectionnerMeteo(this)}">
                                <img src="assets/snowy.png" alt="Snowy">
                                <span class="meteo-label">Snowy</span>
                            </div>
                        </div>
                    </div>

                    <button class="bouton-valider-date" onclick="verifierDate()">Vérifier !</button>
                </div>
            `;

    btnContinuer.style.display = 'none';
    // afficher une bulle flottante pour le personnage (sans déplacer le contenu centré)
    removeSpeakerFloat();
    const nom = document.getElementById('nomPersonnage') ? document.getElementById('nomPersonnage').textContent : 'Monsieur chat';
    createSpeakerFloat(nom, texteDialogue.textContent);
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

    // Vérifier que la météo a été sélectionnée
    if (!window.selectedMeteo) {
        messageDiv.innerHTML = '<div class="message-date" style="background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%); color: white;">⚠️ Please select the weather before checking!</div>';
        toutCorrect = false;
    }

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
        messageDiv.innerHTML = '<div class="message-date" style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white;">🎉 Super ! C\'est la bonne date !</div>';
        exerciceTermine = true;
        setTimeout(() => {
            document.getElementById('btnContinuer').style.display = 'block';
        }, 800);
    } else {
        messageDiv.innerHTML = '<div class="message-date" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white;">❌ Quelque chose ne va pas, essaye encore !</div>';
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
        // cours -> retirer bulle flottante et réafficher le chat gauche
        removeSpeakerFloat();
    } else if (niveau.type === 'exercice') {
        // For specific exercises we render their content; default fallback otherwise
        if (niveauId === 2) {
            texteDialogue.textContent = `Relie chaque mot en anglais à la bonne image. Clique sur le point qui correspond au mot, puis sur celui de l'image.`;
            // render exercise 1.1
            afficherExercice1_1();
            exerciceTermine = false;
            // show speaker instructions
            removeSpeakerFloat();
            const nomEx = document.getElementById('nomPersonnage') ? document.getElementById('nomPersonnage').textContent : 'Monsieur chat';
            createSpeakerFloat(nomEx, texteDialogue.textContent);
        } else {
            texteDialogue.textContent = `Exercice ${niveau.nom}. Contenu à venir...`;
            zoneExercice.style.display = 'none';
            btnContinuer.style.display = 'block';
            exerciceTermine = true;
            // exercices -> afficher bulle flottante
            removeSpeakerFloat();
            const nomEx = document.getElementById('nomPersonnage') ? document.getElementById('nomPersonnage').textContent : 'Monsieur chat';
            createSpeakerFloat(nomEx, texteDialogue.textContent);
        }
    } else if (niveau.type === 'evaluation') {
        texteDialogue.textContent = "Évaluation finale à venir...";
        zoneExercice.style.display = 'none';
        btnContinuer.style.display = 'block';
        exerciceTermine = true;
        // évaluation -> retirer bulle flottante et réafficher le chat gauche
        removeSpeakerFloat();
    }

    container.style.display = 'flex';
}

document.getElementById('btnContinuer').addEventListener('click', () => {
    const container = document.getElementById('dialogueContainer');
    const btnContinuer = document.getElementById('btnContinuer');

    if (exerciceTermine) {
        container.style.display = 'none';
        removeSpeakerFloat();
        btnContinuer.textContent = 'Continue →';
        completerNiveau(niveauActuel);
    } else {
        container.style.display = 'none';
        removeSpeakerFloat();
    }
});

function completerNiveau(id) {
    if (!niveauxCompletes.includes(id)) {
        niveauxCompletes.push(id);
        genererNiveaux();
    }
}

function fermerDialogue() {
    const container = document.getElementById('dialogueContainer');
    container.style.display = 'none';
    removeSpeakerFloat();
}

// Crée une bulle flottante avec le personnage et le texte (en bas à gauche)
function createSpeakerFloat(nom, texte) {
    removeSpeakerFloat();
    const existing = document.querySelector('.speaker-float');
    if (existing) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'speaker-float';

    // Cloner l'image du personnage si possible
    const originalPerso = document.getElementById('personnageDialogue');
    let persoClone;
    if (originalPerso) {
        persoClone = originalPerso.cloneNode(true);
        // éviter les ids dupliqués
        persoClone.removeAttribute('id');
    } else {
        persoClone = document.createElement('div');
        persoClone.className = 'personnage-dialogue';
    }

    // Bulle contenant nom et texte
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const nomEl = document.createElement('div');
    nomEl.className = 'nom-personnage';
    nomEl.textContent = nom || 'Monsieur chat';
    const texteEl = document.createElement('div');
    texteEl.className = 'texte-dialogue';
    texteEl.textContent = texte || '';
    bubble.appendChild(nomEl);
    bubble.appendChild(texteEl);

    wrapper.appendChild(persoClone);
    wrapper.appendChild(bubble);

    document.body.appendChild(wrapper);
    // masquer la partie nom/texte dans la boîte principale pour éviter duplication
    const mainBox = document.querySelector('.dialogue-box');
    if (mainBox) mainBox.classList.add('hide-speaker');
    // masquer le chat gauche dans la boîte principale
    const container = document.getElementById('dialogueContainer');
    if (container) container.classList.add('hide-left-chat');

    // animate in (slide + fade)
    requestAnimationFrame(() => {
        wrapper.classList.add('show');
    });
}

function removeSpeakerFloat() {
    const el = document.querySelector('.speaker-float');
    const container = document.getElementById('dialogueContainer');
    // animate out then remove
    if (el) {
        // remove 'show' to trigger transition out
        el.classList.remove('show');
        const duration = 280; // match CSS transition (ms)
        setTimeout(() => {
            if (el && el.parentNode) el.parentNode.removeChild(el);
        }, duration + 20);
    }
    // retirer la classe qui cache le nom/texte dans la boîte principale
    const mainBox = document.querySelector('.dialogue-box');
    if (mainBox) mainBox.classList.remove('hide-speaker');
    // retirer la classe qui cache le chat gauche
    if (container) container.classList.remove('hide-left-chat');
}

// Permet de sélectionner visuellement une option météo (clique ou clavier)
function selectionnerMeteo(el) {
    if (!el) return;
    // Trouver toutes les options présentes dans la boîte courante
    const parent = el.closest('.meteo-options');
    if (!parent) return;

    const options = parent.querySelectorAll('.meteo-option');
    options.forEach(opt => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-pressed', 'false');
    });

    // Marquer l'option cliquée comme sélectionnée
    el.classList.add('selected');
    el.setAttribute('aria-pressed', 'true');

    // Sauvegarder la sélection globalement si nécessaire
    const label = el.querySelector('.meteo-label');
    window.selectedMeteo = label ? label.textContent.trim() : null;
}

// Exercice 1.1 - matching words to images
function afficherExercice1_1() {
    const zoneExercice = document.getElementById('zoneExercice');
    const btnContinuer = document.getElementById('btnContinuer');
    zoneExercice.style.display = 'block';
    btnContinuer.style.display = 'none';

    const pairs = [
        { key: 'eat', word: 'Eat', img: 'assets/eat.png' },
        { key: 'sleep', word: 'Sleep', img: 'assets/sleep.png' },
        { key: 'work', word: 'Work', img: 'assets/work.png' },
        { key: 'wake', word: 'Wake up', img: 'assets/wake.png' },
        { key: 'play', word: 'Play', img: 'assets/play.png' },
        { key: 'brush', word: 'Brush my teeth', img: 'assets/brush.png' }
    ];

    function shuffle(a) { return a.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(a=>a[1]); }

    // split into left (3 images), right (3 images), and words (6)
    const shuffledPairs = shuffle(pairs.slice());
    const leftImages = shuffledPairs.slice(0,3);
    const rightImages = shuffledPairs.slice(3,6);
    const words = shuffle(pairs.slice());

    // render 3-column layout
    zoneExercice.innerHTML = `
        <svg class="match-svg" xmlns="http://www.w3.org/2000/svg"></svg>
        <div class="match-container">
            <div class="match-left"></div>
            <div class="match-center"></div>
            <div class="match-right"></div>
        </div>
    `;

    const svg = zoneExercice.querySelector('.match-svg');
    const leftCol = zoneExercice.querySelector('.match-left');
    const centerCol = zoneExercice.querySelector('.match-center');
    const rightCol = zoneExercice.querySelector('.match-right');

    // helper to create image block (no text under images)
    function createImageBlock(p, side) {
        const d = document.createElement('div');
        d.className = 'match-image';
        d.setAttribute('data-key', p.key);
        d.tabIndex = 0;
        const img = document.createElement('img');
        img.src = p.img;
        img.alt = p.key;
        d.appendChild(img);
        // connector point
        const point = document.createElement('span');
        point.className = 'connector-point ' + (side==='left' ? 'point-right' : 'point-left');
        point.setAttribute('data-key', p.key);
        point.setAttribute('data-role', 'image');
        d.appendChild(point);
        return d;
    }

    // create word block with left and right points
    function createWordBlock(p) {
        const d = document.createElement('div');
        d.className = 'match-word';
        d.setAttribute('data-key', p.key);
        d.tabIndex = 0;
        const leftPoint = document.createElement('span');
        leftPoint.className = 'connector-point point-left';
        leftPoint.setAttribute('data-key', p.key);
        leftPoint.setAttribute('data-role', 'word');
        const txt = document.createElement('div');
        txt.className = 'word-text';
        txt.textContent = p.word;
        const rightPoint = document.createElement('span');
        rightPoint.className = 'connector-point point-right';
        rightPoint.setAttribute('data-key', p.key);
        rightPoint.setAttribute('data-role', 'word');
        d.appendChild(leftPoint);
        d.appendChild(txt);
        d.appendChild(rightPoint);
        return d;
    }

    // render
    leftImages.forEach(p => leftCol.appendChild(createImageBlock(p, 'left')));
    words.forEach(p => centerCol.appendChild(createWordBlock(p)));
    rightImages.forEach(p => rightCol.appendChild(createImageBlock(p, 'right')));

    // connection logic
    let startPoint = null; // DOM element of connector-point
    let matchedKeys = new Set();
    const total = pairs.length;

    function getPointCenter(el) {
        const r = el.getBoundingClientRect();
        const svgR = svg.getBoundingClientRect();
        const x = (r.left + r.right) / 2 - svgR.left;
        const y = (r.top + r.bottom) / 2 - svgR.top;
        return { x, y };
    }

    function drawLine(fromEl, toEl, correct) {
        const p1 = getPointCenter(fromEl);
        const p2 = getPointCenter(toEl);
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1', p1.x);
        line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x);
        line.setAttribute('y2', p2.y);
        line.classList.add('match-line');
        line.classList.add(correct ? 'correct' : 'wrong');
        svg.appendChild(line);
        return line;
    }

    function connectPoints(start, end) {
        // ensure one is word and one is image
        if (!start || !end) return;
        const startRole = start.getAttribute('data-role');
        const endRole = end.getAttribute('data-role');
        if (startRole === endRole) return; // invalid

        const wordEl = startRole === 'word' ? start : end; // point element
        const imageEl = startRole === 'image' ? start : end;
        const wordKey = wordEl.getAttribute('data-key');
        const imageKey = imageEl.getAttribute('data-key');

        // prevent reconnecting already matched
        if (matchedKeys.has(wordKey) || matchedKeys.has(imageKey)) return;

        const correct = wordKey === imageKey;
        const line = drawLine(start, end, correct);

        if (correct) {
            // mark matched visually and disable points
            matchedKeys.add(wordKey);
            // find parent word and image blocks
            const wordBlock = centerCol.querySelector(`.match-word[data-key="${wordKey}"]`);
            const imgBlock = zoneExercice.querySelector(`.match-image[data-key="${imageKey}"]`);
            if (wordBlock) wordBlock.classList.add('matched');
            if (imgBlock) imgBlock.classList.add('matched');
            // disable points for these keys
            Array.from(zoneExercice.querySelectorAll(`.connector-point[data-key="${wordKey}"]`)).forEach(pt=>pt.classList.add('disabled'));
            Array.from(zoneExercice.querySelectorAll(`.connector-point[data-key="${imageKey}"]`)).forEach(pt=>pt.classList.add('disabled'));

            // keep the line visible and colored green
            line.classList.add('correct');
            // increment and check completion
            if (matchedKeys.size === total) {
                exerciceTermine = true;
                setTimeout(()=>{ btnContinuer.style.display = 'block'; }, 400);
                const msg = zoneExercice.querySelector('#messageMatch');
                if (!msg) {
                    const m = document.createElement('div');
                    m.id = 'messageMatch';
                    m.className = 'message-date';
                    m.style.background = 'linear-gradient(135deg,#2ecc71 0%,#27ae60 100%)';
                    m.style.color = 'white';
                    m.textContent = '🎉 Bien joué ! Tu as bien tout aligné !';
                    zoneExercice.prepend(m);
                }
            }
        } else {
            // wrong: animate red then remove line
            line.classList.add('wrong');
            // brief shake on both parent blocks
            const wordBlock = centerCol.querySelector(`.match-word[data-key="${wordKey}"]`);
            const imgBlock = zoneExercice.querySelector(`.match-image[data-key="${imageKey}"]`);
            if (wordBlock) wordBlock.classList.add('match-wrong');
            if (imgBlock) imgBlock.classList.add('match-wrong');
            setTimeout(()=>{
                if (wordBlock) wordBlock.classList.remove('match-wrong');
                if (imgBlock) imgBlock.classList.remove('match-wrong');
            }, 600);
            setTimeout(()=>{ if (line && line.parentNode) line.parentNode.removeChild(line); }, 700);
        }
    }

    // wire points
    zoneExercice.querySelectorAll('.connector-point').forEach(pt => {
        pt.addEventListener('click', (e) => {
            if (pt.classList.contains('disabled')) return;
            // if no start selected and this is a word point -> select
            const role = pt.getAttribute('data-role');
            if (!startPoint) {
                if (role !== 'word') {
                    // signal: must select a word point first
                    pt.classList.add('match-wrong');
                    setTimeout(()=>pt.classList.remove('match-wrong'), 350);
                    return;
                }
                startPoint = pt;
                pt.classList.add('selected');
                return;
            }
            // if clicking same point -> deselect
            if (startPoint === pt) { startPoint.classList.remove('selected'); startPoint = null; return; }
            // else attempt to connect startPoint -> pt
            connectPoints(startPoint, pt);
            if (startPoint) startPoint.classList.remove('selected');
            startPoint = null;
        });
        pt.addEventListener('keydown', (e) => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); pt.click(); } });
    });

    // on resize, update existing lines positions (in case of window resize)
    window.addEventListener('resize', () => {
        const lines = svg.querySelectorAll('line');
        lines.forEach(line => {
            const x1 = line.getAttribute('x1'); // keep as-is; more advanced updating would store endpoints
        });
    });
}
