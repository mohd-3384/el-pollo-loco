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

function playSound(sound, volume = 0.5) {
    if (isMuted || !sound) return;
    sound.volume = volume;
    sound.currentTime = 0;
    sound.play().catch(() => { });
}

function updateMuteIcon() {
    const icon = document.getElementById('muteIcon');
    if (!icon) return;
    icon.src = isMuted ? 'img/icons/sound-off.png' : 'img/icons/sound-on.png';
}

function startMusic() {
    if (isMuted) return;
    backgroundMusic.volume = 0.3;
    if (backgroundMusic.paused || backgroundMusic.ended) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(() => { });
    }
}

function initGame() {
    canvas = document.getElementById('canvas');
    world = new World(canvas);
    ctx = canvas.getContext('2d');
    startCollisionDetection();
}

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

function shouldSkipCollisionCheck() {
    return window.gameOver || !world?.character || !world?.enemies || !world?.endboss;
}

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

function stompEnemy(pepe, enemy) {
    playSound(boingSound);
    enemy.die?.();
    pepe.velocityY = -5;
}

function killPepe(pepe) {
    pepe.energy = 0;
    world.statusBarHealth.setPercentage(0);
    pepe.dead();
}

function hurtPepe(pepe, lastHitBy, enemy) {
    pepe.isHurt = true;
    pepe.playHurtLoop?.();
    pepe.energy = Math.max(0, pepe.energy - 15);
    world.statusBarHealth.setPercentage(pepe.energy);
    lastHitBy.set(enemy, true);
    if (pepe.energy === 0) pepe.dead();
}

function resetHurtState(allEnemies, pepe, lastHitBy) {
    pepe.isHurt = false;
    allEnemies.forEach(e => lastHitBy.delete(e));
}

function activateEndbossIfNear(pepe) {
    if (!world.endboss.activated && world.endboss.x - pepe.x < 700) {
        world.endboss.activate();
    }
}

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

function isColliding(a, b) {
    const boxA = getHitbox(a);
    const boxB = getHitbox(b);
    return checkBoxCollision(boxA, boxB);
}

function getHitbox(object) {
    return {
        x: object.x + (object.hitbox?.offsetX || 0),
        y: object.y + (object.hitbox?.offsetY || 0),
        width: object.hitbox?.width || object.width,
        height: object.hitbox?.height || object.height
    };
}

function checkBoxCollision(boxA, boxB) {
    return boxA.x < boxB.x + boxB.width &&
        boxA.x + boxA.width > boxB.x &&
        boxA.y < boxB.y + boxB.height &&
        boxA.y + boxA.height > boxB.y;
}

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

async function setupGameWorld() {
    initKeyboardControls();
    await preloadImages(backgroundImagePaths);
    initGame();
}

function handleFullscreenOnMobile() {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const isLandscape = window.innerWidth > window.innerHeight;
    if (isMobile && isLandscape && !document.fullscreenElement) {
        const wrapper = document.getElementById('canvasWrapper');
        wrapper?.requestFullscreen?.().catch(() => { });
    }
}

function toggleMobileControls() {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const isLandscape = window.innerWidth > window.innerHeight;
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
        mobileControls.style.display = (isMobile && isLandscape) ? 'block' : 'none';
    }
}

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

function goHome() {
    window.gameOver = true;
    window.isPlaying = false;
    stopWorldAndAudio();
    resetWorldState();
    resetUIToStartScreen();
}

function stopWorldAndAudio() {
    if (window.world?.drawFrame) cancelAnimationFrame(world.drawFrame);
    if (world?.character) {
        world.character.walkSound?.pause();
        world.character.jumpSound?.pause();
    }
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

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

function resetUIToStartScreen() {
    const startFrame = document.getElementById('startFrame');
    if (startFrame) {
        startFrame.classList.remove('fade-out');
        startFrame.style.display = 'block';
        startFrame.style.opacity = '1';
    }
    showButtons('startBtn', 'impressumContainer');
}

function showHomeButton() {
    const home = document.getElementById('home');
    if (home) home.style.display = 'flex';
}

function hideHomeButton() {
    const home = document.getElementById('home');
    if (home) home.style.display = 'none';
}

async function fullyResetGame() {
    stopWorldAndCharacter();
    resetGameState();
    clearUIAndCanvas();
    resetAudio();
    await waitShortDelay();
}

function stopWorldAndCharacter() {
    if (window.world?.drawFrame) cancelAnimationFrame(world.drawFrame);
    if (world?.character?.keyboardInterval) {
        clearInterval(world.character.keyboardInterval);
        world.character.keyboardInterval = null;
        world.character.keyboardIntervalStarted = false;
    }
}

function resetGameState() {
    window.gameOver = true;
    world = null;
    canvas = null;
    ctx = null;
    keyboard = {};
}

function clearUIAndCanvas() {
    clearCanvas();
    hideButtons('replayBtn', 'impressumContainer');
    hideVictoryScreen();
    hideGameOverScreen();
    hideHomeButton();
}

function resetAudio() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function waitShortDelay() {
    return new Promise(resolve => setTimeout(resolve, 50));
}

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

function restoreMuteState() {
    const storedMute = localStorage.getItem('isMuted');
    if (storedMute !== null) {
        isMuted = JSON.parse(storedMute);
        updateMuteIcon();
        applyMuteToSounds();
    }
}

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