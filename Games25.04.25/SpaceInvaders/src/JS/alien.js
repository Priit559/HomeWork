class Alien {
    constructor(x, y, type) {
        this.width = 40;
        this.height = 40;
        this.x = x;
        this.y = y;
        this.type = type;
        this.speed = 2;
        this.direction = 1;
        this.color = randomColor();
    }

    draw(ctx) {
        const alienImg = document.getElementById(`alien${this.type}`);
        ctx.drawImage(alienImg, this.x, this.y, this.width, this.height);
    }

    move() {
        this.x += this.speed * this.direction;
    }

    moveDown() {
        this.y += this.height;
        this.direction *= -1;
    }
}