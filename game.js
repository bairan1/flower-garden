let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let selectedItem = null;
let garden = [];

// 初始化背景
function initBackground() {
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 绘制花朵
function drawFlower(x, y, type) {
    ctx.beginPath();
    
    switch(type) {
        case 'flower1': // 玫瑰花
            // 花瓣
            ctx.fillStyle = '#FF69B4';
            for(let i = 0; i < 12; i++) {
                ctx.beginPath();
                ctx.ellipse(
                    x + Math.cos(i * Math.PI/6) * 8,
                    y + Math.sin(i * Math.PI/6) * 8,
                    6, 4, i * Math.PI/6, 0, Math.PI * 2
                );
                ctx.fill();
            }
            // 花蕊
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'flower2': // 向日葵
            // 花瓣
            ctx.fillStyle = '#FFD700';
            for(let i = 0; i < 16; i++) {
                ctx.beginPath();
                ctx.ellipse(
                    x + Math.cos(i * Math.PI/8) * 15,
                    y + Math.sin(i * Math.PI/8) * 15,
                    8, 3, i * Math.PI/8, 0, Math.PI * 2
                );
                ctx.fill();
            }
            // 花蕊
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'flower3': // 郁金香
            // 花瓣
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(x, y - 15);
            ctx.bezierCurveTo(x + 15, y - 5, x + 15, y + 10, x, y + 15);
            ctx.bezierCurveTo(x - 15, y + 10, x - 15, y - 5, x, y - 15);
            ctx.fill();
            // 花蕊
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
}

// 移除原来的 getFlowerColor 函数，因为颜色现在直接在 drawFlower 中设置
function getFlowerColor(type) {
    switch(type) {
        case 'flower1': return '#FF69B4'; // 玫瑰花-粉色
        case 'flower2': return '#FFD700'; // 向日葵-黄色
        case 'flower3': return '#FF0000'; // 郁金香-红色
        default: return '#FF69B4';
    }
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
    
    drawFlower(x, y, selectedItem);
});

// 初始化游戏
initBackground();