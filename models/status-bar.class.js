class StatusBar extends DrawableObject {
    percentage = 100;
    imageCache = {};
    images = [];
    type = '';

    constructor(type, x, y) {
        super();
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 200;
        this.height = 60;
        this.images = this.loadImagePaths(type);
        this.loadImages(this.images);
        this.setPercentage(100);
    }

    /**
    * Loads image paths for the given statusbar type.
    * @param {string} type - The type of statusbar ('health', 'coin', 'bottle').
    * @returns {string[]} Array of image paths.
    */
    loadImagePaths(type) {
        const base = './img/7_statusbars/1_statusbar';
        switch (type) {
            case 'health':
                return this.getStatusbarPaths(base, '2_statusbar_health/blue');
            case 'coin':
                return this.getStatusbarPaths(base, '1_statusbar_coin/green');
            case 'bottle':
                return this.getStatusbarPaths(base, '3_statusbar_bottle/orange');
            default:
                return [];
        }
    }

    /**
    * Creates statusbar image paths based on base and subfolder.
    * @param {string} base - The base path.
    * @param {string} subfolder - The specific subfolder.
    * @returns {string[]} Array of paths.
    */
    getStatusbarPaths(base, subfolder) {
        const levels = ['0', '20', '40', '60', '80', '100'];
        return levels.map(level => `${base}/${subfolder}/${level}.png`);
    }

    /**
    * Updates the displayed image based on the current percentage.
    * @param {number} percentage - The fill percentage (0-100).
    */
    setPercentage(percentage) {
        this.percentage = percentage;
        const index = this.resolveImageIndex();
        const path = this.images[index];
        this.img = this.imageCache[path];
    }

    /**
    * Resolves the correct image index based on the percentage.
    * @returns {number} Index for the statusbar image.
    */
    resolveImageIndex() {
        if (this.percentage >= 100) return 5;
        if (this.percentage >= 80) return 4;
        if (this.percentage >= 60) return 3;
        if (this.percentage >= 40) return 2;
        if (this.percentage >= 20) return 1;
        return 0;
    }
}
