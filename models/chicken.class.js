class Chicken extends MovableObject {
    walkImages = [
        '../img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        '../img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        '../img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];
    currentWalkFrame = 0;


    constructor(x = 800) {
        super();
        this.loadImage(this.walkImages[0]);
        this.loadImages(this.walkImages);

        this.x = x;
        this.y = 360;
        this.width = 80;
        this.height = 70;
        this.speed = 0.3 + Math.random() * 0.2;

        this.hitbox = {
            offsetX: 8,
            offsetY: 6,
            width: this.width - 8,
            height: this.height - 8
        };

        this.deadImagePath = '../img/3_enemies_chicken/chicken_normal/2_dead/dead.png';
        this.loadImage(this.deadImagePath);

        this.animateWalk();
        setTimeout(() => {
            this.moveLeftLoop(750);
        }, Math.random() * 1000);
    }


    animateWalk() {
        this.walkInterval = setInterval(() => {
            if (this.dead) {
                clearInterval(this.walkInterval);
                return;
            }

            const path = this.walkImages[this.currentWalkFrame];
            const img = this.imageCache[path];

            if (img instanceof HTMLImageElement && img.complete) {
                this.img = img;
            }

            this.currentWalkFrame = (this.currentWalkFrame + 1) % this.walkImages.length;
        }, 150);
    }


    die() {
        if (this.dead) return;
        this.dead = true;

        if (this.walkInterval) {
            clearInterval(this.walkInterval);
            this.walkInterval = null;
        }

        const img = this.imageCache[this.deadImagePath];
        if (img instanceof HTMLImageElement && img.complete) {
            this.img = img;
        } else {
            console.warn('❌ Dead-Image nicht im Cache:', this.deadImagePath);
        }

        setTimeout(() => {
            const idx = world.enemies.indexOf(this);
            if (idx > -1) {
                world.enemies.splice(idx, 1);
            }
        }, 400);
    }


    draw(ctx) {
        if (!this.img || !(this.img instanceof HTMLImageElement) || !this.img.complete) return;

        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}
