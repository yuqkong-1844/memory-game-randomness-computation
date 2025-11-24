// --- Card Data (No Change) ---
const cardImageBaseNames = [
    'Buffon.png','centrallimit.png','coupon.png','crossing.png','JL.png',
    'Lasvegas.png','makov.png','martingale.png','pairwiseind.png',
    'Ramsey.png','randomalg.png','tvd.png','unbalancinglights.png','Azuma.png','coupling.png'
];

const IMAGE_FOLDERS = { 'Base':'./images/','Colored':'./images_v2/' };
let currentImageStyle = 'Base';
let currentLanguage = 'EN'; // Default language

const imageBaseURL = () => IMAGE_FOLDERS[currentImageStyle];
const numPairs = cardImageBaseNames.length;
const cardDeck = [...cardImageBaseNames,...cardImageBaseNames];

// --- Data Containers (UPDATED) ---
let storiesMap = { 'EN': {}, 'CN': {} };
let aboutContent = { 'EN': {}, 'CN': {} }; // NEW: Initialize about content container

// --- DOM Elements (Updates for About Modal) ---
let gameGrid = document.getElementById('game-grid');
let resetButton = document.getElementById('reset-button');
let styleSwitchButton = document.getElementById('style-switch-button');
let currentStyleDisplay = document.getElementById('current-style');

let languageButton = document.getElementById('language-button'); 
let currentLangDisplay = document.getElementById('current-lang'); 

let cheatButton = document.getElementById('cheat-button');

let gameOverModal = document.getElementById('game-over-modal');
let gameOverModalContent = document.getElementById('game-over-modal-content');
let modalCloseButton = document.getElementById('modal-close-button');
let gameOverMessage = document.getElementById('game-over-message'); // NEW

let storyModal = document.getElementById('card-story-modal');
let storyModalContent = document.getElementById('card-story-modal-content');
let storyTitleDisplay = document.getElementById('story-title');
let storyContentDisplay = document.getElementById('story-content');
let storyCloseButton = document.getElementById('story-close-button');
let storyCardImage = document.getElementById('story-card-image');

let imageViewerModal = document.getElementById('image-viewer-modal');
let imageViewerModalContent = document.getElementById('image-viewer-modal-content');
let zoomedImage = document.getElementById('zoomed-image');
let imageSaveButton = document.getElementById('image-save-button');
let imageCloseButton = document.getElementById('image-close-button');

// NEW 2-Player DOM Elements
let modeSwitchButton = document.getElementById('mode-switch-button');
let currentModeDisplay = document.getElementById('current-mode');
let playerScoreArea = document.getElementById('player-score-area');
let player1ScoreDisplay = document.getElementById('player1-score-display');
let player2ScoreDisplay = document.getElementById('player2-score-display');
let player1Score = document.getElementById('player1-score');
let player2Score = document.getElementById('player2-score');

// NEW About Modal Elements
let aboutButton = document.getElementById('about-button');
let aboutModal = document.getElementById('about-modal');
let aboutModalContent = document.getElementById('about-modal-content');
let aboutCloseButton = document.getElementById('about-close-button');
let aboutTitleDisplay = document.getElementById('about-title'); // NEW: Get title element
let aboutDynamicContent = document.getElementById('about-dynamic-content'); // NEW: Get content element


// --- Game State (UPDATED) ---
let firstCard=null, secondCard=null, lockBoard=false, matchesFound=0, moves=0, timerInterval=null, seconds=0;

// NEW 2-Player State
let isTwoPlayerMode = false; // Starts in single-player mode
let currentPlayer = 1; // 1 or 2
let playerScores = { 1: 0, 2: 0 };


// --- Utility Functions (No Change) ---
function shuffle(array){for(let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];} return array;}
function startTimer(){if(moves===0&&timerInterval===null){seconds=0; timerInterval=setInterval(()=>{seconds++;},1000);}}
function stopTimer(){clearInterval(timerInterval);timerInterval=null;}

// --- Modal Transition Logic (No Change) ---
function showModal(modalElement, contentElement) {
    modalElement.classList.add('flex', 'opacity-100');
    modalElement.classList.remove('hidden');
    setTimeout(() => { 
        contentElement.classList.remove('scale-90', 'opacity-0'); 
        contentElement.classList.add('scale-100', 'opacity-100'); 
    }, 50);
}

function hideModal(modalElement, contentElement) {
    contentElement.classList.remove('scale-100', 'opacity-100');
    contentElement.classList.add('scale-90', 'opacity-0');
    setTimeout(() => { 
        modalElement.classList.remove('flex', 'opacity-100'); 
        modalElement.classList.add('hidden'); 
    }, 300);
}

/// --- Image Zoom Logic ---

function showImageZoom(imagePath, imageName) {

    zoomedImage.src = imagePath;
    zoomedImage.alt = imageName;
    
    // Set up the download link
    imageSaveButton.onclick = () => {
        const a = document.createElement('a');
        a.href = imagePath;
        a.download = imageName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    showModal(imageViewerModal, imageViewerModalContent);
}

async function fetchAllStories() {
    const urlEN = './card_stories/stories.json';
    const urlCN = './card_stories/stories_cn.json';

    try {
        const [resEN, resCN] = await Promise.all([
            fetch(urlEN),
            fetch(urlCN).catch(e => null) 
        ]);

        if (resEN && resEN.ok) {
            const dataEN = await resEN.json();
            storiesMap['EN'] = dataEN.reduce((map, story) => { map[story.image] = story; return map; }, {});
        } else {
            console.error("Failed to load English stories from " + urlEN);
        }

        if (resCN && resCN.ok) {
            const dataCN = await resCN.json();
            storiesMap['CN'] = dataCN.reduce((map, story) => { map[story.image] = story; return map; }, {});
        } else {
            console.warn("Chinese stories not found at " + urlCN + ".");
        }
    } catch (error) {
        console.error('Critical error fetching stories:', error);
    }
}

function renderStoryContentFromJSON(storyData) {
    let html = '';
    storyTitleDisplay.textContent = storyData.title || 'Card Story';

    storyData.sections.forEach(section => {
        let content = section.content || '';
        let contentWithInlineMath = content.replace(/\$([^\$\n]+?)\$/g, (match, mathContent) => {
            try {
                if (typeof katex !== 'undefined') {
                    return katex.renderToString(mathContent.trim(), { displayMode: false, throwOnError: false });
                }
                return match; 
            } catch (e) {
                console.error("Inline KaTeX Error:", e);
                return `<span class="text-red-500">[Math Error]</span>`;
            }
        });

        switch (section.type) {
            case 'paragraph':
            case 'note':
            case 'heading':
                html += section.type === 'heading' ? `<h4>${contentWithInlineMath}</h4>` : `<p>${contentWithInlineMath}</p>`;
                break;
            case 'equation':
                try {
                    if (typeof katex !== 'undefined') {
                        const rendered = katex.renderToString(section.latex, { displayMode: true, throwOnError: false });
                        html += `<div class="katex-display">${rendered}</div>`;
                    } else {
                        html += `<p class="text-red-500">KaTeX library not loaded yet.</p>`;
                    }
                } catch (e) {
                    console.error("Block KaTeX Error:", e);
                    html += `<p class="text-red-500">Error rendering LaTeX: ${section.latex}</p>`;
                }
                break;
            default:
                html += `<p>${contentWithInlineMath}</p>`;
                break;
        }
    });
    
    storyContentDisplay.innerHTML = html;
}

function showCardStory(imageBaseName){
    let storyData = storiesMap[currentLanguage][imageBaseName];
    if (!storyData && currentLanguage === 'CN') {
        storyData = storiesMap['EN'][imageBaseName];
    }
    
    const imagePath = imageBaseURL() + imageBaseName;
    storyCardImage.src = imagePath;
    storyCardImage.alt = imageBaseName;
    
    storyCardImage.onclick = () => showImageZoom(imagePath, imageBaseName);

    showModal(storyModal, storyModalContent);
    
    if(currentLangDisplay) {
        currentLangDisplay.textContent = (currentLanguage === 'EN') ? 'EN' : '中文';
    }

    if (storyData) {
        renderStoryContentFromJSON(storyData);
    } else {
        storyTitleDisplay.textContent = `${imageBaseName.replace(/\.png$/,'').toUpperCase()}`;
        storyContentDisplay.innerHTML = `<p class="text-center font-bold text-red-600">No story found.</p>`;
    }
}

function toggleLanguage() {
    currentLanguage = (currentLanguage === 'EN') ? 'CN' : 'EN';
    if(currentLangDisplay) {
        currentLangDisplay.textContent = (currentLanguage === 'EN') ? 'EN' : '中文';
    }
    // Re-render story if modal is open
    if (!storyModal.classList.contains('hidden') && storyCardImage.alt) {
        showCardStory(storyCardImage.alt);
    }
    // Re-render about content if modal is open
    if (!aboutModal.classList.contains('hidden')) {
        renderAboutContent(currentLanguage);
    }
}

function revealAllCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (!card.classList.contains('is-matched')) {
            card.classList.add('is-flipped');
        }
    });
    lockBoard = true;
    
    setTimeout(() => {
        cards.forEach(card => {
            if (!card.classList.contains('is-matched')) {
                card.classList.remove('is-flipped');
            }
        });
        lockBoard = false;
    }, 3000); 
}


// --- 2-Player Logic ---

function updateScoreDisplay() {
    player1Score.textContent = playerScores[1];
    player2Score.textContent = playerScores[2];
    
    // Highlight the current player's score box
    player1ScoreDisplay.classList.remove('is-active');
    player2ScoreDisplay.classList.remove('is-active');

    if (currentPlayer === 1) {
        player1ScoreDisplay.classList.add('is-active');
    } else if (currentPlayer === 2) {
        player2ScoreDisplay.classList.add('is-active');
    }
}

function switchGameMode() {
    isTwoPlayerMode = !isTwoPlayerMode;
    
    // Update Mode Display
    currentModeDisplay.textContent = isTwoPlayerMode ? '2P' : '1P';
    
    // Toggle Score Area Visibility
    if (isTwoPlayerMode) {
        playerScoreArea.classList.remove('hidden');
        playerScoreArea.classList.add('flex');
    } else {
        playerScoreArea.classList.add('hidden');
        playerScoreArea.classList.remove('flex');
    }
    
    // Restart game to apply new mode
    initializeGame();
}


// --- Game Logic (UPDATED) ---

function createCard(imageBaseName,index){
    const cardContainer=document.createElement('div'); cardContainer.className='card-container';
    const card=document.createElement('div'); card.className='card w-full h-full relative';
    card.dataset.imagename=imageBaseName; card.dataset.imagepath=imageBaseURL()+imageBaseName; card.dataset.index=index;
    card.addEventListener('click',handleCardClick);
    const cardFace=document.createElement('div'); cardFace.className='card-face';
    const cardImage=document.createElement('img'); cardImage.src=card.dataset.imagepath; cardImage.alt=`Card Image ${imageBaseName}`;
    cardImage.onerror=function(){console.error(`Failed to load image at:${this.src}`); this.parentNode.innerHTML='<span class="text-center font-bold text-xs p-2">IMAGE NOT FOUND.</span>';};
    cardFace.appendChild(cardImage);
    const cardBack=document.createElement('div'); cardBack.className='card-back-pattern w-full h-full shadow-xl';
    card.appendChild(cardFace); card.appendChild(cardBack); cardContainer.appendChild(card); return cardContainer;
}

async function initializeGame(){
    // Ensure both stories and about content are fetched before starting the game
    if (Object.keys(storiesMap['EN']).length === 0) {
        await fetchAllStories();
    }
    if (Object.keys(aboutContent['EN']).length === 0) { // NEW: Fetch about content
        await fetchAboutContent();
    }
    
    gameGrid.innerHTML=''; 
    moves=0; 
    matchesFound=0; 
    stopTimer(); 
    seconds=0; 
    lockBoard=false; 
    
    // 2-Player Reset
    playerScores = { 1: 0, 2: 0 };
    currentPlayer = 1;

    hideModal(gameOverModal, gameOverModalContent);
    hideModal(storyModal, storyModalContent);
    hideModal(imageViewerModal, imageViewerModalContent); 
    hideModal(aboutModal, aboutModalContent); // NEW: Hide about modal too

    if (isTwoPlayerMode) {
        updateScoreDisplay(); // Initialize score and turn indicator
    } else {
        // Ensure single-player mode looks right if game is re-initialized
        currentModeDisplay.textContent = '1P';
        playerScoreArea.classList.add('hidden');
        playerScoreArea.classList.remove('flex');
    }


    const shuffledDeck=shuffle([...cardDeck]);
    shuffledDeck.forEach((name,index)=>{gameGrid.appendChild(createCard(name,index));});
    currentStyleDisplay.textContent=currentImageStyle;
}

function handleCardClick(event){
    const clickedCard=event.currentTarget;
    if(clickedCard.classList.contains('is-matched')){showCardStory(clickedCard.dataset.imagename); return;}
    flipCard(event);
}

function flipCard(event){
    startTimer();
    if(lockBoard) return; 
    const clickedCard=event.currentTarget;
    if(clickedCard.classList.contains('is-flipped')) return;
    clickedCard.classList.add('is-flipped');
    
    if(!firstCard){
        firstCard=clickedCard; 
        return;
    }
    secondCard=clickedCard; 
    checkForMatch();
}

function checkForMatch(){
    const isMatch=firstCard.dataset.imagename===secondCard.dataset.imagename;
    moves++; 
    
    if (isTwoPlayerMode) {
        resolveTwoPlayerTurn(isMatch);
    } else {
        // Original Single Player Logic
        isMatch ? disableCards() : unflipCards();
    }
}

// NEW Function for 2-Player Match Resolution
function resolveTwoPlayerTurn(isMatch) {
    if (isMatch) {
        // Player scores a point and keeps the turn
        playerScores[currentPlayer]++;
        updateScoreDisplay(); // Update score display
        
        // Match found - lock cards
        firstCard.classList.add('is-matched'); 
        secondCard.classList.add('is-matched');
        firstCard.querySelector('.card-back-pattern').classList.add('is-matched');
        secondCard.querySelector('.card-back-pattern').classList.add('is-matched');
        resetBoard(); 
        matchesFound++;
        
        if (matchesFound === numPairs) {
            gameOver();
        }
        // Player keeps the turn, so no need to switch currentPlayer
    } else {
        // No match - unflip cards and switch turn
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('is-flipped'); 
            secondCard.classList.remove('is-flipped'); 
            
            // Switch Player
            currentPlayer = (currentPlayer === 1) ? 2 : 1;
            updateScoreDisplay(); // Update to highlight new active player
            
            resetBoard(); // Unlock board
        }, 1200);
    }
}

// Original Single Player Logic (still needed if isTwoPlayerMode is false)
function disableCards(){
    firstCard.classList.add('is-matched'); secondCard.classList.add('is-matched');
    firstCard.querySelector('.card-back-pattern').classList.add('is-matched');
    secondCard.querySelector('.card-back-pattern').classList.add('is-matched');
    resetBoard(); matchesFound++;
    if(matchesFound===numPairs) gameOver();
}

function unflipCards(){lockBoard=true; setTimeout(()=>{firstCard.classList.remove('is-flipped'); secondCard.classList.remove('is-flipped'); resetBoard();},1200);}
function resetBoard(){firstCard=null; secondCard=null; lockBoard=false;}

function gameOver(){
    stopTimer();
    
    let message = "All pairs found successfully.";
    if (isTwoPlayerMode) {
        const score1 = playerScores[1];
        const score2 = playerScores[2];
        
        if (score1 > score2) {
            message = `<span class="text-green-600 font-extrabold">Player 1 WINS!</span> Score: ${score1} to ${score2}.`;
        } else if (score2 > score1) {
            message = `<span class="text-green-600 font-extrabold">Player 2 WINS!</span> Score: ${score2} to ${score1}.`;
        } else {
            message = `It's a <span class="font-extrabold">TIE!</span> Both players scored ${score1} pairs.`;
        }
    }
    
    gameOverMessage.innerHTML = message;
    showModal(gameOverModal, gameOverModalContent);

    // Crucially, the cards remain flipped since the game state is over.
    // The board is locked (lockBoard=false) but all cards are `.is-matched`.
}

function switchImageStyle(){const styles=Object.keys(IMAGE_FOLDERS); const currentIndex=styles.indexOf(currentImageStyle); currentImageStyle=styles[(currentIndex+1)%styles.length]; initializeGame();}


async function fetchAboutContent() {
    const urlEN = './card_stories/about_cn.json';
    const urlCN = './card_stories/about_cn.json'; 
    
    try {
        const [resEN, resCN] = await Promise.all([
            fetch(urlEN).catch(e => null),
            fetch(urlCN).catch(e => null) 
        ]);

        if (resEN && resEN.ok) {
            aboutContent['EN'] = await resEN.json();
        } else {
             console.warn("Failed to load English about content.");
        }
        
        if (resCN && resCN.ok) {
            aboutContent['CN'] = await resCN.json();
        } else {
             console.warn("Failed to load Chinese about content.");
        }
    } catch (error) {
        console.error('Critical error fetching about content:', error);
    }
}

function renderAboutContent(lang) {
    let data = aboutContent[lang] || aboutContent['EN']; // Fallback to English
    
    if (!aboutTitleDisplay || !aboutDynamicContent) {
        console.error("About modal elements (title/content) not found in DOM.");
        return;
    }

    if (!data || Object.keys(data).length === 0) {
        aboutTitleDisplay.textContent = 'Project Information';
        aboutDynamicContent.innerHTML = '<p class="text-center text-red-500">Could not load project information.</p>';
        return;
    }

    aboutTitleDisplay.textContent = data.title;
    
    let html = `
        <h3 class="text-xl font-bold mt-4 mb-2 text-gray-800">${data.section1.title}</h3>
        <p class="mb-4">${data.section1.content}</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2 text-gray-800">${data.section2.title}</h3>
        <ul class="list-disc list-inside space-y-1 text-gray-600">
    `;

    // Render list
    if (data.section2.people) {
        data.section2.people.forEach(person => {
            // Using placeholder text for Chinese characters if needed for visibility: '、'
            const separator = (lang === 'CN') ? '、' : ', '; 
            html += `<li><strong>${person.role}：</strong> ${person.names.join(separator)}</li>`;
        });
    }
    
    html += `
        </ul>
        <p class="text-sm text-gray-500 italic mt-6">${data.thanks}</p>
    `;
    
    aboutDynamicContent.innerHTML = html;
}

function showAboutModal() {
    renderAboutContent(currentLanguage); // Render content based on current language
    showModal(aboutModal, aboutModalContent);
}


// --- Event Listeners and Initialization (FIXED) ---

// FIXED Listener for the new About button: calls the function that renders content
aboutButton.addEventListener('click', showAboutModal);
aboutCloseButton.addEventListener('click', () => hideModal(aboutModal, aboutModalContent));


// Listener for the Main "New Game" button remains the same
resetButton.addEventListener('click',initializeGame); 
modalCloseButton.addEventListener('click', () => hideModal(gameOverModal, gameOverModalContent));

styleSwitchButton.addEventListener('click',switchImageStyle);
modeSwitchButton.addEventListener('click', switchGameMode);

if(languageButton) languageButton.addEventListener('click', toggleLanguage); 
if(cheatButton) cheatButton.addEventListener('click', revealAllCards);

storyCloseButton.addEventListener('click', () => hideModal(storyModal, storyModalContent));
imageCloseButton.addEventListener('click', () => hideModal(imageViewerModal, imageViewerModalContent));

window.onload=initializeGame;