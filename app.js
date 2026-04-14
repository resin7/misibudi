/* ============================================================
   MISI RUMAH RAPI SI BUDI — Game Engine
   ============================================================
   Arsitektur: Branching Scenario dengan State Machine
   Variable: Score_Aturan (0-2) → Lencana Emas/Perak/Belajar Lagi
   ============================================================ */

// ===================== STATE & VARIABLES =====================
let Score_Aturan = 0;          // Skor utama (0-2)
let currentScreen = 'title';   // Track current active screen
let soundEnabled = true;       // Audio toggle state
let choices = { scene1: null, scene2: null }; // Track player choices
let bgmStarted = false;

// ===================== DOM REFERENCES ========================
const screens = {
    title: document.getElementById('screen-title'),
    intro: document.getElementById('screen-intro'),
    scene1: document.getElementById('screen-scene1'),
    scene2: document.getElementById('screen-scene2'),
    result: document.getElementById('screen-result'),
};

const sfx = {
    ding: document.getElementById('sfx-ding'),
    buzz: document.getElementById('sfx-buzz'),
    tada: document.getElementById('sfx-tada'),
};

const bgm = document.getElementById('bgm');

// ===================== INITIALIZATION ========================
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    setupProgressBar();
    
    // Set initial volume
    if (bgm) bgm.volume = 0.15;
    Object.values(sfx).forEach(s => { if (s) s.volume = 0.4; });
});

// ===================== PARTICLES SYSTEM ======================
function createParticles() {
    const container = document.getElementById('particles-container');
    const colors = ['#FDCB6E', '#A29BFE', '#E84393', '#00B894', '#74B9FF', '#FD79A8'];
    const shapes = ['circle', 'square', 'star'];
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 12 + 4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 15;
        const startX = Math.random() * 100;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${startX}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
        `;
        
        container.appendChild(particle);
    }
}

// ===================== SCREEN NAVIGATION =====================
function navigateTo(screenName) {
    // Fade out current screen
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Fade in target screen after brief delay
    setTimeout(() => {
        screens[screenName].classList.add('active');
        currentScreen = screenName;
        updateProgress(screenName);
    }, 300);
}

// ===================== PROGRESS BAR ==========================
function setupProgressBar() {
    updateProgress('title');
}

function updateProgress(screenName) {
    const progressMap = {
        'title': { width: '0%', step: 0 },
        'intro': { width: '10%', step: 0 },
        'scene1': { width: '33%', step: 1 },
        'scene2': { width: '66%', step: 2 },
        'result': { width: '100%', step: 3 },
    };
    
    const progress = progressMap[screenName] || { width: '0%', step: 0 };
    document.getElementById('progress-bar').style.width = progress.width;
    
    // Update step indicators
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepNum === progress.step) {
            step.classList.add('active');
        } else if (stepNum < progress.step) {
            step.classList.add('completed');
        }
    });
}

// ===================== AUDIO SYSTEM ==========================
function playSound(name) {
    if (!soundEnabled) return;
    
    const sound = sfx[name];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {}); // Ignore autoplay restrictions
    }
}

function startBGM() {
    if (!soundEnabled || bgmStarted) return;
    
    bgm.play().catch(() => {}); // Ignore autoplay restrictions
    bgmStarted = true;
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
    
    if (soundEnabled) {
        if (bgmStarted) bgm.play().catch(() => {});
    } else {
        bgm.pause();
    }
}

// ===================== TYPEWRITER EFFECT =====================
function typeWriter(element, text, speed = 35, callback) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            setTimeout(callback, 500);
        }
    }
    
    type();
}

// ===================== GAME FLOW =============================

/**
 * START GAME — Triggered from Title Screen
 */
function startGame() {
    // Reset state
    Score_Aturan = 0;
    choices = { scene1: null, scene2: null };
    
    // Reset UI states
    resetChoiceButtons(1);
    resetChoiceButtons(2);
    
    // Start BGM
    startBGM();
    
    // Navigate to intro
    navigateTo('intro');
    
    // Start intro narration with typewriter effect
    setTimeout(() => {
        const introText = document.getElementById('intro-text');
        const introNarration = 'Perkenalkan, ini Budi! Anak kelas 2 SD yang ceria dan suka bermain. Hari ini, Budi akan menghadapi dua situasi di rumah. Setiap pilihan yang Budi ambil akan menentukan lencana yang ia dapatkan. Yuk, bantu Budi membuat pilihan yang benar!';
        
        typeWriter(introText, introNarration, 30, () => {
            const btnNext = document.getElementById('btn-next-intro');
            btnNext.style.display = 'inline-flex';
            btnNext.style.animation = 'fade-in-up 0.5s ease-out';
        });
    }, 600);
}

/**
 * GO TO SCENE 1 — Dilema Mainan
 */
function goToScene1() {
    navigateTo('scene1');
    playSound('ding');
}

/**
 * SELECT CHOICE — Core branching logic
 * @param {number} scene - Scene number (1 or 2)
 * @param {string} choice - 'A' (wrong) or 'B' (correct)
 */
function selectChoice(scene, choice) {
    const choiceBtnA = document.getElementById(`choice-${scene}a`);
    const choiceBtnB = document.getElementById(`choice-${scene}b`);
    
    // Disable all choices in this scene
    choiceBtnA.classList.add('disabled');
    choiceBtnB.classList.add('disabled');
    
    if (choice === 'B') {
        // ✅ CORRECT CHOICE — Patuh
        Score_Aturan += 1;  // Adjust variable Score_Aturan + 1
        
        choiceBtnB.classList.add('selected-right', 'pulse-glow');
        playSound('ding');
        
        // Show positive feedback layer
        setTimeout(() => {
            showFeedback(`${scene}b`);
        }, 600);
        
    } else {
        // ❌ WRONG CHOICE — Melanggar
        // No variable change
        
        choiceBtnA.classList.add('selected-wrong', 'shake');
        playSound('buzz');
        
        // Show negative feedback layer
        setTimeout(() => {
            showFeedback(`${scene}a`);
        }, 600);
    }
    
    // Track choice
    if (scene === 1) choices.scene1 = choice;
    if (scene === 2) choices.scene2 = choice;
}

/**
 * SHOW FEEDBACK LAYER
 */
function showFeedback(feedbackId) {
    const layer = document.getElementById(`feedback-${feedbackId}`);
    if (layer) {
        layer.classList.add('active');
    }
}

/**
 * CLOSE FEEDBACK & NAVIGATE
 */
function closeFeedback(feedbackId) {
    const layer = document.getElementById(`feedback-${feedbackId}`);
    if (layer) {
        layer.classList.remove('active');
    }
    
    // Determine next navigation
    const scene = parseInt(feedbackId.charAt(0));
    
    if (scene === 1) {
        // After Scene 1 feedback → Go to Scene 2
        setTimeout(() => {
            navigateTo('scene2');
            playSound('ding');
        }, 300);
    } else if (scene === 2) {
        // After Scene 2 feedback → Go to Results
        setTimeout(() => {
            navigateTo('result');
            showResults();
        }, 300);
    }
}

/**
 * RESET CHOICE BUTTONS — For replay
 */
function resetChoiceButtons(scene) {
    const btnA = document.getElementById(`choice-${scene}a`);
    const btnB = document.getElementById(`choice-${scene}b`);
    
    if (btnA) {
        btnA.classList.remove('disabled', 'selected-wrong', 'selected-right', 'shake', 'pulse-glow');
    }
    if (btnB) {
        btnB.classList.remove('disabled', 'selected-wrong', 'selected-right', 'shake', 'pulse-glow');
    }
}

// ===================== RESULTS SYSTEM ========================

/**
 * SHOW RESULTS — Calculate & display badge
 */
function showResults() {
    playSound('tada');
    
    // Animate score display
    const scoreDisplay = document.getElementById('score-display');
    const scoreCircle = document.getElementById('score-circle');
    animateScore(scoreDisplay, Score_Aturan);
    
    // Determine badge state
    let badgeHTML = '';
    let messageHTML = '';
    let circleClass = '';
    
    if (Score_Aturan === 2) {
        // ★ STATE: EMAS — Score_Aturan = 2
        circleClass = 'gold';
        badgeHTML = `
            <div class="badge-display">
                <div class="badge-icon">🏅</div>
                <div class="badge-title gold">Lencana Emas!</div>
            </div>
        `;
        messageHTML = `
            <p><strong>LUAR BIASA, Budi!</strong> 🎉<br>
            Kamu berhasil membuat semua keputusan yang benar!<br>
            Budi merapikan kamar DAN membawa piring ke tempat cuci.<br>
            Ibu sangat bangga dengan Budi!</p>
        `;
    } else if (Score_Aturan === 1) {
        // ★ STATE: PERAK — Score_Aturan = 1
        circleClass = 'silver';
        badgeHTML = `
            <div class="badge-display">
                <div class="badge-icon">🥈</div>
                <div class="badge-title silver">Lencana Perak</div>
            </div>
        `;
        messageHTML = `
            <p><strong>Bagus, Budi!</strong> 👍<br>
            Kamu sudah membuat satu keputusan yang benar.<br>
            Tapi masih ada yang bisa diperbaiki.<br>
            Yuk, coba lagi untuk mendapatkan Lencana Emas!</p>
        `;
    } else {
        // ★ STATE: BELAJAR LAGI — Score_Aturan = 0
        circleClass = 'bronze';
        badgeHTML = `
            <div class="badge-display">
                <div class="badge-icon">📚</div>
                <div class="badge-title bronze">Ayo Belajar Lagi!</div>
            </div>
        `;
        messageHTML = `
            <p><strong>Jangan menyerah, Budi!</strong> 💪<br>
            Kedua pilihan belum tepat, tapi tidak apa-apa!<br>
            Kita bisa belajar dari kesalahan.<br>
            Coba lagi dan ingat kewajiban kita di rumah ya!</p>
        `;
    }
    
    // Apply to DOM
    scoreCircle.className = 'score-circle ' + circleClass;
    document.getElementById('badge-container').innerHTML = badgeHTML;
    document.getElementById('result-message').innerHTML = messageHTML;
    
    // Build summary
    buildSummary();
    
    // Generate confetti for gold
    if (Score_Aturan === 2) {
        generateConfetti();
    }
}

/**
 * ANIMATE SCORE — Count up animation
 */
function animateScore(element, target) {
    let current = 0;
    const duration = 1000;
    const stepTime = duration / (target || 1);
    
    if (target === 0) {
        element.textContent = '0';
        return;
    }
    
    const interval = setInterval(() => {
        current++;
        element.textContent = current;
        if (current >= target) {
            clearInterval(interval);
        }
    }, stepTime);
}

/**
 * BUILD SUMMARY — Show recap of each choice
 */
function buildSummary() {
    const summaryContainer = document.getElementById('result-summary');
    
    const scene1Result = choices.scene1 === 'B' ? 'correct' : 'incorrect';
    const scene2Result = choices.scene2 === 'B' ? 'correct' : 'incorrect';
    
    summaryContainer.innerHTML = `
        <div class="summary-item ${scene1Result}">
            <span class="summary-icon">${scene1Result === 'correct' ? '✅' : '❌'}</span>
            <div>
                <strong>Misi 1:</strong> Dilema Mainan<br>
                ${scene1Result === 'correct' 
                    ? 'Budi merapikan mainan sebelum bermain. 👏' 
                    : 'Budi langsung pergi bermain tanpa merapikan. 😔'}
            </div>
        </div>
        <div class="summary-item ${scene2Result}">
            <span class="summary-icon">${scene2Result === 'correct' ? '✅' : '❌'}</span>
            <div>
                <strong>Misi 2:</strong> Dilema Makan Siang<br>
                ${scene2Result === 'correct' 
                    ? 'Budi membawa piring ke tempat cuci. 👏' 
                    : 'Budi meninggalkan piring di meja. 😔'}
            </div>
        </div>
    `;
}

/**
 * GENERATE CONFETTI — Celebration for Gold Badge
 */
function generateConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    
    const colors = ['#F9CA24', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#E84393', '#00B894', '#FDCB6E'];
    const shapes = ['circle', 'square', 'triangle'];
    
    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 12 + 5;
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = Math.random() * 2 + 2;
        const rotation = Math.random() * 360;
        
        const isCircle = Math.random() > 0.5;
        
        piece.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${left}%;
            top: -20px;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            border-radius: ${isCircle ? '50%' : '2px'};
            transform: rotate(${rotation}deg);
        `;
        
        container.appendChild(piece);
    }
}

// ===================== RESTART GAME ==========================

/**
 * RESTART GAME — Reset all state and navigate to title
 */
function restartGame() {
    // Reset variables
    Score_Aturan = 0;
    choices = { scene1: null, scene2: null };
    
    // Reset UI states
    resetChoiceButtons(1);
    resetChoiceButtons(2);
    
    // Hide all feedback layers
    document.querySelectorAll('.feedback-layer').forEach(layer => {
        layer.classList.remove('active');
    });
    
    // Reset intro button
    const btnNextIntro = document.getElementById('btn-next-intro');
    if (btnNextIntro) btnNextIntro.style.display = 'none';
    
    // Reset result displays
    document.getElementById('confetti-container').innerHTML = '';
    document.getElementById('badge-container').innerHTML = '';
    document.getElementById('result-message').innerHTML = '';
    document.getElementById('result-summary').innerHTML = '';
    document.getElementById('score-display').textContent = '0';
    
    // Navigate to title
    navigateTo('title');
    
    playSound('ding');
}

// ===================== KEYBOARD SUPPORT ======================
document.addEventListener('keydown', (e) => {
    // Accessibility: Allow Enter/Space to trigger focused buttons
    if (e.key === 'Enter' || e.key === ' ') {
        const focused = document.activeElement;
        if (focused && focused.tagName === 'BUTTON') {
            focused.click();
        }
    }
});

// ===================== CONSOLE BRANDING ======================
console.log(
    '%c🏠 Misi Rumah Rapi Si Budi %c Interactive Story Engine v1.0',
    'background: linear-gradient(135deg, #6C5CE7, #E84393); color: white; padding: 8px 16px; border-radius: 8px 0 0 8px; font-weight: bold; font-size: 14px;',
    'background: #2D3436; color: #FDCB6E; padding: 8px 16px; border-radius: 0 8px 8px 0; font-size: 14px;'
);
console.log('📊 Variable: Score_Aturan | Type: Number | Default: 0');
console.log('🎯 Logic: Score 2 = Emas, Score 1 = Perak, Score 0 = Belajar Lagi');
