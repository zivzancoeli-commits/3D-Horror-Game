# 3D Horror Game

## How it works
It's ran as 2D but it creates the illusion of 3D using a trick called raycasting. To look at it do F12 and type "showMap = true;" and you'll see the player, rays, and walls. This is what Doom used and what it does is it sends a ray out in multiple directions taking small steps and each step it checks if it's in a wall or not. If it's in a wall it goes back a step and says that's the distance, if it isn't in a wall then it keeps walking forward. Each ray draws a small strip/rectangle which its size is based on the distance the ray traveled and another thing called lookOffset. Look offset is what makes it so it looks like you can look up and down. The lights, enemy, key, and door are all draw separately but use an x and y comparison to see if there's any walls in the way. Their'a map generation that is random each time so if you reload then you'll notice the map is different.

## How to play it
1. Open https://zivzancoeli-commits.github.io/3D-Horror-Game/
2. Use WASD or arrows to move, shift to sneak, and control to sprint
3. Find the key then go to the door which is the opposite side of the map
4. You won!

## What it has
- Map Generation
- WASD/Arrows Movement
- Sprinting (control)
- Crounching (shift)
- An enemy
- Flickering Lights
- Jump Scares
- Player Settings
- Game Settings

## What I want to add
- Textures
- Sounds
- A main menu
- Configurable map generation
