let canvas;
let world;
const backgroundMusic = new Audio('./audio/mexican-huapango-banda.mp3');
const coinSound = new Audio('./audio/coin-collected.mp3');
const bottleSound = new Audio('./audio/collect-bottle.mp3');
const boingSound = new Audio('./audio/boing.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.05;
let isMuted = false;
const backgroundImagePaths = [];

for (let i = 0; i < 10; i++) {
    const suffix = (i % 2 === 0) ? '1' : '2';
    backgroundImagePaths.push(
        `./img/5_background/layers/air.png`,
        `./img/5_background/layers/3_third_layer/${suffix}.png`,
        `./img/5_background/layers/2_second_layer/${suffix}.png`,
        `./img/5_background/layers/1_first_layer/${suffix}.png`
    );
}

/** 
 * Initializes game world and collision detection.
 */
function initGame() {
    canvas = document.getElementById('canvas');
    world = new World(canvas);
    ctx = canvas.getContext('2d');
    setInterval(() => {
        if (world?.character && world?.enemies) {
            world.character.checkCollisionsWithEnemies(world.enemies);
        }
    }, 1000 / 60);
    startCollisionDetection();
}

/** 
 * Starts collision detection checks in intervals.
 */
function startCollisionDetection() {
    const lastHitBy = new WeakMap();
    setInterval(() => {
        if (shouldSkipCollisionCheck()) return;
        const pepe = world.character;
        const allEnemies = [...world.enemies, world.endboss];
        let collisionDetected = detectEnemyCollisions(allEnemies, pepe, lastHitBy);
        if (!collisionDetected && pepe.isHurt) resetHurtState(allEnemies, pepe, lastHitBy);
        activateEndbossIfNear(pepe);
        checkThrowablesCollision();
        collectCoins(pepe);
        collectBottles(pepe);
    }, 1000 / 30);
}

/** 
 * Returns true if collision check should be skipped.
 * @returns {boolean}
 */
function shouldSkipCollisionCheck() {
    return window.gameOver || !world?.character || !world?.enemies || !world?.endboss;
}

/** 
 * Detects collisions between Pepe and enemies.
 * @param {Array} allEnemies 
 * @param {Character} pepe 
 * @param {WeakMap} lastHitBy 
 * @returns {boolean}
 */
function detectEnemyCollisions(allEnemies, pepe, lastHitBy) {
    let collisionDetected = false;
    allEnemies.forEach(enemy => {
        if (!enemy || enemy.isDead || enemy.dead) return;
        if (isColliding(pepe, enemy)) {
            handleCollision(pepe, enemy, lastHitBy);
            collisionDetected = true;
        }
    });
    return collisionDetected;
}

/** 
 * Handles collision between Pepe and an enemy.
 * @param {Character} pepe 
 * @param {Object} enemy 
 * @param {WeakMap} lastHitBy 
 */
function handleCollision(pepe, enemy, lastHitBy) {
    if (pepe.isDead) return;
    const isChicken = enemy.constructor.name === 'Chicken' || enemy.constructor.name === 'SmallChicken';
    const isEndboss = enemy.constructor.name === 'Endboss';
    const characterIsAbove = (pepe.y + pepe.height / 2) < (enemy.y + (enemy.hitbox?.offsetY || 0)) && pepe.velocityY > 0;
    if (isChicken && characterIsAbove) return stompEnemy(pepe, enemy);
    if (isEndboss) return killPepe(pepe);
    if (isChicken && !pepe.isHurt && pepe.energy > 0 && !lastHitBy.has(enemy)) {
        hurtPepe(pepe, lastHitBy, enemy);
    }
}

/** 
 * Stomps enemy when Pepe jumps on it.
 * @param {Character} pepe 
 * @param {Object} enemy 
 */
function stompEnemy(pepe, enemy) {
    playSound(boingSound);
    enemy.die?.();
    pepe.velocityY = -5;
}

/** 
 * Activates endboss when Pepe is near.
 * @param {Character} pepe 
 */
function activateEndbossIfNear(pepe) {
    if (!world.endboss.activated && world.endboss.x - pepe.x < 700) {
        world.endboss.activate();
    }
}

/**
 * Checks for collisions between throwable bottles and enemies or the endboss.
 * Removes bottles after a successful hit.
 */
function checkThrowablesCollision() {
    world.throwables = world.throwables.filter(bottle => {
        if (checkEndbossCollision(bottle)) return false;
        if (checkEnemyCollision(bottle)) return false;
        return true;
    });
}

/** 
 * Collects coins when Pepe collides with them.
 * @param {Character} pepe 
 */
function collectCoins(pepe) {
    world.coins = world.coins.filter(coin => {
        if (isColliding(pepe, coin)) {
            pepe.coins = Math.min(100, pepe.coins + 20);
            world.statusBarCoin.setPercentage(pepe.coins);
            playSound(coinSound);
            return false;
        }
        return true;
    });
}

/** 
 * Collects bottles when Pepe collides with them.
 * @param {Character} pepe 
 */
function collectBottles(pepe) {
    world.bottles = world.bottles.filter(bottle => {
        if (isColliding(pepe, bottle)) {
            pepe.bottles = Math.min(100, pepe.bottles + 20);
            world.statusBarBottle.setPercentage(pepe.bottles);
            playSound(bottleSound);
            return false;
        }
        return true;
    });
}

/** 
 * Starts the game and sets up world.
 */
async function startGame() {
    window.isPlaying = true;
    prepareGameStart();
    await setupGameWorld();
    handleFullscreenOnMobile();
    toggleMobileControls();
    configureSoundVolumes();
    startMusic();
    hideGameOverScreen();
}

/** 
 * Loads images and initializes the world.
 */
async function setupGameWorld() {
    initKeyboardControls();
    await preloadImages(backgroundImagePaths);
    initGame();
}

/** 
 * Requests fullscreen if on mobile and landscape.
 */
function handleFullscreenOnMobile() {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const isLandscape = window.innerWidth > window.innerHeight;
    if (isMobile && isLandscape && !document.fullscreenElement) {
        const wrapper = document.getElementById('canvasWrapper');
        wrapper?.requestFullscreen?.().catch(() => { });
    }
}

/** 
 * Shows or hides mobile controls based on device orientation.
 */
function toggleMobileControls() {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const isLandscape = window.innerWidth > window.innerHeight;
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
        mobileControls.style.display = (isMobile && isLandscape) ? 'block' : 'none';
    }
}
window.addEventListener('resize', toggleMobileControls);

/** 
 * Configures volume for all game sounds.
 */
function configureSoundVolumes() {
    const sounds = [
        world?.character?.startSound,
        world?.character?.walkSound,
        world?.character?.jumpSound,
        backgroundMusic
    ];
    sounds.forEach(sound => {
        if (!sound) return;
        sound.volume = isMuted ? 0 : 0.5;
    });
}

/** 
 * Ends the game and returns to home screen.
 */
function goHome() {
    window.gameOver = true;
    window.isPlaying = false;
    stopWorldAndAudio();
    resetWorldState();
    resetUIToStartScreen();
}

/** 
 * Stops animations and sounds.
 */
function stopWorldAndAudio() {
    if (window.world?.drawFrame) cancelAnimationFrame(world.drawFrame);
    if (world?.character) {
        world.character.walkSound?.pause();
        world.character.jumpSound?.pause();
    }
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

/** 
 * Resets world and UI after game ends.
 */
function resetWorldState() {
    if (world) {
        resetWorldObjects();
        resetCharacterState();
        resetEndbossState();
    }
    world = null;
    resetUIState();
}

/** 
 * Resets general world objects
 */
function resetWorldObjects() {
    if (world.throwables) world.throwables = [];
    if (world.statusBarHealth) world.statusBarHealth.setPercentage(100);
    if (world.statusBarCoin) world.statusBarCoin.setPercentage(0);
    if (world.statusBarBottle) world.statusBarBottle.setPercentage(0);
}

/** 
 * Resets the character's status
 */
function resetCharacterState() {
    if (!world.character) return;
    world.character.energy = 100;
    world.character.coins = 0;
    world.character.bottles = 0;
    world.character.isHurt = false;
    world.character.isDead = false;
    world.character.currentAnimation = 'idle';
}

/** 
 * Resets the final boss's status
 */
function resetEndbossState() {
    if (!world.endboss) return;
    world.endboss.isDead = false;
    world.endboss.hits = 0;
    world.endboss.activated = false;
}

/** 
 * Resets the user interface
 */
function resetUIState() {
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) mobileControls.style.display = 'none';
    hideGameKeys();
    hideButtons('replayBtn', 'impressumContainer');
    hideVictoryScreen();
    hideGameOverScreen();
    hideHomeButton();
    clearCanvas();
}

/** 
 * Displays the start screen UI.
 */
function resetUIToStartScreen() {
    const startFrame = document.getElementById('startFrame');
    if (startFrame) {
        startFrame.classList.remove('fade-out');
        startFrame.style.display = 'block';
        startFrame.style.opacity = '1';
    }
    showButtons('startBtn', 'impressumContainer');
}

/** 
 * Shows the home button.
 */
function showHomeButton() {
    const home = document.getElementById('home');
    if (home) home.style.display = 'flex';
}

/** 
 * Hides the home button.
 */
function hideHomeButton() {
    const home = document.getElementById('home');
    if (home) home.style.display = 'none';
}

/** 
 * Fully resets the game for a clean restart.
 */
async function fullyResetGame() {
    stopWorldAndCharacter();
    resetGameState();
    clearUIAndCanvas();
    resetAudio();
    await waitShortDelay();
}

/** 
 * Stops world and character intervals.
 */
function stopWorldAndCharacter() {
    if (window.world?.drawFrame) cancelAnimationFrame(world.drawFrame);
    if (world?.character?.keyboardInterval) {
        clearInterval(world.character.keyboardInterval);
        world.character.keyboardInterval = null;
        world.character.keyboardIntervalStarted = false;
    }
}

/** 
 * Clears world, canvas, and keyboard state.
 */
function resetGameState() {
    window.gameOver = true;
    world = null;
    canvas = null;
    ctx = null;
    keyboard = {};
}

/** 
 * Hides game over UI and clears canvas.
 */
function clearUIAndCanvas() {
    clearCanvas();
    hideButtons('replayBtn', 'impressumContainer');
    hideVictoryScreen();
    hideGameOverScreen();
    hideHomeButton();
}

/** 
 * Restarts the game after resetting.
 */
async function restartGame() {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const isLandscape = window.innerWidth > window.innerHeight;
    if (isMobile && isLandscape && !document.fullscreenElement) {
        const wrapper = document.getElementById('canvasWrapper');
        wrapper?.requestFullscreen?.().catch(() => { });
    }
    await fullyResetGame();
    startGame();
}