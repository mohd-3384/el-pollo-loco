class SmallChicken extends MovableObject {
    walkImages = [
        '../img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        '../img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        '../img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];
    currentWalkFrame = 0;


    constructor(x = 800) {
        super();
        this.loadImage(this.walkImages[0]);
        this.loadImages(this.walkImages);

        this.x = x;
        this.y = 380;
        this.width = 50;
        this.height = 50;
        this.speed = 0.2 + Math.random() * 0.4;

        this.animateWalk();

        this.hitbox = {
            offsetX: 10,
            offsetY: 10,
            width: this.width - 20,
            height: this.height - 20
        };

        this.deadImagePath = '../img/3_enemies_chicken/chicken_small/2_dead/dead.png';
        this.loadImage(this.deadImagePath);

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
