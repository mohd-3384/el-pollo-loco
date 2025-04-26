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

/**
 * Preloads a list of images and resolves when all are loaded.
 * @param {string[]} imagePaths - Array of image file paths to preload.
 * @returns {Promise<HTMLImageElement[]>} Promise resolving with loaded images.
 */
function preloadImages(imagePaths) {
    return Promise.all(
        imagePaths.map(path => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = path;
                img.onload = () => resolve(img);
                img.onerror = () => resolve(img);
            });
        })
    );
}

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
 * Toggles the game's mute state and updates all relevant sounds and UI.
 */
function toggleMute() {
    isMuted = !isMuted;
    const sounds = [
        world?.character?.startSound,
        world?.character?.walkSound,
        world?.character?.jumpSound,
        backgroundMusic
    ];
    sounds.forEach(sound => {
        if (!sound) return;
        sound.volume = isMuted ? 0 : 0.5;
        if (sound === backgroundMusic && !isMuted) sound.play().catch(() => { });
    });
    updateMuteIcon();
    localStorage.setItem('isMuted', JSON.stringify(isMuted));
}

/** 
 * Plays a sound with specified volume if not muted. 
 * @param {HTMLAudioElement} sound - The sound to play.
 * @param {number} [volume=0.5] - The volume level.
 */
function playSound(sound, volume = 0.5) {
    if (isMuted || !sound) return;
    sound.volume = volume;
    sound.currentTime = 0;
    sound.play().catch(() => { });
}

/** 
 * Updates the mute icon based on mute state.
 */
function updateMuteIcon() {
    const icon = document.getElementById('muteIcon');
    if (!icon) return;
    icon.src = isMuted ? 'img/icons/sound-off.png' : 'img/icons/sound-on.png';
}

/** 
 * Starts background music if not muted.
 */
function startMusic() {
    if (isMuted) return;
    backgroundMusic.volume = 0.3;
    if (backgroundMusic.paused || backgroundMusic.ended) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(() => { });
    }
}

/** 
 * Initializes game world and collision detection.
 */
function initGame() {
    canvas = document.getElementById('canvas');
    world = new World(canvas);
    ctx = canvas.getContext('2d');
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
 * Instantly kills Pepe.
 * @param {Character} pepe 
 */
function killPepe(pepe) {
    pepe.energy = 0;
    world.statusBarHealth.setPercentage(0);
    pepe.dead();
}

/** 
 * Hurts Pepe when colliding with enemy.
 * @param {Character} pepe 
 * @param {WeakMap} lastHitBy 
 * @param {Object} enemy 
 */
function hurtPepe(pepe, lastHitBy, enemy) {
    pepe.isHurt = true;
    pepe.playHurtLoop?.();
    pepe.energy = Math.max(0, pepe.energy - 15);
    world.statusBarHealth.setPercentage(pepe.energy);
    lastHitBy.set(enemy, true);
    if (pepe.energy === 0) pepe.dead();
}

/** 
 * Resets Pepe's hurt state.
 * @param {Array} allEnemies 
 * @param {Character} pepe 
 * @param {WeakMap} lastHitBy 
 */
function resetHurtState(allEnemies, pepe, lastHitBy) {
    pepe.isHurt = false;
    allEnemies.forEach(e => lastHitBy.delete(e));
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
 * Checks for collision between bottles and endboss.
 */
function checkThrowablesCollision() {
    world.throwables = world.throwables.filter(bottle => {
        if (!bottle.alreadyHitEndboss && isColliding(bottle, world.endboss)) {
            world.endboss.hitByBottle();
            bottle.alreadyHitEndboss = true;
            return false;
        }
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
 * Checks if two objects are colliding.
 * @param {Object} a 
 * @param {Object} b 
 * @returns {boolean}
 */
function isColliding(a, b) {
    const boxA = getHitbox(a);
    const boxB = getHitbox(b);
    return checkBoxCollision(boxA, boxB);
}

/** 
 * Returns the hitbox of an object.
 * @param {Object} object 
 * @returns {Object}
 */
function getHitbox(object) {
    return {
        x: object.x + (object.hitbox?.offsetX || 0),
        y: object.y + (object.hitbox?.offsetY || 0),
        width: object.hitbox?.width || object.width,
        height: object.hitbox?.height || object.height
    };
}

/** 
 * Checks collision between two hitboxes.
 * @param {Object} boxA 
 * @param {Object} boxB 
 * @returns {boolean}
 */
function checkBoxCollision(boxA, boxB) {
    return boxA.x < boxB.x + boxB.width &&
        boxA.x + boxA.width > boxB.x &&
        boxA.y < boxB.y + boxB.height &&
        boxA.y + boxA.height > boxB.y;
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
 * Prepares UI and game state for start.
 */
function prepareGameStart() {
    hideButtons('startBtn', 'replayBtn', 'impressumContainer');
    hideStartScreen();
    hideVictoryScreen();
    clearCanvas();
    hideHomeButton();
    updateGameKeysVisibility();
    if (window.world?.drawFrame) cancelAnimationFrame(window.world.drawFrame);
    world = null;
    window.gameOver = false;
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
 * Draws a transparent hitbox for an object.
 * @param {Object} obj 
 * @param {CanvasRenderingContext2D} ctx 
 */
function drawHitbox(obj, ctx) {
    if (!obj.hitbox) return;
    ctx.save();
    ctx.strokeStyle = 'transparent';
    ctx.lineWidth = 2;
    ctx.strokeRect(
        obj.x + (obj.hitbox.offsetX || 0),
        obj.y + (obj.hitbox.offsetY || 0),
        obj.hitbox?.width || obj.width,
        obj.hitbox?.height || obj.height
    );
    ctx.restore();
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
    world = null;
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
 * Resets background music.
 */
function resetAudio() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

/** 
 * Waits briefly (50ms).
 * @returns {Promise<void>}
 */
function waitShortDelay() {
    return new Promise(resolve => setTimeout(resolve, 50));
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

document.addEventListener('DOMContentLoaded', () => {
    restoreMuteState();
});

/** 
 * Restores mute state from localStorage.
 */
function restoreMuteState() {
    const storedMute = localStorage.getItem('isMuted');
    if (storedMute !== null) {
        isMuted = JSON.parse(storedMute);
        updateMuteIcon();
        applyMuteToSounds();
    }
}

/** 
 * Applies mute settings to all sounds.
 */
function applyMuteToSounds() {
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