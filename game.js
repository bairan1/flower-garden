const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 设置画布大小为窗口大小
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 烟花粒子类
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.gravity = 0.2;
        this.life = 100;
        this.size = Math.random() * 3 + 2;
    }

    update() {
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
        this.life--;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// 烟花类
class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetY = Math.random() * canvas.height * 0.4;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: -Math.random() * 15 - 10
        };
        this.particles = [];
        this.exploded = false;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    explode() {
        const particleCount = 150;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(this.x, this.y, this.color));
        }
    }

    update() {
        if (!this.exploded) {
            this.velocity.y += 0.2;
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            if (this.y <= this.targetY) {
                this.explode();
                this.exploded = true;
            }
        } else {
            this.particles.forEach((particle, index) => {
                particle.update();
                if (particle.alpha <= 0 || particle.life <= 0) {
                    this.particles.splice(index, 1);
                }
            });
        }
    }

    draw() {
        if (!this.exploded) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        this.particles.forEach(particle => particle.draw());
    }
}

let fireworks = [];
let autoLaunch = false;
let lastLaunch = Date.now();

function addFirework() {
    const x = Math.random() * canvas.width;
    const y = canvas.height;
    fireworks.push(new Firework(x, y));
}

function toggleAutoLaunch() {
    autoLaunch = !autoLaunch;
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (autoLaunch && Date.now() - lastLaunch > 500) {
        addFirework();
        lastLaunch = Date.now();
    }

    fireworks.forEach((firework, index) => {
        firework.update();
        firework.draw();
        if (firework.exploded && firework.particles.length === 0) {
            fireworks.splice(index, 1);
        }
    });
}

// 窗口大小改变时调整画布大小
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 点击画布发射烟花
canvas.addEventListener('click', (e) => {
    fireworks.push(new Firework(e.clientX, canvas.height));
});

// 开始动画
animate();
