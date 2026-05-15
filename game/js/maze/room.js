class RoomManager {
    constructor() {
        this.room = null;
        this.view = "center";
        this.initDOM(); // Инициализация HTML кнопок
    }

    initDOM() {
        this.navLeft = document.getElementById('nav-left');
        this.navRight = document.getElementById('nav-right');
        this.navDown = document.getElementById('nav-down');

        if (!this.navLeft) return;

        // Поворот влево
        this.navLeft.onclick = () => {
            if (UI.selectedItemForUse || UI.isMessageActive || UI.isPaused) return;
            if (this.view === "center") this.view = "left";
            else if (this.view === "right") this.view = "center";
            this.updateArrows();
        };

        // Поворот вправо
        this.navRight.onclick = () => {
            if (UI.selectedItemForUse || UI.isMessageActive || UI.isPaused) return;
            if (this.view === "center") this.view = "right";
            else if (this.view === "left") this.view = "center";
            this.updateArrows();
        };

        // Выход из комнаты
        this.navDown.onclick = () => {
            if (UI.selectedItemForUse || UI.isMessageActive || UI.isPaused) return;
            exitRoom(); // Это глобальная функция из твоего кода
        };
    }

    updateArrows() {
        if (!this.navLeft) return;
        
        // Включаем/отключаем нужные кнопки в зависимости от того, куда смотрим
        if (this.view === "center") {
            this.navLeft.style.display = "block";
            this.navRight.style.display = "block";
            this.navDown.style.display = "block";
        } else if (this.view === "left") {
            this.navLeft.style.display = "none";
            this.navRight.style.display = "block"; // Правая возвращает обратно в центр
            this.navDown.style.display = "none";
        } else if (this.view === "right") {
            this.navLeft.style.display = "block"; // Левая возвращает обратно в центр
            this.navRight.style.display = "none";
            this.navDown.style.display = "none";
        }
    }

    enter(roomID, x, y) {
        this.view = "center";

        if (roomsData && roomsData[roomID]) {
            this.room = roomsData[roomID]; 
            
            for (let viewKey in this.room.views) {
                const view = this.room.views[viewKey];
                if (view.objects) {
                    view.objects = view.objects.map(obj => {
                        const libData = ObjectsLibrary[obj.id];
                        return (libData) ? { ...libData, ...obj } : obj;
                    });
                }
            }
        }
        this.updateArrows();
    }

    draw(ctx, w, h) {
        if (!this.room || !this.room.views[this.view]) return;
        const v = this.room.views[this.view];
        
        ctx.fillStyle = v.bg || "#000";
        ctx.fillRect(0, 0, w, h);

        v.objects.forEach(o => {
            if (o.visible !== false) { 
                ctx.fillStyle = o.color || "white";
                ctx.fillRect(o.rx * w, o.ry * h, o.rw * w, o.rh * h);
            }
        });
        
        // Больше никакого кода для рисования UI поверх комнаты на канвасе!
    }

    // Обработка кликов только по ПРЕДМЕТАМ в комнате (стрелки обрабатывает HTML)
    getClickTarget(mx, my, w, h) {
        const v = this.room.views[this.view];
        if (!v || !v.objects) return null;

        for (let o of v.objects) {
            if (o.visible !== false &&
                mx > o.rx * w && mx < (o.rx + o.rw) * w && 
                my > o.ry * h && my < (o.ry + o.rh) * h) {
                return { type: 'OBJECT', data: o };
            }
        }
        return null;
    }

    handleMouseClick(mx, my, w, h) {
        const target = this.getClickTarget(mx, my, w, h);
        
        if (!target) {
            if (UI.selectedItemForUse) return "MISSED_UI";
            return null;
        }

        if (target.type === 'OBJECT') {
            if (UI.selectedItemForUse) {
                this.handleObjectClick(target.data);
                return "ITEM_USED";
            }
            if (ObjectLogic[target.data.logicType]) {
                ObjectLogic[target.data.logicType](target.data);
            }
            return "OBJECT_CLICKED";
        }

        return null;
    }

    handleObjectClick(obj) {
        if (!UI.selectedItemForUse) return;

        const item = UI.selectedItemForUse;
        let finalMessage = t.messages.not_applicable;
        let shouldDelete = false;

        if (typeof item.action === "function") {
            const response = item.action(obj);

            if (response && typeof response === "object") {
                finalMessage = response.message || "Код говно";
                shouldDelete = response.deleteItem || false;

                if (shouldDelete) {
                    Inventory.removeItem(item.instanceId);
                    UI.updateConsumables(Inventory.items);
                    UI.renderInventory(Inventory.items);
                }
            } 
        }

        UI.showMessage(finalMessage);
        UI.selectedItemForUse = null;
        UI.resetCursor();
    }
}