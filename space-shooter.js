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
