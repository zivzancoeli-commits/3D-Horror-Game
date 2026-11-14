let playerX = 75;
let playerY = 75;
let enemyX = 475;
let enemyY = 475;
let lastSeenX = 75;
let lastSeenY = 75;
let enemySpeed = 0.5;
let mapSize = 11;
let playerAngle = 0;
let showMap = false;
let lookOffset = 0;
let speed = 0.4;
let walkSpeed = 0.4;
let sprint = 100
let sneak = false;
let hidden = false;
let checkTimer = 0;
let keyX = 0;
let keyY = 0;
let hasKey = false;
let doorX = 475;
let doorY = 475;
let doorSide = -1;
let time = 0;
let jumpscare = 0;
let winScreen = 0;
let playing = false;
let menu = "main";
let fov = 60;
let mouseSens = 1;
let invertLook = false;
let keyForward = "w";
let keyBack = "s";
let keyLeft = "a";
let keyRight = "d";
let keySneak = "Shift";
let keySprint = "Control";
let waitingFor = "";
let wallTex = document.createElement("canvas");
wallTex.width = 64;
wallTex.height = 64;
let wctx = wallTex.getContext("2d");
wctx.fillStyle = "rgb(170, 170, 30)";
wctx.fillRect(0, 0, 64, 64);
for (let tx = 0; tx < 64; tx+= 8) {
    wctx.fillStyle = "rgb(205, 205, 30)";
    wctx.fillRect(tx, 0, 2, 64);
}
let keys = {};
addEventListener("keydown", function (e) {
    let k = e.key;
    if (k.length === 1) { k = k.toLowerCase(); }
    if (waitingFor !== "") {
        if (k === "Escape") {
            waitingFor = "";
            return;
        }
        if (waitingFor === "forward") { keyForward = k; }
        if (waitingFor === "back") { keyBack = k; }
        if (waitingFor === "left") { keyLeft = k; }
        if (waitingFor === "right") { keyRight = k; }
        if (waitingFor === "sneak") { keySneak = k; }
        if (waitingFor === "sprint") { keySprint = k; }
        waitingFor = "";
        return;
    }
    keys[k] = true;
});
addEventListener("keyup", function (e) {
    let k = e.key;
    if (k.length === 1) { k = k.toLowerCase(); }
    keys[k] = false;
});
addEventListener("mousemove", function (e) {
    if (document.pointerLockElement !== canvas) { return; }
    playerAngle += e.movementX * 0.002 * mouseSens;
});
addEventListener("mousemove", function (e) {
    if (document.pointerLockElement !== canvas) { return; }
    if (invertLook === true) {
        lookOffset += e.movementY * mouseSens;
    } else {
        lookOffset -= e.movementY * mouseSens;
    }
});
function generateMap() {
    let grid = [];
    for (let row = 0; row < mapSize; row++) {
        grid[row] = [];
        for (let col = 0; col < mapSize; col++) {
            grid[row][col] = 1;
        }
    }
    grid[1][1] = 0;
    let stack = [[1, 1]];
    let dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];

    while (stack.length > 0) {
        let cur = stack[stack.length - 1];
        let cr = cur[0];
        let cc = cur[1];
        let options = [];

        for (let d = 0; d < dirs.length; d++) {
            let nr = cr + dirs[d][0];
            let nc = cc + dirs[d][1];
            if (nr >= 1 && nr <= mapSize - 2 && nc >= 1 && nc <= mapSize - 2 && grid[nr][nc] === 1) {
                options.push([nr, nc]);
            }
        }
        if (options.length === 0) {
            stack.pop();
        } else {
            let pick = options[Math.floor(Math.random() * options.length)];
            let nr = pick[0];
            let nc = pick[1];
            grid[(cr + nr) / 2][(cc + nc) / 2] = 0;
            grid[nr][nc] = 0;
            stack.push([nr, nc]);
        }
    }
    let connections = [];
    for (let r = 1; r <= mapSize - 2; r++) {
        for (let c = 1; c <= mapSize - 2; c++) {
            if ((r + c) % 2 === 1 && grid[r][c] === 1) {
                connections.push([r, c]);
            }
        }
    }
    let openings = Math.min(3, connections.length);
    for (let i = 0; i < openings; i++) {
        let index = Math.floor(Math.random() * connections.length);
        let cell = connections.splice(index, 1)[0];
        grid[cell[0]][cell[1]] = 0;
    }
    return grid;
}
let map = [];
let sideSteps = [[0, -1], [-1, 0], [0, 1], [1, 0]];
let doorCol = Math.floor(doorX / 50);
let doorRow = Math.floor(doorY / 50);

function placeKey() {
    let kc = 0;
    let kr = 0;
    while (map[kr][kc] !== 0 || Math.abs(kr - 1) + Math.abs(kc - 1) < 4 || Math.abs(kr - (mapSize - 2)) + Math.abs(kc -  (mapSize - 2)) < 4) {
        kc = Math.floor(Math.random() * map[0].length);
        kr = Math.floor(Math.random() * map.length);
    }
    keyX = kc * 50 + 25;
    keyY = kr * 50 + 25;
    hasKey = false;
}
function startLevel() {
    let end = mapSize - 2;
    doorX = end * 50 + 25;
    doorY = end * 50 + 25;
    doorCol = end;
    doorRow = end;
    map = generateMap();
    doorSide = -1;
    let firstSide = Math.floor(Math.random() * 4);
    for (let attempt = 0; attempt < 4; attempt++) {
        let side = (firstSide + attempt) % 4;
        let wallCol = doorCol + sideSteps[side][0];
        let wallRow = doorRow + sideSteps[side][1];
        if (map[wallRow][wallCol] === 1) {
            doorSide = side;
            break;
        }
    }
    placeKey();
    playerX = 75; 
    playerY = 75;
    enemyX = doorX;
    enemyY = doorY;
    hidden = false;
    checkTimer = 0;
    lastSeenX = 75;
    lastSeenY = 75;
    sprint = 100;
}
startLevel();
let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
function drawButton(x, y, w, h, label) {
    ctx.fillStyle = "rgb(80, 20, 20)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgb(220, 220, 220)";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h / 2 + 8);
}
function clicked(mx, my, x, y, w, h) {
    return mx >= x && mx <= x + w && my >= y && my <= y + h;
}
function goToMenu() {
    playing = false;
    menu = "main";
    winScreen = 0;
    jumpscare = 0;
    document.exitPointerLock();
}
canvas.addEventListener("click", function (e) {
    if (playing === true) {
        canvas.requestPointerLock();
        return;
    }
    let rect = canvas.getBoundingClientRect();
    let mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    let my = (e.clientY - rect.top) * (canvas.height / rect.height);
    if (menu === "main") {
        if (clicked(mx, my, 220, 220, 200, 50)) {
            menu = "setup";
        }
        if (clicked(mx, my, 220, 290, 200, 50)) {
            menu = "controls";
        }
    } else if (menu === "setup") {
        if (clicked(mx, my, 180, 110, 60, 36)) {
            enemySpeed -= 0.1;
            if (enemySpeed < 0.1) { enemySpeed = 0.1; }
            enemySpeed = Math.round(enemySpeed * 10) / 10;
        }
        if (clicked(mx, my, 400, 110, 60, 36)) {
            enemySpeed += 0.1;
            if (enemySpeed > 2.5) { enemySpeed = 2.5; }
            enemySpeed = Math.round(enemySpeed * 10) / 10;
        }
        if (clicked(mx, my, 180, 175, 60, 36)) {
            mapSize -= 4;
            if (mapSize < 7) { mapSize = 7; }
        }
        if (clicked(mx, my, 400, 175, 60, 36)) {
            mapSize += 4;
            if (mapSize > 15) { mapSize = 15; }
        }
        if (clicked(mx, my, 180, 240, 60, 36)) {
            walkSpeed -= 0.1;
            if (walkSpeed < 0.2) { walkSpeed = 0.2; }
            walkSpeed = Math.round(walkSpeed * 10) / 10;
        }
        if (clicked(mx, my, 400, 240, 60, 36)) {
            walkSpeed += 0.1;
            if (walkSpeed > 10) { walkSpeed = 10; }
            walkSpeed = Math.round(walkSpeed * 10) / 10;
        }
        if (clicked(mx, my, 180, 305, 60, 36)) {
            fov -= 5;
            if (fov < 40) { fov = 40; }
        }
        if (clicked(mx, my, 400, 305, 60, 36)) {
            fov += 5;
            if (fov > 120) { fov = 120; }
        }
        if (clicked(mx, my, 120, 360, 170, 50)) {
            startLevel();
            playing = true;
            canvas.requestPointerLock();
        }
        if (clicked(mx, my, 340, 360, 170, 50)) {
            menu = "main";
        }
    } else if (menu === "controls") {
        if (clicked(mx, my, 120, 50, 400, 34)) { waitingFor = "forward"; }
        if (clicked(mx, my, 120, 90, 400, 34)) { waitingFor = "back"; }
        if (clicked(mx, my, 120, 130, 400, 34)) { waitingFor = "left"; }
        if (clicked(mx, my, 120, 170, 400, 34)) { waitingFor = "right"; }
        if (clicked(mx, my, 120, 210, 400, 34)) { waitingFor = "sneak"; }
        if (clicked(mx, my, 120, 250, 400, 34)) { waitingFor = "sprint"; }
        if (clicked(mx, my, 180, 310, 60, 36)) {
            mouseSens -= 0.1;
            if (mouseSens < 0.2) { mouseSens = 0.2; }
            mouseSens = Math.round(mouseSens * 10) / 10;
        }
        if (clicked(mx, my, 400, 310, 60, 36)) {
            mouseSens += 0.1;
            if (mouseSens > 3) { mouseSens = 3;}
            mouseSens = Math.round(mouseSens * 10) / 10;
        }
        if (clicked(mx, my, 120, 360, 180, 50)) {
            if (invertLook === true) { invertLook = false; } else { invertLook = true; }
        }
        if (clicked(mx, my, 340, 360, 180, 50)) {
            waitingFor = "";
            menu = "main";
        }
    }
});
function draw() {
    if (lookOffset > 500) {
        lookOffset = 500;
    } else if (lookOffset < -500) {
        lookOffset = -500;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let cielGrad = ctx.createLinearGradient(0, 0, 0, canvas.height / 2 + lookOffset);
    cielGrad.addColorStop(0, "rgb(70, 70, 55)");
    cielGrad.addColorStop(1, "rgb(3, 3, 3)");
    ctx.fillStyle = cielGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2 + lookOffset);
    let horizon = canvas.height / 2 + lookOffset;
    let floorGrad = ctx.createLinearGradient(0, horizon, 0, canvas.height);
    floorGrad.addColorStop(0, "rgb(3, 3, 3)");
    floorGrad.addColorStop(1, "rgb(60, 55, 35)");
    ctx.fillStyle = floorGrad;
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
    let fovRad = fov * Math.PI / 180;
    let wallDistances = [];
    for (let i = 0; i < 80; i = i + 1) {
        let rayX = playerX;
        let rayY = playerY;
        let cell = 0;
        let steps = 0;
        let rayAngle = playerAngle - fovRad / 2 + i * (fovRad / 80);
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
        let wallHeight = Math.round(5000 / distance);
        let shade = 80 - distance / 2;
        if (shade < 15) { shade = 15; }
        let stripWidth = 8;
        let hitCol = Math.floor(rayX / 50);
        let hitRow = Math.floor(rayY / 50);
        let beforeX = rayX - Math.cos(rayAngle);
        let beforeY = rayY - Math.sin(rayAngle);
        let beforeCol = Math.floor(beforeX / 50);
        let beforeRow = Math.floor(beforeY / 50)
        let isDoor = false;
        if (doorSide !== -1) {
            let wallCol = doorCol + sideSteps[doorSide][0];
            let wallRow = doorRow + sideSteps[doorSide][1];
            let along = beforeX - doorX;
            if (doorSide === 1 || doorSide === 3) {
                along = beforeY - doorY;
            }
            if (hitCol === wallCol && hitRow === wallRow && beforeCol === doorCol && beforeRow === doorRow && Math.abs(along) < 5) {
                isDoor = true;
            }
        }
        let stripX = i * stripWidth;
        let stripY = Math.round(canvas.height / 2 + lookOffset - wallHeight / 2);
        if (isDoor === true) {
            ctx.fillStyle = "rgb(100, 60, 20)";
            ctx.fillRect(stripX, stripY, stripWidth, wallHeight);
        } else {
            let texPos;
            if (beforeCol !== hitCol) {
                texPos = beforeY - Math.floor(beforeY / 50) * 50;
            } else {
                texPos = beforeX - Math.floor(beforeX / 50) * 50;
            }
            let texX = Math.floor(texPos / 50 * wallTex.width);
            if (texX < 0) { texX = 0; }
            if (texX > wallTex.width - 1) { texX = wallTex.width - 1; }
            ctx.drawImage(wallTex, texX, 0, 1, wallTex.height, stripX, stripY, stripWidth, wallHeight);
            let dark = 0.5 + distance / 200;
            if (dark > 0.97) { dark = 0.97; }
            ctx.fillStyle = "rgba(3, 3, 3, " + dark + ")";
            ctx.fillRect(stripX, stripY, stripWidth, wallHeight);
        }
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
                let screenX = (lightAngle + fovRad / 2) / fovRad * canvas.width;
                let strip = Math.floor(screenX / 8);
                if (strip >= 0 && strip < 80 && lightDistance < wallDistances[strip]) {
                    let flicker = 0.75 + Math.sin(time * 0.2 + x * 2 + y * 3) * 0.25;
                    ctx.fillStyle = "rgb(" + 255 * bright * flicker + ", " + 250 * bright * flicker + ", " + 200 * bright * flicker+ ")";
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
    let screenX = (enemyAngle + fovRad / 2) / fovRad * canvas.width;
    let strip = Math.floor(screenX / 8);
    if (strip >= 0 && strip < 80 && enemyDistance < wallDistances[strip]) {
        ctx.fillStyle = "rgb(" + 120 * bright + ", 0, 0)";
        let wobble = Math.sin(time * 0.2) * enemyHeight * 0.05;
        let stretch = Math.sin(time * 0.5) * enemyHeight * 0.03;
        ctx.fillRect(screenX - enemyHeight / 4 + wobble, enemyTop - stretch, enemyHeight / 2, enemyHeight + stretch);
    }
    let items = [];
    if (hasKey === false) {
        items.push([keyX, keyY, 255, 220, 0]);
    }
    for (let k = 0; k < items.length; k++) {
        let ix = items[k][0] - playerX;
        let iy = items[k][1] - playerY;
        let iDist = Math.sqrt(ix * ix + iy * iy) + 0.0000001;
        let iAngle = Math.atan2(iy, ix) - playerAngle;
        while (iAngle > Math.PI) { iAngle -= Math.PI * 2; }
        while (iAngle < -Math.PI) { iAngle += Math.PI * 2; }
        let iScreenX = (iAngle + fovRad / 2) / fovRad * canvas.width;
        let iStrip = Math.floor(iScreenX / 8);
        let iSize = 5000 / iDist;
        if (iStrip >= 0 && iStrip < 80 && iDist < wallDistances[iStrip]) {
            ctx.fillStyle = "rgb(" + items[k][2] + ", " + items[k][3] + ", " + items[k][4] + ")";
            let bob = Math.sin(time * 0.08) * iSize * 0.05;
            let glow = 0.2 + Math.sin(time * 0.1) * 0.1;
            ctx.fillStyle = "rgba(255, 220, 0, " + glow + ")";
            ctx.fillRect(iScreenX - iSize / 8, horizon + iSize / 4 - iSize / 16 + bob, iSize / 4, iSize / 4);
            ctx.fillStyle = "rgb(" + items[k][2] + ", " + items[k][3] + ", " + items[k][4] + ")";
            ctx.fillRect(iScreenX - iSize / 16, horizon + iSize / 4 + bob, iSize / 8, iSize / 8);
        }
    }
    let fear = 1 - enemyDistance / 250;
    if (fear < 0) { fear = 0; }
    ctx.fillStyle = "rgba(0, 0, 0, " + fear * 0.6 + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(150, 0, 0, " + fear * 0.25 + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (jumpscare > 0) {
        let shakeX = Math.random() * 30 - 15;
        let shakeY = Math.random() * 30 - 15;
        let cx = canvas.width / 2 + shakeX;
        let cy = canvas.height / 2 + shakeY;
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgb(120, 0, 0)";
        ctx.fillRect(cx - 150, cy - 200, 300, 400);
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillRect(cx - 90, cy - 120, 50, 30);
        ctx.fillRect(cx + 40, cy - 120, 50, 30);
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(cx - 100, cy + 40, 200, 80);
    }
    if (winScreen > 0) {
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgb(255, 220, 0)";
        ctx.font = "48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("You escaped!", canvas.width / 2, canvas.height / 2);
    }
}
function update() {
    if (playing === false) {
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (menu === "main") {
            ctx.fillStyle = "rgb(180, 0, 0)";
            ctx.font = "48px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Horror Game", canvas.width / 2, 140);
            drawButton(220, 220, 200, 50, "Play");
            drawButton(220, 290, 200, 50, "Settings");
        } else if (menu === "setup") {
            ctx.fillStyle = "rgb(180, 0, 0)";
            ctx.font = "36px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Game Settings", canvas.width / 2, 50);
            ctx.fillStyle = "rgb(200, 200, 200)";
            ctx.font = "20px sans-serif";
            ctx.fillText("Enemy speed: " + enemySpeed, canvas.width / 2, 95);
            drawButton(180, 110, 60, 36, "-");
            drawButton(400, 110, 60, 36, "+");
            ctx.fillText("Map size: " + mapSize + " x " + mapSize, canvas.width / 2, 160);
            drawButton(180, 175, 60, 36, "-");
            drawButton(400, 175, 60, 36, "+");
            ctx.fillText("Player speed: " + walkSpeed, canvas.width / 2, 225);
            drawButton(180, 240, 60, 36, "-");
            drawButton(400, 240, 60, 36, "+");
            ctx.fillText("FOV: " + fov, canvas.width / 2, 290);
            drawButton(180, 305, 60, 36, "-");
            drawButton(400, 305, 60, 36, "+");
            drawButton(120, 360, 170, 50, "Start");
            drawButton(340, 360, 170, 50, "Back");
        } else if (menu === "controls") {
            ctx.fillStyle = "rgb(180, 0, 0)";
            ctx.font = "36px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Controls", canvas.width / 2, 36);
            if (waitingFor === "forward") { drawButton(120, 50, 400, 34, "Forward: press a key"); }
            else { drawButton(120, 50, 400, 34, "Forward: " + keyForward); }
            if (waitingFor === "back") { drawButton(120, 90, 400, 34, "Back: press a key"); }
            else { drawButton(120, 90, 400, 34, "Back: " + keyBack); }
            if (waitingFor === "left") { drawButton(120, 130, 400, 34, "Left: press a key"); }
            else { drawButton(120, 130, 400, 34, "Left: " + keyLeft); }
            if (waitingFor === "right") { drawButton(120, 170, 400, 34, "Right: press a key"); }
            else { drawButton(120, 170, 400, 34, "Right: " + keyRight); }
            if (waitingFor === "sneak") { drawButton(120, 210, 400, 34, "Sneak: press a key"); }
            else { drawButton(120, 210, 400, 34, "Sneak: " + keySneak); }
            if (waitingFor === "sprint") { drawButton(120, 250, 400, 34, "Sprint: press a key"); }
            else { drawButton(120, 250, 400, 34, "Sprint: " + keySprint); }
            ctx.fillStyle = "rgb(200, 200, 200)";
            ctx.font = "20px sans-serif";
            ctx.fillText("Mouse sensitivity: " + mouseSens, canvas.width / 2, 305);
            drawButton(180, 310, 60, 36, "-");
            drawButton(400, 310, 60, 36, "+");
            if (invertLook === true) { drawButton(120, 360, 180, 50, "Invert Y: On"); }
            else { drawButton(120, 360, 180, 50, "Invert Y: Off"); }
            drawButton(340, 360, 180, 50, "Back");
        }
        requestAnimationFrame(update);
        return;
    }
    if (keys["Escape"]) {
        if (document.pointerLockElement === canvas) {
            document.exitPointerLock();
            keys["Escape"] = false;
        } else {
            goToMenu();
            requestAnimationFrame(update);
            return
        }
    }
    if (keys[keySneak]) {
        sneak = true;
    } else {
        sneak = false;
    }
    if (keys[keySprint]) {
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
    if (keys[keyLeft]) {
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
    if (keys[keyRight]) {
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
    if (keys[keyForward]) {
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

    if (keys[keyBack]) {
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
    let kdx = playerX - keyX;
    let kdy = playerY - keyY;
    if (hasKey === false && Math.sqrt(kdx * kdx + kdy * kdy) < 20) {
        hasKey = true;
    }
    let ddx = playerX - doorX;
    let ddy = playerY - doorY;
    if (hasKey === true && Math.sqrt(ddx * ddx + ddy * ddy) < 20) {
        winScreen = 180;
        startLevel();
    } else if (edist < 15) {
        jumpscare = 60;
        startLevel();
    }
    time++;
    if (jumpscare > 0) { jumpscare--; }
    if (winScreen > 0) {
        winScreen--;
        if (winScreen === 0) {
            goToMenu();
            requestAnimationFrame(update);
            return;
        }
    }
    draw();
    requestAnimationFrame(update);
    speed = walkSpeed;
}
update();