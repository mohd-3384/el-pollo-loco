class MovableObject extends DrawableObject {
    x = 120;
    y = 400;
    img;
    height = 100;
    width = 100;
    energy = 100;


    // loadImage(path) {
    //     this.img = new Image();
    //     this.img.src = path;
    // }
    loadImage(path) {
        const img = new Image();
        img.src = path;

        img.onload = () => {
            this.img = img;
        };

        this.imageCache = this.imageCache || {};
        this.imageCache[path] = img;
    }


    loadImages(imageArray) {
        this.imageCache = this.imageCache || {};
        imageArray.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }


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
}