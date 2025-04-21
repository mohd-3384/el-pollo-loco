let canvas;
let world;
const backgroundMusic = new Audio('./audio/mexican-huapango-banda.mp3');
const coinSound = new Audio('./audio/coin-collected.mp3');
const bottleSound = new Audio('./audio/collect-bottle.mp3');
const boingSound = new Audio('./audio/boing.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;
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
        if (sound === backgroundMusic && !isMuted) {
            sound.play().catch(e => console.warn('Musik konnte nicht erneut gestartet werden:', e));
        }
    });

    updateMuteIcon();
}


function playSound(sound, volume = 0.5) {
    if (isMuted || !sound) return;
    sound.volume = volume;
    sound.currentTime = 0;
    sound.play().catch(e => console.warn('Sound konnte nicht abgespielt werden:', e));
}


function updateMuteIcon() {
    const icon = document.getElementById('muteIcon');
    if (!icon) return;
    icon.src = isMuted ? 'img/icons/sound-off.png' : 'img/icons/sound-on.png';
}


function startMusic() {
    if (!backgroundMusic.played.length && !isMuted) {
        backgroundMusic.volume = 0.3;
        backgroundMusic.play().catch(e =>
            console.warn('Musikstart blockiert:', e)
        );
    }
}


function initGame() {
    canvas = document.getElementById('canvas');
    world = new World(canvas);
    ctx = canvas.getContext('2d');
    updateMuteIcon();
    startCollisionDetection();
}


function startCollisionDetection() {
    const lastHitBy = new WeakMap();

    setInterval(() => {
        if (!world?.character || !world?.enemies || !world?.endboss) return;

        let collisionDetected = false;

        const allEnemies = [...world.enemies, world.endboss];
        const pepe = world.character;

        allEnemies.forEach(enemy => {
            if (!enemy || enemy.isDead || enemy.dead) return;

            if (isColliding(pepe, enemy)) {
                const isChicken = enemy.constructor.name === 'Chicken';
                const isSmallChicken = enemy.constructor.name === 'SmallChicken';
                const isEndboss = enemy.constructor.name === 'Endboss';

                const characterMid = pepe.y + pepe.height / 2;
                const enemyTop = enemy.y + (enemy.hitbox?.offsetY || 0);
                const characterIsAbove = characterMid < enemyTop && pepe.velocityY > 0;

                if ((isChicken || isSmallChicken) && characterIsAbove) {
                    playSound(boingSound);
                    enemy.die?.();
                    pepe.velocityY = -5;
                    return;
                }

                if (isEndboss) {
                    pepe.energy = 0;
                    world.statusBarHealth.setPercentage(0);
                    pepe.dead();
                    return;
                }

                if ((isChicken || isSmallChicken) && !pepe.isHurt && pepe.energy > 0 && !lastHitBy.has(enemy)) {
                    pepe.isHurt = true;
                    pepe.playHurtLoop?.();
                    pepe.energy = Math.max(0, pepe.energy - 15);
                    world.statusBarHealth.setPercentage(pepe.energy);
                    lastHitBy.set(enemy, true);
                    if (pepe.energy === 0) pepe.dead();
                }

                collisionDetected = true;
            }
        });

        if (!collisionDetected && pepe.isHurt) {
            pepe.isHurt = false;
            allEnemies.forEach(e => lastHitBy.delete(e));
        }

        if (!world.endboss.activated && world.endboss.x - pepe.x < 700) {
            world.endboss.activate();
        }

        world.throwables = world.throwables.filter(bottle => {
            if (isColliding(bottle, world.endboss)) {
                world.endboss.hitByBottle();
                return false;
            }
            return true;
        });

        world.coins = world.coins.filter(coin => {
            if (isColliding(pepe, coin)) {
                pepe.coins = Math.min(100, pepe.coins + 20);
                world.statusBarCoin.setPercentage(pepe.coins);
                playSound(coinSound);
                return false;
            }
            return true;
        });

        world.bottles = world.bottles.filter(bottle => {
            if (isColliding(pepe, bottle)) {
                pepe.bottles = Math.min(100, pepe.bottles + 20);
                world.statusBarBottle.setPercentage(pepe.bottles);
                playSound(bottleSound);
                return false;
            }
            return true;
        });

    }, 1000 / 30);
}


function isColliding(a, b) {
    const boxA = {
        x: a.x + (a.hitbox?.offsetX || 0),
        y: a.y + (a.hitbox?.offsetY || 0),
        width: a.hitbox?.width || a.width,
        height: a.hitbox?.height || a.height
    };

    const boxB = {
        x: b.x + (b.hitbox?.offsetX || 0),
        y: b.y + (b.hitbox?.offsetY || 0),
        width: b.hitbox?.width || b.width,
        height: b.hitbox?.height || b.height
    };

    return boxA.x < boxB.x + boxB.width &&
        boxA.x + boxA.width > boxB.x &&
        boxA.y < boxB.y + boxB.height &&
        boxA.y + boxA.height > boxB.y;
}


async function startGame() {
    hideButtons('startBtn', 'replayBtn');
    hideStartScreen();
    clearCanvas();
    showGameKeys();

    if (window.world?.drawFrame) cancelAnimationFrame(window.world.drawFrame);
    world = null;
    window.gameOver = false;

    initKeyboardControls();
    await preloadImages(backgroundImagePaths);
    initGame();
    startMusic();
    hideGameOverScreen();
    hideVictoryScreen();
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