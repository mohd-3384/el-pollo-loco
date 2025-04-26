class ThrowableObject extends MovableObject {

    constructor(x, y, direction) {
        super();

        this.rotationImages = [
            '../img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
            '../img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
            '../img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
            '../img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
        ];

        this.loadImages(this.rotationImages);
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speedX = 10 * direction;
        this.speedY = 8;
        this.gravity = 0.5;
        this.throw();
    }

    throw() {
        this.applyGravity();
        this.animateRotation();
        this.moveInterval = setInterval(() => {
            this.x += this.speedX;
        }, 1000 / 60);
    }

    animateRotation() {
        let i = 0;
        this.rotationInterval = setInterval(() => {
            this.img = this.imageCache[this.rotationImages[i]];
            i = (i + 1) % this.rotationImages.length;
        }, 100);
    }

    applyGravity() {
        this.gravityInterval = setInterval(() => {
            this.y -= this.speedY;
            this.speedY -= this.gravity;
            if (this.y > 400) {
                this.remove();
            }
        }, 1000 / 60);
    }

    remove() {
        clearInterval(this.gravityInterval);
        clearInterval(this.moveInterval);
        clearInterval(this.rotationInterval);
        const idx = world.throwables.indexOf(this);
        if (idx > -1) world.throwables.splice(idx, 1);
    }
}
