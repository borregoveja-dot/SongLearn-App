// --- 1. Datos de la canción y Variables de Estado Globales ---
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
let audioPlayer = null; // Instancia para el reproductor de audio HTML5


// ------------------------------------------------------------------------------------------------
// --- FUNCIONES CENTRALES ---
// ------------------------------------------------------------------------------------------------

function loadLyrics(dataArray = currentSongData) { 
    currentSongData = dataArray;
    const lyricContainer = document.getElementById('lyric-container');
    
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

    if (activeLineContainer && activeLineContainer.style.display !== 'none') {
        activeLineContainer.style.display = 'none';
        if (lyricContainer) lyricContainer.style.display = 'block';
        if (toggleButton) toggleButton.textContent = "Ocultar Traducción Total";
        isTranslationMode = true;
    } else if (activeLineContainer) {
        if (lyricContainer) lyricContainer.style.display = 'none';
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

// --- CONTROL DE AUDIO ESTABLE (HTML5) ---

// FUNCIÓN DE CONTROL DE PAUSA/PLAY (ESTABLE)
function togglePlayPause() {
    const focusPlayBtn = document.getElementById('focus-play-btn');

    if (!audioPlayer || audioPlayer.readyState < 2) {
        alert("Por favor, carga un archivo de audio primero.");
        return;
    }
    
    if (audioPlayer.paused) {
        audioPlayer.play();
        if (focusPlayBtn) focusPlayBtn.textContent = '⏸️'; // Pausa (Reproduciendo)
    } else {
        audioPlayer.pause();
        if (focusPlayBtn) focusPlayBtn.textContent = '▶️'; // Play (Pausado)
    }
}

// FUNCIÓN PARA VINCULAR EL ARCHIVO DE AUDIO
function handleFileInput(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        if (audioPlayer) audioPlayer.src = url;
    }
}


// --- Carga de Datos Manual (VERSIÓN AUTOMÁTICA FINAL) ---
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
        alert("Error: El número total de líneas debe ser PAR.");
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

    // Cargar la nueva letra y reiniciar la interfaz
    loadLyrics(newSongData); 
    currentLineIndex = 0; 
    renderFocusedLine(); 
    
    document.getElementById('active-line-container').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none'; 
    
    alert(`¡Canción de ${newSongData.length} frases cargada con éxito!`);
}


// --- Funciones de Modo Juego (resto sin cambios) ---
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
        if (gameLineDiv) gameLineDiv.innerHTML = "¡Juego Terminado! 🏆";
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


// --- 5. Inicialización y Event Listeners (FINAL Y ESTABLE) ---
document.addEventListener('DOMContentLoaded', function() {
    
    // VINCULACIÓN DE BOTONES
    const nextBtn = document.getElementById('next-btn'); 
    const prevBtn = document.getElementById('prev-btn');
    const loadLyricsButton = document.getElementById('load-lyrics-btn');
    const startGameButton = document.getElementById('start-game-btn'); 
    const checkButton = document.getElementById('check-btn');
    const nextGameBtn = document.getElementById('next-game-btn'); 
    const userInput = document.getElementById('user-input');
    const toggleButton = document.getElementById('toggle-mode');
    const focusedLineDiv = document.getElementById('focused-line');
    const focusPlayBtn = document.getElementById('focus-play-btn'); // Botón de Play/Pause
    const audioFileInput = document.getElementById('audio-file-input'); // Entrada de archivo
    audioPlayer = document.getElementById('local-audio-player'); // Reproductor de audio

    // Inicialización de datos
    loadLyrics();
    renderFocusedLine(); 

    // Eventos de Navegación (Modo Enfoque)
    if (nextBtn) nextBtn.addEventListener('click', nextLine);
    if (prevBtn) prevBtn.addEventListener('click', prevLine);
    
    // EVENTO DE CONTROL DE AUDIO
    if (focusPlayBtn) focusPlayBtn.addEventListener('click', togglePlayPause);
    
    // Eventos de Carga de Contenido
    if (toggleButton) toggleButton.addEventListener('click', toggleFullTranslationMode);
    if (loadLyricsButton) loadLyricsButton.addEventListener('click', processManualLyrics); 
    if (audioFileInput) audioFileInput.addEventListener('change', handleFileInput); // VINCULAR SUBIDA DE ARCHIVO

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
