// --- 1. Datos de la canción (Inicialmente simulados) ---
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

// --- Variables de Modo Enfoque y Navegación ---
const focusedLineDiv = document.getElementById('focused-line');
const repeatBtn = document.getElementById('repeat-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const nextGameBtn = document.getElementById('next-game-btn'); // Botón de avance de juego

let currentLineIndex = 0; // Índice de la frase activa
let youtubePlayerInstance = null; 

// --- Funciones de Traducción Interactiva y Carga ---
function loadLyrics(dataArray = currentSongData) { 
    currentSongData = dataArray; // Actualiza los datos para toda la aplicación
    // ESTA SECCIÓN CARGA LA VISTA DE TRADUCCIÓN TOTAL (NO LA DE ENFOQUE)
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
    // CAMBIA ENTRE MODO ENFOQUE (DEFAULT) y MODO TRADUCCIÓN TOTAL
    
    if (document.getElementById('active-line-container').style.display !== 'none') {
        // Estamos en Modo Enfoque, cambiamos a Traducción Total
        document.getElementById('active-line-container').style.display = 'none';
        lyricContainer.style.display = 'block';
        toggleButton.textContent = "Ocultar Traducción Total";
        isTranslationMode = true;
    } else {
        // Estamos en Traducción Total, volvemos a Enfoque
        lyricContainer.style.display = 'none';
        document.getElementById('active-line-container').style.display = 'flex';
        toggleButton.textContent = "Mostrar Traducción Total";
        isTranslationMode = false;
    }
}

// --- Funciones de Modo Enfoque y Navegación ---

function renderFocusedLine() {
    if (currentSongData.length === 0) {
        focusedLineDiv.innerHTML = "<p>Carga una canción y su letra para empezar.</p>";
        return;
    }
    
    // Aseguramos que el índice sea válido
    if (currentLineIndex < 0) currentLineIndex = 0;
    if (currentLineIndex >= currentSongData.length) currentLineIndex = currentSongData.length - 1;

    const line = currentSongData[currentLineIndex];

    focusedLineDiv.innerHTML = `
        <p class="english-focus">${line.english}</p>
        <p class="translation-focus">${line.spanish}</p>
    `;
}

function nextLine() {
    if (currentLineIndex < currentSongData.length - 1) {
        currentLineIndex++;
        renderFocusedLine();
    } else if (currentLineIndex === currentSongData.length - 1) {
        currentLineIndex++;
        focusedLineDiv.innerHTML = `<p style="font-size: 1.5em; color: #28a745;">¡Canción terminada! Puedes empezar el Juego.</p>`;
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
const urlInput = document.getElementById('youtube-url');
const loadButton = document.getElementById('load-video-btn');
const playerContainer = document.getElementById('youtube-player');

function getYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|\?v=)|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function loadYouTubeVideo() {
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
const combinedLyricsInput = document.getElementById('combined-lyrics-input');
const loadLyricsButton = document.getElementById('load-lyrics-btn');

function processManualLyrics() {
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
    renderFocusedLine(); // Muestra la primera línea en el modo enfoque
    
    // Configura la interfaz de vuelta al modo Enfoque
    document.getElementById('active-line-container').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none'; 
    
    alert(`¡Canción de ${newSongData.length} frases cargada con éxito!`);
}


// --- Funciones de Modo Juego ---
let currentGameIndex = 0;
let currentMissingWord = '';

const gameContainer = document.getElementById('game-container');
const gameLineDiv = document.getElementById('game-line');
const userInput = document.getElementById('user-input');
const checkButton = document.getElementById('check-btn');
const startGameButton = document.getElementById('start-game-btn');

gameContainer.style.display = 'none'; 

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
    gameContainer.style.display = 'block'; 
    startGameButton.style.display = 'none';
    
    currentGameIndex = 0;
    loadGameLine();
}

// --- 5. Inicialización y Event Listeners ---
loadLyrics();
renderFocusedLine(); 

// Eventos de Navegación (Modo Enfoque)
nextBtn.addEventListener('click', nextLine);
prevBtn.addEventListener('click', prevLine);
repeatBtn.addEventListener('click', repeatLine);

// Eventos de Carga de Contenido
toggleButton.addEventListener('click', toggleFullTranslationMode);
loadButton.addEventListener('click', loadYouTubeVideo);
loadLyricsButton.addEventListener('click', processManualLyrics); 

// Eventos del Modo Juego
startGameButton.addEventListener('click', startGame);
checkButton.addEventListener('click', checkAnswer);
if (nextGameBtn) nextGameBtn.addEventListener('click', nextGameLine);

// Permite usar la tecla Enter para verificar
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        if (!nextGameBtn.disabled) {
            nextGameLine();
        } else if (!userInput.disabled) {
            checkAnswer();
        }
    }
});
