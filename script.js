// --- 1. Datos de la canción y Variables de Estado Globales ---
// SOLO VARIABLES DE ESTADO (NO BUSCAN ELEMENTOS HTML)
let currentSongData = [
    { english: "I was standing in the street", spanish: "Yo estaba parado en la calle" },
    { english: "When the sky turned black and blue", spanish: "Cuando el cielo se puso negro y azul" },
    { english: "I heard the sound of silence", spanish: "Escuché el sonido del silencio" },
    { english: "Calling out your name", spanish: "Gritando tu nombre" },
    { english: "And I knew I had to run away.", spanish: "Y supe que tenía que huir." }
];

let isTranslationMode = false;
let currentLineIndex = 0; 
let currentGameIndex = 0;
let currentMissingWord = '';
let youtubePlayerInstance = null; 


// ------------------------------------------------------------------------------------------------
// --- FUNCIONES CENTRALES (BUSCAN ELEMENTOS SOLO CUANDO ES NECESARIO) ---
// ------------------------------------------------------------------------------------------------

function loadLyrics(dataArray = currentSongData) { 
    currentSongData = dataArray;
    const lyricContainer = document.getElementById('lyric-container');
    
    // Si el contenedor existe, lo limpia
    if (lyricContainer) lyricContainer.innerHTML = ''; 
    
    currentSongData.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.classList.add('lyric-line');
        lineDiv.dataset.index = index; 

        const englishP = document.createElement('p');
        englishP.classList.add('english-text');
        englishP.textContent = line.english;

        const spanishP = document.createElement('p');
        spanishP.classList.add('spanish-translation');
        spanishP.textContent = line.spanish;

        lineDiv.appendChild(englishP);
        lineDiv.appendChild(spanishP);
        
        if (lyricContainer) lyricContainer.appendChild(lineDiv);

        lineDiv.addEventListener('click', toggleTranslation);
    });
}

function toggleTranslation(event) {
    if (isTranslationMode) return; 
    event.currentTarget.classList.toggle('active');
}

function toggleFullTranslationMode() {
    const toggleButton = document.getElementById('toggle-mode');
    const activeLineContainer = document.getElementById('active-line-container');
    const lyricContainer = document.getElementById('lyric-container');

    if (activeLineContainer.style.display !== 'none') {
        // Modo Enfoque -> Traducción Total
        activeLineContainer.style.display = 'none';
        lyricContainer.style.display = 'block';
        if (toggleButton) toggleButton.textContent = "Ocultar Traducción Total";
        isTranslationMode = true;
    } else {
        // Traducción Total -> Modo Enfoque
        lyricContainer.style.display = 'none';
        activeLineContainer.style.display = 'flex';
        if (toggleButton) toggleButton.textContent = "Mostrar Traducción Total";
        isTranslationMode = false;
    }
}

// --- Modo Enfoque y Navegación ---
function renderFocusedLine() {
    const focusedLineDiv = document.getElementById('focused-line');
    
    if (currentSongData.length === 0 || !focusedLineDiv) {
        if (focusedLineDiv) focusedLineDiv.innerHTML = "<p>Carga una canción y su letra para empezar.</p>";
        return;
    }
    
    if (currentLineIndex < 0) currentLineIndex = 0;
    
    if (currentLineIndex >= currentSongData.length) { 
        currentLineIndex = currentSongData.length;
        focusedLineDiv.innerHTML = `<p style="font-size: 1.5em; color: #28a745;">¡Canción terminada! Puedes empezar el Juego.</p>`;
        return;
    }

    const line = currentSongData[currentLineIndex];

    focusedLineDiv.innerHTML = `
        <p class="english-focus">${line.english}</p>
        <p class="translation-focus">${line.spanish}</p>
    `;
}

function nextLine() {
    if (currentLineIndex < currentSongData.length) {
        currentLineIndex++;
        renderFocusedLine();
    }
}

function prevLine() {
    if (currentLineIndex > 0) {
        currentLineIndex--;
        renderFocusedLine();
    }
}

function repeatLine() {
    alert("Funcionalidad de Repetición del Video (API de YouTube) aún no implementada."); 
}


// --- Integración de Audio (YouTube) ---
function getYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|\?v=)|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function loadYouTubeVideo() {
    const urlInput = document.getElementById('youtube-url');
    const playerContainer = document.getElementById('youtube-player');

    const url = urlInput.value;
    const videoId = getYouTubeVideoId(url);

    if (videoId && playerContainer) {
        const iframeHtml = `
            <iframe 
                width="100%" 
                height="315" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen>
            </iframe>
        `;
        playerContainer.innerHTML = iframeHtml;
        playerContainer.style.marginBottom = '20px'; 
    } else if (playerContainer) {
        alert("Por favor, introduce una URL de YouTube válida.");
        playerContainer.innerHTML = '';
    }
}

// --- Carga de Datos Manual (VERSIÓN AUTOMÁTICA) ---
function processManualLyrics() {
    const combinedLyricsInput = document.getElementById('combined-lyrics-input');
    
    if (!combinedLyricsInput) {
        alert("Error interno: Campo de texto de carga no encontrado.");
        return;
    }

    const rawText = combinedLyricsInput.value.trim().replace(/\r\n|\r/g, '\n');
    
    if (!rawText) {
        alert("Por favor, pega la letra completa en el campo de texto.");
        return;
    }

    const allLines = rawText.split('\n').filter(line => line.trim() !== '');

    if (allLines.length % 2 !== 0) {
        alert("Error: El número total de líneas debe ser PAR (Español, Inglés, Español, Inglés...).");
        return;
    }

    const newSongData = [];
    
    for (let i = 0; i < allLines.length; i += 2) {
        newSongData.push({
            spanish: (allLines[i] || '').trim(), 
            english: (allLines[i + 1] || '').trim() 
        });
    }

    if (newSongData.length === 0) {
        alert("No se pudo procesar la letra.");
        return;
    }

    // Cargar la nueva letra y reiniciar la interfaz
    loadLyrics(newSongData); 
    currentLineIndex = 0; 
    renderFocusedLine(); 
    
    const activeLineContainer = document.getElementById('active-line-container');
    const gameContainer = document.getElementById('game-container');

    if (activeLineContainer) activeLineContainer.style.display = 'flex';
    if (gameContainer) gameContainer.style.display = 'none'; 
    
    alert(`¡Canción de ${newSongData.length} frases cargada con éxito!`);
}


// --- Funciones de Modo Juego ---
function chooseRandomWord(line) {
    const words = line.english.split(' ');
    const longWords = words.filter(word => word.length > 3);
    if (longWords.length === 0) return { hiddenLine: line.english, missingWord: '' };

    const randomIndex = Math.floor(Math.random() * longWords.length);
    const wordToHide = longWords[randomIndex];
    
    const regex = new RegExp(`\\b${wordToHide}\\b`);
    const hiddenLine = line.english.replace(regex, '___');

    return { hiddenLine, missingWord: wordToHide.replace(/[.,!?'"]/, '') }; 
}

function loadGameLine() {
    const gameLineDiv = document.getElementById('game-line');
    const userInput = document.getElementById('user-input');
    const checkButton = document.getElementById('check-btn');
    const nextGameBtn = document.getElementById('next-game-btn');
    const feedbackElement = document.getElementById('feedback');
    
    if (currentGameIndex >= currentSongData.length) { 
        gameLineDiv.innerHTML = "¡Juego Terminado! 🏆";
        if (userInput) userInput.disabled = true;
        if (checkButton) checkButton.disabled = true;
        if (nextGameBtn) nextGameBtn.disabled = true; 
        if (feedbackElement) feedbackElement.textContent = "¡Felicidades, completaste la canción!";
        return;
    }
    
    const currentLine = currentSongData[currentGameIndex]; 
    const { hiddenLine, missingWord } = chooseRandomWord(currentLine);
    
    currentMissingWord = missingWord.toLowerCase();
    
    if (gameLineDiv) gameLineDiv.innerHTML = hiddenLine.replace('___', '<span class="missing-word">___</span>');
    if (userInput) userInput.value = '';
    if (userInput) userInput.disabled = false;
    if (checkButton) checkButton.disabled = false;
    if (nextGameBtn) nextGameBtn.disabled = true; 
    if (feedbackElement) feedbackElement.textContent = '';
}

function checkAnswer() {
    const checkButton = document.getElementById('check-btn');
    const nextGameBtn = document.getElementById('next-game-btn');
    const feedbackElement = document.getElementById('feedback');
    const userInput = document.getElementById('user-input');
    const gameLineDiv = document.getElementById('game-line');

    const userAnswer = userInput.value.trim().toLowerCase();
    
    if (userAnswer === currentMissingWord) {
        if (feedbackElement) feedbackElement.textContent = "¡Correcto! ✅";
        if (feedbackElement) feedbackElement.classList.remove('incorrect');
        if (feedbackElement) feedbackElement.classList.add('correct');
        if (nextGameBtn) nextGameBtn.disabled = false; 
        if (userInput) userInput.disabled = true;
        
        if (gameLineDiv) gameLineDiv.innerHTML = currentSongData[currentGameIndex].english; 
    } else {
        if (feedbackElement) feedbackElement.textContent = "Incorrecto. ❌ Inténtalo de nuevo.";
        if (feedbackElement) feedbackElement.classList.remove('correct');
        if (feedbackElement) feedbackElement.classList.add('incorrect');
    }
}

function nextGameLine() { 
    currentGameIndex++;
    loadGameLine();
}

function startGame() {
    document.getElementById('active-line-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block'; 
    document.getElementById('controls').style.display = 'none'; 
    
    currentGameIndex = 0;
    loadGameLine();
}


// ------------------------------------------------------------------------------------------------
// --- 5. Inicialización y Event Listeners (SOLUCIÓN DEFINITIVA DE INTERACCIÓN) ---
// ------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    
    // VINCULACIÓN DE BOTONES (AHORA ES SEGURO ENCONTRARLOS)
    const nextBtn = document.getElementById('next-btn'); 
    const prevBtn = document.getElementById('prev-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const loadButton = document.getElementById('load-video-btn');
    const loadLyricsButton = document.getElementById('load-lyrics-btn');
    const startGameButton = document.getElementById('start-game-btn'); 
    const checkButton = document.getElementById('check-btn');
    const nextGameBtn = document.getElementById('next-game-btn'); 
    const userInput = document.getElementById('user-input');
    const toggleButton = document.getElementById('toggle-mode');

    // Inicialización de datos
    loadLyrics();
    renderFocusedLine(); 

    // Eventos de Navegación (Modo Enfoque)
    if (nextBtn) nextBtn.addEventListener('click', nextLine);
    if (prevBtn) prevBtn.addEventListener('click', prevLine);
    if (repeatBtn) repeatBtn.addEventListener('click', repeatLine);

    // Eventos de Carga de Contenido
    if (toggleButton) toggleButton.addEventListener('click', toggleFullTranslationMode);
    if (loadButton) loadButton.addEventListener('click', loadYouTubeVideo);
    if (loadLyricsButton) loadLyricsButton.addEventListener('click', processManualLyrics); 

    // Eventos del Modo Juego
    if (startGameButton) startGameButton.addEventListener('click', startGame);
    if (checkButton) checkButton.addEventListener('click', checkAnswer);
    if (nextGameBtn) nextGameBtn.addEventListener('click', nextGameLine);

    // Evento de Tecla Enter
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                if (nextGameBtn && !nextGameBtn.disabled) {
                    nextGameLine();
                } else if (checkButton && !checkButton.disabled) {
                    checkAnswer();
                }
            }
        });
    }
});
