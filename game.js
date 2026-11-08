let playerX = 75;
let playerY = 75;
let enemyX = 475;
let enemyY = 475;
let lastSeenX = 75;
let lastSeenY = 75;
let enemySpeed = 0.5;
let playerAngle = 0;
let showMap = false;
let lookOffset = 0;
let speed = 0.4;
let sprint = 100
let sneak = false;
let hidden = false;
let checkTimer = 0;
let keys = {};
addEventListener("keydown", function (e) { keys[e.key] = true; });
addEventListener("keyup", function (e) { keys[e.key] = false; });
addEventListener("mousemove", function (e) { playerAngle += e.movementX * 0.002; });
addEventListener("mousemove", function (e) { lookOffset -= e.movementY * 1; });

let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1],
    [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
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
        let shade = 80 - distance / 2;
        if (shade < 15) { shade = 15; }
        let stripWidth = 8;
        ctx.fillStyle = "rgb(" + shade + ", " + shade + ", " + shade + ")";
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
                let bright = 1 - lightDistance / 300;
                if (bright < 0.1) { bright = 0.1; }
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
                    ctx.fillStyle = "rgb(" + 255 * bright + ", " + 250 * bright + ", " + 200 * bright + ")";
                    ctx.fillRect(screenX - lightSize / 2, lightY2 - lightSize / 2, lightSize, lightSize / 3)
                }
            }
        }
    }
    let dx = enemyX - playerX;
    let dy = enemyY - playerY;
    let enemyDistance = Math.sqrt(dx * dx + dy * dy);
    let bright = 1 - enemyDistance / 300;
    if (bright < 0.1) { bright = 0.1; }
    let enemyHeight = 5000 / enemyDistance;
    let enemyTop = horizon - enemyHeight / 2;
    let enemyAngle = Math.atan2(dy, dx) - playerAngle;
    while (enemyAngle > Math.PI) {
        enemyAngle -= Math.PI * 2;
    }
    while (enemyAngle < -Math.PI) {
        enemyAngle += Math.PI * 2;
    }
    let screenX = (enemyAngle + 0.5) / 1.0 * canvas.width;
    let strip = Math.floor(screenX / 8);
    if (strip >= 0 && strip < 80 && enemyDistance < wallDistances[strip]) {
        ctx.fillStyle = "rgb(" + 120 * bright + ", 0, 0)";
        ctx.fillRect(screenX - enemyHeight / 4, enemyTop, enemyHeight / 2, enemyHeight);
    }
    let fear = 1 - enemyDistance / 250;
    if (fear < 0) { fear = 0; }
    ctx.fillStyle = "rgba(0, 0, 0, " + fear * 0.6 + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(150, 0, 0, " + fear * 0.25 + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function update() {
        if (keys["Shift"]) {
            sneak = true;
        } else {
            sneak = false;
        }
        if (keys["Control"]) {
            if (sprint > 0 && sneak === false) {
                speed++;
                sprint -= 1;
            }
        } else if (sprint < 100 && sneak === false) {
            sprint += 0.5;
        } else if (sprint < 100 && sneak === true) {
            sprint++;
        }
        if (sneak === true) {
            speed = speed / 2;
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
    let sdx = playerX - enemyX;
    let sdy = playerY - enemyY;
    let sdist = Math.sqrt(sdx * sdx + sdy * sdy);
    checkTimer++;
    if (checkTimer >= 300) {
        checkTimer = 0;
        hidden = sneak;
    }
    if (hidden === false || sdist < 50) {
        lastSeenX = playerX;
        lastSeenY = playerY;
    }
    let IsCol = Math.floor(lastSeenX / 50);
    let IsRow = Math.floor(lastSeenY / 50);
    let enCol = Math.floor(enemyX / 50);
    let enRow = Math.floor(enemyY / 50);
    if (IsCol === enCol && IsRow === enRow && hidden === true && sdist >= 50) {
        let rc = 0;
        let rr = 0;
        while (map[rr][rc] !== 0) {
            rc = Math.floor(Math.random() * map[0].length);
            rr = Math.floor(Math.random() * map.length);
        }
        lastSeenX = rc * 50 + 25;
        lastSeenY = rr * 50 + 25;
    }
    let distGrid = [];
    for (let y = 0; y < map.length; y++) {
        distGrid[y] = [];
        for (let x = 0; x < map[y].length; x++) {
            distGrid[y][x] = 999;
        }
    }
    let pCol = Math.floor(lastSeenX / 50);
    let pRow = Math.floor(lastSeenY / 50);
    distGrid[pRow][pCol] = 0;
    let queue = [[pRow, pCol]];
    while (queue.length > 0) {
        let cur = queue.shift();
        let r = cur[0];
        let c = cur[1];
        let neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
        for (let n = 0; n < 4; n++) {
            let nr = neighbors[n][0];
            let nc = neighbors[n][1];
            if (map[nr][nc] === 0 && distGrid[nr][nc] === 999) {
                distGrid[nr][nc] = distGrid[r][c] + 1;
                queue.push([nr, nc]);
            }
        }
    }
    let eCol = Math.floor(enemyX / 50);
    let eRow = Math.floor(enemyY / 50);
    let targetX = lastSeenX;
    let targetY = lastSeenY;
    let best = distGrid[eRow][eCol];
    let eNeighbors = [[eRow - 1, eCol], [eRow + 1, eCol], [eRow, eCol - 1], [eRow, eCol + 1]];
    for (let n = 0; n < 4; n++) {
        let nr = eNeighbors[n][0];
        let nc = eNeighbors[n][1];
        if (distGrid[nr][nc] < best) {
            best = distGrid[nr][nc];
            targetX = nc * 50 + 25;
            targetY = nr * 50 + 25;
        }
    }
    let tdx = targetX - enemyX;
    let tdy = targetY - enemyY;
    let tdist = Math.sqrt(tdx * tdx + tdy * tdy) + 0.0000001;
    let edx = playerX - enemyX;
    let edy = playerY - enemyY;
    let edist = Math.sqrt(edx * edx + edy * edy) + 0.0000001;
    let newEX = enemyX + tdx / tdist * enemySpeed;
    let newEY = enemyY + tdy / tdist * enemySpeed;
    let eColX = Math.floor(newEX / 50);
    let eRowX = Math.floor(enemyY / 50);
    if (map[eRowX][eColX] === 0) { enemyX = newEX; }
    let eColY = Math.floor(enemyX / 50);
    let eRowY = Math.floor(newEY / 50);
    if (map[eRowY][eColY] === 0) { enemyY = newEY; }
    if (edist < 15) {
        hidden = false;
        checkTimer = 0;
        lastSeenX = 75;
        lastSeenY = 75;
        enemyX = 475;
        enemyY = 475;
        playerX = 75;
        playerY = 75;
        sprint = 100;
    }
    draw();
    requestAnimationFrame(update);
    speed = 0.4;
}
update();

