class MovableObject extends DrawableObject {
    x = 120;
    y = 400;
    img;
    height = 100;
    width = 100;
    energy = 100;
    velocityY = 0;
    gravity = 0.5;
    falling = false;
    facingLeft = false;
    visible = true;

    /**
    * Loads a single image and stores it in the cache.
    * @param {string} path - Image path to load.
    */
    loadImage(path) {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            this.img = img;
        };
        this.imageCache = this.imageCache || {};
        this.imageCache[path] = img;
    }

    /**
    * Loads multiple images and stores them in the cache.
    * @param {string[]} imageArray - Array of image paths.
    */
    loadImages(imageArray) {
        this.imageCache = this.imageCache || {};
        imageArray.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /**
    * Continuously moves the object to the left and respawns it.
    * @param {number} [spawnX=800] - X position to respawn.
    * @param {Function} [yRandomizer=null] - Optional function to randomize Y position.
    */
    moveLeftLoop(spawnX = 800, yRandomizer = null) {
        setInterval(() => {
            this.x -= this.speed;
            if (this.x + this.width < 0) {
                this.x = spawnX + Math.random() * 200;
                if (typeof yRandomizer === 'function') {
                    this.y = yRandomizer();
                }
            }
        }, 1000 / 60);
    }

    /**
    * Draws the object on the canvas.
    * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
    */
    draw(ctx) {
        if (!this.img || !(this.img instanceof HTMLImageElement) || !this.img.complete) return;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
    * Kills the object and removes it after a short delay.
    */
    die() {
        if (this.dead) return;
        this.dead = true;
        const img = this.imageCache[this.deadImagePath];
        this.img = img;
        if (this.walkInterval) {
            clearInterval(this.walkInterval);
            this.walkInterval = null;
        }
        setTimeout(() => {
            const idx = world.enemies.indexOf(this);
            if (idx > -1) world.enemies.splice(idx, 1);
        }, 400);
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
}