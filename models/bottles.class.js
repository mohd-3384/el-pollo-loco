class Bottle extends MovableObject {
    image = '../img/6_salsa_bottle/1_salsa_bottle_on_ground.png';

    constructor(x, y) {
        super();
        this.loadImage(this.image);
        this.x = x;
        this.y = 350;
        this.width = 70;
        this.height = 80;

        this.hitbox = {
            offsetX: 32,
            offsetY: 18,
            width: this.width - 50,
            height: this.height - 20
        };
    }
}
