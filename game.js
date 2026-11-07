let playerX = 75;
let playerY = 75;
let playerAngle = 0;
let showMap = false;
let lookOffset = 0;
let speed = 1.5;
let sprint = 100
let keys = {};
addEventListener("keydown", function (e) { keys[e.key] = true; });
addEventListener("keyup", function (e) { keys[e.key] = false; });
addEventListener("mousemove", function (e) { playerAngle += e.movementX * 0.002; });
addEventListener("mousemove", function (e) { lookOffset -= e.movementY * 1; });

let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
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
    ctx.fillStyle = "rgb(26, 26, 26)";
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2 + lookOffset);
    let horizon = canvas.height / 2 + lookOffset;
    ctx.fillStyle = "rgb(13, 13, 13)";
    ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon);
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
    let wallDistances = [];
    for (let i = 0; i < 80; i = i + 1) {
        let rayX = playerX;
        let rayY = playerY;
        let cell = 0;
        let steps = 0;
        let rayAngle = playerAngle - 0.5 + i * 0.0125;
        while (cell === 0 && steps < 1000) {
            rayX = rayX + Math.cos(rayAngle);
            rayY = rayY + Math.sin(rayAngle);
            let col = Math.floor(rayX / 50);
            let row = Math.floor(rayY / 50);
            cell = map[row][col];
            steps = steps + 1; 
        }
        let distance = Math.sqrt((rayX - playerX) * (rayX - playerX) + (rayY - playerY) * (rayY - playerY));
        distance = distance + 0.00000001;
        distance = distance * Math.cos(rayAngle - playerAngle);
        wallDistances[i] = distance;
        let wallHeight = 5000 / distance;
        let stripWidth = 8;
        ctx.fillStyle = "rgb(80, 80, 80)";
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
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 0) {
                let lightX = x * 50 + 25;
                let lightY = y * 50 + 25;
                let dx = lightX - playerX;
                let dy = lightY - playerY;
                let lightDistance = Math.sqrt(dx * dx + dy * dy);
                let lightSize = 1000 / lightDistance;
                let lightY2 = horizon - 2500 / lightDistance;
                let lightAngle = Math.atan2(dy, dx) - playerAngle;
                while (lightAngle > Math.PI) {
                    lightAngle -= Math.PI * 2;
                }
                while (lightAngle < -Math.PI) {
                    lightAngle += Math.PI * 2;
                }
                let screenX = (lightAngle + 0.5) / 1.0 * canvas.width;
                let strip = Math.floor(screenX / 8);
                if (strip >= 0 && strip < 80 && lightDistance < wallDistances[strip]) {
                    ctx.fillStyle = "rgb(255, 250, 200)";
                    ctx.fillRect(screenX - lightSize / 2, lightY2 - lightSize / 2, lightSize, lightSize / 3)
                }
            }
        }
    }
}
function update() {
        if (keys["Alt"]) {
            if (sprint > 0) {
                speed = 2.5;
                sprint -= 1;
            }
        } else if (sprint < 100) {
            sprint += 0.5;
        }
        if (keys["ArrowLeft"] || keys["a"]) {
            let newXLeft = playerX - Math.cos(playerAngle + 1.57) * speed;
            let newYLeft = playerY - Math.sin(playerAngle + 1.57) * speed;
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
            let newXRight = playerX - Math.cos(playerAngle - 1.57) * speed;
            let newYRight = playerY - Math.sin(playerAngle - 1.57) * speed;
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
        let newX = playerX + Math.cos(playerAngle) * speed;
        let newY = playerY + Math.sin(playerAngle) * speed;
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
        let newXBackwards = playerX - Math.cos(playerAngle) * speed;
        let newYBackwards = playerY - Math.sin(playerAngle) * speed;
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
    speed = 1.5;
}
update();

