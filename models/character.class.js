let keyboard = {};

function initKeyboardControls() {
    window.addEventListener("keydown", e => {
        if (e.code === 'ArrowRight') keyboard.RIGHT = true;
        if (e.code === 'ArrowLeft') keyboard.LEFT = true;
        if (e.code === 'Space') keyboard.SPACE = true;
        if (e.code === 'KeyD') keyboard.D = true;
    });

    window.addEventListener("keyup", e => {
        if (e.code === 'ArrowRight') keyboard.RIGHT = false;
        if (e.code === 'ArrowLeft') keyboard.LEFT = false;
        if (e.code === 'Space') keyboard.SPACE = false;
        if (e.code === 'KeyD') keyboard.D = false;
    });
}


class Character extends MovableObject {
    idleImages = [
        '../img/2_character_pepe/1_idle/idle/I-1.png',
        '../img/2_character_pepe/1_idle/idle/I-2.png',
        '../img/2_character_pepe/1_idle/idle/I-3.png',
        '../img/2_character_pepe/1_idle/idle/I-4.png',
        '../img/2_character_pepe/1_idle/idle/I-5.png',
        '../img/2_character_pepe/1_idle/idle/I-6.png',
        '../img/2_character_pepe/1_idle/idle/I-7.png',
        '../img/2_character_pepe/1_idle/idle/I-8.png',
        '../img/2_character_pepe/1_idle/idle/I-9.png',
        '../img/2_character_pepe/1_idle/idle/I-10.png'
    ];

    walkImages = [
        '../img/2_character_pepe/2_walk/W-21.png',
        '../img/2_character_pepe/2_walk/W-22.png',
        '../img/2_character_pepe/2_walk/W-23.png',
        '../img/2_character_pepe/2_walk/W-24.png',
        '../img/2_character_pepe/2_walk/W-25.png',
        '../img/2_character_pepe/2_walk/W-26.png'
    ];

    jumpImages = [
        '../img/2_character_pepe/3_jump/J-31.png',
        '../img/2_character_pepe/3_jump/J-32.png',
        '../img/2_character_pepe/3_jump/J-33.png',
        '../img/2_character_pepe/3_jump/J-34.png',
        '../img/2_character_pepe/3_jump/J-35.png',
        '../img/2_character_pepe/3_jump/J-36.png',
        '../img/2_character_pepe/3_jump/J-37.png',
        '../img/2_character_pepe/3_jump/J-38.png',
        '../img/2_character_pepe/3_jump/J-39.png'
    ];

    walkSound = new Audio('../audio/walking.mp3');
    jumpSound = new Audio('../audio/jump.mp3');
    deadSound = new Audio('../audio/pepescream.mp3');

    currentIdleFrame = 0;
    currentWalkFrame = 0;
    currentJumpFrame = 0;
    speed = 5;
    velocityY = 0;
    gravity = 0.5;
    currentAnimation = 'idle';
    facingLeft = false;
    groundY = 140;
    jumpCount = 0;
    maxJumps = 2;

    isHurt = false;
    hurtInterval = null;
    coins = 0;
    bottles = 0;
    canThrow = true;


    constructor() {
        super();
        this.currentAnimation = 'idle';

        this.loadImage(this.idleImages[0]);
        this.loadImages(this.idleImages);
        this.loadImages(this.walkImages);
        this.loadImages(this.jumpImages);

        this.x = 200;
        this.y = -50;
        this.width = 140;
        this.height = 300;
        this.minX = this.x - 100;
        this.groundY = 140;

        this.animate();
        this.checkKeyboard();
        this.visible = true;

        this.fall();

        this.hitbox = {
            offsetX: 35,
            offsetY: 120,
            width: this.width - 80,
            height: this.height - 135
        };

        this.hurtImages = [
            '../img/2_character_pepe/4_hurt/H-41.png',
            '../img/2_character_pepe/4_hurt/H-42.png',
            '../img/2_character_pepe/4_hurt/H-43.png'
        ];

        this.loadImages(this.hurtImages);
        this.keyboardIntervalStarted = false;
    }


    animate() {
        setInterval(() => {
            if (this.currentAnimation === 'dead' || this.isDead) return;

            if (this.isHurt) {
                const hurtPath = this.hurtImages[this.currentIdleFrame % this.hurtImages.length];
                const hurtImg = this.imageCache[hurtPath];

                if (hurtImg instanceof HTMLImageElement && hurtImg.complete) {
                    this.img = hurtImg;
                }

                this.currentIdleFrame++;
                return;
            }

            switch (this.currentAnimation) {
                case 'walk':
                    const walkImg = this.imageCache[this.walkImages[this.currentWalkFrame]];
                    if (walkImg instanceof HTMLImageElement && walkImg.complete) {
                        this.img = walkImg;
                    }
                    this.currentWalkFrame = (this.currentWalkFrame + 1) % this.walkImages.length;
                    break;

                case 'jump':
                    const jumpImg = this.imageCache[this.jumpImages[this.currentJumpFrame]];
                    if (jumpImg instanceof HTMLImageElement && jumpImg.complete) {
                        this.img = jumpImg;
                    }
                    this.currentJumpFrame = (this.currentJumpFrame + 1) % this.jumpImages.length;
                    break;

                default:
                    const idleImg = this.imageCache[this.idleImages[this.currentIdleFrame]];
                    if (idleImg instanceof HTMLImageElement && idleImg.complete) {
                        this.img = idleImg;
                    }
                    this.currentIdleFrame = (this.currentIdleFrame + 1) % this.idleImages.length;
            }
        }, 100);
    }


    // checkKeyboard() {
    //     if (this.keyboardIntervalStarted) return;
    //     this.keyboardIntervalStarted = true;

    //     let previousD = false;

    //     setInterval(() => {
    //         if (this.isDead || window.gameOver) return;

    //         if (this.falling) {
    //             this.applyGravity();
    //             return;
    //         }

    //         if (keyboard.RIGHT && this.x < 3000) {
    //             this.x += this.speed;
    //             this.facingLeft = false;
    //             this.currentAnimation = 'walk';
    //             this.playWalkSound();
    //         } else if (keyboard.LEFT && this.x > this.minX) {
    //             this.x -= this.speed;
    //             this.facingLeft = true;
    //             this.currentAnimation = 'walk';
    //             this.playWalkSound();
    //         } else if (this.isJumping()) {
    //             this.currentAnimation = 'jump';
    //         } else {
    //             this.currentAnimation = 'idle';
    //             this.stopWalkSound();
    //         }

    //         if (keyboard.SPACE) {
    //             this.jump();
    //         }

    //         if (keyboard.D && !previousD && this.canThrow) {
    //             this.throwBottle();
    //         }

    //         previousD = keyboard.D;

    //         if (this.isJumping()) {
    //             this.currentAnimation = 'jump';
    //         }

    //         this.applyGravity();
    //     }, 1000 / 60);
    // }
    checkKeyboard() {
        if (this.keyboardIntervalStarted) return; // Verhindert mehrfaches Starten
        this.keyboardIntervalStarted = true;

        // Speichere die setInterval-Instanz
        this.keyboardInterval = setInterval(() => {
            if (this.isDead || window.gameOver) return;

            // Schwerkraft anwenden, wenn Pepe fällt
            if (this.falling) {
                this.applyGravity();
                return;
            }

            // Bewegung nach rechts
            if (keyboard.RIGHT && this.x < 3000) {
                this.x += this.speed;
                this.facingLeft = false;
                this.currentAnimation = 'walk';
                this.playWalkSound();
            }
            // Bewegung nach links
            else if (keyboard.LEFT && this.x > this.minX) {
                this.x -= this.speed;
                this.facingLeft = true;
                this.currentAnimation = 'walk';
                this.playWalkSound();
            }
            // Springen
            else if (this.isJumping()) {
                this.currentAnimation = 'jump';
            }
            // Idle-Animation
            else {
                this.currentAnimation = 'idle';
                this.stopWalkSound();
            }

            // Springen mit der Leertaste
            if (keyboard.SPACE) {
                this.jump();
            }

            // Flasche werfen mit der Taste "D"
            if (keyboard.D && !this.previousD && this.canThrow) {
                this.throwBottle();
            }

            // Speichert den Zustand der Taste "D"
            this.previousD = keyboard.D;

            // Schwerkraft anwenden, wenn Pepe springt oder fällt
            if (this.isJumping()) {
                this.currentAnimation = 'jump';
            }

            this.applyGravity();
        }, 1000 / 60);
    }


    jump() {
        if (this.jumpCount < this.maxJumps) {
            this.velocityY = -11;
            this.jumpCount++;
            this.currentAnimation = 'jump';
            this.currentJumpFrame = 0;
            this.playJumpSound();
        }
    }


    applyGravity() {
        if (this.velocityY < 0) {
            this.gravity = 0.4;
        } else {
            this.gravity = 0.8;
        }

        this.y += this.velocityY;
        this.velocityY += this.gravity;

        if (!this.falling && this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.jumpCount = 0;
        }
    }


    isJumping() {
        return this.y < this.groundY || this.velocityY < 0;
    }


    draw(ctx) {
        if (!this.visible || !this.img || !(this.img instanceof HTMLImageElement) || !this.img.complete) {
            return;
        }

        if (this.facingLeft) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(this.img, -this.x - this.width, this.y, this.width, this.height);
            ctx.restore();
        } else {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }


    fall() {
        this.velocityY = 2;
        this.gravity = 0.4;
        this.falling = true;
        this.currentAnimation = 'jump';

        const fallInterval = setInterval(() => {
            this.y += this.velocityY;
            this.velocityY += this.gravity;

            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.velocityY = 0;
                this.falling = false;
                clearInterval(fallInterval);
                this.currentJumpFrame = 0;
                console.log('Pepe ist sicher gelandet');
            }
        }, 1000 / 60);
    }


    playStartSound() {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        this.startSound.volume = 0.5;
        this.startSound.play().catch(e =>
            console.warn('Startsound blockiert:', e)
        );
    }


    playWalkSound() {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        if (this.walkSound.paused) {
            this.walkSound.volume = 0.3;
            this.walkSound.loop = true;
            this.walkSound.play();
        }
    }


    stopWalkSound() {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        this.walkSound.pause();
        this.walkSound.currentTime = 0;
    }


    playJumpSound() {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        this.jumpSound.volume = 0.4;
        this.jumpSound.play();
    }


    playHurtLoop() {
        if (this.hurtInterval) return;

        this.isHurt = true;
        let i = 0;

        this.hurtInterval = setInterval(() => {
            if (!this.isHurt) {
                clearInterval(this.hurtInterval);
                this.hurtInterval = null;
                return;
            }

            const img = this.imageCache[this.hurtImages[i]];
            if (img instanceof HTMLImageElement && img.complete) {
                this.img = img;
            }

            i = (i + 1) % this.hurtImages.length;
        }, 300);

        setTimeout(() => {
            this.isHurt = false;

            const idleImg = this.imageCache[this.idleImages[0]];
            if (idleImg instanceof HTMLImageElement && idleImg.complete) {
                this.img = idleImg;
                this.currentIdleFrame = 0;
                this.currentAnimation = 'idle';
            }
        }, 1500);
    }


    dead() {
        if (this.deadInterval || this.isDead) return;

        this.isDead = true;
        this.currentAnimation = 'dead';
        this.currentDeadFrame = 0;

        this.deadImages = [
            '../img/2_character_pepe/5_dead/D-51.png',
            '../img/2_character_pepe/5_dead/D-52.png',
            '../img/2_character_pepe/5_dead/D-53.png',
            '../img/2_character_pepe/5_dead/D-54.png',
            '../img/2_character_pepe/5_dead/D-55.png',
            '../img/2_character_pepe/5_dead/D-56.png',
            '../img/2_character_pepe/5_dead/D-57.png'
        ];
        this.loadImages(this.deadImages);

        if (typeof isMuted === 'undefined' || !isMuted) {
            this.deadSound.volume = 0.5;
            this.deadSound.play().catch(e =>
                console.warn('Todes-Sound konnte nicht abgespielt werden:', e)
            );
        }

        this.deadInterval = setInterval(() => {
            const path = this.deadImages[this.currentDeadFrame];
            const img = this.imageCache[path];

            if (img instanceof HTMLImageElement && img.complete) {
                this.img = img;
            }

            this.currentDeadFrame++;

            if (this.currentDeadFrame >= this.deadImages.length) {
                clearInterval(this.deadInterval);
                this.deadInterval = null;
                this.startDeathFall();
            }
        }, 200);
    }


    startDeathFall() {
        if (this.fallInterval) return;

        this.gravity = 1.2;
        this.velocityY = 5;

        this.fallInterval = setInterval(() => {
            this.y += this.velocityY;
            this.velocityY += this.gravity;

            if (this.y > 600) {
                clearInterval(this.fallInterval);
                this.fallInterval = null;
                this.visible = false;

                if (typeof showGameOverScreen === 'function') {
                    showGameOverScreen();
                }
            }
        }, 1000 / 60);
    }


    throwBottle() {
        if (this.bottles > 0 && this.canThrow) {
            console.log('Flasche geworfen! Verbleibende Flaschen:', this.bottles);
            this.canThrow = false;

            const direction = this.facingLeft ? -1 : 1;
            const bottle = new ThrowableObject(this.x + 50, this.y + 80, direction);
            world.throwables.push(bottle);

            this.bottles = Math.max(0, this.bottles - 20);
            world.statusBarBottle.setPercentage(this.bottles);

            setTimeout(() => {
                this.canThrow = true;
                console.log('Wurf wieder möglich');
            }, 500);
        } else {
            console.log('Wurf nicht möglich:', { canThrow: this.canThrow, bottles: this.bottles });
        }
    }


}
