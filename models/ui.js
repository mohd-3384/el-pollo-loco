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
    hideGameKeys();

    window.gameOver = true;
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

    // Animation stoppen & Spiel pausieren
    if (world?.drawFrame) cancelAnimationFrame(world.drawFrame);
    if (world?.character) {
        world.character.walkSound?.pause();
        world.character.jumpSound?.pause();
    }

    hideGameKeys();
    window.gameOver = true;
}