function hideButtons(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        const btn = el.querySelector('button');
        if (btn) {
            btn.style.display = 'none';
        } else {
            el.style.display = 'none';
        }
    });
}


function showButtons(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        const btn = el.querySelector('button');
        if (btn) {
            btn.style.display = 'block';
        } else {
            el.style.display = 'block';
        }
    });
}


function hideStartScreen() {
    const startFrame = document.getElementById('startFrame');
    if (startFrame) {
        startFrame.classList.add('fade-out');
        setTimeout(() => {
            startFrame.style.display = 'none';
        }, 200);
    }
}


function showGameOverScreen() {
    const gameOverImage = document.getElementById('gameOverImage');
    const replayBtn = document.getElementById('replayBtn');

    if (gameOverImage) gameOverImage.style.display = 'block';
    if (replayBtn) {
        replayBtn.style.display = 'block';
        const btn = replayBtn.querySelector('button');
        if (btn) btn.style.display = 'block';
    }

    if (world?.drawFrame) cancelAnimationFrame(world.drawFrame);
    if (world?.character) {
        world.character.walkSound?.pause();
        world.character.jumpSound?.pause();
    }
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    hideGameKeys();

    window.gameOver = true;
    showHomeButton();
}


function clearCanvas(canvasId = 'canvas') {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}


function hideGameOverScreen() {
    const gameOverImage = document.getElementById('gameOverImage');
    if (gameOverImage) {
        gameOverImage.style.display = 'none';
    }
}


function hideVictoryScreen() {
    const youWon = document.getElementById('youWon');
    if (youWon) {
        youWon.style.display = 'none';
    }
}


function showGameKeys() {
    const keys = document.getElementById('gameKeys');
    if (keys) keys.style.display = 'block';
}


function hideGameKeys() {
    const keys = document.getElementById('gameKeys');
    if (keys) keys.style.display = 'none';
}


function showVictoryScreen() {
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
    if (world?.drawFrame) cancelAnimationFrame(world.drawFrame);
    if (world?.character) {
        world.character.walkSound?.pause();
        world.character.jumpSound?.pause();
    }
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }

    hideGameKeys();
    window.gameOver = true;
    showHomeButton();
}


function setupFullscreenToggle() {
    const canvasWrapper = document.getElementById('canvasWrapper');
    const fullIcon = document.getElementById('fullScreen');
    const smallIcon = document.getElementById('smallScreen');

    if (!document.fullscreenElement) {
        canvasWrapper.requestFullscreen().then(() => {
            fullIcon.style.display = 'none';
            smallIcon.style.display = 'block';
        }).catch(err => {
            console.warn('Fullscreen nicht möglich:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            fullIcon.style.display = 'block';
            smallIcon.style.display = 'none';
        }).catch(err => {
            console.warn('Fullscreen verlassen nicht möglich:', err);
        });
    }
}


document.addEventListener('fullscreenchange', () => {
    const fullIcon = document.getElementById('fullScreen');
    const smallIcon = document.getElementById('smallScreen');

    const isFullscreen = !!document.fullscreenElement;

    if (isFullscreen) {
        fullIcon.style.display = 'none';
        smallIcon.style.display = 'block';
    } else {
        fullIcon.style.display = 'block';
        smallIcon.style.display = 'none';
    }
});


function checkScreenOrientation() {
    const popup = document.getElementById('landscape-popup');
    const fullDiv = document.getElementById('full');
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const isPortrait = window.innerHeight > window.innerWidth;
    const isSmallScreen = window.innerWidth < 720;

    // 📱 Mobile Portrait
    if (isMobile && isPortrait) {
        popup.style.display = 'flex';
        if (fullDiv) fullDiv.style.display = 'none';
        if (world?.drawFrame) cancelAnimationFrame(world.drawFrame);
        exitFullscreen();
        return;
    }

    // 📱 Mobile Landscape
    if (isMobile && !isPortrait) {
        popup.style.display = 'none';
        if (fullDiv) fullDiv.style.display = 'none';
        requestFullscreenIfNotActive();
        if (!window.gameOver && world && world.draw) {
            world.drawFrame = requestAnimationFrame(() => world.draw());
        }
        return;
    }

    // 💻 Nicht-Mobile (Desktop oder große Tablets)
    popup.style.display = 'none';
    if (fullDiv) fullDiv.style.display = 'flex';
    if (!window.gameOver && world && world.draw) {
        world.drawFrame = requestAnimationFrame(() => world.draw());
    }

    if (window.innerWidth < 720) {
        popup.style.display = 'flex';
        if (fullDiv) fullDiv.style.display = 'none';
        if (world?.drawFrame) cancelAnimationFrame(world.drawFrame);
        exitFullscreen();
        return;
    }
}


function requestFullscreenIfNotActive() {
    const wrapper = document.getElementById('canvasWrapper');
    if (!document.fullscreenElement && wrapper?.requestFullscreen) {
        wrapper.requestFullscreen().catch(err =>
            console.warn('Fullscreen konnte nicht aktiviert werden:', err)
        );
    }
}


function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err =>
            console.warn('Fullscreen konnte nicht verlassen werden:', err)
        );
    }
}


document.addEventListener('fullscreenchange', () => {
    const fullIcon = document.getElementById('fullScreen');
    const smallIcon = document.getElementById('smallScreen');
    const isFullscreen = !!document.fullscreenElement;

    fullIcon.style.display = isFullscreen ? 'none' : 'block';
    smallIcon.style.display = isFullscreen ? 'block' : 'none';
});



function setupOrientationCheck() {
    window.addEventListener('load', checkScreenOrientation);
    window.addEventListener('resize', checkScreenOrientation);
    window.addEventListener('orientationchange', checkScreenOrientation);
}


setupOrientationCheck();


function pressButton(key) {
    if (!keyboard) return;

    keyboard[key] = true;

    // Taste automatisch wieder loslassen nach kurzer Zeit
    setTimeout(() => {
        keyboard[key] = false;
    }, 150); // 150ms simuliert gedrückte Taste
}
