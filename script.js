// --- Declaración de Variables Globales (Solo las necesarias) ---
let currentSongData = [
    { english: "I was standing in the street", spanish: "Yo estaba parado en la calle" },
    { english: "When the sky turned black and blue", spanish: "Cuando el cielo se puso negro y azul" },
    { english: "I heard the sound of silence", spanish: "Escuché el sonido del silencio" },
    { english: "Calling out your name", spanish: "Gritando tu nombre" },
    { english: "And I knew I had to run away.", spanish: "Y supe que tenía que huir." }
];

const lyricContainer = document.getElementById('lyric-container');
const toggleButton = document.getElementById('toggle-mode');

let isTranslationMode = false;
let currentLineIndex = 0; 
let youtubePlayerInstance = null; 

// --- Funciones de Traducción Interactiva y Carga ---
function loadLyrics(dataArray = currentSongData) { 
    currentSongData = dataArray; 
    lyricContainer.innerHTML = ''; 
    
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
        lyricContainer.appendChild(lineDiv);

        lineDiv.addEventListener('click', toggleTranslation);
    });
}

function toggleTranslation(event) {
    if (isTranslationMode) return; 
    event.currentTarget.classList.toggle('active');
}

function toggleFullTranslationMode() {
    // Lógica para cambiar entre modo Enfoque y modo Traducción Total
    const activeLineContainer = document.getElementById('active-line-container');

    if (activeLineContainer.style.display !== 'none') {
        // Modo Enfoque -> Traducción Total
        activeLineContainer.style.display = 'none';
        lyricContainer.style.display = 'block';
        toggleButton.textContent = "Ocultar Traducción Total";
        isTranslationMode = true;
    } else {
        // Traducción Total -> Modo Enfoque
        lyricContainer.style.display = 'none';
        activeLineContainer.style.display = 'flex';
        toggleButton.textContent = "Mostrar Traducción Total";
        isTranslationMode = false;
    }
}

// --- Funciones de Modo Enfoque y Navegación ---
function renderFocusedLine() {
    const focusedLineDiv = document.getElementById('focused-line');
    
    if (currentSongData.length === 0) {
        focusedLineDiv.innerHTML = "<p>Carga una canción y su letra para empezar.</p>";
        return;
    }
    
    // Lógica para manejar el final de la canción
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
    alert("Funcionalidad de Repetición del Video (API de YouTube) aún no implementada, pero la interfaz está lista."); 
}


// --- Funciones de Integración de Audio (YouTube) ---
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

    if (videoId) {
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
    } else {
        alert("Por favor, introduce una URL de YouTube válida.");
        playerContainer.innerHTML = '';
    }
}

// --- Funciones de Carga de Datos Manual (VERSIÓN AUTOMÁTICA FINAL) ---
function processManualLyrics() {
    const combinedLyricsInput = document.getElementById('combined-lyrics-input');
    const rawText = combinedLyricsInput.value.trim().replace(/\r\n|\r/g, '\n');
    
    if (!rawText) {
        alert("Por favor, pega la letra completa en el campo de texto.");
        return;
    }

    const allLines = rawText.split('\n').filter(line => line.trim() !== '');

    if (allLines.length % 2 !== 0) {
        alert("Error: El número total de líneas debe ser PAR (Español, Inglés, Español, Inglés...). Por favor, verifica que no falte la última traducción o letra.");
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
        alert("No se pudo procesar la letra. Asegúrate de que los campos no estén vacíos.");
        return;
    }

    // 4. ¡Cargar la nueva letra y reiniciar la interfaz!
    loadLyrics(newSongData); 
    currentLineIndex = 0; 
    renderFocusedLine(); 
    
    document.getElementById('active-line-container').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none'; 
    
    alert(`¡Canción de ${newSongData.length} frases cargada con éxito!`);
}


// --- Funciones de Modo Juego ---
let currentGameIndex = 0;
let currentMissingWord = '';

function chooseRandomWord(line) {
    const words = line.english.split(' ');
    const longWords = words.filter(word => word.length > 3);
    if (longWords.length === 0) return { hiddenLine: line.english, missingWord: '' };

    const randomIndex = Math.floor(L.random() * longWords.length);
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
        userInput.disabled = true;
        checkButton.disabled = true;
        nextGameBtn.disabled = true; 
        feedbackElement.textContent = "¡Felicidades, completaste la canción!";
        return;
    }
    
    const currentLine = currentSongData[currentGameIndex]; 
    const { hiddenLine, missingWord } = chooseRandomWord(currentLine);
    
    currentMissingWord = missingWord.toLowerCase();
    
    gameLineDiv.innerHTML = hiddenLine.replace('___', '<span class="missing-word">___</span>');
    userInput.value = '';
    userInput.disabled = false;
    checkButton.disabled = false;
    nextGameBtn.disabled = true; 
    feedbackElement.textContent = '';
}

function checkAnswer() {
    const checkButton = document.getElementById('check-btn');
    const nextGameBtn = document.getElementById('next-game-btn');
    const feedbackElement = document.getElementById('feedback');
    const userInput = document.getElementById('user-input');
    const gameLineDiv = document.getElementById('game-line');

    const userAnswer = userInput.value.trim().toLowerCase();
    
    if (userAnswer === currentMissingWord) {
        feedbackElement.textContent = "¡Correcto! ✅";
        feedbackElement.classList.remove('incorrect');
        feedbackElement.classList.add('correct');
        nextGameBtn.disabled = false; 
        userInput.disabled = true;
        
        gameLineDiv.innerHTML = currentSongData[currentGameIndex].english; 
    } else {
        feedbackElement.textContent = "Incorrecto. ❌ Inténtalo de nuevo.";
        feedbackElement.classList.remove('correct');
        feedbackElement.classList.add('incorrect');
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


// --- 5. Inicialización y Event Listeners (FINAL Y CORREGIDO) ---

// Espera a que TODO el HTML se haya cargado antes de vincular los eventos
document.addEventListener('DOMContentLoaded', function() {
    
    // VINCULACIÓN DE BOTONES (DECLARADOS AQUÍ para evitar el error de ámbito)
    const nextBtn = document.getElementById('next-btn'); 
    const prevBtn = document.getElementById('prev-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const loadButton = document.getElementById('load-video-btn');
    const loadLyricsButton = document.getElementById('load-lyrics-btn');
    const startGameButton = document.getElementById('start-game-btn'); 
    const checkButton = document.getElementById('check-btn');
    const nextGameBtn = document.getElementById('next-game-btn'); 
    const userInput = document.getElementById('user-input');

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

    // Inicializa el estado oculto del juego
    document.getElementById('game-container').style.display = 'none';
});
