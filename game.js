let playerX = 75;
let playerY = 75;
let playerAngle = 0;
let keys = {};
addEventListener("keydown", function (e) { keys[e.key] = true; });
addEventListener("keyup", function (e) { keys[e.key] = false; });

let map = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1]
];
let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    for (let i = 0; i < 20; i = i + 1) {
        let rayX = playerX;
        let rayY = playerY;
        cell = 0;
        let steps = 0;
        let rayAngle = playerAngle - 0.4 + i * 0.05;
        while (cell === 0 && steps < 1000) {
            rayX = rayX + Math.cos(rayAngle);
            rayY = rayY + Math.sin(rayAngle);
            col = Math.floor(rayX / 50);
            row = Math.floor(rayY / 50);
            cell = map[row][col];
            steps = steps + 1; 
        }
        //raycasting
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.moveTo(playerX, playerY);
        ctx.lineTo(rayX, rayY);
        ctx.stroke();
    }
}
function update() {
    if (keys["ArrowLeft"] || keys["a"]) {playerAngle -= 0.05; }
    if (keys["ArrowRight"] || keys["d"]) {playerAngle += 0.05; }
    if (keys["ArrowUp"] || keys["w"]) {
        let newX = playerX + Math.cos(playerAngle) * 2;
        let newY = playerY + Math.sin(playerAngle) * 2;
        let colX = Math.floor(newX / 50);
        let rowX = Math.floor(playerY / 50);
        let cellX = map[rowX][colX];
        if (cellX === 0) {
            playerX = newX;
        }
        let colY = Math.floor(playerX / 50);
        let rowY = Math.floor(newY / 50);
        let cellY = map[rowY][colY];
        if (cellY === 0) {
            playerY = newY;
        }
    }
    if (keys["ArrowDown"] || keys["s"]) {
        let newXBackwards = playerX - Math.cos(playerAngle) * 2;
        let newYBackwards = playerY - Math.sin(playerAngle) * 2;
        let colX = Math.floor(newXBackwards / 50);
        let rowX = Math.floor(playerY / 50);
        let cellX = map[rowX][colX];
        if (cellX === 0) {
            playerX = newXBackwards;
        }
        let colY = Math.floor(playerX / 50);  
        let rowY = Math.floor(newYBackwards / 50);
        let cellY = map[rowY][colY];
        if (cellY === 0) {
            playerY = newYBackwards;
        }
    }
    draw();
    requestAnimationFrame(update);
}
update();

