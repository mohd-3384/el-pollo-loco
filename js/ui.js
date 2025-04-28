/**
 * Hides elements by their IDs.
 * @param  {...string} ids - Element IDs.
 */
function hideButtons(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = 'none';
    });
}

/**
 * Shows elements by their IDs with flex display.
 * @param  {...string} ids - Element IDs.
 */
function showButtons(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = 'flex';
    });
}

/**
 * Fades out and hides the start screen.
 */
function hideStartScreen() {
    const startFrame = document.getElementById('startFrame');
    if (startFrame) {
        startFrame.classList.add('fade-out');
        setTimeout(() => {
            startFrame.style.display = 'none';
        }, 200);
    }
}

/**
 * Shows the game over screen and stops the game.
 */
function showGameOverScreen() {
    this.displayGameOverUI();
    this.stopWorldAudio();
    hideGameKeys();
    window.gameOver = true;
    showHomeButton();
    showButtons('replayBtn', 'impressumContainer');
}

/**
 * Displays game over UI elements.
 */
function displayGameOverUI() {
    const gameOverImage = document.getElementById('gameOverImage');
    const replayBtn = document.getElementById('replayBtn');
    if (gameOverImage) gameOverImage.style.display = 'block';
    if (replayBtn) {
        replayBtn.style.display = 'block';
        const btn = replayBtn.querySelector('button');
        if (btn) btn.style.display = 'block';
    }
}

/**
 * Stops world animations and audio.
 */
function stopWorldAudio() {
    if (world?.drawFrame) cancelAnimationFrame(world.drawFrame);
    if (world?.character) {
        world.character.walkSound?.pause();
        world.character.jumpSound?.pause();
    }
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

/**
 * Clears the canvas area.
 * @param {string} [canvasId='canvas'] - Canvas element ID.
 */
function clearCanvas(canvasId = 'canvas') {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Hides the game over screen.
 */
function hideGameOverScreen() {
    const gameOverImage = document.getElementById('gameOverImage');
    if (gameOverImage) {
        gameOverImage.style.display = 'none';
    }
}

/**
 * Hides the victory screen.
 */
function hideVictoryScreen() {
    const youWon = document.getElementById('youWon');
    if (youWon) {
        youWon.style.display = 'none';
    }
}

/**
 * Shows the mobile game keys.
 */
function showGameKeys() {
    const keys = document.getElementById('gameKeys');
    if (keys) keys.style.display = 'flex';
}

/**
 * Hides the mobile game keys.
 */
function hideGameKeys() {
    const keys = document.getElementById('gameKeys');
    if (keys) keys.style.display = 'none';
}

/**
 * Shows the victory screen and ends the game.
 */
function showVictoryScreen() {
    this.displayVictoryUI();
    this.stopWorldAudio();
    hideGameKeys();
    window.gameOver = true;
    showHomeButton();
    showButtons('replayBtn', 'impressumContainer');
}

/**
 * Displays victory UI elements.
 */
function displayVictoryUI() {
    const youWon = document.getElementById('youWon');
    const replayBtn = document.getElementById('replayBtn');
    if (youWon) {
        youWon.style.display = 'block';
    }
    if (replayBtn) {
        replayBtn.style.display = 'block';
        const btn = replayBtn.querySelector('button');
        if (btn) btn.style.display = 'block';
    }
}

/**
 * Toggles fullscreen mode for the canvas wrapper.
 */
function setupFullscreenToggle() {
    const canvasWrapper = document.getElementById('canvasWrapper');
    const fullIcon = document.getElementById('fullScreen');
    const smallIcon = document.getElementById('smallScreen');
    if (!document.fullscreenElement) {
        canvasWrapper.requestFullscreen().then(() => {
            fullIcon.style.display = 'none';
            smallIcon.style.display = 'block';
        }).catch(() => { });
    } else {
        document.exitFullscreen().then(() => {
            fullIcon.style.display = 'block';
            smallIcon.style.display = 'none';
        }).catch(() => { });
    }
}

/**
 * Checks screen orientation and adapts the layout.
 */
function checkScreenOrientation() {
    const popup = document.getElementById('landscape-popup');
    const fullDiv = document.getElementById('full');
    const mobileControls = document.getElementById('mobile-controls');
    const isMobile = detectMobile();
    const isPortrait = isPortraitMode();
    const isSmallDesktop = isSmallScreenDesktop();
    handleOrientationSwitch({ isMobile, isPortrait, isSmallDesktop, popup, fullDiv, mobileControls });
}

/**
 * Detects if the device is mobile.
 * @returns {boolean}
 */
function detectMobile() {
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

/**
 * Checks if the screen is in portrait mode.
 * @returns {boolean}
 */
function isPortraitMode() {
    return window.innerHeight > window.innerWidth;
}

/**
 * Checks if screen width is smaller than 720px on desktop.
 * @returns {boolean}
 */
function isSmallScreenDesktop() {
    return !detectMobile() && window.innerWidth < 720;
}

/**
 * Handles orientation changes based on device type and screen size.
 * @param {Object} params - Orientation and device status.
 */
function handleOrientationSwitch({ isMobile, isPortrait, isSmallDesktop, popup, fullDiv, mobileControls }) {
    if ((isMobile && isPortrait) || isSmallDesktop) {
        handleShowRotatePopup(popup, fullDiv, mobileControls);
    } else if (isMobile && !isPortrait) {
        handleMobileLandscape(popup, fullDiv, mobileControls);
    } else {
        handleDesktopNormal(popup, fullDiv, mobileControls);
    }
}

/**
 * Displays the "rotate device" popup.
 */
function handleShowRotatePopup(popup, fullDiv, mobileControls) {
    popup.style.display = 'flex';
    if (fullDiv) fullDiv.style.display = 'none';
    if (mobileControls) mobileControls.style.display = 'none';
    updateGameKeysVisibility();
    if (world?.drawFrame) cancelAnimationFrame(world.drawFrame);
    exitFullscreen();
}

/**
 * Handles layout when on mobile landscape.
 */
function handleMobileLandscape(popup, fullDiv, mobileControls) {
    popup.style.display = 'none';
    if (fullDiv) fullDiv.style.display = 'none';
    if (mobileControls) mobileControls.style.display = 'block';
    updateGameKeysVisibility();
    requestFullscreenIfNotActive();
    if (!window.gameOver && world && world.draw) {
        world.drawFrame = requestAnimationFrame(() => world.draw());
    }
}

/**
 * Handles layout for normal desktop view.
 */
function handleDesktopNormal(popup, fullDiv, mobileControls) {
    popup.style.display = 'none';
    if (fullDiv) fullDiv.style.display = 'flex';
    if (mobileControls) mobileControls.style.display = 'none';
    updateGameKeysVisibility();
    if (!window.gameOver && world && world.draw) {
        world.drawFrame = requestAnimationFrame(() => world.draw());
    }
}

/**
 * Requests fullscreen mode if not already active.
 */
function requestFullscreenIfNotActive() {
    const wrapper = document.getElementById('canvasWrapper');
    if (!document.fullscreenElement && wrapper?.requestFullscreen) {
        wrapper.requestFullscreen().catch(() => { });
    }
}

/**
 * Exits fullscreen mode.
 */
function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
    }
}

document.addEventListener('fullscreenchange', () => {
    const fullIcon = document.getElementById('fullScreen');
    const smallIcon = document.getElementById('smallScreen');
    const isFullscreen = !!document.fullscreenElement;
    fullIcon.style.display = isFullscreen ? 'none' : 'block';
    smallIcon.style.display = isFullscreen ? 'block' : 'none';
});

/**
 * Sets up event listeners for orientation checking.
 */
function setupOrientationCheck() {
    window.addEventListener('load', checkScreenOrientation);
    window.addEventListener('resize', checkScreenOrientation);
    window.addEventListener('orientationchange', checkScreenOrientation);
}
setupOrientationCheck();

/**
 * Simulates a short button press.
 * @param {string} key - Keyboard key.
 */
function pressButton(key) {
    if (!keyboard) return;
    keyboard[key] = true;
    setTimeout(() => {
        keyboard[key] = false;
    }, 150);
}

/**
 * Handles button press event.
 * @param {string} key - Keyboard key.
 */
function handleButtonPress(key) {
    if (!keyboard) return;
    keyboard[key] = true;
}

/**
 * Handles button release event.
 * @param {string} key - Keyboard key.
 */
function handleButtonRelease(key) {
    if (!keyboard) return;
    keyboard[key] = false;
}

document.addEventListener('mouseup', () => resetKeyboard());
document.addEventListener('touchend', () => resetKeyboard());

/**
 * Resets all keyboard input states.
 */
function resetKeyboard() {
    if (!keyboard) return;
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.SPACE = false;
    keyboard.D = false;
}

/**
 * Updates the visibility of mobile game keys based on play status.
 */
function updateGameKeysVisibility() {
    if (!window.isPlaying) {
        hideGameKeys();
        return;
    }
    const isMobile = /Mobi|Android|iPhone|iPad|Tablet/i.test(navigator.userAgent);
    const isLandscape = window.innerWidth > window.innerHeight;
    if (isMobile && isLandscape) hideGameKeys();
    else showGameKeys();
}

/**
 * Displays the impressum content by setting its display style to 'flex'.
 */
function showImpressum() {
    let impressumContent = document.getElementById('impressumContent');
    impressumContent.style.display = 'flex';
}

/**
 * Hides the impressum content by setting its display style to 'none'.
 */
function hideImpressum() {
    let impressumContent = document.getElementById('impressumContent');
    impressumContent.style.display = 'none';
}