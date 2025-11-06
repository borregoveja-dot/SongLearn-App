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

// --- Funciones de Traducción Interactiva ---
function loadLyrics(dataArray = currentSongData) { 
    currentSongData = dataArray; // Actualiza los datos para toda la aplicación
    lyricContainer.innerHTML = ''; 
    
    currentSongData.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.classList.add('lyric-line');
        lineDiv.dataset.index = index; 

        // Crea el texto en inglés
        const englishP = document.createElement('p');
        englishP.classList.add('english-text');
        englishP.textContent = line.english;

        // Crea la traducción en español
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
    isTranslationMode = !isTranslationMode;
    toggleButton.textContent = isTranslationMode ? "Ocultar Traducción Total" : "Mostrar Traducción Total";
    
    document.querySelectorAll('.lyric-line').forEach(line => {
        if (isTranslationMode) {
            line.classList.add('active');
            line.style.cursor = 'default';
        } else {
            line.classList.remove('active');
            line.style.cursor = 'pointer';
        }
    });
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
    const rawText = combinedLyricsInput.value.trim();

    if (!rawText) {
        alert("Por favor, pega la letra completa en el campo de texto.");
        return;
    }

    // 1. Divide el texto por saltos de línea y elimina líneas vacías
    const allLines = rawText.split('\n').filter(line => line.trim() !== '');

    if (allLines.length % 2 !== 0) {
        alert("Error: El número total de líneas debe ser PAR (Español, Inglés, Español, Inglés...). Por favor, verifica que no falte la última traducción o letra.");
        return;
    }

    const newSongData = [];
    
    // 2. Itera y empareja las líneas: [i] es Español, [i+1] es Inglés
    for (let i = 0; i < allLines.length; i += 2) {
        newSongData.push({
            // El primer elemento (posición impar) es Español
            spanish: (allLines[i] || '').trim(), 
            // El segundo elemento (posición par) es Inglés
            english: (allLines[i + 1] || '').trim() 
        });
    }

    if (newSongData.length === 0) {
        alert("No se pudo procesar la letra. Asegúrate de que los campos no estén vacíos.");
        return;
    }

    // 3. Cargar la nueva letra y reiniciar la interfaz
    loadLyrics(newSongData); 
    currentGameIndex = 0; 
    
    gameContainer.style.display = 'none'; 
    lyricContainer.style.display = 'block';
    startGameButton.style.display = 'block'; 
    toggleButton.style.display = 'block';
    
    alert(`¡Canción de ${newSongData.length} frases cargada con éxito!`);
}


// --- Funciones de Modo Juego ---
let currentGameIndex = 0;
let currentMissingWord = '';

const gameContainer = document.getElementById('game-container');
const gameLineDiv = document.getElementById('game-line');
const userInput = document.getElementById('user-input');
const checkButton = document.getElementById('check-btn');
const nextButton = document.getElementById('next-btn');
const feedbackElement = document.getElementById('feedback');
const startGameButton = document.getElementById('start-game-btn');

gameContainer.style.display = 'none'; 

function chooseRandomWord(line) {
    const words = line.english.split(' ');
    // Intentamos ocultar palabras de más de 3 letras para que sea interesante
    const longWords = words.filter(word => word.length > 3);
    if (longWords.length === 0) return { hiddenLine: line.english, missingWord: '' };

    const randomIndex = Math.floor(Math.random() * longWords.length);
    const wordToHide = longWords[randomIndex];
    
    // Reemplaza la palabra entera por el hueco
    const regex = new RegExp(`\\b${wordToHide}\\b`);
    const hiddenLine = line.english.replace(regex, '___');

    return { hiddenLine, missingWord: wordToHide.replace(/[.,!?'"]/, '') }; 
}

function loadGameLine() {
    if (currentGameIndex >= currentSongData.length) { 
        gameLineDiv.innerHTML = "¡Juego Terminado! 🏆";
        userInput.disabled = true;
        checkButton.disabled = true;
        nextButton.disabled = true;
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
    nextButton.disabled = true;
    feedbackElement.textContent = '';
}

function checkAnswer() {
    const userAnswer = userInput.value.trim().toLowerCase();
    
    if (userAnswer === currentMissingWord) {
        feedbackElement.textContent = "¡Correcto! ✅";
        feedbackElement.classList.remove('incorrect');
        feedbackElement.classList.add('correct');
        nextButton.disabled = false; 
        userInput.disabled = true;
        
        gameLineDiv.innerHTML = currentSongData[currentGameIndex].english; 
    } else {
        feedbackElement.textContent = "Incorrecto. ❌ Inténtalo de nuevo.";
        feedbackElement.classList.remove('correct');
        feedbackElement.classList.add('incorrect');
    }
}

function nextLine() {
    currentGameIndex++;
    loadGameLine();
}

function startGame() {
    lyricContainer.style.display = 'none'; 
    toggleButton.style.display = 'none'; 
    gameContainer.style.display = 'block'; 
    startGameButton.style.display = 'none';
    
    currentGameIndex = 0;
    loadGameLine();
}

// --- 5. Inicialización y Event Listeners ---
loadLyrics();
toggleButton.addEventListener('click', toggleFullTranslationMode);
loadButton.addEventListener('click', loadYouTubeVideo);

// ACTIVACIÓN DEL BOTÓN DE CARGA MANUAL:
loadLyricsButton.addEventListener('click', processManualLyrics); 

// Eventos del juego
startGameButton.addEventListener('click', startGame);
checkButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', nextLine);

// Permite usar la tecla Enter para verificar
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        if (!nextButton.disabled) {
            nextLine();
        } else if (!userInput.disabled) {
            checkAnswer();
        }
    }
});
