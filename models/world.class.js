class World {
    character = new Character();
    endboss = new Endboss();
    enemies = [];
    clouds = [];
    backgroundObjects = [];
    canvas;
    ctx;
    cameraX = 0;
    coins = [];
    bottles = [];


    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;

        this.initBackground();
        this.initClouds();
        this.startEnemySpawner();

        this.initStatusBars();
        this.draw();
        this.initCoins();
        this.initBottles();
        this.throwables = [];
    }


    initCoins() {
        const coinPositions = [
            { x: 800, y: 80 },
            { x: 1200, y: 100 },
            { x: 1600, y: 120 },
            { x: 2000, y: 260 },
            { x: 2400, y: 90 }
        ];

        this.coins = coinPositions.map(pos => new Coin(pos.x, pos.y));
    }


    initBottles() {
        const bottlePositions = [1000, 1400, 1800, 2200, 2600];
        this.bottles = bottlePositions.map(x => new Bottle(x));
    }


    initBackground() {
        const layerWidth = 720;
        const totalRepeats = 10;

        for (let i = 0; i < totalRepeats; i++) {
            const x = i * layerWidth;
            const suffix = (i % 2 === 0) ? '1' : '2';

            this.backgroundObjects.push(
                new BackgroundObject(`../img/5_background/layers/air.png`, x, 0, 720, 480),
                new BackgroundObject(`../img/5_background/layers/3_third_layer/${suffix}.png`, x, 0, 720, 480),
                new BackgroundObject(`../img/5_background/layers/2_second_layer/${suffix}.png`, x, 0, 720, 480),
                new BackgroundObject(`../img/5_background/layers/1_first_layer/${suffix}.png`, x, 0, 720, 480)
            );
        }
    }


    initClouds() {
        const cloudRepeats = 20;

        for (let i = 0; i < cloudRepeats; i++) {
            const x = i * 400 + Math.random() * 200;
            const y = 30 + Math.random() * 80;
            const cloudImg = Math.random() < 0.5 ? '1.png' : '2.png';
            const path = `../img/5_background/layers/4_clouds/${cloudImg}`;

            this.clouds.push(new Cloud(x, y, path));
        }
    }


    startEnemySpawner() {
        setInterval(() => {
            if (this.enemies.length >= 7) return;

            const isSmall = Math.random() < 0.5;
            const spawnDistance = 720 + Math.random() * 300;
            const spawnX = this.character.x + spawnDistance;

            let enemy;

            if (isSmall) {
                enemy = new SmallChicken(spawnX);
            } else {
                enemy = new Chicken(spawnX);
            }

            this.enemies.push(enemy);
        }, 2000);
    }


    drawObjects(objects) {
        if (!objects || !Array.isArray(objects)) return;

        objects.forEach(obj => {
            if (obj.draw) {
                obj.draw(this.ctx);
            } else if (obj.img instanceof HTMLImageElement && obj.img.complete) {
                this.ctx.drawImage(obj.img, obj.x, obj.y, obj.width + 1, obj.height);
            }
        });
    }


    removeOffscreenEnemies() {
        this.enemies = this.enemies.filter(enemy => enemy.x + enemy.width > this.character.x - 500);
    }


    calculateCameraX() {
        const worldEndX = 3000;
        const padding = 100;
        const maxCam = -(worldEndX - padding);
        return Math.max(Math.min(0, -this.character.x + padding), maxCam);
    }


    initStatusBars() {
        this.statusBarHealth = new StatusBar('health', 20, 4);
        this.statusBarCoin = new StatusBar('coin', 20, 54);
        this.statusBarBottle = new StatusBar('bottle', 20, 102);
        this.statusBarCoin.setPercentage(0);
        this.statusBarBottle.setPercentage(0);
    }


    draw() {
        if (window.gameOver) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.cameraX = this.calculateCameraX();
        this.ctx.translate(this.cameraX, 0);

        this.drawObjects(this.backgroundObjects);
        this.drawObjects(this.clouds);
        this.drawObjects(this.coins);
        this.drawObjects(this.bottles);
        this.drawObjects(this.enemies);
        this.drawObjects(this.throwables);
        this.character.draw(this.ctx);
        this.endboss.draw(this.ctx);

        this.coins.forEach(c => drawHitbox(c, this.ctx));
        this.bottles.forEach(b => drawHitbox(b, this.ctx));
        this.enemies.forEach(e => drawHitbox(e, this.ctx));
        drawHitbox(this.character, this.ctx);

        this.removeOffscreenEnemies();
        this.ctx.translate(-this.cameraX, 0);

        this.statusBarHealth.draw(this.ctx);
        this.statusBarCoin.draw(this.ctx);
        this.statusBarBottle.draw(this.ctx);

        this.drawFrame = requestAnimationFrame(() => this.draw());
    }
}