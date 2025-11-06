// --- 1. Datos de la canción (Inicialmente simulados) ---
const songData = [
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
function loadLyrics() {
    lyricContainer.innerHTML = ''; 
    songData.forEach((line, index) => {
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
    const longWords = words.filter(word => word.length > 3);
    if (longWords.length === 0) return { hiddenLine: line.english, missingWord: '' };

    const randomIndex = Math.floor(Math.random() * longWords.length);
    const wordToHide = longWords[randomIndex];
    
    const regex = new RegExp(`\\b${wordToHide}\\b`);
    const hiddenLine = line.english.replace(regex, '___');

    return { hiddenLine, missingWord: wordToHide.replace(/[.,!?'"]/, '') }; 
}

function loadGameLine() {
    if (currentGameIndex >= songData.length) {
        gameLineDiv.innerHTML = "¡Juego Terminado! 🏆";
        userInput.disabled = true;
        checkButton.disabled = true;
        nextButton.disabled = true;
        feedbackElement.textContent = "¡Felicidades, completaste la canción!";
        return;
    }
    
    const currentLine = songData[currentGameIndex];
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
        
        gameLineDiv.innerHTML = songData[currentGameIndex].english;
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
