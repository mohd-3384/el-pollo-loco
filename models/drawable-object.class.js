class DrawableObject {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 100;
        this.height = 100;
        this.img = null;
        this.imageCache = {};
    }


    loadImage(path) {
        const img = new Image();
        img.src = path;

        img.onload = () => {
            this.img = img;
        };

        this.imageCache[path] = img;
    }


    loadImages(imageArray) {
        imageArray.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }


    draw(ctx) {
        if (!this.img || !(this.img instanceof HTMLImageElement) || !this.img.complete) {
            return;
        }

        const drawX = Math.round(this.x);
        const drawY = Math.round(this.y);

        ctx.drawImage(this.img, drawX, drawY, this.width + 1, this.height);
    }
}
