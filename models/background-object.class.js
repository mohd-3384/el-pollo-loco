class BackgroundObject extends DrawableObject {
    constructor(imagePath, x, y, width, height) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }


    draw(ctx) {
        if (!this.img || !this.img.complete) return;

        const drawX = Math.round(this.x);
        ctx.drawImage(this.img, drawX, this.y, this.width + 1, this.height);
    }

}