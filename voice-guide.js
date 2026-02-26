/**
 * 🎙️ GUIDA VOCALE AGRO NOCERINO-SARNESE
 * Legge solo i titoli e i nomi dei luoghi in italiano con controlli avanzati.
 */

(function() {
  function initVoiceGuide() {
    let voiceBtn = document.getElementById('voice-guide-btn');
    const isMainPage = !!voiceBtn;
    
    // Creazione UI se non esiste (per le pagine dei luoghi)
    if (!voiceBtn) {
      const container = document.createElement('div');
      container.className = 'voice-guide-container-floating';
      container.innerHTML = `
        <div class="voice-controls-popup" id="voice-controls-popup">
          <input type="range" id="voice-progress" min="0" value="0" step="1">
          <span id="voice-time">0%</span>
        </div>
        <button id="voice-guide-btn" class="voice-guide-floating" title="Attiva Guida Vocale">
          <svg class="voice-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
          <svg class="stop-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
            <rect x="6" y="6" width="12" height="12"></rect>
          </svg>
        </button>
      `;
      document.body.appendChild(container);
      voiceBtn = document.getElementById('voice-guide-btn');
    } else {
      // Se siamo nella main page, aggiungiamo lo slider vicino al bottone nella navbar
      const controls = document.createElement('div');
      controls.className = 'voice-navbar-controls';
      controls.id = 'voice-controls-popup';
      controls.innerHTML = `
        <input type="range" id="voice-progress" min="0" value="0" step="1">
        <span id="voice-time">0%</span>
      `;
      voiceBtn.parentElement.appendChild(controls);
    }

    // Aggiunta stili necessari
    const style = document.createElement('style');
    style.textContent = `
      .voice-guide-container-floating {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
      }
      .voice-guide-floating {
        background-color: var(--primary, #e67e22);
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        transition: transform 0.3s ease, background-color 0.3s ease;
      }
      .voice-guide-floating:hover { transform: scale(1.1); }
      .voice-guide-floating.active { background-color: #e74c3c; }
      
      .voice-controls-popup {
        background: var(--card, white);
        padding: 10px 15px;
        border-radius: 10px;
        box-shadow: var(--shadow-warm);
        display: none;
        align-items: center;
        gap: 10px;
        border: 1px solid var(--border);
        min-width: 220px;
      }
      .voice-controls-popup.active { display: flex; }
      
      .voice-navbar-controls {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 10px;
        background: var(--card, white);
        padding: 10px 15px;
        border-radius: 10px;
        box-shadow: var(--shadow-warm);
        display: none;
        align-items: center;
        gap: 10px;
        border: 1px solid var(--border);
        min-width: 220px;
        z-index: 1001;
      }
      .voice-navbar-controls.active { display: flex; }
      
      #voice-progress {
        flex: 1;
        accent-color: var(--primary);
        cursor: pointer;
        height: 6px;
      }
      #voice-time {
        font-size: 0.8rem;
        font-weight: 600;
        min-width: 40px;
        text-align: right;
        color: var(--foreground);
      }
      
      .speaking-highlight {
        background-color: hsla(16, 70%, 55%, 0.25);
        border-radius: 4px;
        box-shadow: 0 0 0 2px hsla(16, 70%, 55%, 0.1);
        transition: all 0.3s ease;
      }
      .dark .speaking-highlight {
        background-color: hsla(16, 85%, 65%, 0.35);
      }
      
      @keyframes pulse-voice {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      .voice-guide-floating.active .voice-icon {
        animation: pulse-voice 1.5s infinite;
      }
    `;
    document.head.appendChild(style);

    const synth = window.speechSynthesis;
    const voiceIcon = voiceBtn.querySelector('.voice-icon');
    const stopIcon = voiceBtn.querySelector('.stop-icon');
    const btnText = voiceBtn.querySelector('.btn-text');
    const progressSlider = document.getElementById('voice-progress');
    const timeDisplay = document.getElementById('voice-time');
    const controlsPopup = document.getElementById('voice-controls-popup');
    
    let isSpeaking = false;
    let content = [];
    let currentUtteranceIndex = 0;

    function stopSpeaking(reset = false) {
      synth.cancel();
      isSpeaking = false;
      voiceBtn.classList.remove('active');
      if (voiceIcon) voiceIcon.style.display = 'block';
      if (stopIcon) stopIcon.style.display = 'none';
      if (btnText) btnText.textContent = "Guida Vocale";
      // Non rimuoviamo .active da controlsPopup qui per permettere di muovere lo slider anche da fermo
      
      if (reset) {
        currentUtteranceIndex = 0;
        updateUI();
        if (controlsPopup) controlsPopup.classList.remove('active');
      }
      
      document.querySelectorAll('.speaking-highlight').forEach(el => {
        el.classList.remove('speaking-highlight');
      });
    }

    function getPageContent() {
      const items = [];
      const pageTitle = document.title.split('—')[0].trim();
      const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');

      // 1. PRESENTAZIONE INIZIALE E ISTRUZIONI
      let introText = `Benvenuto nella guida vocale dell'Agro Nocerino Sarnese. `;
      if (isHome) {
        introText += `Ti trovi nella pagina principale. Ti guiderò attraverso la storia, la natura e i sapori di questa terra. `;
      } else {
        introText += `Stai esplorando ${pageTitle}. Ti accompagnerò nella scoperta di questo luogo unico. `;
      }
      introText += `Puoi fermare la mia voce in qualsiasi momento cliccando il pulsante Ferma Guida. Usa lo slider che è apparso per saltare avanti o indietro nel mio discorso. `;
      
      items.push({ text: introText, element: document.body });

      // 2. FILO LOGICO DELLA NARRAZIONE
      if (isHome) {
        // Percorso logico per la Home
        const sections = [
          { selector: '#home h1', prefix: 'Iniziamo da ' },
          { selector: '#places .section-header h2', prefix: 'Passiamo poi ai ' },
          { selector: '#discover .section-header h2', prefix: 'Scopriamo ora come ' },
          { selector: '#map .section-header h2', prefix: 'Infine, guarda la nostra ' }
        ];

        sections.forEach(sec => {
          const el = document.querySelector(sec.selector);
          if (el) {
            items.push({ text: sec.prefix + el.innerText.trim(), element: el });
          }
        });

        // Aggiungiamo anche i nomi dei luoghi nella griglia se presenti
        const placeTitles = document.querySelectorAll('.place-title');
        if (placeTitles.length > 0) {
          items.push({ text: "Tra i luoghi più belli che puoi visitare ci sono:", element: document.getElementById('places') });
          placeTitles.forEach((title, idx) => {
            if (idx < 5) { // Limitiamo ai primi 5 per non essere troppo lunghi
              items.push({ text: title.innerText.trim(), element: title });
            }
          });
          if (placeTitles.length > 5) {
            items.push({ text: "...e molti altri ancora che trovi elencati qui sotto.", element: document.getElementById('places') });
          }
        }
      } else {
        // Percorso logico per le pagine dei Luoghi
        const placeSections = [
          { selector: 'h1', prefix: 'Oggi scopriamo ' },
          { selector: '.place-info', prefix: 'Ecco alcune informazioni rapide: ' },
          { selector: 'section h2', prefix: 'Approfondiamo con ' },
          { selector: '.place-map-container h2, #place-map', prefix: 'Puoi trovarci sulla ' },
          { selector: '.place-related h3', prefix: 'Nelle vicinanze ti consiglio di vedere anche ' }
        ];

        placeSections.forEach(sec => {
          const elements = document.querySelectorAll(sec.selector);
          elements.forEach((el, idx) => {
            // Per section h2 ne prendiamo diversi, per gli altri solo il primo
            if (idx === 0 || sec.selector === 'section h2') {
              let text = el.innerText.trim();
              // Se è la sezione info, leggiamo i punti chiave
              if (el.classList.contains('place-info')) {
                text = Array.from(el.querySelectorAll('.info-item')).map(i => i.innerText.trim()).join('. ');
              }
              items.push({ text: sec.prefix + text, element: el });
            }
          });
        });
      }

      items.push({ text: "La mia guida termina qui. Buona navigazione!", element: document.body });

      return items;
    }

    function updateUI() {
      if (content.length > 0) {
        const progress = Math.round((currentUtteranceIndex / (content.length - 1)) * 100);
        progressSlider.max = content.length - 1;
        progressSlider.value = currentUtteranceIndex;
        timeDisplay.textContent = `${progress}%`;
      }
    }

    function speakCurrent() {
      if (currentUtteranceIndex >= content.length) {
        stopSpeaking(true);
        return;
      }

      const item = content[currentUtteranceIndex];
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = 'it-IT';
      utterance.rate = 1.0;

      utterance.onstart = () => {
        if (!isSpeaking) return;
        if (item.element !== document.body) {
          item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          item.element.classList.add('speaking-highlight');
        }
        updateUI();
      };

      utterance.onend = () => {
        if (item.element !== document.body) {
          item.element.classList.remove('speaking-highlight');
        }
        if (isSpeaking) {
          currentUtteranceIndex++;
          speakCurrent();
        }
      };

      utterance.onerror = () => stopSpeaking();
      synth.speak(utterance);
    }

    function startSpeaking() {
      if (content.length === 0) content = getPageContent();
      if (content.length === 0) return;

      isSpeaking = true;
      voiceBtn.classList.add('active');
      if (voiceIcon) voiceIcon.style.display = 'none';
      if (stopIcon) stopIcon.style.display = 'block';
      if (btnText) btnText.textContent = "Ferma Guida";
      if (controlsPopup) controlsPopup.classList.add('active');
      
      updateUI();
      speakCurrent();
    }

    voiceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isSpeaking) {
        stopSpeaking();
      } else {
        startSpeaking();
      }
    });

    // Gestione dello slider per muovere la posizione senza chiudersi
    progressSlider.addEventListener('input', () => {
      currentUtteranceIndex = parseInt(progressSlider.value);
      updateUI();
    });

    progressSlider.addEventListener('change', () => {
      const wasSpeaking = isSpeaking;
      if (wasSpeaking) {
        synth.cancel(); // Ferma solo l'audio corrente per ripartire dal nuovo punto
        speakCurrent();
      }
    });

    window.addEventListener('beforeunload', () => synth.cancel());
  }

  // Avvio
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceGuide);
  } else {
    initVoiceGuide();
  }
})();
