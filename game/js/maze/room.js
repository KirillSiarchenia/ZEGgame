class RoomManager {
    constructor() {
        this.room = null;
        this.view = "center";
        this.relNav = {
            left:  { rx: 0,    ry: 0.25, rw: 0.1, rh: 0.5 },
            right: { rx: 0.9,  ry: 0.25, rw: 0.1, rh: 0.5 },
            exit:  { rx: 0.3,  ry: 0.85, rw: 0.4, rh: 0.12 }
        };
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
}

    getBox(key, w, h) {
        const b = this.relNav[key];
        return { x: b.rx * w, y: b.ry * h, w: b.rw * w, h: b.rh * h };
    }

    draw(ctx, w, h) {
        if (!this.room|| !this.room.views[this.view]) return;
        const v = this.room.views[this.view];
        ctx.fillStyle = v.bg || "#000";
        ctx.fillRect(0, 0, w, h);

        v.objects.forEach(o => {
            if (o.visible !== false) { 
                ctx.fillStyle = o.color || "white";
                ctx.fillRect(o.rx * w, o.ry * h, o.rw * w, o.rh * h);
            }
        });

        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        if (this.view === "center") {
            for (let k in this.relNav) {
                const b = this.getBox(k, w, h);
                ctx.fillRect(b.x, b.y, b.w, b.h);
            }
        } else {
            const back = this.view === "left" ? "right" : "left";
            const b = this.getBox(back, w, h);
            ctx.fillRect(b.x, b.y, b.w, b.h);
        }
    }

    getClickTarget(mx, my, w, h) {
        const v = this.room.views[this.view];
        if (!v) return null;

        if (v.objects) {
            for (let o of v.objects) {
                if (o.visible !== false &&
                    mx > o.rx * w && mx < (o.rx + o.rw) * w && 
                    my > o.ry * h && my < (o.ry + o.rh) * h) {
                    return { type: 'OBJECT', data: o };
                }
            }
        }

        if (this.view === "center") {
            const exit = this.getBox("exit", w, h);
            if (this.isIn(mx, my, exit)) return { type: 'EXIT' };

            const left = this.getBox("left", w, h);
            if (this.isIn(mx, my, left)) return { type: 'NAV_LEFT' };

            const right = this.getBox("right", w, h);
            if (this.isIn(mx, my, right)) return { type: 'NAV_RIGHT' };
        } else {
            const left = this.getBox("left", w, h);
            const right = this.getBox("right", w, h);
            if (this.isIn(mx, my, left) || this.isIn(mx, my, right)) return { type: 'NAV_BACK' };
        }

        return null;
    }

    handleMouseClick(mx, my, w, h) {
        const target = this.getClickTarget(mx, my, w, h);
        if (!target) return null;

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

        if (UI.selectedItemForUse) return "MISSED_UI";

        if (target.type === 'EXIT') return "EXIT";
        
        if (target.type === 'NAV_LEFT') { this.view = "left"; return "NAVIGATED"; }
        if (target.type === 'NAV_RIGHT') { this.view = "right"; return "NAVIGATED"; }
        if (target.type === 'NAV_BACK') { this.view = "center"; return "NAVIGATED"; }

        return null;
    }


    handleObjectClick(obj) {
    if (!UI.selectedItemForUse) return;

    const item = UI.selectedItemForUse;
    let finalMessage = "Это здесь неприменимо."; 
    let shouldDelete = false; 

    if (item.useOnTarget === obj.id || item.useOnTarget === obj.id) {
        finalMessage = "Предмет использован.";
        shouldDelete = true; 

        if (typeof item.action === "function") {
            const response = item.action(obj);

            if (typeof response === "object" && response !== null) {
                finalMessage = response.message || finalMessage;
                shouldDelete = (response.deleteItem !== undefined) ? response.deleteItem : true;
            } else if (typeof response === "string") {
                finalMessage = response;
            }
        }

        if (shouldDelete) {
            Inventory.removeItem(item.instanceId);
        }
    } 

    UI.showMessage(finalMessage);

    UI.selectedItemForUse = null; 
    UI.resetCursor();
}

    isIn = (mx, my, r) => mx > r.x && mx < r.x + r.w && my > r.y && my < r.y + r.h;
    default = () => ({ views: { center: { bg: "#111", objects: [] }, left: { bg: "#000", objects: [] }, right: { bg: "#222", objects: [] } } });
}