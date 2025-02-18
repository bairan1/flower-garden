const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 5;
        this.score = 0;
        this.lives = 3;
    }

    draw() {
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        }
        if (direction === 'right' && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }

    shoot() {
        bullets.push(new Bullet(this.x + this.width / 2, this.y));
    }
}

class Enemy {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = Math.random() * 2 + 1;
    }

    draw() {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
        return this.y > canvas.height;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = 7;
    }

    draw() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
        return this.y < 0;
    }
}

const player = new Player();
let enemies = [];
let bullets = [];
let keys = {};
let gameOver = false;
let enemySpawnTimer = 0;

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.fillText('游戏结束!', canvas.width/2 - 100, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText(`最终得分: ${player.score}`, canvas.width/2 - 60, canvas.height/2 + 40);
        return;
    }

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 生成敌人
    enemySpawnTimer++;
    if (enemySpawnTimer > 60) {
        enemies.push(new Enemy());
        enemySpawnTimer = 0;
    }

    // 更新玩家位置
    if (keys['ArrowLeft']) player.move('left');
    if (keys['ArrowRight']) player.move('right');

    // 更新子弹
    bullets = bullets.filter(bullet => {
        bullet.draw();
        return !bullet.update();
    });

    // 更新敌人
    enemies = enemies.filter(enemy => {
        enemy.draw();
        
        // 检查与子弹的碰撞
        bullets = bullets.filter(bullet => {
            if (checkCollision(bullet, enemy)) {
                player.score += 10;
                return false;
            }
            return true;
        });

        // 检查与玩家的碰撞
        if (checkCollision(enemy, player)) {
            player.lives--;
            if (player.lives <= 0) {
                gameOver = true;
            }
            return false;
        }

        return !enemy.update();
    });

    // 绘制玩家
    player.draw();

    // 绘制UI
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`得分: ${player.score}`, 10, 30);
    ctx.fillText(`生命: ${player.lives}`, 10, 60);

    requestAnimationFrame(gameLoop);
}
// 添加到文件末尾
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        player.shoot();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 开始游戏
gameLoop();
