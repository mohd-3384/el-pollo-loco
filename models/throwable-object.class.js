class ThrowableObject extends MovableObject {
    constructor(x, y) {
        super().loadImage('img/pepe/throwable/throwable.png');
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.speedY = 0;
        this.gravity = 10;
        this.isThrown = false;
        this.throwDirection = null;
    }
}