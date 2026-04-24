const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const maze = new Maze(maps.map1, tileSize);

canvas.width = maze.cols * tileSize;
canvas.height = maze.rows * tileSize;

const player = new Player(9, 0, tileSize);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    maze.draw(ctx);
    player.draw(ctx);

    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    let dx = 0, dy = 0;

    if (key === "arrowup" || key === "w" || key === "ц") dy = -1;
    if (key === "arrowdown" || key === "s" || key === "ы") dy = 1;
    if (key === "arrowleft" || key === "a" || key === "ф") dx = -1;
    if (key === "arrowright" || key === "d" || key === "в") dx = 1;

    player.move(dx, dy, maze); 
});

gameLoop();