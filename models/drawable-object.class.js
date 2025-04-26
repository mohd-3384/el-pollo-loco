class DrawableObject {

    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 100;
        this.height = 100;
        this.img = null;
        this.imageCache = {};
    }

    /**
    * Loads a single image and sets it as the current image.
    * @param {string} path - The path to the image file.
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
    * Preloads multiple images into the image cache.
    * @param {string[]} imageArray - Array of image paths.
    */
    loadImages(imageArray) {
        imageArray.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /**
    * Draws the current image on the canvas.
    * @param {CanvasRenderingContext2D} ctx - The canvas drawing context.
    */
    draw(ctx) {
        if (!this.img || !(this.img instanceof HTMLImageElement) || !this.img.complete) {
            return;
        }
        const drawX = Math.round(this.x);
        const drawY = Math.round(this.y);
        ctx.drawImage(this.img, drawX, drawY, this.width + 1, this.height);
    }
}
