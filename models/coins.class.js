class Coin extends MovableObject {
    images = [
        '../img/8_coin/coin_1.png',
        '../img/8_coin/coin_2.png'
    ];

    constructor(x, y) {
        super();
        this.loadImage(this.images[0]);
        this.loadImages(this.images);
        this.x = x;
        this.y = y;
        this.width = 150;
        this.height = 150;
        this.animate();

        this.hitbox = {
            offsetX: 50,
            offsetY: 50,
            width: this.width - 100,
            height: this.height - 100
        };
    }


    animate() {
        let i = 0;
        setInterval(() => {
            this.img = this.imageCache[this.images[i]];
            i = (i + 1) % this.images.length;
        }, 300);
    }

    draw(ctx) {
        if (!this.img || !(this.img instanceof HTMLImageElement) || !this.img.complete) return;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}
