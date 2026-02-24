/*
╔═══════════════════════════════════════════════════════════════╗
║  🎯 SCRIPT PRINCIPALE - SITO AGRO NOCERINO-SARNESE           ║
║  Versione UMANIZZATA - Facile da leggere e comprendere       ║
╚═══════════════════════════════════════════════════════════════╝

COSA FA QUESTO FILE:
✅ Anima i numeri delle statistiche
✅ Attiva animazioni al scroll (slideIn, zoomIn, ecc)
✅ Crea effetti parallax (sfondo che si muove lentamente)
✅ Gestisce il tema light/dark e lo ricorda
✅ Mostra/nascondi il menu mobile
✅ Gestisce il carousel (slideshow) di immagini
✅ Login e registrazione degli utenti
✅ Genera dinamicamente la griglia dei siti (28 luoghi)
✅ Filtra i siti per categoria (Storia, Natura, Enogastronomia)
*/

// ═════════════════════════════════════════════════════════════
// 📊 SEZIONE 1: ANIMAZIONI - IL SITO PRENDE VITA
// ═════════════════════════════════════════════════════════════

/**
 * FUNZIONE: Numeri che contano
 * DOVE SI USA: Nelle statistiche della homepage (50+ Siti, 100+ Aziende, ecc)
 * COME FUNZIONA: Quando scrolliamo fino alle statistiche, i numeri contano da 0 al valore finale
 */
function animateStats() {
  // Step 1: Trova tutti gli elementi che hanno numeri (classe 'stat-number')
  const counters = document.querySelectorAll('.stat-number');
  
  // Step 2: Crea un osservatore che guarda quando gli elementi divengono visibili
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      // Se questo elemento è visibile sullo schermo...
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target')); // Numero finale (es: 50)
        let count = 0; // Parte da 0
        const speed = target / 100; // Velocità dell'animazione
        
        // Step 3: Funzione che aggiorna il numero ad ogni frame
        const update = () => {
          count += speed;
          if (count < target) {
            // Mentre non ha raggiunto il target
            el.textContent = Math.floor(count) + '+';
            // Continua l'animazione al prossimo frame
            requestAnimationFrame(update);
          } else {
            // Ha raggiunto il target, mostra il numero definitivo
            el.textContent = target.toLocaleString() + '+';
          }
        };
        
        update(); // Avvia il counter
        observer.unobserve(el); // Non controllare più questo elemento
        
        // Aggiungi effetto visuale al genitore (la card della statistica)
        entry.target.parentElement?.classList.add('stat-animate');
      }
    });
  }, { threshold: 0.6 }); // Attiva quando il 60% dell'elemento è visibile
  
  // Step 4: Inizia a controllare tutti i contatori
  counters.forEach(counter => observer.observe(counter));
}

/**
 * FUNZIONE: Animazioni al scroll
 * DOVE SI USA: Quando scrolliamo, gli elementi si animano dolcemente
 * COME FUNZIONA: Elementi con classe 'scroll-trigger' si animano quando diventano visibili
 */
function initScrollAnimations() {
  // Osserva elementi con classe 'scroll-trigger'
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Aggiungi la classe che attiva l'animazione CSS
        entry.target.classList.add('scroll-animate-in');
        
        // EFFETTO SPECIALE: I bambini si animano uno dopo l'altro (stagger)
        if (entry.target.children) {
          Array.from(entry.target.children).forEach((child, idx) => {
            if (child.classList && child.classList.contains('scroll-stagger')) {
              // Salva l'indice come variabile CSS per il delay
              child.style.setProperty('--item-index', idx);
            }
          });
        }
        
        // Non osservare più questo elemento (animazione una sola volta)
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
  
  // Inizia a controllare tutti gli elementi scroll-trigger
  document.querySelectorAll('.scroll-trigger').forEach(el => observer.observe(el));
}

/**
 * FUNZIONE: Effetto Parallax
 * DOVE SI USA: Sfondi delle hero section (si muovono lentamente durante lo scroll)
 * COME FUNZIONA: Elementi con data-parallax="0.5" si muovono più lentamente del resto
 */
function initParallax() {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset; // Quanti pixel abbiamo scrollato
    
    // Trova tutti gli elementi con attributo data-parallax
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const speed = el.getAttribute('data-parallax') || 0.5; // Velocità del movimento
      // speed=0.5 = si muove al 50% della velocità di scroll
      // speed=0.2 = si muove al 20% (sembra più lontano)
      el.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
}

/**
 * FUNZIONE: Tooltip (messaggi hover)
 * DOVE SI USA: Informazioni su hover (quando passi il mouse)
 * COME FUNZIONA: Mostra un messaggetto sopra gli elementi con data-tooltip
 */
function initInteractiveTooltips() {
  // Trova tutti gli elementi con attributo data-tooltip
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      // Crea il div del tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip-popup';
      tooltip.textContent = el.getAttribute('data-tooltip'); // Il testo da mostrare
      document.body.appendChild(tooltip); // Aggiungilo alla pagina
      
      // Calcola dove metterlo (sopra l'elemento, centrato)
      const rect = el.getBoundingClientRect();
      tooltip.style.left = rect.left + rect.width / 2 + 'px';
      tooltip.style.top = rect.top - 10 + 'px';
      tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
      
      // Attiva l'animazione di apparizione
      requestAnimationFrame(() => tooltip.classList.add('show'));
      
      // Quando il mouse esce, rimuovi il tooltip
      el.addEventListener('mouseleave', () => {
        tooltip.classList.remove('show');
        setTimeout(() => tooltip.remove(), 300); // Rimuovi dopo l'animazione
      });
    });
  });
}

// ═════════════════════════════════════════════════════════════
// 🌗 SEZIONE 2: TEMA LIGHT/DARK - IL BROWSER RICORDA
// ═════════════════════════════════════════════════════════════

/**
 * FUNZIONE: Salva un cookie (piccolo file di testo nel browser)
 * CHE È: I cookie sono salvati nel browser dell'utente
 * PERCHÉ: Per ricordare le scelte (tema, utente loggato, ecc)
 */
function setCookie(name, value, days) {
  // Calcola quando il cookie scade (es: 365 giorni da oggi)
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  // Salva il cookie: nome=valore;scadenza;percorso
  document.cookie = `${name}=${value};expires=${expires};path=/`;
}

/**
 * FUNZIONE: Legge un cookie dal browser
 * USA: getCookie('theme') per sapere se l'utente vuole light o dark
 */
function getCookie(name) {
  // Dividi i cookie per ';' e cerca quello con il nome corretto
  return document.cookie.split('; ').reduce((r, v) => {
    const [k, val] = v.split('=');
    return k === name ? val : r;
  }, null);
}

/**
 * FUNZIONE: Carica il tema salvato all'apertura della pagina
 */
function initTheme() {
  const saved = getCookie('theme'); // Leggi il cookie 'theme'
  if (saved === 'dark') {
    // Se era dark, aggiungi la classe 'dark' a <html>
    // CSS cambierà i colori quando vede questa classe
    document.documentElement.classList.add('dark');
  }
}

/**
 * FUNZIONE: Cambia tra light e dark mode
 * USA: toggleTheme() quando l'utente clicca il bottone tema
 */
function toggleTheme() {
  // Aggiungi/togli la classe 'dark' da <html> (toggle = on/off)
  const isDark = document.documentElement.classList.toggle('dark');
  // Salva la scelta nel cookie per i prossimi 365 giorni
  setCookie('theme', isDark ? 'dark' : 'light', 365);
}

// Collega il bottone al toggle del tema
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// ═════════════════════════════════════════════════════════════
// 📱 SEZIONE 3: MENU MOBILE & CAROUSEL
// ═════════════════════════════════════════════════════════════

/**
 * FUNZIONE: Menu Mobile
 * DOVE: Su schermi piccoli (mobile), il menu si nasconde in un hamburger
 * COME: Clicca l'hamburger per mostrare/nascondere il menu
 */
document.getElementById('mobile-toggle').addEventListener('click', () => {
  // Toggle = se ha la classe aggiungi, se non ce l'ha toglila
  document.getElementById('nav-menu').classList.toggle('active');
});

/**
 * SISTEMA: Carousel (Slideshow di immagini)
 * DOVE: Nella sezione principale della homepage
 * COME: Clicca i bottoni prev/next per scorrere tra le immagini
 */
let currentImage = 0; // Traccia quale immagine è visibile
const images = document.querySelectorAll('.carousel-image'); // Tutte le immagini

/**
 * Mostra solo l'immagine all'indice specificato
 */
function showImage(index) {
  images.forEach((img, i) => {
    // La classe 'active' mostra/nascondu l'immagine in CSS
    img.classList.toggle('active', i === index);
  });
}

/**
 * Vai all'immagine successiva (dopo l'ultima torna alla prima)
 */
function nextImage() {
  currentImage = (currentImage + 1) % images.length;
  showImage(currentImage);
}

/**
 * Vai all'immagine precedente (prima della prima va all'ultima)
 */
function prevImage() {
  currentImage = (currentImage - 1 + images.length) % images.length;
  showImage(currentImage);
}

// Collega i bottoni del carousel
document.getElementById('carousel-next').addEventListener('click', nextImage);
document.getElementById('carousel-prev').addEventListener('click', prevImage);

// ═════════════════════════════════════════════════════════════
// 🔐 SEZIONE 4: AUTENTICAZIONE - LOGIN & REGISTRAZIONE
// ═════════════════════════════════════════════════════════════

/**
 * FUNZIONE: Apri il modale (finestra popup) di login
 */
function openLoginModal() {
  document.getElementById('login-modal').classList.add('active');
}

/**
 * FUNZIONE: Chiudi il modale di login
 */
function closeLoginModal() {
  document.getElementById('login-modal').classList.remove('active');
}

// Collega il bottone "Sign In" all'apertura del modale
document.getElementById('auth-btn').addEventListener('click', openLoginModal);
// Collega la X del modale alla chiusura
document.getElementById('modal-close').addEventListener('click', closeLoginModal);

// Bottoni per scambiare tra form di login e registrazione
document.getElementById('show-register').addEventListener('click', () => {
  document.getElementById('login-form-container').style.display = 'none';
  document.getElementById('register-form-container').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', () => {
  document.getElementById('register-form-container').style.display = 'none';
  document.getElementById('login-form-container').style.display = 'block';
});

/**
 * FUNZIONE: Login (accesso)
 * COME: Verifica username e password nel localStorage
 * SE CORRETTE: Salva l'utente nel cookie
 */
function login(username, password) {
  // Leggi la lista di utenti dal localStorage (default: array vuoto)
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Cerca un utente con username e password corrispondenti
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    // Credenziali errate
    alert('Invalid username or password');
    return;
  }
  
  // ✅ Login riuscito! Salva nel cookie per 7 giorni
  setCookie('user', JSON.stringify(user), 7);
  updateAuthUI(); // Aggiorna il bottone (mostrerà "Hello, username")
  closeLoginModal(); // Chiudi la finestra popup
}

/**
 * FUNZIONE: Registrazione (creazione nuovo account)
 * COME: Aggiunge un nuovo utente al localStorage
 * CONTROLLA: Se l'username è già usato (non puoi avere due username uguali)
 */
function register(username, email, password) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Controlla se l'username esiste già
  if (users.some(u => u.username === username)) {
    alert('Username already exists. Choose a different username.');
    return;
  }
  
  // ✅ Nuovo utente valido! Aggiungilo alla lista
  users.push({ username, email, password });
  // Salva la lista aggiornata nel localStorage (memoria del browser)
  localStorage.setItem('users', JSON.stringify(users));
  
  // Loggati automaticamente con il nuovo account
  setCookie('user', JSON.stringify({ username, email }), 7);
  updateAuthUI();
  closeLoginModal();
}

/**
 * FUNZIONE: Aggiorna il bottone di autenticazione
 * MOSTRA:
 *   - "Sign In" se non sei loggato (clicca per aprire il modale)
 *   - "Hello, username" se sei loggato (clicca per uscire)
 */
function updateAuthUI() {
  const authBtn = document.getElementById('auth-btn');
  const user = getCookie('user'); // Leggi il cookie 'user'
  
  if (user) {
    // ✅ Utente è loggato
    const parsed = JSON.parse(user);
    authBtn.textContent = `Hello, ${parsed.username}`;
    authBtn.onclick = () => {
      // Click = Logout (elimina il cookie)
      setCookie('user', '', -1); // Scadenza negativa = immediato
      updateAuthUI(); // Aggiorna di nuovo
    };
  } else {
    // ❌ Utente non loggato
    authBtn.textContent = 'Sign In';
    authBtn.onclick = openLoginModal;
  }
}

// Quando l'utente invia il form di login
document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault(); // Non ricaricare la pagina
  login(
    document.getElementById('login-username').value,
    document.getElementById('login-password').value
  );
});

// Quando l'utente invia il form di registrazione
document.getElementById('register-form').addEventListener('submit', e => {
  e.preventDefault(); // Non ricaricare la pagina
  register(
    document.getElementById('register-username').value,
    document.getElementById('register-email').value,
    document.getElementById('register-password').value
  );
});

// ═════════════════════════════════════════════════════════════
// 📍 SEZIONE 5: DATABASE - 28 SITI DA VISITARE
// ═════════════════════════════════════════════════════════════

/**
 * DATABASE LOCATIONS
 * Contiene tutti i 28 siti (11 storia + 5 natura + 6 enogastronomia)
 * Struttura di ogni sito:
 * - id: identificativo univoco per l'URL
 * - nome: nome completo del sito
 * - comune: città dove si trova
 * - lat/lng: coordinate GPS per la mappa
 * - categoria: tipo ('storia', 'natura', 'enogastronomia')
 * - descrizione: cosa è questo sito
 * - image: path all'immagine
 */
const luoghi = [
  // 🏛️ STORIA - 11 SITI ARCHEOLOGICI
  { id: 'battistero-santa-maria-maggiore', nome: "Battistero Paleocristiano di Santa Maria Maggiore", comune: "Nocera Superiore", lat: 40.7485, lng: 14.6400, categoria: 'storia', descrizione: "Monumento paleocristiano VI secolo (La Rotonda). Vasca battesimale.", image: 'src/assets/Battistero Paleocristiano di Santa Maria Maggiore.jpeg' },
  { id: 'museo-archeologico-provinciale', nome: "Museo Archeologico Provinciale dell'Agro Nocerino", comune: "Nocera Inferiore", lat: 40.7475, lng: 14.6180, categoria: 'storia', descrizione: "Collezione di reperti dell'antica Nuceria Alfaterna.", image: "src/assets/Museo Archeologico Provinciale dell'Agro Nocerino.jpg" },
  { id: 'castello-parco-fienga', nome: "Castello del Parco Fienga", comune: "Nocera Inferiore", lat: 40.7478, lng: 14.6205, categoria: 'storia', descrizione: "Fortezza medievale con viste panoramiche.", image: 'src/assets/Castello_Del_Parco_Nocera.jpg' },
  { id: 'museo-valle-sarno', nome: "Museo Archeologico Nazionale della Valle del Sarno", comune: "Sarno", lat: 40.8120, lng: 14.6200, categoria: 'storia', descrizione: "Palazzo Capua - insediamenti dal IX sec. a.C.", image: 'src/assets/Museo Archeologico Nazionale della Valle del Sarno.jpg' },
  { id: 'cattedrale-san-prisco', nome: "Cattedrale di San Prisco", comune: "Nocera Inferiore", lat: 40.7470, lng: 14.6170, categoria: 'storia', descrizione: "Chiesa storica della diocesi locale.", image: 'src/assets/Cattedrale di San Prisco.jpg' },
  { id: 'basilica-santalfonso', nome: "Basilica di Sant'Alfonso Maria de' Liguori", comune: "Pagani", lat: 40.7235, lng: 14.5760, categoria: 'storia', descrizione: "Santuario e museo alfonsiano.", image: "src/assets/Basilica di Sant'Alfonso Maria de' Liguori.jpg" },
  { id: 'santuario-madonna-galline', nome: "Santuario di Maria SS. del Carmelo", comune: "Pagani", lat: 40.7240, lng: 14.5755, categoria: 'storia', descrizione: "Centro spirituale con festa tradizionale.", image: 'src/assets/Santuario di Maria SS. del Carmelo.jpg' },
  { id: 'concattedrale-san-michele', nome: "Concattedrale di San Michele Arcangelo", comune: "Sarno", lat: 40.8115, lng: 14.6220, categoria: 'storia', descrizione: "Chiesa storica nel centro di Sarno.", image: 'src/assets/Concattedrale di San Michele Arcangelo.jpg' },
  { id: 'santuario-santa-maria-dei-bagni', nome: "Santuario di Santa Maria dei Bagni", comune: "Scafati", lat: 40.7440, lng: 14.4840, categoria: 'storia', descrizione: "Luogo sacro legato a fonte miracolosa.", image: 'src/assets/Santuario di Santa Maria dei Bagni.jpg' },
  { id: 'piazza-del-corso', nome: "Piazza del Corso", comune: "Nocera Inferiore", lat: 40.7480, lng: 14.6190, categoria: 'storia', descrizione: "Area archeologica a vista con resti romani.", image: 'src/assets/Piazza del Corso-Nocera_Inferiore.jpg' },
  { id: 'eremo-santa-maria-castello', nome: "Eremo di Santa Maria a Castello", comune: "Castel San Giorgio", lat: 40.7720, lng: 14.5560, categoria: 'storia', descrizione: "Eremo medievale con vista panoramica.", image: 'src/assets/Eremo_di_Santa_Maria_a_Castello.jpg' },
  { id: 'pompei', nome: "Pompei", comune: "Pompei", lat: 40.748, lng: 14.498, categoria: 'storia', descrizione: "Sito archeologico famoso, patrimonio UNESCO.", image: 'src/assets/Pompei.jpg' },
  
  // 🌿 NATURA - 6 SITI NATURALI
  { id: 'monte-vesuvio', nome: "Monte Vesuvio & Parco Nazionale", comune: "Ercolano", lat: 40.8210, lng: 14.4265, categoria: 'natura', descrizione: "Vulcano attivo con sentieri naturalistici e panoramiche spettacolari.", image: 'src/assets/Monte Vesuvio & Parco Nazionale.jpg' },
  { id: 'valle-sarno-river', nome: "Valle del Sarno - Sentieri Fluviali", comune: "Sarno", lat: 40.8150, lng: 14.5900, categoria: 'natura', descrizione: "Ecosistema fluviale con biodiversità e percorsi trekking.", image: 'src/assets/Valle del Sarno - Sentieri Fluviali.jpg' },
  { id: 'oasi-fiume-sarno', nome: "Oasi Naturale del Fiume Sarno", comune: "Scafati", lat: 40.7400, lng: 14.4900, categoria: 'natura', descrizione: "Riserva naturale protetta con specie endemiche e birdwatching.", image: 'src/assets/Oasi Naturale del Fiume Sarno.jpg' },
  { id: 'bosco-ninfeo', nome: "Bosco del Ninfeo & Laghi", comune: "Nocera Inferiore", lat: 40.7520, lng: 14.6100, categoria: 'natura', descrizione: "Ambiente costiero con flora rara e zone umide protette.", image: 'src/assets/Bosco del Ninfeo & Laghi.jpg' },
  { id: 'parco-monti-picentini', nome: "Parco Monti Picentini", comune: "Mercato San Severino", lat: 40.7100, lng: 14.7000, categoria: 'natura', descrizione: "Catena montuosa con cascate, grotte e sentieri escursionistici.", image: 'src/assets/Parco Monti Picentini.jpg' },
  { id: 'sarno', nome: "Sarno", comune: "Sarno", lat: 40.811, lng: 14.623, categoria: 'natura', descrizione: "Valle e attività agricole; offre scorci naturali e borghi caratteristici.", image: 'src/assets/Sarno.jpg' },
  
  // 🍷 ENOGASTRONOMIA - 7 AZIENDE AGRICOLE
  { id: 'azienda-viticola-fiano', nome: "Azienda Viticola Fiano DOCG", comune: "Avellino", lat: 40.9050, lng: 14.7800, categoria: 'enogastronomia', descrizione: "Cantina con degustazione vini bianchi d'eccellenza e tour in vigna.", image: 'src/assets/Azienda Viticola Fiano DOCG.jpg' },
  { id: 'caseificio-taurasi', nome: "Caseificio Artigianale Taurasi", comune: "Taurasi", lat: 40.9400, lng: 14.8200, categoria: 'enogastronomia', descrizione: "Formaggi DOP e laboratori di produzione casearia.", image: 'src/assets/Caseificio Artigianale Taurasi.jpeg' },
  { id: 'orto-biologico-nocera', nome: "Orto Biologico Agri-Social", comune: "Nocera Inferiore", lat: 40.7450, lng: 14.6150, categoria: 'enogastronomia', descrizione: "Fattoria biologica con raccolta a mano e ristorazione km0.", image: 'src/assets/agriculture-1.jpg' },
  { id: 'frantoio-olio-pagani', nome: "Frantoio Oleario Pagani Bio", comune: "Pagani", lat: 40.7270, lng: 14.5800, categoria: 'enogastronomia', descrizione: "Frantoio biologico con visita guidata raccolta olive.", image: 'src/assets/Frantoio Oleario Pagani Bio.webp' },
  { id: 'laboratorio-pasta-sarno', nome: "Laboratorio Pasta Artigianale", comune: "Sarno", lat: 40.8100, lng: 14.6200, categoria: 'enogastronomia', descrizione: "Pasta fresca fatta a mano e corsi di cucina tradizionale.", image: 'src/assets/agriculture-1.jpg' },
  { id: 'enoteca-regionale', nome: "Enoteca Regionale & Wine Bar", comune: "Nocera Inferiore", lat: 40.7480, lng: 14.6180, categoria: 'enogastronomia', descrizione: "Selezione vini DOC e DOP, piatti gourmet abbinati.", image: 'src/assets/Azienda Viticola Fiano DOCG.jpg' },
  { id: 'fattoria', nome: "Fattoria Locale", comune: "Poggiomarino", lat: 40.78, lng: 14.52, categoria: 'enogastronomia', descrizione: "Prodotti tipici, tecniche agricole e eventi stagionali.", image: 'src/assets/Fattoria_locale.png' }
];

// ═════════════════════════════════════════════════════════════
// 🎨 SEZIONE 6: RENDERING DINAMICO - CREA LA GRIGLIA
// ═════════════════════════════════════════════════════════════

/**
 * FUNZIONE: Crea la griglia di siti dinamicamente
 * ARGS: filter = 'all' mostra tutti, oppure 'storia'/'natura'/'enogastronomia' per filtrare
 * COME FUNZIONA:
 * 1. Pulisce la griglia (innerHTML = '')
 * 2. Filtra i siti per categoria
 * 3. Per ogni sito, crea una card HTML
 * 4. Aggiunge un'animazione di slideIn con delay
 * 5. Aggiunge la card alla griglia
 */
function renderPlaces(filter = 'all') {
  const grid = document.getElementById('places-grid');
  if (!grid) return; // Se non esiste la griglia, esci
  
  grid.innerHTML = ''; // Pulisci la griglia
  
  // Filtra i siti in base alla categoria scelta
  const filtered = luoghi.filter(l => filter === 'all' ? true : l.categoria === filter);
  
  // Per ogni sito filtrato...
  filtered.forEach((l, idx) => {
    // Step 1: Crea un elemento <article> per la card
    const card = document.createElement('article');
    card.className = 'place-card';
    
    // Step 2: Aggiungi animazione di slide-in con delay
    card.style.animation = `slideInUp 0.6s ease-out backwards`;
    card.style.animationDelay = `${idx * 0.1}s`; // Ogni card appare con 0.1s di ritardo
    
    // Step 3: Riempi la card con HTML
    card.innerHTML = `
      <div class="place-card-inner">
        <!-- Immagine e overlay -->
        <div class="place-image-wrapper">
          <img class="place-image" src="${l.image}" alt="${l.nome}" loading="lazy">
          <div class="place-overlay">
            <!-- Badge con icona categoria -->
            <span class="category-badge category-${l.categoria}">
              ${getCategoryIcon(l.categoria)} ${l.categoria}
            </span>
          </div>
        </div>
        
        <!-- Contenuto della card -->
        <div class="place-body">
          <div class="place-title">${l.nome}</div>
          <div class="place-meta">
            <span class="meta-item">🗺️ ${l.comune}</span>
          </div>
          <p class="place-desc">${l.descrizione}</p>
          <div class="place-actions">
            <!-- Bottone che porta alla pagina del sito -->
            <a class="btn btn-primary btn-glow" href="places/${l.id}.html">
              <span>Scopri di più</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;
    
    // Step 4: Aggiungi la card alla griglia
    grid.appendChild(card);
  });
}

/**
 * FUNZIONE: Restituisce l'emoji giusto per ogni categoria
 * INPUT: 'storia', 'natura', 'enogastronomia', o altro
 * OUTPUT: emoji corrispondente
 */
function getCategoryIcon(category) {
  const icons = {
    'storia': '🏛️',           // Tempio antico
    'natura': '🌿',           // Foglia
    'enogastronomia': '🍷',   // Bicchiere di vino
    'default': '📍'           // Pin mappa
  };
  return icons[category] || icons.default;
}

/**
 * FUNZIONE: Attiva i bottoni di filtro
 * COME FUNZIONA:
 * 1. Trova tutti i bottoni con classe 'places-controls button'
 * 2. Aggiunge un click listener a ogni bottone
 * 3. Quando clicchi, ricarica renderPlaces() con il filtro scelto
 * 4. Attiva il bottone (aggiunge classe 'active')
 */
function initPlaceFilters() {
  const filterBtns = document.querySelectorAll('.places-controls button');
  
  filterBtns.forEach(b => {
    b.addEventListener('click', () => {
      // Deattiva tutti i bottoni
      filterBtns.forEach(x => x.classList.remove('active'));
      // Attiva solo il bottone cliccato
      b.classList.add('active');
      // Ricarica la griglia con il nuovo filtro
      renderPlaces(b.getAttribute('data-filter'));
    });
  });
  
  // Attiva il primo bottone ("Tutti") per default
  if (filterBtns[0]) filterBtns[0].classList.add('active');
}

// ═════════════════════════════════════════════════════════════
// �️ SEZIONE 6A: INIZIALIZZAZIONE MAPPA LEAFLET
// ═════════════════════════════════════════════════════════════

/**
 * FUNZIONE: initMap()
 * QUANDO SI USA: Al caricamento della pagina
 * CHE FA: Disegna la mappa interattiva con tutti i 28 siti e i marker
 */
function initMap() {
  const mapElement = document.getElementById('interactive-map');
  if (!mapElement) return; // Se non esiste la mappa, esci
  
  // Crea la mappa centrata su Nocera Inferiore (lat: 40.75, lng: 14.62)
  const map = L.map('interactive-map').setView([40.75, 14.62], 11);
  
  // Aggiungi lo stile della mappa da OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
  
  // Aggiungi i marker per ogni sito nella lista
  luoghi.forEach(luogo => {
    // Crea un marker sulla posizione GPS del sito
    const marker = L.marker([luogo.lat, luogo.lng])
      .bindPopup(`<b>${luogo.nome}</b><br>${luogo.comune}`)
      .addTo(map);
  });
}

// ═════════════════════════════════════════════════════════════
// �🚀 SEZIONE 7: INIZIALIZZAZIONE - AVVIA TUTTO AL CARICAMENTO
// ═════════════════════════════════════════════════════════════

/**
 * EVENTO: DOMContentLoaded
 * QUANDO: Quando la pagina HTML è completamente caricata
 * COSA FA: Inizializza tutte le funzioni
 */
document.addEventListener('DOMContentLoaded', () => {
  // Tema: Carica il tema salvato
  initTheme();
  
  // Autenticazione: Aggiorna il bottone di login
  updateAuthUI();
  
  // Carousel: Mostra la prima immagine
  showImage(currentImage);
  
  // Animazioni: Attiva tutte le animazioni
  animateStats();                // Numeri che contano
  initScrollAnimations();        // Elementi che si animano al scroll
  initParallax();                // Sfondo che si muove lentamente
  initInteractiveTooltips();     // Messaggetti al hover
  initMap();                     // Inizializza la mappa interattiva
  
  // Siti: Crea la griglia e attiva i filtri
  renderPlaces();                // Crea le card iniziali
  initPlaceFilters();            // Attiva i bottoni di filtro
});

// ═════════════════════════════════════════════════════════════
// ✨ FINE SCRIPT - TUTTO PRONTO!
// ═════════════════════════════════════════════════════════════
