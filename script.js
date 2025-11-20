 let nomJoueur = '';
        let niveauxCompletes = [];
        let niveauActuel = 0;
        let exerciceTermine = false;
        let reponsesDonnees = {};

        const niveaux = [
            { id: 1, type: 'cours', nom: 'Lesson 1', emoji: '📚' },
            { id: 2, type: 'exercice', nom: 'Exercise 1', emoji: '✏️' },
            { id: 3, type: 'cours', nom: 'Lesson 2', emoji: '📖' },
            { id: 4, type: 'exercice', nom: 'Exercise 2', emoji: '📝' },
            { id: 5, type: 'cours', nom: 'Lesson 3', emoji: '📕' },
            { id: 6, type: 'exercice', nom: 'Exercise 3', emoji: '✍️' },
            { id: 7, type: 'cours', nom: 'Lesson 4', emoji: '📗' },
            { id: 8, type: 'exercice', nom: 'Exercise 4', emoji: '📋' },
            { id: 9, type: 'cours', nom: 'Lesson 5', emoji: '📘' },
            { id: 10, type: 'exercice', nom: 'Exercise 5', emoji: '⭐' },
            { id: 11, type: 'evaluation', nom: 'Final Evaluation', emoji: '🏆' }
        ];

        const contenus = {
            1: { texte: "Bienvenue ! Aujourd'hui nous allons apprendre les couleurs en anglais. Les couleurs sont très importantes pour décrire le monde autour de toi !" },
            2: {
                texte: "Comment dit-on 'rouge' en anglais ?",
                reponses: [
                    { texte: "Blue", correct: false },
                    { texte: "Red", correct: true },
                    { texte: "Green", correct: false }
                ]
            },
            3: { texte: "Très bien ! Maintenant apprenons les nombres. Les nombres de 1 à 10 sont essentiels pour compter en anglais." },
            4: {
                texte: "Comment dit-on '5' en anglais ?",
                reponses: [
                    { texte: "Four", correct: false },
                    { texte: "Five", correct: true },
                    { texte: "Six", correct: false }
                ]
            },
            5: { texte: "Excellent ! Découvrons maintenant les animaux. Il y a beaucoup d'animaux différents et chacun a un nom en anglais." },
            6: {
                texte: "Comment dit-on 'chat' en anglais ?",
                reponses: [
                    { texte: "Dog", correct: false },
                    { texte: "Cat", correct: true },
                    { texte: "Bird", correct: false }
                ]
            },
            7: { texte: "Super ! Voyons les jours de la semaine maintenant. Il y a 7 jours dans une semaine." },
            8: {
                texte: "Comment dit-on 'lundi' en anglais ?",
                reponses: [
                    { texte: "Sunday", correct: false },
                    { texte: "Monday", correct: true },
                    { texte: "Tuesday", correct: false }
                ]
            },
            9: { texte: "Fantastique ! Pour finir, apprenons les salutations. C'est important pour être poli !" },
            10: {
                texte: "Comment dit-on 'bonjour' en anglais ?",
                reponses: [
                    { texte: "Goodbye", correct: false },
                    { texte: "Hello", correct: true },
                    { texte: "Thank you", correct: false }
                ]
            },
            11: { type: 'evaluation' }
        };

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
            dessinerChemins();
        }

        const positionsX = ['20%', '30%', '70%', '65%', '40%', '45%', '75%', '70%', '25%', '35%'];
        const espacementY = 250;

        function genererNiveaux() {
            const conteneur = document.getElementById('conteneurNiveaux');
            conteneur.innerHTML = '';

            const niveauxNormaux = niveaux.filter(n => n.type !== 'evaluation');
            const hauteurNormale = (niveauxNormaux.length - 1) * espacementY + 200;
            const hauteurTotale = hauteurNormale + 400;
            conteneur.style.minHeight = `${hauteurTotale}px`;

            niveaux.forEach((niveau, index) => {
                const div = document.createElement('div');
                div.className = `niveau niveau-${niveau.type}`;
                div.id = `niveau-${niveau.id}`;
                
                if (niveau.type === 'evaluation') {
                    div.style.left = '50%';
                    div.style.top = `${hauteurNormale + 150}px`;
                    div.style.transform = 'translateX(-50%)';
                } else {
                    div.style.left = positionsX[index];
                    div.style.top = `${index * espacementY + 100}px`;
                    div.style.transform = 'translateX(-50%)';
                }
                
                const estComplete = niveauxCompletes.includes(niveau.id);
                let estProchainNiveau;
                
                if (niveau.type === 'evaluation') {
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
        }

        let timeoutDessin = null;
        
        function dessinerChemins() {
            if (timeoutDessin) {
                clearTimeout(timeoutDessin);
            }
            
            const svg = document.getElementById('cheminNiveaux');
            svg.innerHTML = '';

            timeoutDessin = setTimeout(() => {
                for (let i = 0; i < niveaux.length - 2; i++) {
                    const niveau1 = document.getElementById(`niveau-${i + 1}`);
                    const niveau2 = document.getElementById(`niveau-${i + 2}`);

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
                        
                        const estComplete = niveauxCompletes.includes(i + 1);
                        path.setAttribute('stroke', estComplete ? '#38ef7d' : '#95a5a6');
                        path.setAttribute('stroke-width', '20');
                        path.setAttribute('fill', 'none');
                        path.setAttribute('stroke-linecap', 'round');
                        path.style.filter = 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))';

                        svg.appendChild(path);
                    }
                }
                timeoutDessin = null;
            }, 100);
        }

        function ouvrirNiveau(id) {
            const niveau = document.getElementById(`niveau-${id}`);
            
            if (niveau.classList.contains('niveau-verrouille')) {
                return;
            }

            niveauActuel = id;
            exerciceTermine = false;
            afficherDialogue(id);
        }

        function afficherDialogue(niveauId) {
            const container = document.getElementById('dialogueContainer');
            const texteDialogue = document.getElementById('texteDialogue');
            const zoneExercice = document.getElementById('zoneExercice');
            const btnContinuer = document.getElementById('btnContinuer');
            
            const contenu = contenus[niveauId];
            const niveau = niveaux.find(n => n.id === niveauId);
            
            if (niveau.type === 'evaluation') {
                afficherEvaluation();
                return;
            }
            
            if (niveau.type === 'cours') {
                texteDialogue.textContent = contenu.texte;
                zoneExercice.style.display = 'none';
                btnContinuer.style.display = 'block';
                exerciceTermine = true;
            } else {
                texteDialogue.textContent = contenu.texte;
                zoneExercice.style.display = 'block';
                zoneExercice.innerHTML = `
                    <div class="exercice-titre">Choisis ta réponse :</div>
                    <div class="boutons-exercice" id="boutonsExercice"></div>
                    <div id="messageExercice"></div>
                `;
                
                const boutonsContainer = document.getElementById('boutonsExercice');
                contenu.reponses.forEach((reponse) => {
                    const btn = document.createElement('button');
                    btn.className = 'bouton-exercice';
                    btn.textContent = reponse.texte;
                    btn.onclick = () => verifierReponse(reponse.correct, btn);
                    boutonsContainer.appendChild(btn);
                });
                
                btnContinuer.style.display = 'none';
            }
            
            container.style.display = 'flex';
        }

        function afficherEvaluation() {
            const container = document.getElementById('dialogueContainer');
            const zoneExercice = document.getElementById('zoneExercice');
            const texteDialogue = document.getElementById('texteDialogue');
            const btnContinuer = document.getElementById('btnContinuer');
            
            const exercicesIds = [2, 4, 6, 8, 10];
            const nbBonnesReponses = exercicesIds.filter(id => reponsesDonnees[id] === true).length;
            const note = (nbBonnesReponses * 20) / 5;
            
            let appreciation = '';
            let etoiles = '';
            if (note >= 20) {
                appreciation = '🎉 Excellent travail ! Tu es un champion de l\'anglais !';
                etoiles = '⭐⭐⭐⭐⭐';
            } else if (note >= 16) {
                appreciation = '👏 Très bien ! Continue comme ça !';
                etoiles = '⭐⭐⭐⭐';
            } else if (note >= 12) {
                appreciation = '👍 Bien ! Tu progresses !';
                etoiles = '⭐⭐⭐';
            } else if (note >= 8) {
                appreciation = '💪 Pas mal ! Encore un petit effort !';
                etoiles = '⭐⭐';
            } else {
                appreciation = '📚 Continue à t\'entraîner, tu vas y arriver !';
                etoiles = '⭐';
            }
            
            texteDialogue.textContent = 'Voici tes résultats !';
            zoneExercice.style.display = 'block';
            zoneExercice.innerHTML = `
                <div class="resultats-container">
                    <div class="note-finale">${note}</div>
                    <div class="note-sur">sur 20</div>
                    <div class="etoiles">${etoiles}</div>
                    <div class="appreciation">${appreciation}</div>
                    
                    <div class="recapitulatif">
                        <div class="recapitulatif-titre">📊 Récapitulatif de tes exercices :</div>
                        <div class="ligne-recap">
                            <span>✏️ Exercice 1 - Les couleurs</span>
                            <span>${reponsesDonnees[2] ? '✅ Réussi' : '❌ Raté'}</span>
                        </div>
                        <div class="ligne-recap">
                            <span>📝 Exercice 2 - Les nombres</span>
                            <span>${reponsesDonnees[4] ? '✅ Réussi' : '❌ Raté'}</span>
                        </div>
                        <div class="ligne-recap">
                            <span>✍️ Exercice 3 - Les animaux</span>
                            <span>${reponsesDonnees[6] ? '✅ Réussi' : '❌ Raté'}</span>
                        </div>
                        <div class="ligne-recap">
                            <span>📋 Exercice 4 - Les jours</span>
                            <span>${reponsesDonnees[8] ? '✅ Réussi' : '❌ Raté'}</span>
                        </div>
                        <div class="ligne-recap">
                            <span>⭐ Exercice 5 - Les salutations</span>
                            <span>${reponsesDonnees[10] ? '✅ Réussi' : '❌ Raté'}</span>
                        </div>
                    </div>
                </div>
            `;
            
            btnContinuer.style.display = 'block';
            btnContinuer.textContent = 'Terminer 🎉';
            exerciceTermine = true;
            
            container.style.display = 'flex';
        }

        function verifierReponse(estCorrect, bouton) {
            const messageDiv = document.getElementById('messageExercice');
            const tousLesBoutons = document.querySelectorAll('.bouton-exercice');
            const btnContinuer = document.getElementById('btnContinuer');
            
            tousLesBoutons.forEach(btn => btn.style.pointerEvents = 'none');
            
            if (estCorrect) {
                bouton.classList.add('correct');
                messageDiv.innerHTML = '<div class="message-exercice message-succes">🎉 Bravo ! C\'est la bonne réponse !</div>';
                exerciceTermine = true;
                
                reponsesDonnees[niveauActuel] = true;
                
                setTimeout(() => {
                    btnContinuer.style.display = 'block';
                }, 600);
            } else {
                bouton.classList.add('incorrect');
                messageDiv.innerHTML = '<div class="message-exercice message-erreur">😊 Pas tout à fait ! Réessaye !</div>';
                
                if (reponsesDonnees[niveauActuel] === undefined) {
                    reponsesDonnees[niveauActuel] = false;
                }
                
                setTimeout(() => {
                    tousLesBoutons.forEach(btn => {
                        if (!btn.classList.contains('incorrect')) {
                            btn.style.pointerEvents = 'auto';
                        }
                    });
                    
                    setTimeout(() => {
                        messageDiv.innerHTML = '';
                    }, 2000);
                }, 500);
            }
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
                setTimeout(() => {
                    dessinerChemins();
                }, 200);
            }
        }

        let resizeTimeout = null;
        window.addEventListener('resize', () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(() => {
                dessinerChemins();
                resizeTimeout = null;
            }, 250);
        });