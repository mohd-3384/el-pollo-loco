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
    currentFrame = 0;

    constructor(x = 2800) {
        super();
        this.loadImage(this.alertImages[0]);
        this.loadImages(this.alertImages);

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


    // animateIdle() {
    //     setInterval(() => {
    //         const path = this.alertImages[this.currentFrame];
    //         this.img = this.imageCache[path];
    //         this.currentFrame = (this.currentFrame + 1) % this.alertImages.length;
    //     }, 200);
    // }
    animateIdle() {
        setInterval(() => {
            const path = this.alertImages[this.currentFrame];
            const img = this.imageCache[path];

            if (img instanceof HTMLImageElement && img.complete) {
                this.img = img;
            }

            this.currentFrame = (this.currentFrame + 1) % this.alertImages.length;
        }, 200);
    }



    // draw(ctx) {
    //     ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    // }
    draw(ctx) {
        if (!this.img || !(this.img instanceof HTMLImageElement) || !this.img.complete) {
            // console.warn('Endboss-Bild nicht bereit:', this.img);
            return;
        }

        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}
