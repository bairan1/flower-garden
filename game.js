let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let selectedItem = null;
let garden = [];
let animationFrameId;
let time = 0;

// 初始化背景
function initBackground() {
    // 创建渐变背景
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a3a');
    gradient.addColorStop(1, '#4a1a4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加星星
    for(let i = 0; i < 100; i++) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
        ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// 绘制魔法花朵
function drawFlower(x, y, type, time) {
    ctx.save();
    
    switch(type) {
        case 'flower1': // 幻彩莲花
            let petals = 8;
            let size = 20;
            let hue = (time * 50) % 360;
            
            for(let i = 0; i < petals; i++) {
                ctx.beginPath();
                ctx.fillStyle = `hsla(${hue + i * 45}, 100%, 70%, 0.8)`;
                ctx.translate(x, y);
                ctx.rotate((Math.PI * 2 / petals) * i + Math.sin(time) * 0.1);
                ctx.translate(-x, -y);
                
                ctx.beginPath();
                ctx.moveTo(x, y - size);
                ctx.quadraticCurveTo(
                    x + size, y - size,
                    x, y + size
                );
                ctx.quadraticCurveTo(
                    x - size, y - size,
                    x, y - size
                );
                ctx.fill();
            }
            
            // 发光效果
            ctx.beginPath();
            let gradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
            gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.3)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'flower2': // 星光舞者
            let arms = 12;
            for(let i = 0; i < arms; i++) {
                ctx.beginPath();
                ctx.strokeStyle = `hsla(${(time * 100 + i * 30) % 360}, 100%, 70%, 0.8)`;
                ctx.lineWidth = 2;
                ctx.translate(x, y);
                ctx.rotate((Math.PI * 2 / arms) * i + time);
                ctx.translate(-x, -y);
                
                let curve = Math.sin(time * 5) * 10;
                ctx.beginPath();
                ctx.moveTo(x, y - 15);
                ctx.quadraticCurveTo(
                    x + curve, y - 7.5,
                    x, y
                );
                ctx.stroke();
            }
            break;
            
        case 'flower3': // 梦幻水晶
            ctx.translate(x, y);
            ctx.rotate(time);
            ctx.translate(-x, -y);
            
            for(let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.fillStyle = `hsla(${210 + i * 20}, 80%, 70%, 0.6)`;
                ctx.translate(x, y);
                ctx.rotate(Math.PI / 3);
                ctx.translate(-x, -y);
                
                ctx.beginPath();
                ctx.moveTo(x, y - 20);
                ctx.lineTo(x + 10, y);
                ctx.lineTo(x, y + 20);
                ctx.lineTo(x - 10, y);
                ctx.closePath();
                ctx.fill();
            }
            break;
    }
    
    ctx.restore();
}

function animate() {
    time += 0.01;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initBackground();
    
    garden.forEach(flower => {
        drawFlower(flower.x, flower.y, flower.type, time);
    });
    
    animationFrameId = requestAnimationFrame(animate);
}

function selectItem(item) {
    selectedItem = item;
}

function clearCanvas() {
    garden = [];
    initBackground();
}

canvas.addEventListener('click', function(event) {
    if (!selectedItem) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    garden.push({
        x: x,
        y: y,
        type: selectedItem
    });
});

// 初始化游戏
initBackground();
animate();
