let keyboard = {};

/**
 * Initializes keyboard event listeners for player controls.
 * 
 * Sets flags in the global `keyboard` object based on key presses and releases.
 * Handles right, left, jump (space), and throw (D) inputs.
 */
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

    sleepImages = [
        '../img/2_character_pepe/1_idle/long_idle/I-11.png',
        '../img/2_character_pepe/1_idle/long_idle/I-12.png',
        '../img/2_character_pepe/1_idle/long_idle/I-13.png',
        '../img/2_character_pepe/1_idle/long_idle/I-14.png',
        '../img/2_character_pepe/1_idle/long_idle/I-15.png',
        '../img/2_character_pepe/1_idle/long_idle/I-16.png',
        '../img/2_character_pepe/1_idle/long_idle/I-17.png',
        '../img/2_character_pepe/1_idle/long_idle/I-18.png',
        '../img/2_character_pepe/1_idle/long_idle/I-19.png',
        '../img/2_character_pepe/1_idle/long_idle/I-20.png'
    ];

    hurtImages = [
        '../img/2_character_pepe/4_hurt/H-41.png',
        '../img/2_character_pepe/4_hurt/H-42.png',
        '../img/2_character_pepe/4_hurt/H-43.png'
    ];

    deadImages = [
        '../img/2_character_pepe/5_dead/D-51.png',
        '../img/2_character_pepe/5_dead/D-52.png',
        '../img/2_character_pepe/5_dead/D-53.png',
        '../img/2_character_pepe/5_dead/D-54.png',
        '../img/2_character_pepe/5_dead/D-55.png',
        '../img/2_character_pepe/5_dead/D-56.png',
        '../img/2_character_pepe/5_dead/D-57.png'
    ];

    snoreSound = new Audio('../audio/snore.mp3');
    inactivityTimer = null;
    isSleeping = false;

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
        this.loadImages(this.sleepImages);
        this.loadImages(this.hurtImages);
        this.loadImages(this.deadImages);

        this.x = 200;
        this.y = -50;
        this.width = 140;
        this.height = 300;
        this.minX = this.x - 100;
        this.groundY = 140;

        this.animate();
        this.checkKeyboard();
        this.setupInactivityTimer();
        this.visible = true;
        this.fall();

        this.hitbox = {
            offsetX: 35,
            offsetY: 120,
            width: this.width - 80,
            height: this.height - 135
        };
        this.keyboardIntervalStarted = false;
    }

    /**
    * Runs the character's animation based on its current state every 100ms.
    */
    animate() {
        setInterval(() => {
            if (this.currentAnimation === 'dead' || this.isDead) return;
            if (this.isSleeping) return;
            if (this.isHurt) {
                this.playHurtAnimation();
                return;
            }
            this.playMainAnimation();
        }, 100);
    }

    /**
    * Displays the next frame of the hurt animation.
    */
    playHurtAnimation() {
        const path = this.hurtImages[this.currentIdleFrame % this.hurtImages.length];
        const img = this.imageCache[path];
        if (img instanceof HTMLImageElement && img.complete) {
            this.img = img;
        }
        this.currentIdleFrame++;
    }

    /**
    * Plays the current main animation based on the character's state.
    */
    playMainAnimation() {
        switch (this.currentAnimation) {
            case 'walk':
                this.playWalkAnimation();
                break;
            case 'jump':
                this.playJumpAnimation();
                break;
            default:
                this.playIdleAnimation();
        }
    }

    /**
    * Displays the next frame of the walk animation.
    */
    playWalkAnimation() {
        const path = this.walkImages[this.currentWalkFrame];
        const img = this.imageCache[path];
        if (img instanceof HTMLImageElement && img.complete) {
            this.img = img;
        }
        this.currentWalkFrame = (this.currentWalkFrame + 1) % this.walkImages.length;
    }

    /**
    * Displays the next frame of the jump animation.
    */
    playJumpAnimation() {
        const path = this.jumpImages[this.currentJumpFrame];
        const img = this.imageCache[path];
        if (img instanceof HTMLImageElement && img.complete) this.img = img;
        this.currentJumpFrame = (this.currentJumpFrame + 1) % this.jumpImages.length;
    }

    /**
    * Displays the next frame of the idle animation.
    */
    playIdleAnimation() {
        const path = this.idleImages[this.currentIdleFrame];
        const img = this.imageCache[path];
        if (img instanceof HTMLImageElement && img.complete) this.img = img;
        this.currentIdleFrame = (this.currentIdleFrame + 1) % this.idleImages.length;
    }

    /**
    * Handles character movement based on keyboard input and state.
    */
    handleMovement() {
        if (this.isSleeping) return;
        if (keyboard.RIGHT && this.x < 3000) {
            this.moveRight();
        } else if (keyboard.LEFT && this.x > this.minX) {
            this.moveLeft();
        } else if (this.isJumping()) {
            this.currentAnimation = 'jump';
        } else {
            this.idle();
        }
    }

    /**
    * Moves the character to the right and plays walk sound.
    */
    moveRight() {
        this.x += this.speed;
        this.facingLeft = false;
        this.currentAnimation = 'walk';
        this.playWalkSound();
    }

    /**
    * Moves the character to the left and plays walk sound.
    */
    moveLeft() {
        this.x -= this.speed;
        this.facingLeft = true;
        this.currentAnimation = 'walk';
        this.playWalkSound();
    }

    /**
    * Sets the character to idle state and stops walk sound.
    */
    idle() {
        this.currentAnimation = 'idle';
        this.stopWalkSound();
    }

    /**
    * Handles jumping and throwing bottles based on input.
    */
    handleJumpAndThrow() {
        if (keyboard.SPACE) this.jump();
        if (keyboard.D && !this.previousD && this.canThrow) this.throwBottle();
        this.previousD = keyboard.D;
        if (this.isJumping()) this.currentAnimation = 'jump';
    }

    /**
    * Makes the character jump if allowed.
    */
    jump() {
        if (this.jumpCount < this.maxJumps) {
            this.velocityY = -11;
            this.jumpCount++;
            this.currentAnimation = 'jump';
            this.currentJumpFrame = 0;
            this.playJumpSound();
        }
    }

    /**
    * Applies gravity to the character's vertical movement.
    */
    applyGravity() {
        if (this.velocityY < 0) this.gravity = 0.4;
        else this.gravity = 0.8;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        if (!this.falling && this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.jumpCount = 0;
        }
    }

    /**
    * Checks if the character is currently jumping or falling.
    */
    isJumping() {
        return this.y < this.groundY || this.velocityY < 0;
    }

    /**
    * Draws the character on the canvas.
    */
    draw(ctx) {
        if (!this.visible || !this.img || !(this.img instanceof HTMLImageElement) || !this.img.complete) return;
        if (this.facingLeft) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(this.img, -this.x - this.width, this.y, this.width, this.height);
            ctx.restore();
        } else {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    /**
    * Handles the initial fall of the character at game start.
    */
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
            }
        }, 1000 / 60);
    }

    /**
    * Plays the start sound if not muted.
    */
    playStartSound() {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        this.startSound.volume = 0.5;
        this.startSound.play().catch(() => { });
    }

    /**
    * Plays the walking sound if not muted and not already playing.
    */
    playWalkSound() {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        if (this.walkSound.paused) {
            this.walkSound.volume = 0.3;
            this.walkSound.loop = true;
            this.walkSound.play().catch(() => { });
        }
    }

    /**
    * Stops the walking sound immediately.
    */
    stopWalkSound() {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        this.walkSound.pause();
        this.walkSound.currentTime = 0;
    }

    /**
    * Plays the jump sound if not muted.
    */
    playJumpSound() {
        if (typeof isMuted !== 'undefined' && isMuted) return;
        this.jumpSound.volume = 0.4;
        this.jumpSound.play().catch(() => { });
    }

    /**
    * Starts the hurt animation loop.
    */
    playHurtLoop() {
        if (this.hurtInterval) return;
        this.isHurt = true;
        let i = 0;
        this.startHurtAnimation(i);
        this.endHurtAnimation();
    }

    /**
    * Begins switching hurt frames repeatedly.
    */
    startHurtAnimation(i) {
        this.hurtInterval = setInterval(() => {
            if (!this.isHurt) {
                this.clearHurtInterval();
                return;
            }
            this.showNextHurtFrame(i);
            i = (i + 1) % this.hurtImages.length;
        }, 300);
    }

    /**
    * Shows the next hurt frame.
    */
    showNextHurtFrame(i) {
        const img = this.imageCache[this.hurtImages[i]];
        if (img instanceof HTMLImageElement && img.complete) {
            this.img = img;
        }
    }

    /**
    * Ends the hurt animation after a delay.
    */
    endHurtAnimation() {
        setTimeout(() => {
            this.isHurt = false;
            this.resetToIdle();
        }, 1500);
    }

    /**
    * Resets character back to idle state.
    */
    resetToIdle() {
        const idleImg = this.imageCache[this.idleImages[0]];
        if (idleImg instanceof HTMLImageElement && idleImg.complete) {
            this.img = idleImg;
            this.currentIdleFrame = 0;
            this.currentAnimation = 'idle';
        }
    }

    /**
    * Clears the hurt animation interval.
    */
    clearHurtInterval() {
        clearInterval(this.hurtInterval);
        this.hurtInterval = null;
    }

    /**
    * Plays the death sound if not muted.
    */
    playDeadSound() {
        if (typeof isMuted === 'undefined' || !isMuted) {
            this.deadSound.volume = 0.5;
            this.deadSound.play().catch(() => { });
        }
    }

    /**
    * Starts switching death frames.
    */
    startDeadAnimation() {
        this.deadInterval = setInterval(() => {
            this.updateDeadFrame();
        }, 200);
    }

    /**
    * Updates the current death frame.
    */
    updateDeadFrame() {
        const path = this.deadImages[this.currentDeadFrame];
        const img = this.imageCache[path];
        if (img instanceof HTMLImageElement && img.complete) this.img = img;
        this.currentDeadFrame++;
        if (this.currentDeadFrame >= this.deadImages.length) {
            clearInterval(this.deadInterval);
            this.deadInterval = null;
            this.startDeathFall();
        }
    }

    /**
    * Triggers the death animation and sound.
    */
    dead() {
        if (this.deadInterval || this.isDead) return;
        this.isDead = true;
        this.currentAnimation = 'dead';
        this.currentDeadFrame = 0;
        this.loadImages(this.deadImages);
        this.playDeadSound();
        this.startDeadAnimation();
        this.stopSleepAnimation();
    }

    /**
    * Makes the character fall off-screen after death.
    */
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
                if (typeof showGameOverScreen === 'function') showGameOverScreen();
            }
        }, 1000 / 60);
    }

    /**
    * Throws a bottle if available.
    */
    throwBottle() {
        if (this.bottles > 0 && this.canThrow) {
            this.canThrow = false;
            const direction = this.facingLeft ? -1 : 1;
            const bottle = new ThrowableObject(this.x + 50, this.y + 80, direction);
            world.throwables.push(bottle);
            this.bottles = Math.max(0, this.bottles - 20);
            world.statusBarBottle.setPercentage(this.bottles);
            setTimeout(() => {
                this.canThrow = true;
            }, 500);
        }
    }

    /**
    * Sets the inactivity timer to start the sleep animation.
    */
    setupInactivityTimer() {
        const resetTimer = () => {
            if (this.isSleeping) this.stopSleepAnimation();
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = setTimeout(() => {
                this.startSleepAnimation();
            }, 8000);
        };
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('mousedown', resetTimer);
        window.addEventListener('touchstart', resetTimer);
        resetTimer();
    }

    /**
    * Start the Sleep-Animation.
    */
    startSleepAnimation() {
        if (this.isSleeping || this.isDead || window.gameOver) return;
        this.isSleeping = true;
        this.currentAnimation = 'sleep';
        this.currentIdleFrame = 0;
        this.snoreSound.loop = true;
        this.snoreSound.volume = 0.5;
        if (!isMuted) this.snoreSound.play().catch(() => { });
        this.sleepInterval = setInterval(() => {
            const path = this.sleepImages[this.currentIdleFrame % this.sleepImages.length];
            const img = this.imageCache[path];
            if (img instanceof HTMLImageElement && img.complete) this.img = img;
            this.currentIdleFrame++;
        }, 200);
    }

    /**
    * Stops the sleep animation and sets Pepe back to idle state.
    */
    stopSleepAnimation() {
        if (!this.isSleeping) return;
        this.isSleeping = false;
        this.currentAnimation = 'idle';
        this.currentIdleFrame = 0;
        clearInterval(this.sleepInterval);
        this.snoreSound.pause();
        this.snoreSound.currentTime = 0;
        const idleImg = this.imageCache[this.idleImages[0]];
        if (idleImg instanceof HTMLImageElement && idleImg.complete) {
            this.img = idleImg;
        }
    }

    /**
    * Checks for collisions with Chicken or SmallChicken.
    */
    checkCollisionsWithEnemies(enemies) {
        enemies.forEach(enemy => {
            if (isColliding(this, enemy)) {
                this.stopSleepAnimation();
            }
        });
    }

    /**
    * Starts checking keyboard input and updates the character's movement and gravity.
    */
    checkKeyboard() {
        if (this.keyboardIntervalStarted) return;
        this.keyboardIntervalStarted = true;
        this.keyboardInterval = setInterval(() => {
            if (this.isDead || window.gameOver) return;
            if (this.falling) {
                this.applyGravity();
                return;
            }
            if (keyboard.RIGHT || keyboard.LEFT || keyboard.SPACE || keyboard.D) this.stopSleepAnimation();
            this.handleMovement();
            this.handleJumpAndThrow();
            this.applyGravity();
        }, 1000 / 60);
    }
}