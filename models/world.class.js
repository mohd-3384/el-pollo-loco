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

    /**
    * Initializes all coin objects in the world.
    */
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

    /**
    * Initializes all bottle objects in the world.
    */
    initBottles() {
        const bottlePositions = [1000, 1400, 1800, 2200, 2600];
        this.bottles = bottlePositions.map(x => new Bottle(x));
    }

    /**
    * Initializes background layers with repeating images.
    */
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

    /**
    * Spawns clouds randomly across the world.
    */
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

    /**
    * Starts periodically spawning chickens.
    */
    startEnemySpawner() {
        setInterval(() => {
            if (this.enemies.length >= 7) return;
            const isSmall = Math.random() < 0.5;
            const spawnDistance = 720 + Math.random() * 300;
            const spawnX = this.character.x + spawnDistance;
            let enemy;
            enemy = isSmall ? new SmallChicken(spawnX) : new Chicken(spawnX);
            this.enemies.push(enemy);
        }, 2000);
    }

    /**
    * Draws a list of game objects on the canvas.
    * @param {Array} objects - List of drawable objects.
    */
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

    /**
    * Removes enemies that are too far off-screen.
    */
    removeOffscreenEnemies() {
        this.enemies = this.enemies.filter(enemy => enemy.x + enemy.width > this.character.x - 500);
    }

    /**
    * Calculates the camera X offset based on character position.
    * @returns {number} Camera X position.
    */
    calculateCameraX() {
        const worldEndX = 3000;
        const padding = 100;
        const maxCam = -(worldEndX - padding);
        return Math.max(Math.min(0, -this.character.x + padding), maxCam);
    }

    /**
    * Initializes health, coin, and bottle status bars.
    */
    initStatusBars() {
        this.statusBarHealth = new StatusBar('health', 20, 4);
        this.statusBarEndboss = new StatusBar('endboss', 220, 10);
        this.statusBarCoin = new StatusBar('coin', 20, 54);
        this.statusBarBottle = new StatusBar('bottle', 20, 102);
        this.statusBarCoin.setPercentage(0);
        this.statusBarBottle.setPercentage(0);
        this.statusBarEndboss.setPercentage(100);
    }

    /**
    * Main draw loop for the world.
    */
    draw() {
        if (window.gameOver) return;
        this.clearCanvasAndMoveCamera();
        this.drawWorldObjects();
        this.drawCharacterAndBoss();
        this.drawHitboxes();
        this.restoreCamera();
        this.drawStatusBars();
        this.drawFrame = requestAnimationFrame(() => this.draw());
    }

    /**
    * Clears the canvas and moves the camera.
    */
    clearCanvasAndMoveCamera() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.cameraX = this.calculateCameraX();
        this.ctx.translate(this.cameraX, 0);
    }

    /**
    * Draws background, clouds, collectibles, and enemies.
    */
    drawWorldObjects() {
        this.drawObjects(this.backgroundObjects);
        this.drawObjects(this.clouds);
        this.drawObjects(this.coins);
        this.drawObjects(this.bottles);
        this.drawObjects(this.enemies);
        this.drawObjects(this.throwables);
    }

    /**
    * Draws the player character and the endboss.
    */
    drawCharacterAndBoss() {
        this.character.draw(this.ctx);
        this.endboss.draw(this.ctx);
    }

    /**
    * Draws hitboxes for collision debugging.
    */
    drawHitboxes() {
        this.coins.forEach(c => drawHitbox(c, this.ctx));
        this.bottles.forEach(b => drawHitbox(b, this.ctx));
        this.enemies.forEach(e => drawHitbox(e, this.ctx));
        drawHitbox(this.character, this.ctx);
    }

    /**
    * Restores the camera position after drawing.
    */
    restoreCamera() {
        this.removeOffscreenEnemies();
        this.ctx.translate(-this.cameraX, 0);
    }

    /**
    * Draws the HUD status bars.
    */
    drawStatusBars() {
        this.statusBarHealth.draw(this.ctx);
        this.statusBarCoin.draw(this.ctx);
        this.statusBarBottle.draw(this.ctx);
        if (this.isEndbossVisible()) {
            this.statusBarEndboss.draw(this.ctx);
        }
    }

    /**
     * Visibility of Endboss 
     * @returns Boolean
     */
    isEndbossVisible() {
        return this.character.x + this.canvas.width > this.endboss.x && !this.endboss.isDead;
    }
}