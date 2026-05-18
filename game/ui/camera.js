class Camera {
    // инициализация камеры и ее мертвой зоны | inicjalizacja kamery i jej martwej strefy
    constructor(width, height, mapWidth, mapHeight) {
        this.x = 0;
        this.y = 0;
        this.width = width; 
        this.height = height; 
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight; 

        this.deadZone = {
            width: 300, 
            height: 200
        };
    }

    // жесткое центрирование камеры на объекте (игроке) | sztywne centrowanie kamery na obiekcie (graczu)
    focusOn(playerX, playerY) {
        this.x = playerX - this.width / 2;
        this.y = playerY - this.height / 2;
    }

    // отрисовка отладочной рамки мертвой зоны | rysowanie ramki debugowania martwej strefy
    drawDebug(ctx) {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.lineWidth = 2;
        
        const x = (this.width - this.deadZone.width) / 2;
        const y = (this.height - this.deadZone.height) / 2;
        
        ctx.strokeRect(x, y, this.deadZone.width, this.deadZone.height);
    }

    // плавное обновление позиции камеры, если игрок выходит за мертвую зону | płynna aktualizacja pozycji kamery, jeśli gracz wychodzi poza martwą strefę
    update(playerX, playerY) {
        const edgeLeft = this.x + (this.width / 2) - (this.deadZone.width / 2);
        const edgeRight = this.x + (this.width / 2) + (this.deadZone.width / 2);
        const edgeTop = this.y + (this.height / 2) - (this.deadZone.height / 2);
        const edgeBottom = this.y + (this.height / 2) + (this.deadZone.height / 2);

        if (playerX > edgeRight) {
            this.x += playerX - edgeRight;
        }
        else if (playerX < edgeLeft) {
            this.x -= edgeLeft - playerX;
        }

        if (playerY > edgeBottom) {
            this.y += playerY - edgeBottom;
        }
        else if (playerY < edgeTop) {
            this.y -= edgeTop - playerY;
        }
    }

    // применение сдвига камеры к контексту холста | zastosowanie przesunięcia kamery do kontekstu płótna
    apply(ctx) {
        ctx.translate(-Math.floor(this.x), -Math.floor(this.y));
    }
}