class Endboss extends MovableObject {
    alertImages = [
        '../img/4_enemie_boss_chicken/2_alert/G5.png',
        '../img/4_enemie_boss_chicken/2_alert/G6.png',
        '../img/4_enemie_boss_chicken/2_alert/G7.png',
        '../img/4_enemie_boss_chicken/2_alert/G8.png',
        '../img/4_enemie_boss_chicken/2_alert/G9.png',
        '../img/4_enemie_boss_chicken/2_alert/G10.png',
        '../img/4_enemie_boss_chicken/2_alert/G11.png',
        '../img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    walkImages = [
        '../img/4_enemie_boss_chicken/1_walk/G1.png',
        '../img/4_enemie_boss_chicken/1_walk/G2.png',
        '../img/4_enemie_boss_chicken/1_walk/G3.png',
        '../img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    deadImages = [
        '../img/4_enemie_boss_chicken/5_dead/G24.png',
        '../img/4_enemie_boss_chicken/5_dead/G25.png',
        '../img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    currentFrame = 0;
    hits = 0;
    isDead = false;
    activated = false;


    constructor(x = 2800) {
        super();
        this.loadImage(this.alertImages[0]);
        this.loadImages(this.alertImages);
        this.loadImages(this.walkImages);
        this.loadImages(this.deadImages);

        this.x = x;
        this.y = 50;
        this.width = 360;
        this.height = 400;

        this.animateIdle();

        this.hitbox = {
            offsetX: 66,
            offsetY: 80,
            width: this.width - 120,
            height: this.height - 100
        };
    }


    animateIdle() {
        this.idleInterval = setInterval(() => {
            if (this.isDead) return;
            const path = this.alertImages[this.currentFrame];
            const img = this.imageCache[path];
            if (img instanceof HTMLImageElement && img.complete) {
                this.img = img;
            }
            this.currentFrame = (this.currentFrame + 1) % this.alertImages.length;
        }, 200);
    }


    activate() {
        if (this.activated || this.isDead || window.gameOver) return;
        this.activated = true;
        clearInterval(this.idleInterval);
        setTimeout(() => {
            if (!this.isDead && !window.gameOver && world?.character) {
                this.startWalking();
            }
        }, 3000);
    }


    startWalking() {
        this.walkInterval = setInterval(() => {
            if (this.isDead || window.gameOver || !world?.character) return;
            const pepe = world.character;
            const path = this.walkImages[this.currentFrame % this.walkImages.length];
            const img = this.imageCache[path];
            if (img instanceof HTMLImageElement && img.complete) {
                this.img = img;
            }
            this.currentFrame++;
            if (this.x > pepe.x) {
                this.x -= 2;
            } else if (this.x < pepe.x) {
                this.x += 2;
            }
        }, 100);
    }


    hitByBottle() {
        if (this.isDead) return;
        this.hits++;
        console.log('Endboss getroffen! Trefferanzahl:', this.hits);
        if (this.hits >= 3) {
            this.die();
        }
    }


    die() {
        this.isDead = true;
        clearInterval(this.walkInterval);
        this.currentFrame = 0;
        this.deathInterval = setInterval(() => {
            const path = this.deadImages[this.currentFrame];
            const img = this.imageCache[path];
            if (img instanceof HTMLImageElement && img.complete) {
                this.img = img;
            }
            this.currentFrame++;

            if (this.currentFrame >= this.deadImages.length) {
                clearInterval(this.deathInterval);
                this.fallDown();
            }
        }, 250);
    }


    fallDown() {
        window.gameOver = true;
        const fall = setInterval(() => {
            this.y += 5;
            if (this.y > 500) {
                clearInterval(fall);
                showVictoryScreen?.();
            }
        }, 1000 / 60);
    }


    draw(ctx) {
        if (!this.img || !(this.img instanceof HTMLImageElement) || !this.img.complete) {
            return;
        }
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}
