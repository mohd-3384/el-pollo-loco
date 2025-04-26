class Cloud extends DrawableObject {
    constructor(x, y, imagePath) {
        super();
        this.loadImage(imagePath);

        this.x = x;
        this.y = y;
        this.width = 500;
        this.height = 200;
        this.speed = 0.1 + Math.random() * 0.15;

        this.moveCloud();
    }

    /**
    * Moves the cloud to the left and resets position when off-screen.
    */
    moveCloud() {
        setInterval(() => {
            this.x -= this.speed;
            if (this.x + this.width < 0) {
                this.x = 7200 + Math.random() * 500;
            }
        }, 1000 / 60);
    }
}
