class Bullet {
    constructor(x, y, direction) {
        this.width = 3;
        this.height = 15;
        this.x = x;
        this.y = y;
        this.speed = 7;
        this.direction = direction;
    }

    draw(ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move() {
        this.y += this.speed * this.direction;
    }
}