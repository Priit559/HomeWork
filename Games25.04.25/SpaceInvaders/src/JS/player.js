class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
        this.bullets = [];
    }

    draw(ctx) {
        const shipImg = document.getElementById('shipImg');
        ctx.drawImage(shipImg, this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        }
        if (direction === 'right' && this.x < this.canvas.width - this.width) {
            this.x += this.speed;
        }
    }

    shoot() {
        this.bullets.push(new Bullet(this.x + this.width / 2, this.y, -1));
    }
}