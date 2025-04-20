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

    loadImagePaths(type) {
        const base = './img/7_statusbars/1_statusbar';
        switch (type) {
            case 'health':
                return [
                    `${base}/2_statusbar_health/blue/0.png`,
                    `${base}/2_statusbar_health/blue/20.png`,
                    `${base}/2_statusbar_health/blue/40.png`,
                    `${base}/2_statusbar_health/blue/60.png`,
                    `${base}/2_statusbar_health/blue/80.png`,
                    `${base}/2_statusbar_health/blue/100.png`
                ];
            case 'coin':
                return [
                    `${base}/1_statusbar_coin/green/0.png`,
                    `${base}/1_statusbar_coin/green/20.png`,
                    `${base}/1_statusbar_coin/green/40.png`,
                    `${base}/1_statusbar_coin/green/60.png`,
                    `${base}/1_statusbar_coin/green/80.png`,
                    `${base}/1_statusbar_coin/green/100.png`
                ];
            case 'bottle':
                return [
                    `${base}/3_statusbar_bottle/orange/0.png`,
                    `${base}/3_statusbar_bottle/orange/20.png`,
                    `${base}/3_statusbar_bottle/orange/40.png`,
                    `${base}/3_statusbar_bottle/orange/60.png`,
                    `${base}/3_statusbar_bottle/orange/80.png`,
                    `${base}/3_statusbar_bottle/orange/100.png`
                ];
            default:
                console.warn(`Unknown status bar type: ${type}`);
                return [];
        }
    }

    setPercentage(percentage) {
        this.percentage = percentage;
        const index = this.resolveImageIndex();
        const path = this.images[index];
        this.img = this.imageCache[path];
    }

    resolveImageIndex() {
        if (this.percentage >= 100) return 5;
        if (this.percentage >= 80) return 4;
        if (this.percentage >= 60) return 3;
        if (this.percentage >= 40) return 2;
        if (this.percentage >= 20) return 1;
        return 0;
    }
}
