let playerX = 75;
let playerY = 75;
let playerAngle = 0;
let showMap = false;
let lookOffset = 10;
let keys = {};
addEventListener("keydown", function (e) { keys[e.key] = true; });
addEventListener("keyup", function (e) { keys[e.key] = false; });
addEventListener("mousemove", function (e) { playerAngle += e.movementX * 0.002; });
addEventListener("mousemove", function (e) { lookOffset -= e.movementY * 1; });

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
canvas.addEventListener("click", function () {
    canvas.requestPointerLock();
});
function draw() {
    if (lookOffset > 200) {
        lookOffset = 200;
    } else if (lookOffset < -200) {
        lookOffset = -200;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (showMap === true) {
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
    for (let i = 0; i < 80; i = i + 1) {
        let rayX = playerX;
        let rayY = playerY;
        cell = 0;
        let steps = 0;
        let rayAngle = playerAngle - 0.4 + i * 0.0125;
        while (cell === 0 && steps < 1000) {
            rayX = rayX + Math.cos(rayAngle);
            rayY = rayY + Math.sin(rayAngle);
            col = Math.floor(rayX / 50);
            row = Math.floor(rayY / 50);
            cell = map[row][col];
            steps = steps + 1; 
        }
        let distance = Math.sqrt((rayX - playerX) * (rayX - playerX) + (rayY - playerY) * (rayY - playerY));
        distance = distance + 0.00000001;
        let wallHeight = 5000 / distance;
        let stripWidth = 10;
        ctx.fillStyle = "white";
        ctx.fillRect(i * stripWidth, canvas.height / 2 + lookOffset - wallHeight / 2, stripWidth, wallHeight);
        //raycasting
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.moveTo(playerX, playerY);
        ctx.lineTo(rayX, rayY);
        if (showMap === true) {
            ctx.stroke();
        }
    }
}
function update() {
        if (keys["ArrowLeft"] || keys["a"]) {
            let newXLeft = playerX - Math.cos(playerAngle + 1.57) * 1.5;
            let newYLeft = playerY - Math.sin(playerAngle + 1.57) * 1.5;
            let colX = Math.floor(newXLeft / 50);
            let rowX = Math.floor(playerY / 50);
            let cellX = map[rowX][colX];
            if (cellX === 0) {
                playerX = newXLeft;
            }
            let colY = Math.floor(playerX / 50);
            let rowY = Math.floor(newYLeft / 50);
            let cellY = map[rowY][colY];
            if (cellY === 0) {
                playerY = newYLeft;
            }
        }
        if (keys["ArrowRight"] || keys["d"]) {
            let newXRight = playerX - Math.cos(playerAngle - 1.57) * 1.5;
            let newYRight = playerY - Math.sin(playerAngle - 1.57) * 1.5;
            let colX = Math.floor(newXRight / 50);
            let rowX = Math.floor(playerY / 50);
            let cellX = map[rowX][colX];
            if (cellX === 0) {
                playerX = newXRight;
            }
            let colY = Math.floor(playerX / 50);
            let rowY = Math.floor(newYRight / 50);
            let cellY = map[rowY][colY];
            if (cellY === 0) {
                playerY = newYRight;
            }
        }
        if (keys["ArrowUp"] || keys["w"]) {
        let newX = playerX + Math.cos(playerAngle) * 1.5;
        let newY = playerY + Math.sin(playerAngle) * 1.5;
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
        let newXBackwards = playerX - Math.cos(playerAngle) * 1.5;
        let newYBackwards = playerY - Math.sin(playerAngle) * 1.5;
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

