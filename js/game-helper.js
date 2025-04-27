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
 * Resets background music.
 */
function resetAudio() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
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
 * Waits briefly (50ms).
 * @returns {Promise<void>}
 */
function waitShortDelay() {
    return new Promise(resolve => setTimeout(resolve, 50));
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