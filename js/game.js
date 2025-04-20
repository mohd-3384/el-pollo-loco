let canvas;
let world;
const backgroundMusic = new Audio('./audio/mexican-huapango-banda.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;
let isMuted = false;

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
        if (!world?.character || !world?.enemies) return;

        let collisionDetected = false;

        [...world.enemies, world.endboss].forEach(enemy => {
            if (enemy && isColliding(world.character, enemy)) {
                collisionDetected = true;

                if (!world.character.isHurt) {
                    world.character.isHurt = true;
                    world.character.playHurtLoop?.();
                }

                const isRelevantEnemy =
                    enemy.constructor.name === 'Chicken' ||
                    enemy.constructor.name === 'SmallChicken';

                if (isRelevantEnemy && world.character.energy > 0 && !lastHitBy.has(enemy)) {
                    world.character.energy = Math.max(0, world.character.energy - 15);
                    world.statusBarHealth.setPercentage(world.character.energy);
                    lastHitBy.set(enemy, true);
                    console.log('Energy:', world.character.energy);

                    if (world.character.energy === 0) {
                        console.log('💀 Pepe dead');
                        world.character.dead();
                    }
                }
            }
        });

        if (!collisionDetected && world.character.isHurt) {
            world.character.isHurt = false;
            [...world.enemies, world.endboss].forEach(enemy => {
                if (lastHitBy.has(enemy)) {
                    lastHitBy.delete(enemy);
                }
            });
        }
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

// function drawHitbox(obj, ctx) {
//     if (!obj.hitbox) return;
//     ctx.save();
//     ctx.strokeStyle = 'red';
//     ctx.lineWidth = 1;
//     ctx.strokeRect(
//         obj.x + obj.hitbox.offsetX,
//         obj.y + obj.hitbox.offsetY,
//         obj.hitbox.width,
//         obj.hitbox.height
//     );
//     ctx.restore();
// }


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

}

