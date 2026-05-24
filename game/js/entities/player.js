class Player {
    constructor(x, y) {
        // Позиция на сетке и физические координаты | Pozycja na siatce i współrzędne fizyczne
        this.gridX = x; 
        this.gridY = y;
        this.x = x * tileSize;
        this.y = y * tileSize;

        this.lastMoveX = 0; 
        this.lastMoveY = 0;

        // Состояние здоровья | Stan zdrowia
        this.hp = PLAYER_CONFIG.MAX_HP;

        // Логика реакции на урон | Logika reakcji na obrażenia
        this.hasReceivedFirstDamage = false; 
        this.waitingForSafeMoment = false;   
        this.safeTimeElapsed = 0;            
        this.firstDamageReactionDone = false; 
        this.knockbackTimer = 0;

        // Инициализация графики | Inicjalizacja grafiki
        this.sprite = new Image();
        this.sprite.src = PLAYER_CONFIG.SPRITE_PATH; 
        
        // Состояние анимации | Stan animacji
        this.facing = 'down';  
        this.currentFrame = 0;
        this.frameTimer = 0;   

        // ну там чисто для зроку
        this.visionRadius = 400; 
        this.missingEye = false;
    }

    // Проверка движения | Sprawdzanie ruchu
    get isMoving() {
        return this.x !== this.gridX * tileSize || this.y !== this.gridY * tileSize;
    }

    // Отдача при ударе | Odrzut
    applyKnockback(enemyGridX, enemyGridY, maze) {
        this.knockbackTimer = 400;
        let dx = Math.sign(this.gridX - enemyGridX);
        let dy = Math.sign(this.gridY - enemyGridY);
        if (dx === 0 && dy === 0) dy = 1;

        for (let i = 0; i < 2; i++) {
            const nextX = this.gridX + dx;
            const nextY = this.gridY + dy;
            if (maze.isFreeCell(nextX, nextY)) {
                this.gridX = nextX;
                this.gridY = nextY;
            } else break;
        }
    }

    // Обновление логики и анимации | Aktualizacja logiki i animacji
    update(dt) {
        if (this.hp <= 0) return;
        if (this.knockbackTimer > 0) this.knockbackTimer -= dt * 1000;

        const targetX = this.gridX * tileSize;
        const targetY = this.gridY * tileSize;
        const step = PLAYER_CONFIG.SPEED * dt;

        // Движение | Ruch
        if (this.x < targetX) this.x = Math.min(this.x + step, targetX);
        else if (this.x > targetX) this.x = Math.max(this.x - step, targetX);
        
        if (this.y < targetY) this.y = Math.min(this.y + step, targetY);
        else if (this.y > targetY) this.y = Math.max(this.y - step, targetY);

        if (this.isMoving) {
            this.frameTimer += dt;
            if (this.frameTimer >= PLAYER_CONFIG.ANIM_SPEED) {
                this.frameTimer = 0;
                this.currentFrame = (this.currentFrame + 1) % 3; 
            }
        } else {
            this.currentFrame = 0;
            this.frameTimer = 0;
        }

        this.checkFirstDamageReaction(dt, enemies);
    }

    checkFirstDamageReaction(dt, enemies) {
        if (this.firstDamageReactionDone || !this.waitingForSafeMoment) return;

        if (enemies.every(e => e.state === 'patrol')) {
            this.safeTimeElapsed += dt;
            if (this.safeTimeElapsed >= 2.5) { 
                UI.showMessage(t.messages.first_damage_reaction);                    
                this.firstDamageReactionDone = true;
                this.waitingForSafeMoment = false; 
            }
        } else {
            this.safeTimeElapsed = 0;
        }
    }

    // Отрисовка | Rysowanie
    draw(ctx) {
        const rows = { 'down': 0, 'up': 1, 'left': 2, 'right': 3 };
        const row = rows[this.facing] || 0;

        const sourceX = this.currentFrame * PLAYER_CONFIG.FRAME_WIDTH;
        const sourceY = row * PLAYER_CONFIG.FRAME_HEIGHT;

        if (this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(
                this.sprite,
                sourceX, sourceY, PLAYER_CONFIG.FRAME_WIDTH, PLAYER_CONFIG.FRAME_HEIGHT, 
                this.x, this.y, tileSize, tileSize
            );
        }
    }

    // Ввод направления | Kierunek wejściowy
    move(dx, dy, maze, enemies) {
        if (this.knockbackTimer > 0) return;

        // Поворот спрайта | Obrót sprite'a
        if (dx === 1) this.facing = 'right';
        else if (dx === -1) this.facing = 'left';
        else if (dy === 1) this.facing = 'down';
        else if (dy === -1) this.facing = 'up';

        if (!this.isMoving) {
            const nextX = this.gridX + dx;
            const nextY = this.gridY + dy;

            const isWall = maze.isWall(nextX, nextY);
            const isEnemyThere = enemies.some(e => {
                if (e.gridX === nextX && e.gridY === nextY) return true;
                const eGridL = Math.floor(e.x / tileSize), eGridR = Math.floor((e.x + tileSize - 1) / tileSize);
                const eGridT = Math.floor(e.y / tileSize), eGridB = Math.floor((e.y + tileSize - 1) / tileSize);
                return nextX >= eGridL && nextX <= eGridR && nextY >= eGridT && nextY <= eGridB;
            });

            if (!isWall && !isEnemyThere) {
                this.gridX = nextX;
                this.gridY = nextY;
                this.lastMoveX = dx;
                this.lastMoveY = dy;
            }
        }
    }
}