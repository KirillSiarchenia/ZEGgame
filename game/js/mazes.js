export class Maze
{

  // выбор карты для уровня | wybór mapy dla poziomu
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
                    ctx.fillStyle = "black"; 
                } else {
                    ctx.fillStyle = "white"; 
                }
                ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
  }

  // проверка стен | sprawdzanie ścian
  isWall(x, y) {
        if (y < 0 || y >= this.rows || x < 0 || x >= this.cols) {
            return true; 
        }
        return this.grid[y][x] === 1;
    }

}
