class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(this.canvas);
        this.aliens = [];
        this.alienBullets = [];
        this.score = 0;
        this.gameOver = false;
        this.keys = {};
        this.alienDirection = 1;
        this.alienStepDown = 20;
        this.alienShootInterval = 1000;
        this.level = 1;
        this.baseAlienSpeed = 2;
        this.currentAlienSpeed = this.baseAlienSpeed;
        this.maxLevel = 8;
        this.createAliens();
        this.setupEventListeners();
        this.startAlienShooting();
        this.gameLoop();
    }

    createAliens() {
        const columns = 6;
        const rows = this.level;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const type = Math.floor(Math.random() * 3) + 1;
                this.aliens.push(new Alien(
                    col * 70 + 50,
                    row * 70 + 50,
                    type,
                    this.canvas
                ));
            }
        }

  
        this.currentAlienSpeed = this.baseAlienSpeed + (this.level * 0.5);
        this.alienShootInterval = Math.max(1000 - (this.level * 50), 500);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') {
                this.player.shoot();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    startAlienShooting() {
        setInterval(() => {
            if (!this.gameOver && this.aliens.length > 0) {
                const randomAlien = this.aliens[Math.floor(Math.random() * this.aliens.length)];
                this.alienBullets.push(new Bullet(
                    randomAlien.x + randomAlien.width / 2,
                    randomAlien.y + randomAlien.height,
                    true
                ));
            }
        }, this.alienShootInterval);
    }

    checkCollisions() {

        this.player.bullets.forEach((bullet, bulletIndex) => {
            this.aliens.forEach((alien, alienIndex) => {
                if (this.isColliding(bullet, alien)) {
                    this.player.bullets.splice(bulletIndex, 1);
                    this.aliens.splice(alienIndex, 1);
                    this.score += 100;
                    document.getElementById('score').textContent = `Score: ${this.score}`;
                }
            });
        });


        this.alienBullets.forEach((bullet, index) => {
            if (this.isColliding(bullet, this.player)) {
                this.gameOver = true;
                document.getElementById('gameOver').style.display = 'block';
            }
        });


        this.aliens.forEach(alien => {
            if (this.isColliding(alien, this.player)) {
                this.gameOver = true;
                document.getElementById('gameOver').style.display = 'block';
            }
        });
    }

    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    update() {
        if (this.gameOver) return;


        if (this.keys['ArrowLeft']) this.player.move('left');
        if (this.keys['ArrowRight']) this.player.move('right');


        this.player.bullets.forEach((bullet, index) => {
            bullet.move();
            if (bullet.y < 0) {
                this.player.bullets.splice(index, 1);
            }
        });

        this.alienBullets.forEach((bullet, index) => {
            bullet.move();
            if (bullet.y > this.canvas.height) {
                this.alienBullets.splice(index, 1);
            }
        });


        let alienTouchingEdge = false;
        this.aliens.forEach(alien => {
            alien.x += this.currentAlienSpeed * this.alienDirection;
            if (alien.x <= 0 || alien.x + alien.width >= this.canvas.width) {
                alienTouchingEdge = true;
            }
        });

        if (alienTouchingEdge) {
            this.alienDirection *= -1;
            this.aliens.forEach(alien => {
                alien.y += this.alienStepDown;
            });
        }


        if (this.aliens.length === 0) {
            this.level++;

            document.getElementById('score').textContent = 
                `Score: ${this.score} | Level: ${this.level}`;

            this.createAliens();
 
            this.alienShootInterval = Math.max(1000 - (this.level * 50), 500);
            this.restartAlienShooting();
        }

        this.checkCollisions();
    }

    restartAlienShooting() {

        if (this.shootingInterval) {
            clearInterval(this.shootingInterval);
        }

        this.shootingInterval = setInterval(() => {
            if (!this.gameOver && this.aliens.length > 0) {
                const randomAlien = this.aliens[Math.floor(Math.random() * this.aliens.length)];
                this.alienBullets.push(new Bullet(
                    randomAlien.x + randomAlien.width / 2,
                    randomAlien.y + randomAlien.height,
                    true
                ));
            }
        }, this.alienShootInterval);
    }

    startAlienShooting() {
        this.shootingInterval = setInterval(() => {
            if (!this.gameOver && this.aliens.length > 0) {
                const randomAlien = this.aliens[Math.floor(Math.random() * this.aliens.length)];
                this.alienBullets.push(new Bullet(
                    randomAlien.x + randomAlien.width / 2,
                    randomAlien.y + randomAlien.height,
                    true
                ));
            }
        }, this.alienShootInterval);
    }
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.player.draw(this.ctx);
        this.aliens.forEach(alien => alien.draw(this.ctx));
        this.player.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.alienBullets.forEach(bullet => bullet.draw(this.ctx));
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}



window.onload = () => {
    new Game();
};