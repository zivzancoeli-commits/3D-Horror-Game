let playerX = 75;
let playerY = 75;
let playerAngle = 0;
let keys = {};
addEventListener("keydown", function (e) { keys[e.key] = true; });
addEventListener("keyup", function (e) { keys[e.key] = false; });

let map = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1]
];
let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
function draw() {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 1) {
                ctx.fillStyle = "gray";
            } else {
                ctx.fillStyle = "black";
            }
            ctx.fillRect(x * 50, y * 50, 50, 50);
        }
    }
    // player
    ctx.fillStyle = "red";
    ctx.fillRect(playerX - 5, playerY - 5, 10, 10)
    // direction
    ctx.strokeStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(playerX + Math.cos(playerAngle) * 20, playerY + Math.sin(playerAngle) * 20);
    ctx.stroke();
}
function update() {
    if (keys["ArrowLeft"]) {playerAngle -= 0.05; }
    if (keys["ArrowRight"]) {playerAngle += 0.05; }
    if (keys["ArrowUp"]) {
        playerX += Math.cos(playerAngle) * 5;
        playerY += Math.sin(playerAngle) * 5;
    }
    if (keys["ArrowDown"]) {
        playerX -= Math.cos(playerAngle) * 5;
        playerY -= Math.sin(playerAngle) * 5;
    }
    draw();
    requestAnimationFrame(update);
}
update();