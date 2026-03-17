// --- VARIABLES GLOBALES ---
let vies = 3;
let personnageActuel = null;
let menteurDemasque = false;
let isTyping = false;
let personnages = {}; // Sera rempli au hasard à chaque partie !

const portraitEmojis = { 'Alex': '😊', 'Maxime': '😏', 'Chloé': '📸', 'Sam': '🕵️', 'Julien': '🔮' };

// --- LES 5 PROFILS DE PERSONNALITÉ (Sans nom assigné) ---
const profilsDeBase = [
    {
        id: 'famille',
        subtitle: 'Cherche la stabilité',
        criteresHTML: `<div class="criteria-item">📷 Aime les photos</div><div class="criteria-item">👶 Veut des enfants</div><div class="criteria-item">❤️ Accepte les défauts</div>`,
        isMenteur: false, sujetMensonge: null,
        aveu: "",
        secret: { critere: 'enfants', valeur: 1, msg: "veut absolument des enfants (👶 ✅)." },
        epilogue: "Quelques mois plus tard... Vous êtes assis(e) sur le tapis du salon. Dans vos mains, un tout nouvel album Polaroid se remplit des rires de l'après-midi. L'agitation est là, douce et réconfortante. Vous avez trouvé votre équilibre.",
        dialogue: {
            'start': { npc: "Coucou... Je t'avoue que je suis un peu impressionné(e) par tout ce monde. C'est la première fois.", choix: [{ texteBtn: "A) On va y aller doucement.", texteJoueur: "Ne t'en fais pas, on va discuter tranquillement.", nextNode: 'rassurer', patienceModif: +10 }, { texteBtn: "B) T'es timide ? Bof...", texteJoueur: "T'es timide ? C'est un peu un tue-l'amour pour moi.", nextNode: 'mechant', patienceModif: -30 }] },
            'rassurer': { npc: "Merci. Je cherche quelqu'un d'authentique. L'image parfaite sur les réseaux, ça me fatigue.", choix: [{ texteBtn: "Tu ne postes jamais rien ?", texteJoueur: "Tu ne gardes pas de souvenirs ?", nextNode: 'evasif_photos', patienceModif: 0 }, { texteBtn: "L'authenticité, c'est accepter les défauts.", texteJoueur: "L'authenticité, c'est accepter que l'autre n'est pas parfait.", nextNode: 'defauts', patienceModif: +10 }] },
            'mechant': { npc: "Oh... je vois. C'est assez direct.", choix: [{ texteBtn: "C'était une blague !", texteJoueur: "Attends, c'était une blague !", nextNode: 'rattrapage', patienceModif: +10 }, { texteBtn: "Tant pis, ciao.", texteJoueur: "Tant pis. Ciao.", nextNode: 'fin_ratee', patienceModif: -70 }] },
            'rattrapage': { npc: "Hmm... d'accord. Je veux bien passer outre.", choix: [{ texteBtn: "Tu aimes garder des souvenirs ?", texteJoueur: "Merci. Comment gardes-tu tes souvenirs ?", nextNode: 'evasif_photos', patienceModif: 0 }] },
            'evasif_photos': { npc: "Je préfère vivre le moment présent, mais j'aime bien avoir une trace.", choix: [{ texteBtn: "[Insister] Une trace physique ou numérique ?", texteJoueur: "Mais concrètement, tu prends des photos ou pas ?", nextNode: 'verite_photos', patienceModif: -15 }, { texteBtn: "[Laisser couler] Bonne philosophie.", texteJoueur: "Vivre le moment présent, c'est le plus important.", nextNode: 'enfants', patienceModif: +10 }] },
            'verite_photos': { npc: "Tu es insistant(e)... Mais oui, j'ai un Polaroid sur moi. Je n'imprime que du physique.", choix: [{ texteBtn: "C'est mignon. Et ton week-end ?", texteJoueur: "Tu as fait quoi ce week-end d'ailleurs ?", nextNode: 'enfants', patienceModif: +10 }] },
            'enfants': { npc: "Ce week-end ? J'ai couru après des enfants dans le jardin. C'était l'agitation totale.", choix: [{ texteBtn: "[Insister] Ça te donne envie d'en avoir ?", texteJoueur: "Ça ne t'a pas refroidi(e) pour avoir tes propres enfants ?", nextNode: 'verite_enfants', patienceModif: -15 }, { texteBtn: "[Laisser couler] Sympa.", texteJoueur: "Ça devait être un week-end bien rempli !", nextNode: 'defauts', patienceModif: +10 }] },
            'verite_enfants': { npc: "Refroidi(e) ? Pas du tout. C'est même mon rêve d'avoir ma propre tribu.", choix: [{ texteBtn: "C'est un beau projet.", texteJoueur: "C'est un très beau projet de vie.", nextNode: 'defauts', patienceModif: +10 }] },
            'defauts': { npc: "L'amour, c'est trouver la personne dont on trouve les manies attachantes... On a tous des défauts.", choix: [{ texteBtn: "On est d'accord.", texteJoueur: "Je crois qu'on est vraiment sur la même longueur d'onde.", nextNode: 'fin', patienceModif: +10 }] },
            'fin': { npc: "Ça me fait super plaisir... N'hésite pas à me choisir si on est compatibles !", choix: [] },
            'fin_ratee': { npc: "Je retourne lire mon livre. Bonne soirée.", choix: [] }
        }
    },
    {
        id: 'menteur',
        subtitle: 'Très (trop) sûr(e) de soi',
        criteresHTML: ``, // Ne sera jamais le match
        isMenteur: true, sujetMensonge: 'defauts',
        aveu: "D'accord ! Je mens ! J'ai plein de défauts et je suis terrifié qu'on les voie ! Je te donne des indices sur les autres si tu te tais !",
        secret: null,
        epilogue: "Une semaine plus tard... Le masque est complètement tombé. Derrière cette façade de perfection se cachait une personne terrifiée à l'idée de décevoir. En acceptant ses failles, vous avez découvert quelqu'un de profondément loyal.",
        dialogue: {
            'start': { npc: "Salut. Je te préviens, j'ai des standards très élevés. Ne me fais pas perdre mon temps.", choix: [{ texteBtn: "A) Pourquoi si exigeant(e) ?", texteJoueur: "Pourquoi es-tu si exigeant(e) ? Tu cherches la perfection ?", nextNode: 'ego', patienceModif: 0 }, { texteBtn: "B) Redescends sur Terre...", texteJoueur: "Redescends sur Terre, tu n'es pas le centre du monde.", nextNode: 'clash', patienceModif: -20 }] },
            'ego': { npc: "La perfection, je l'incarne déjà. Je réussis tout. Je n'ai aucune faille.", choix: [{ texteBtn: "[Piquer] Personne n'est parfait.", texteJoueur: "Personne n'est parfait. Tu as forcément des défauts.", nextNode: 'defauts', patienceModif: -15 }, { texteBtn: "[Flatter] Impressionnant.", texteJoueur: "C'est impressionnant d'être aussi confiant.", nextNode: 'enfants', patienceModif: +15 }] },
            'clash': { npc: "Je suis juste réaliste. Mon couple devra être à mon image : lisse et sans aucun accroc.", choix: [{ texteBtn: "[Insister] Zéro défaut toléré ?", texteJoueur: "Donc tu ne toléreras aucun défaut chez ton partenaire ?", nextNode: 'defauts', patienceModif: -10 }] },
            'enfants': { npc: "J'ai un emploi du temps chargé, mais oui, transmettre mon patrimoine exceptionnel à des enfants est prévu.", choix: [{ texteBtn: "Tu aimes les photos ?", texteJoueur: "Tu documentes cette vie parfaite avec des photos ?", nextNode: 'photos', patienceModif: 0 }] },
            'defauts': { npc: "Tolérer les défauts, c'est de la complaisance pour les faibles. Je veux un match parfait.", choix: [{ texteBtn: "Et tes souvenirs ?", texteJoueur: "Vision très froide... Et tes souvenirs, tu les gardes comment ?", nextNode: 'photos', patienceModif: 0 }] },
            'photos': { npc: "Les photos ? Je n'en prends pas. Ma mémoire absolue me suffit largement.", choix: [{ texteBtn: "C'est noté.", texteJoueur: "D'accord... C'est noté.", nextNode: 'fin', patienceModif: 0 }] },
            'fin': { npc: "Réfléchis bien. Tu ne trouveras pas mieux ici.", choix: [] }
        }
    },
    {
        id: 'libre',
        subtitle: 'Esprit libre',
        criteresHTML: `<div class="criteria-item">✈️ Indépendant(e)</div><div class="criteria-item">🤫 Ne veut pas d'enfants</div><div class="criteria-item">📷 Documente sa vie</div>`,
        isMenteur: false, sujetMensonge: null,
        aveu: "",
        secret: { critere: 'enfants', valeur: 2, msg: "ne veut absolument pas d'enfants (👶 ❌)." },
        epilogue: "Un an plus tard... Votre appartement est d'un calme absolu. Vous sirotez un café en silence, préparant vos valises pour un départ improvisé à Rome demain matin. La liberté n'a jamais été aussi belle.",
        dialogue: {
            'start': { npc: "Coucou ! J'adore l'esthétique de ce café, ça donne envie de sortir son appareil !", choix: [{ texteBtn: "Tu aimes la photographie ?", texteJoueur: "Tu aimes la photographie ?", nextNode: 'photos', patienceModif: +10 }, { texteBtn: "Moi j'aime le calme ici.", texteJoueur: "Moi je suis surtout là pour le calme.", nextNode: 'evasif_calme', patienceModif: 0 }] },
            'photos': { npc: "Je suis le/la pro des albums physiques ! Mes voyages, mes soirées, je documente toute ma vie.", choix: [{ texteBtn: "Tu voyages beaucoup ?", texteJoueur: "Tu voyages beaucoup j'imagine ?", nextNode: 'evasif_calme', patienceModif: 0 }] },
            'evasif_calme': { npc: "Oui, ma liberté et mon calme, c'est sacré. J'aime quand rien ne bouge.", choix: [{ texteBtn: "[Insister] Donc pas d'enfants ?", texteJoueur: "Un sanctuaire silencieux... Donc fonder une famille, c'est mort ?", nextNode: 'verite_enfants', patienceModif: -20 }, { texteBtn: "[Laisser couler] C'est important.", texteJoueur: "C'est très important d'avoir un endroit pour se ressourcer.", nextNode: 'defauts', patienceModif: +10 }] },
            'verite_enfants': { npc: "Tu y vas fort, mais oui. L'agitation à la maison ? Pitié non. Je tiens bien trop à mon indépendance.", choix: [{ texteBtn: "C'est honnête. Et le couple ?", texteJoueur: "Au moins c'est honnête. Et sinon, le secret d'un couple ?", nextNode: 'defauts', patienceModif: +10 }] },
            'defauts': { npc: "Accepter que l'autre soit humain ! On a tous des défauts, il faut juste trouver les manies supportables.", choix: [{ texteBtn: "Tout à fait d'accord !", texteJoueur: "Je suis tout à fait d'accord avec toi !", nextNode: 'fin', patienceModif: +10 }] },
            'fin': { npc: "Génial ! Si ma vision t'inspire, tu sais où me trouver.", choix: [] }
        }
    },
    {
        id: 'observateur',
        subtitle: 'Fouineur/se',
        criteresHTML: `<div class="criteria-item">🕵️ Observe tout</div><div class="criteria-item">🤫 Fuit l'agitation</div><div class="criteria-item">❤️ Très indulgent(e)</div>`,
        isMenteur: false, sujetMensonge: null,
        aveu: "",
        secret: { critere: 'defauts', valeur: 1, msg: "accepte très bien les défauts des autres (❤️ ✅)." },
        epilogue: "Six mois plus tard... Vous êtes au fond d'un restaurant. Votre partenaire observe les autres clients et vous chuchote des déductions hilarantes. Entre deux rires complices et une totale indulgence pour vos défauts, vous savez que c'est le bon choix.",
        dialogue: {
            'start': { npc: "Chut... regarde les autres. Je suis sûr(e) que certains cachent bien leur jeu.", choix: [{ texteBtn: "Tu as remarqué quoi ?", texteJoueur: "Tu as l'air d'avoir bien observé. Tu as des infos ?", nextNode: 'ragots', patienceModif: +10 }, { texteBtn: "Parle-moi de toi plutôt.", texteJoueur: "Je préfère qu'on parle de toi. Tu es comment ?", nextNode: 'evasif_perso', patienceModif: 0 }] },
            'ragots': { npc: "Quelqu'un ici s'invente une vie parfaite. Et un(e) autre parle tout le temps de ses neveux. C'est sympa mais épuisant.", choix: [{ texteBtn: "Tu n'aimes pas les enfants ?", texteJoueur: "Ça t'épuise tant que ça, les enfants ?", nextNode: 'verite_enfants', patienceModif: -15 }, { texteBtn: "Et toi, tu acceptes les défauts ?", texteJoueur: "Certains se disent parfaits. Et toi, tu acceptes les défauts ?", nextNode: 'defauts', patienceModif: 0 }] },
            'evasif_perso': { npc: "Moi ? Je suis plutôt dans l'observation. Je garde les souvenirs en tête. Et je préfère le calme.", choix: [{ texteBtn: "[Insister] Zéro photo et zéro enfant ?", texteJoueur: "Donc tu ne prends jamais de photos ? Et pas de famille ?", nextNode: 'verite_enfants', patienceModif: -25 }, { texteBtn: "[Laisser couler] Un mystère.", texteJoueur: "C'est mystérieux. Un observateur silencieux.", nextNode: 'defauts', patienceModif: +10 }] },
            'verite_enfants': { npc: "Pour être clair(e), je ne prends pas de photos. Et les enfants, c'est hors de question. Trop de bruit.", choix: [{ texteBtn: "Je vois. Et l'amour ?", texteJoueur: "D'accord, c'est noté. Et comment tu vois l'amour alors ?", nextNode: 'defauts', patienceModif: +10 }] },
            'defauts': { npc: "L'amour, c'est l'indulgence. On est tous un peu cassés. Accepter les travers de l'autre, c'est la seule façon de durer.", choix: [{ texteBtn: "C'est profond.", texteJoueur: "C'est beau et profond comme vision.", nextNode: 'fin', patienceModif: +10 }] },
            'fin': { npc: "Ravi(e) qu'on se comprenne. Fais gaffe à tes choix !", choix: [] }
        }
    },
    {
        id: 'perche',
        subtitle: 'Dans sa bulle',
        criteresHTML: `<div class="criteria-item">🔮 Connecté(e) aux ondes</div><div class="criteria-item">📷 Fuit les photos</div><div class="criteria-item">🦎 Aime les reptiles</div>`,
        isMenteur: false, sujetMensonge: null,
        aveu: "",
        secret: { critere: 'photos', valeur: 2, msg: "se fiche totalement des photos souvenirs (📷 ❌)." },
        epilogue: "Quelques semaines plus tard... Vous vous réveillez avec la tête strictement alignée sur le Nord magnétique. Sur la table de la cuisine, un portrait de vous en confiture vous attend. C'est absurde, mais vous êtes heureux(se).",
        dialogue: {
            'start': { npc: "Salutations, âme errante ! Sais-tu que cette table vibre sur une fréquence de 432 Hz ?", choix: [{ texteBtn: "Euh... très bien.", texteJoueur: "Euh... très bien. C'est bon pour l'amour ?", nextNode: 'vortex', patienceModif: 0 }, { texteBtn: "T'es un peu perché(e), non ?", texteJoueur: "T'es un peu perché(e) toi, non ? Tu as des passions normales ?", nextNode: 'evasif_passions', patienceModif: -20 }] },
            'vortex': { npc: "Oui ! Les énergies nous connectent. Moi, pour m'ancrer, je peins des portraits de tartines au beurre.", choix: [{ texteBtn: "Tu ne prends pas de photos ?", texteJoueur: "Tu les peins ? Tu ne prends pas juste une photo ?", nextNode: 'verite_photos', patienceModif: -15 }] },
            'evasif_passions': { npc: "La normalité est une illusion. Je m'occupe de mes 4 iguanes et j'essaie de fuir le tumulte humain.", choix: [{ texteBtn: "[Insister] Fuir les bébés aussi ?", texteJoueur: "Fuir les humains ? Ça veut dire que fonder une famille c'est non ?", nextNode: 'verite_enfants', patienceModif: -15 }, { texteBtn: "[Laisser couler] Les iguanes c'est cool.", texteJoueur: "Les iguanes c'est très cool comme compagnie.", nextNode: 'defauts', patienceModif: +10 }] },
            'verite_photos': { npc: "Les appareils photos volent l'aura des tartines. Je refuse d'en utiliser. Jamais.", choix: [{ texteBtn: "C'est un concept.", texteJoueur: "C'est un concept unique. Et pour ta vision du couple ?", nextNode: 'defauts', patienceModif: +10 }] },
            'verite_enfants': { npc: "Des bébés humains ? L'horreur. Ils dérèglent les chakras. Mes iguanes me suffisent amplement.", choix: [{ texteBtn: "D'accord... Et le couple ?", texteJoueur: "D'accord... Et dans un couple, tu es tolérant(e) ?", nextNode: 'defauts', patienceModif: +10 }] },
            'defauts': { npc: "Le secret, c'est de dormir vers le Nord magnétique pour accepter les ondes négatives et les défauts de l'autre.", choix: [{ texteBtn: "Merci pour l'astuce.", texteJoueur: "Je note l'astuce du Nord magnétique. Merci.", nextNode: 'fin', patienceModif: +10 }] },
            'fin': { npc: "Que l'univers guide ton choix, voyageur !", choix: [] }
        }
    }
];

// --- INITIALISATION DU JEU (LE GRAND MÉLANGE !) ---
function initialiserJeu() {
    let prenoms = ['Alex', 'Maxime', 'Chloé', 'Sam', 'Julien'];
    
    // On mélange les profils au hasard
    let profilsMelanges = [...profilsDeBase].sort(() => Math.random() - 0.5);

    prenoms.forEach((nom, index) => {
        let p = profilsMelanges[index];
        personnages[nom] = {
            patience: 100,
            subtitle: p.subtitle,
            isMenteur: p.isMenteur,
            sujetMensonge: p.sujetMensonge,
            aveu: p.aveu,
            secret: p.secret,
            criteresHTML: p.criteresHTML,
            epilogue: p.epilogue,
            noeudActuel: 'start',
            dialogue: p.dialogue 
        };
    });

    // On choisit le Match parmi ceux qui ne sont PAS menteurs
    let candidatsSains = prenoms.filter(nom => !personnages[nom].isMenteur);
    let matchGagnant = candidatsSains[Math.floor(Math.random() * candidatsSains.length)];
    personnages[matchGagnant].isMatch = true;

    // Affichage des nouveaux critères sur l'écran d'accueil
    let box = document.querySelector('.criteria-box');
    if(box) box.innerHTML = `<strong>🎯 Critères de votre match</strong>` + personnages[matchGagnant].criteresHTML;
}

// On lance le mélange dès que le script charge !
initialiserJeu();

// --- CARNET INTELLIGENT ---
const etatsCarnet = ["❓", "✅", "❌"];
let notesJoueur = { 'Alex': { photos: 0, enfants: 0, defauts: 0 }, 'Maxime': { photos: 0, enfants: 0, defauts: 0 }, 'Chloé': { photos: 0, enfants: 0, defauts: 0 }, 'Sam': { photos: 0, enfants: 0, defauts: 0 }, 'Julien': { photos: 0, enfants: 0, defauts: 0 } };
let notesPiratees = { 'Alex': { photos: 0, enfants: 0, defauts: 0 }, 'Maxime': { photos: 0, enfants: 0, defauts: 0 }, 'Chloé': { photos: 0, enfants: 0, defauts: 0 }, 'Sam': { photos: 0, enfants: 0, defauts: 0 }, 'Julien': { photos: 0, enfants: 0, defauts: 0 } };

function ouvrirCarnet() { genererCarnetHTML(); document.getElementById('carnet-modal').classList.remove('hidden'); }
function fermerCarnet() { document.getElementById('carnet-modal').classList.add('hidden'); }
function changerNote(nom, critere) { notesJoueur[nom][critere] = (notesJoueur[nom][critere] + 1) % 3; genererCarnetHTML(); }

function genererCarnetHTML() {
    let liste = document.getElementById('carnet-list'); liste.innerHTML = "";
    let aUneContradiction = false;
    for (let nom in notesJoueur) {
        let row = document.createElement('div'); row.className = "carnet-row";
        let htmlBoutons = ""; let profilsCriteres = ['photos', 'enfants', 'defauts']; let elimine = false;
        profilsCriteres.forEach(critere => {
            let noteJ = notesJoueur[nom][critere]; let noteVraie = notesPiratees[nom][critere];
            let enConflit = (noteJ !== 0 && noteVraie !== 0 && noteJ !== noteVraie);
            if (enConflit) aUneContradiction = true;
            if (noteJ === 2) elimine = true;
            htmlBoutons += `<button class="btn-clue ${enConflit ? 'conflict' : ''}" onclick="changerNote('${nom}', '${critere}')">${critere === 'photos' ? '📷' : critere === 'enfants' ? '👶' : '❤️'} ${etatsCarnet[noteJ]}</button>`;
        });
        if(elimine) row.classList.add('eliminated');
        row.innerHTML = `<div class="carnet-name">👤 ${nom} ${elimine ? '(Éliminé)' : ''}</div><div class="carnet-clues">${htmlBoutons}</div>`;
        liste.appendChild(row);
    }
    let alerte = document.getElementById('carnet-alert');
    if(alerte) { if (aUneContradiction) alerte.classList.remove('hidden'); else alerte.classList.add('hidden'); }
}

// --- LE TUTORIEL ---
let etapeTutoActuelle = 0;
const etapesTuto = [
    { titre: "💖 Bienvenue", texte: "Dans ce café, les personnalités changent à chaque partie ! Regarde bien tes critères de recherche avant d'entrer." },
    { titre: "💬 Patience et Risques", texte: "Les candidats sont évasifs. Sois insistant pour obtenir la vérité, mais attention : tu perdras de la patience !" },
    { titre: "🕵️ L'Objection", texte: "L'un d'eux ment sur un point précis. Accuse-le au bon moment avec une preuve de ton carnet pour pirater ses secrets." }
];

document.getElementById('btn-start').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('tutorial-screen').classList.remove('hidden');
    etapeTutoSuivante(true);
});

function etapeTutoSuivante(firstTime = false) {
    if(!firstTime) etapeTutoActuelle++;
    if (etapeTutoActuelle < etapesTuto.length) {
        document.getElementById('tuto-title').innerText = etapesTuto[etapeTutoActuelle].titre;
        document.getElementById('tuto-text').innerText = etapesTuto[etapeTutoActuelle].texte;
        let dots = document.querySelectorAll('#tuto-dots span');
        dots.forEach((dot, index) => { if (index === etapeTutoActuelle) dot.classList.add('active'); else dot.classList.remove('active'); });
        if (etapeTutoActuelle === etapesTuto.length - 1) document.getElementById('btn-next-tuto').innerText = "Entrer dans le Café !";
    } else {
        document.getElementById('tutorial-screen').classList.add('hidden');
        document.getElementById('game-header').classList.remove('hidden');
        document.getElementById('selection-screen').classList.remove('hidden');
        document.getElementById('bg-music').volume = 0.3; document.getElementById('bg-music').play().catch(e=>{});
    }
}

// --- GESTION DE LA PATIENCE ---
function modifierPatience(valeur) {
    if (valeur === 0) return; 
    personnages[personnageActuel].patience += valeur;
    if (personnages[personnageActuel].patience > 100) personnages[personnageActuel].patience = 100;
    mettreAJourJauge();

    if (personnages[personnageActuel].patience <= 0) {
        personnages[personnageActuel].patience = 0;
        isTyping = true;
        setTimeout(() => {
            perdreVie("🤬 " + personnageActuel + " a perdu patience et a quitté la table !");
            retourMenuSelection();
        }, 1500);
    }
}

function mettreAJourJauge() {
    let patience = personnages[personnageActuel].patience;
    let bar = document.getElementById('patience-bar');
    if(bar) {
        bar.style.width = patience + "%";
        if (patience > 50) bar.style.backgroundColor = "#4caf50"; 
        else if (patience > 25) bar.style.backgroundColor = "#ff9800"; 
        else bar.style.backgroundColor = "#f44336"; 
    }
}

// --- MOTEUR DE DISCUSSION ---
function lancerDialogue(nom) {
    let sonTasse = document.getElementById('sfx-tasse'); sonTasse.currentTime = 0; sonTasse.play().catch(e=>{});
    let portrait = document.getElementById('char-portrait'); portrait.innerText = portraitEmojis[nom] || '🙂'; portrait.className = 'portrait-emoji';
    
    // Le sous-titre donne un indice sur la personnalité tirée au sort !
    document.getElementById('char-subtitle').innerText = personnages[nom].subtitle;

    personnageActuel = nom; menteurDemasque = false;
    document.querySelectorAll('.btn-table').forEach(btn => { if (btn.innerText.trim() === nom) btn.classList.add('visited'); });
    document.getElementById('selection-screen').classList.add('hidden'); document.getElementById('dialogue-screen').classList.remove('hidden');
    document.getElementById('char-name').innerText = nom; document.getElementById('chat-box').innerHTML = ''; 
    mettreAJourJauge();

    // Relancer la musique principale au cas où
    let mainMusic = document.getElementById('bg-music');
    if (mainMusic) {
        mainMusic.src = "musique.mp3";
        mainMusic.play().catch(e=>{});
    }

    let memoire = personnages[nom].noeudActuel || 'start'; 
    if (memoire !== 'start') {
        let sysMsg = document.createElement('div'); sysMsg.className = 'message-bubble sys-message'; sysMsg.innerText = "↩ Vous reprenez la conversation…"; document.getElementById('chat-box').appendChild(sysMsg);
    }
    allerAuNoeud(memoire); 
}

function allerAuNoeud(nodeId) {
    personnages[personnageActuel].noeudActuel = nodeId; 
    let noeud = personnages[personnageActuel].dialogue[nodeId];
    
    document.getElementById('questions-container').innerHTML = "";
    isTyping = true;
    
    let chatBox = document.getElementById('chat-box');
    let typingDiv = document.createElement('div');
    typingDiv.className = "typing-indicator"; typingDiv.id = "typing-dots";
    typingDiv.innerHTML = "<span></span><span></span><span></span>";
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    document.getElementById('char-portrait').classList.add('talking');
    setTimeout(() => {
        let dots = document.getElementById('typing-dots');
        if (dots) dots.remove();
        let sonMsg = document.getElementById('sfx-msg');
        if(sonMsg) { sonMsg.currentTime = 0; sonMsg.play().catch(e=>{}); }
        ajouterMessage(noeud.npc, false, noeud.choix);
    }, 1500); 
}

function ajouterMessage(texte, isPlayer, choixSuivants = null, actionApresEcriture = null) {
    let chatBox = document.getElementById('chat-box');
    let bubble = document.createElement('div');
    bubble.classList.add('message-bubble', isPlayer ? 'player-message' : 'npc-message');
    chatBox.appendChild(bubble);
    
    if (isPlayer) {
        bubble.innerText = texte; chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        typeWriter(bubble, texte, 0, choixSuivants, actionApresEcriture);
    }
}

function typeWriter(element, text, index, choixSuivants, actionApresEcriture) {
    if (index < text.length) {
        element.innerHTML += text.charAt(index);
        let chatBox = document.getElementById('chat-box'); chatBox.scrollTop = chatBox.scrollHeight; 
        setTimeout(() => typeWriter(element, text, index + 1, choixSuivants, actionApresEcriture), 20); 
    } else {
        isTyping = false; document.getElementById('char-portrait').classList.remove('talking');
        if (choixSuivants) afficherBoutons(choixSuivants);
        if (actionApresEcriture) actionApresEcriture();
    }
}

function afficherBoutons(choix) {
    let container = document.getElementById('questions-container'); container.innerHTML = ""; 
    if (choix.length > 0) {
        choix.forEach(c => {
            let btn = document.createElement('button'); btn.className = "btn-question"; btn.innerText = c.texteBtn;
            btn.onclick = () => {
                if (isTyping) return;
                ajouterMessage(c.texteJoueur, true); 
                if(c.patienceModif !== undefined) modifierPatience(c.patienceModif);
                allerAuNoeud(c.nextNode); 
            };
            container.appendChild(btn);
        });
    }
    let btnMenteur = document.createElement('button'); btnMenteur.className = "btn-danger"; btnMenteur.id = "btn-menteur";
    btnMenteur.innerText = "🚨 TU MENS !"; btnMenteur.onclick = accuserMensonge;
    container.appendChild(btnMenteur);
}

// --- LA CONFRONTATION FINALE ---
function accuserMensonge() {
    if (isTyping) return;
    document.getElementById('bg-music').pause();
    ajouterMessage("🚨 TU MENS !", true); modifierPatience(-30); 
    setTimeout(() => {
        ajouterMessage("Pardon ?! Tu m'accuses de mentir ? Prouve-le !", false, null, () => {
            setTimeout(() => { document.getElementById('confrontation-modal').classList.remove('hidden'); }, 800);
        });
    }, 400);
}

function annulerConfrontation() {
    document.getElementById('confrontation-modal').classList.add('hidden'); document.getElementById('bg-music').play().catch(e=>{});
    ajouterMessage("Laisse tomber, je me suis trompé(e)...", true); modifierPatience(-20); 
}

function resoudreConfrontation(sujetChoisi) {
    document.getElementById('confrontation-modal').classList.add('hidden'); document.getElementById('bg-music').play().catch(e=>{});
    let perso = personnages[personnageActuel];

    if (perso.isMenteur && perso.sujetMensonge === sujetChoisi) {
        ajouterMessage("Tu dis que tu es parfait, mais c'est faux !", true);
        setTimeout(() => {
            ajouterMessage("🚨 DÉMASQUÉ ! " + perso.aveu, false, null, () => { setTimeout(declencherRecompense, 1500); });
            menteurDemasque = true;
            let btnMenteur = document.getElementById('btn-menteur'); if(btnMenteur) btnMenteur.classList.add('hidden');
        }, 1000);
    } else {
        ajouterMessage("C'est n'importe quoi ! Je n'ai jamais menti là-dessus !", false, null, () => {
            setTimeout(() => {
                perdreVie("Accusation sans preuve !"); perdreVie("Le date tourne au désastre !");
                personnages[personnageActuel].patience = 0; mettreAJourJauge();
                setTimeout(() => { perdreVie("🤬 " + personnageActuel + " quitte la table furieux !"); retourMenuSelection(); }, 1500);
            }, 1000);
        });
    }
}

// --- RÉCOMPENSE ---
let indicesRestants = 3;
function declencherRecompense() {
    indicesRestants = 3; document.getElementById('indices-count').innerText = indicesRestants; document.getElementById('reward-result').innerText = "Choisis un profil à scanner..."; document.getElementById('btn-close-reward').classList.add('hidden');
    let liste = document.getElementById('reward-list'); liste.innerHTML = ""; 
    for (let nom in personnages) {
        if (nom !== personnageActuel) { 
            let btn = document.createElement('button'); btn.className = "btn-reward"; btn.innerText = "🕵️ Scanner " + nom; btn.onclick = () => donnerIndice(nom, btn); liste.appendChild(btn);
        }
    }
    document.getElementById('reward-modal').classList.remove('hidden');
}

function donnerIndice(nom, boutonClic) {
    if (indicesRestants > 0) {
        let secret = personnages[nom].secret; 
        document.getElementById('reward-result').innerText = nom + " " + secret.msg;
        notesJoueur[nom][secret.critere] = secret.valeur; notesPiratees[nom][secret.critere] = secret.valeur; 
        genererCarnetHTML(); 
        boutonClic.disabled = true; boutonClic.innerText = "✔️ Secret piraté"; indicesRestants--; document.getElementById('indices-count').innerText = indicesRestants;
        if (indicesRestants === 0) { document.getElementById('reward-result').innerText += "\n\nC'est tout ce que je sais ! Je te laisse tranquille maintenant."; document.getElementById('btn-close-reward').classList.remove('hidden'); }
    }
}
function fermerRecompense() { document.getElementById('reward-modal').classList.add('hidden'); }

// --- DECISIONS ET FINS DE JEU ---
function demanderConfirmationMatch() { if (isTyping) return; document.getElementById('confirm-modal').classList.remove('hidden'); }
function annulerMatch() { document.getElementById('confirm-modal').classList.add('hidden'); }

function confirmerMatch() {
    document.getElementById('confirm-modal').classList.add('hidden');
    if (personnages[personnageActuel].isMatch) {
        afficherEpilogue(personnageActuel);
    } else { 
        perdreVie("Aïe... " + personnageActuel + " ne correspond pas du tout aux critères demandés cette fois-ci !"); setTimeout(retourMenuSelection, 2000); 
    }
}

function quitterLaTable() {
    if (isTyping) return;
    let sysMsg = document.createElement('div'); sysMsg.className = 'message-bubble sys-message'; sysMsg.innerText = "🚶 Tu repars avec un doute…";
    document.getElementById('chat-box').appendChild(sysMsg); document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
    isTyping = false; 
    setTimeout(retourMenuSelection, 1200);
}

function perdreVie(message) {
    vies--; document.getElementById('lives').innerText = "❤️".repeat(vies) + "🖤".repeat(3 - vies);
    if (vies <= 0) afficherGameOver(message); 
    else {
        let sysMsg = document.createElement('div'); sysMsg.className = 'message-bubble sys-message'; sysMsg.innerText = "💔 " + message;
        document.getElementById('chat-box').appendChild(sysMsg); document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
    }
}

function afficherEpilogue(nomPerso) { 
    document.getElementById('dialogue-screen').classList.add('hidden'); document.getElementById('selection-screen').classList.add('hidden'); document.getElementById('game-header').classList.add('hidden'); 
    
    // Affichage propre de l'épilogue grâce aux données générées
    document.getElementById('epilogue-text').innerText = personnages[nomPerso].epilogue;
    document.getElementById('epilogue-screen').classList.remove('hidden'); 
    document.getElementById('epilogue-screen').querySelector('h1').innerText = "Match Parfait avec " + nomPerso + " !";
}

function afficherGameOver(msg) { document.getElementById('dialogue-screen').classList.add('hidden'); document.getElementById('selection-screen').classList.add('hidden'); document.getElementById('game-header').classList.add('hidden'); document.getElementById('gameover-screen').classList.remove('hidden'); document.getElementById('gameover-message').innerText = msg; }
function retourMenuSelection() {
    let musique = document.getElementById('bg-music'); musique.src = "musique.mp3"; musique.play().catch(e=>{});
    document.getElementById('dialogue-screen').classList.add('hidden'); document.getElementById('selection-screen').classList.remove('hidden');
}

// ==========================================
// --- MOTEUR DU MINI-JEU v3 ---
// Labyrinthe procédural + IA équilibrée
// 😏 voit en ligne droite seulement
// 🤵 patrouille pure
// ==========================================

let mazeCanvas, mazeCtx, minigameInterval, mazeAnimFrame;
let mazePlayer  = { x: 1, y: 8 };
let mazeGoal    = { x: 0, y: 0 };
let mazeEnemies = [];
let targetPersonnage = null;
let mazeTouchStartX = 0, mazeTouchStartY = 0;
let currentMazeMap  = [];
const MAZE_W = 10, MAZE_H = 10, TILE = 32;

// ============================================
// GÉNÉRATION PROCÉDURALE (Recursive Backtracker)
// ============================================
function genererLabyrinthe() {
    const grid    = Array.from({ length: MAZE_H }, () => Array(MAZE_W).fill(1));
    const visited = Array.from({ length: MAZE_H }, () => Array(MAZE_W).fill(false));

    function carve(cx, cy) {
        visited[cy][cx] = true;
        grid[cy][cx] = 0;
        for (const [dy, dx] of shuffle([[0,-2],[0,2],[-2,0],[2,0]])) {
            const ny = cy+dy, nx = cx+dx;
            if (nx>0 && nx<MAZE_W-1 && ny>0 && ny<MAZE_H-1 && !visited[ny][nx]) {
                grid[cy+dy/2][cx+dx/2] = 0;
                carve(nx, ny);
            }
        }
    }
    carve(1, 1);

    const playerPos = { x: 1, y: MAZE_H-2 };
    const goalPos   = { x: MAZE_W-2, y: 1 };
    grid[playerPos.y][playerPos.x] = 0;
    grid[goalPos.y][goalPos.x]     = 2;
    return { grid, playerPos, goalPos };
}

function shuffle(arr) {
    for (let i = arr.length-1; i > 0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function positionsSolLoin(grid, exclude, minDist) {
    const res = [];
    for (let y=1; y<MAZE_H-1; y++)
        for (let x=1; x<MAZE_W-1; x++) {
            if (grid[y][x] !== 0) continue;
            if (exclude.some(p => p.x===x && p.y===y)) continue;
            const dist = exclude.reduce((min,p) =>
                Math.min(min, Math.abs(p.x-x)+Math.abs(p.y-y)), Infinity);
            if (dist >= minDist) res.push({x, y});
        }
    return res;
}

// ============================================
// BFS (utilisé UNIQUEMENT pour le chaser quand
// il voit le joueur — pas en permanence)
// ============================================
function bfsProchainPas(grid, from, to) {
    const queue = [{ ...from, path:[] }];
    const seen  = new Set([`${from.x},${from.y}`]);
    while (queue.length) {
        const cur = queue.shift();
        if (cur.x===to.x && cur.y===to.y) return cur.path[0] || null;
        for (const [dy,dx] of [[0,1],[0,-1],[1,0],[-1,0]]) {
            const nx=cur.x+dx, ny=cur.y+dy, key=`${nx},${ny}`;
            if (!seen.has(key) && grid[ny]?.[nx] !== 1) {
                seen.add(key);
                queue.push({ x:nx, y:ny, path:[...cur.path, {x:nx,y:ny}] });
            }
        }
    }
    return null;
}

// ============================================
// CHAMP DE VISION — ligne droite dégagée
// Retourne true si ennemi voit le joueur
// ============================================
function voitJoueur(ennemi) {
    const ex = ennemi.x, ey = ennemi.y;
    const px = mazePlayer.x, py = mazePlayer.y;
    const PORTEE = 4; // cases max de vision

    // Même ligne horizontale
    if (ey === py && Math.abs(ex-px) <= PORTEE) {
        const minX = Math.min(ex,px), maxX = Math.max(ex,px);
        for (let x=minX+1; x<maxX; x++)
            if (currentMazeMap[ey][x] === 1) return false;
        return true;
    }
    // Même colonne verticale
    if (ex === px && Math.abs(ey-py) <= PORTEE) {
        const minY = Math.min(ey,py), maxY = Math.max(ey,py);
        for (let y=minY+1; y<maxY; y++)
            if (currentMazeMap[y][ex] === 1) return false;
        return true;
    }
    return false;
}

// ============================================
// DÉMARRAGE DU MINI JEU (ET GESTION AUDIO)
// ============================================
function parlerA(nom) {
    if (personnages[nom].noeudActuel && personnages[nom].noeudActuel !== 'start') {
        lancerDialogue(nom); return;
    }
    targetPersonnage = nom;
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('minigame-screen').classList.remove('hidden');
    demarrerMiniJeu();
}

function demarrerMiniJeu() {
    // --- GESTION DE LA MUSIQUE ---
    let mainMusic = document.getElementById('bg-music');
    let mazeMusic = document.getElementById('bg-music-maze');
    if (mainMusic) mainMusic.pause();
    if (mazeMusic) {
        mazeMusic.volume = 0.4;
        mazeMusic.currentTime = 0;
        mazeMusic.play().catch(e=>{});
    }
    // -----------------------------

    mazeCanvas = document.getElementById('maze-canvas');
    mazeCtx    = mazeCanvas.getContext('2d');

    const { grid, playerPos, goalPos } = genererLabyrinthe();
    currentMazeMap = grid;
    mazePlayer = { ...playerPos };
    mazeGoal   = { ...goalPos };

    // Ennemis loin du joueur (distance min 4)
    const candidats = positionsSolLoin(grid, [playerPos, goalPos], 4);
    const positions = shuffle(candidats).slice(0, 3);

    mazeEnemies = [
        // 🤵 Serveur 1 — patrouille horizontale pure
        {
            ...positions[0],
            dx: Math.random()<0.5 ? 1 : -1, dy: 0,
            emoji: '🤵', type: 'patrol',
            timer: 0, speed: 3  // bouge 1 fois toutes les 3 ticks (lent)
        },
        // 😏 Dragueur — patrouille, mais te traque en ligne de vue
        {
            ...positions[1],
            dx: 0, dy: Math.random()<0.5 ? 1 : -1,
            emoji: '😏', type: 'chaser',
            timer: 0, speed: 2,  // vitesse intermédiaire
            alerte: false        // devient true quand il te voit
        },
        // 🤵 Serveur 2 — patrouille verticale pure
        {
            ...(positions[2] || positions[0]),
            dx: 0, dy: Math.random()<0.5 ? 1 : -1,
            emoji: '🤵', type: 'patrol',
            timer: 0, speed: 4  // plus lent
        },
    ];

    document.getElementById('maze-status').innerText = '';
    document.addEventListener('keydown', handleMazeInput);
    mazeCanvas.addEventListener('touchstart', mazeTouchStart, { passive:true });
    mazeCanvas.addEventListener('touchend',   mazeTouchEnd,   { passive:true });

    clearInterval(minigameInterval);
    minigameInterval = setInterval(updateMazeEnemies, 200); // tick rapide, speed contrôle la fréquence
    if (mazeAnimFrame) cancelAnimationFrame(mazeAnimFrame);
    mazeAnimFrame = requestAnimationFrame(drawMaze);
}

// ============================================
// CONTRÔLES
// ============================================
function handleMazeInput(e) {
    if (document.getElementById('minigame-screen').classList.contains('hidden')) return;
    const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
    if (!map[e.key]) return;
    e.preventDefault();
    deplacerJoueur(map[e.key]);
}
function dpadMove(dir) {
    if (document.getElementById('minigame-screen').classList.contains('hidden')) return;
    deplacerJoueur(dir);
}
function mazeTouchStart(e) {
    mazeTouchStartX = e.touches[0].clientX;
    mazeTouchStartY = e.touches[0].clientY;
}
function mazeTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - mazeTouchStartX;
    const dy = e.changedTouches[0].clientY - mazeTouchStartY;
    if (Math.abs(dx)<12 && Math.abs(dy)<12) return;
    deplacerJoueur(Math.abs(dx)>Math.abs(dy) ? (dx>0?'right':'left') : (dy>0?'down':'up'));
}
function deplacerJoueur(dir) {
    let nx=mazePlayer.x, ny=mazePlayer.y;
    if (dir==='up')    ny--;
    if (dir==='down')  ny++;
    if (dir==='left')  nx--;
    if (dir==='right') nx++;
    if (currentMazeMap[ny]?.[nx] !== 1) {
        mazePlayer.x=nx; mazePlayer.y=ny;
        verifierCollisions();
    }
}

// ============================================
// IA ENNEMIS
// ============================================
function updateMazeEnemies() {
    mazeEnemies.forEach(e => {
        e.timer++;
        if (e.timer % e.speed !== 0) return; // fréquence contrôlée par speed

        if (e.type === 'patrol') {
            // Patrouille simple — demi-tour sur mur
            patrouiller(e);

        } else if (e.type === 'chaser') {
            const voit = voitJoueur(e);

            if (voit) {
                // En alerte : BFS vers le joueur
                e.alerte = true;
                afficherStatusMaze('👀 Il t\'a repéré !');
                const pas = bfsProchainPas(currentMazeMap, {x:e.x,y:e.y}, mazePlayer);
                if (pas) { e.x=pas.x; e.y=pas.y; }
            } else {
                if (e.alerte) {
                    // Vient de perdre de vue — continue encore 2 ticks dans la direction
                    const pas = bfsProchainPas(currentMazeMap, {x:e.x,y:e.y}, mazePlayer);
                    if (pas) { e.x=pas.x; e.y=pas.y; }
                    // Réinitialise après un moment
                    if (Math.random() < 0.3) { e.alerte=false; afficherStatusMaze(''); }
                } else {
                    // Patrouille normale
                    patrouiller(e);
                }
            }
        }
    });
    verifierCollisions();
}

function patrouiller(e) {
    let nx=e.x+e.dx, ny=e.y+e.dy;
    if (currentMazeMap[ny]?.[nx] === 1) {
        // Sur mur : cherche une autre direction libre au hasard
        const libres = [];
        for (const [dy,dx] of [[0,1],[0,-1],[1,0],[-1,0]]) {
            if (currentMazeMap[e.y+dy]?.[e.x+dx] !== 1)
                libres.push({dx,dy});
        }
        if (libres.length) {
            const choix = libres[Math.floor(Math.random()*libres.length)];
            e.dx=choix.dx; e.dy=choix.dy;
        }
    } else {
        e.x=nx; e.y=ny;
    }
}

// ============================================
// COLLISIONS
// ============================================
function verifierCollisions() {
    if (mazePlayer.x===mazeGoal.x && mazePlayer.y===mazeGoal.y) {
        stopMiniGame();
        document.getElementById('minigame-screen').classList.add('hidden');
        lancerDialogue(targetPersonnage);
        return;
    }
    for (const e of mazeEnemies) {
        if (e.x===mazePlayer.x && e.y===mazePlayer.y) {
            afficherStatusMaze('💔 Attrapé !');
            stopMiniGame();
            setTimeout(() => {
                perdreVie(e.emoji + " t'a bloqué(e) en chemin !");
                document.getElementById('minigame-screen').classList.add('hidden');
                document.getElementById('selection-screen').classList.remove('hidden');
                
                // Relance la musique du café
                let mainMusic = document.getElementById('bg-music');
                if (mainMusic) {
                    mainMusic.src = "musique.mp3";
                    mainMusic.play().catch(e=>{});
                }
            }, 600);
            return;
        }
    }
}

function afficherStatusMaze(msg) {
    const el = document.getElementById('maze-status');
    if (el) { el.innerText=msg; }
}

// ============================================
// RENDU
// ============================================
function drawMaze() {
    if (document.getElementById('minigame-screen').classList.contains('hidden')) return;
    mazeCtx.clearRect(0, 0, 320, 320);

    // Grille
    for (let y=0; y<MAZE_H; y++) {
        for (let x=0; x<MAZE_W; x++) {
            const cell = currentMazeMap[y][x];
            if (cell === 1) {
                mazeCtx.fillStyle = '#5d3010';
                mazeCtx.fillRect(x*TILE, y*TILE, TILE, TILE);
                mazeCtx.fillStyle = 'rgba(255,255,255,0.07)';
                mazeCtx.fillRect(x*TILE, y*TILE, TILE, 3);
                mazeCtx.fillStyle = 'rgba(0,0,0,0.25)';
                mazeCtx.fillRect(x*TILE, y*TILE+TILE-3, TILE, 3);
            } else {
                mazeCtx.fillStyle = ((x+y)%2===0) ? '#fdf6ee' : '#f5e6d3';
                mazeCtx.fillRect(x*TILE, y*TILE, TILE, TILE);
            }
        }
    }

    const pulse = 0.5 + 0.5*Math.sin(Date.now()/300);

    // Halo cible ☕
    mazeCtx.globalAlpha = 0.2+0.15*pulse;
    mazeCtx.fillStyle = '#f0305e';
    mazeCtx.beginPath();
    mazeCtx.arc(mazeGoal.x*TILE+16, mazeGoal.y*TILE+16, 13+pulse*3, 0, Math.PI*2);
    mazeCtx.fill();
    mazeCtx.globalAlpha = 1;

    // Cône de vision du dragueur (ligne droite, semi-transparent)
    const dragueur = mazeEnemies.find(e => e.type==='chaser');
    if (dragueur) {
        // Dessine rayon de vision dans les 4 directions
        mazeCtx.globalAlpha = 0.07;
        mazeCtx.fillStyle = '#ff2244';
        for (const [dy,dx] of [[0,1],[0,-1],[1,0],[-1,0]]) {
            for (let i=1; i<=4; i++) {
                const vx=dragueur.x+dx*i, vy=dragueur.y+dy*i;
                if (currentMazeMap[vy]?.[vx] === 1) break;
                mazeCtx.fillRect(vx*TILE, vy*TILE, TILE, TILE);
            }
        }
        mazeCtx.globalAlpha = 1;
        // Halo rouge si en alerte
        if (dragueur.alerte) {
            mazeCtx.globalAlpha = 0.25+0.15*pulse;
            mazeCtx.fillStyle = '#ff2244';
            mazeCtx.beginPath();
            mazeCtx.arc(dragueur.x*TILE+16, dragueur.y*TILE+16, 15, 0, Math.PI*2);
            mazeCtx.fill();
            mazeCtx.globalAlpha = 1;
        }
    }

    // Emojis
    mazeCtx.font = '20px serif';
    mazeCtx.textAlign = 'center';
    mazeCtx.textBaseline = 'middle';
    mazeCtx.fillText('☕', mazeGoal.x*TILE+16, mazeGoal.y*TILE+17);
    mazeCtx.fillText('🚶', mazePlayer.x*TILE+16, mazePlayer.y*TILE+17);
    mazeEnemies.forEach(e => mazeCtx.fillText(e.emoji, e.x*TILE+16, e.y*TILE+17));

    mazeAnimFrame = requestAnimationFrame(drawMaze);
}

// ============================================
// STOP / ABANDON
// ============================================
function stopMiniGame() {
    // --- COUPE LA MUSIQUE DU JEU ---
    let mazeMusic = document.getElementById('bg-music-maze');
    if(mazeMusic) mazeMusic.pause();
    // -------------------------------

    clearInterval(minigameInterval);
    if (mazeAnimFrame) cancelAnimationFrame(mazeAnimFrame);
    document.removeEventListener('keydown', handleMazeInput);
    if (mazeCanvas) {
        mazeCanvas.removeEventListener('touchstart', mazeTouchStart);
        mazeCanvas.removeEventListener('touchend', mazeTouchEnd);
    }
}

function annulerMiniJeu() {
    stopMiniGame();
    document.getElementById('minigame-screen').classList.add('hidden');
    document.getElementById('selection-screen').classList.remove('hidden');
    
    // Relance la musique du café
    let mainMusic = document.getElementById('bg-music');
    if (mainMusic) {
        mainMusic.src = "musique.mp3";
        mainMusic.play().catch(e=>{});
    }
}