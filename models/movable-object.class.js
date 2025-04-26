class MovableObject extends DrawableObject {
    x = 120;
    y = 400;
    img;
    height = 100;
    width = 100;
    energy = 100;

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
}