class Maze
{

  // Выбор карты для уровня

  constructor(map, tileSize)
  {
    this.grid = map;
    this.tileSize = tileSize;
    this.rows = map.length;
    this.cols = map[0].length;
  }

  // отрисовка лабиринта | rysowanie labiryntu 
  
  draw(ctx) {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 1) {
                    ctx.fillStyle = "black"; // Стены [cite: 80]
                } else {
                    ctx.fillStyle = "white"; // Проходы
                }
                ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
    }

}
