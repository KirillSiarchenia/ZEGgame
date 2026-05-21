class RoomManager {
    constructor() {
        this.room = null;
        this.view = "center";
        this.initDOM();
    }

    initDOM() {
        this.navLeft = document.getElementById('nav-left');
        this.navRight = document.getElementById('nav-right');
        this.navDown = document.getElementById('nav-down');

        if (!this.navLeft) return;

        this.navLeft.onclick = () => {
            if (UI.selectedItemForUse || UI.isMessageActive || UI.isPaused) return;
            if (this.view === "center") this.view = "left";
            else if (this.view === "right") this.view = "center";
            this.updateArrows();
        };

        this.navRight.onclick = () => {
            if (UI.selectedItemForUse || UI.isMessageActive || UI.isPaused) return;
            if (this.view === "center") this.view = "right";
            else if (this.view === "left") this.view = "center";
            this.updateArrows();
        };

        this.navDown.onclick = () => {
            if (UI.selectedItemForUse || UI.isMessageActive || UI.isPaused) return;
            exitRoom();
        };
    }

    updateArrows() {
        if (!this.navLeft) return;
        
        if (this.view === "center") {
            this.navLeft.style.display = "block";
            this.navRight.style.display = "block";
            this.navDown.style.display = "block";
        } else if (this.view === "left") {
            this.navLeft.style.display = "none";
            this.navRight.style.display = "block"; 
            this.navDown.style.display = "none";
        } else if (this.view === "right") {
            this.navLeft.style.display = "block"; 
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
            if (o.visible === false) return;

            let stateData = o.stateImages ? o.stateImages[o.state] : null;
            
            // Теперь берем размеры строго из базовых настроек объекта
            let currentW = o.w || 100;
            let currentH = o.h || 100;

            const centerX = o.x * w;
            const centerY = o.y * h;
            const dw = currentW * (w / 1920);
            const dh = currentH * (h / 1080);
            const dx = centerX - dw / 2;
            const dy = centerY - dh / 2;

            if (stateData && typeof stateData === 'object') {
                const img = getCachedImage(stateData.sheet);
                if (img.complete) {
                    const fw = stateData.frameWidth || o.frameWidth || o.w || 200;
                    const fh = stateData.frameHeight || o.frameHeight || o.h || fw;
                    
                    ctx.drawImage(
                        img,
                        stateData.index * fw, 0, fw, fh, 
                        dx, dy, dw, dh                  
                    );
                    return; 
                }
            }

            if (typeof stateData === 'string' || o.imagePath) {
                const path = typeof stateData === 'string' ? stateData : o.imagePath;
                const img = getCachedImage(path);
                if (img.complete) {
                    ctx.drawImage(img, dx, dy, dw, dh);
                    return;
                }
            }

            if (o.spriteIndex !== undefined && itemAssets.sheet.complete) {
                const sz = 100;
                ctx.drawImage(itemAssets.sheet, o.spriteIndex * sz, 0, sz, sz, dx, dy, dw, dh);
            } 
            else {
                ctx.fillStyle = o.color || "white";
                ctx.fillRect(dx, dy, dw, dh);
            }
        });
    }

    getClickTarget(mx, my, w, h) {
        const v = this.room.views[this.view];
        if (!v || !v.objects) return null;

        for (let i = v.objects.length - 1; i >= 0; i--) {
            const o = v.objects[i];
            if (o.visible === false) continue;

            let currentW = o.w || 100;
            let currentH = o.h || 100;

            const dw = currentW * (w / 1920);
            const dh = currentH * (h / 1080);
            const dx = o.x * w - dw / 2;
            const dy = o.y * h - dh / 2;

            if (mx > dx && mx < dx + dw && my > dy && my < dy + dh) {
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