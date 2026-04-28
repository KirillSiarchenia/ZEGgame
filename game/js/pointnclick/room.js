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

    enter(mapId, gx, gy) {
        this.room = roomsData[mapId]?.[`${gx},${gy}`] || this.default();
        this.view = "center";
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

    handleMouseClick(mx, my, w, h) {
        const v = this.room.views[this.view];
        if (!v) return;

        if (v.objects) {
            for (let o of v.objects) {
                if (o.visible === false) continue;
                if (mx > o.rx * w && mx < (o.rx + o.rw) * w && 
                    my > o.ry * h && my < (o.ry + o.rh) * h) {
                    
                    if (ObjectLogic[o.logicType]) {
                        ObjectLogic[o.logicType](o);
                    }
                    return "OBJECT_CLICKED";
                }
            }
        }
        
        if (this.view === "center") {
            if (this.isIn(mx, my, this.getBox("left", w, h))) this.view = "left";
            else if (this.isIn(mx, my, this.getBox("right", w, h))) this.view = "right";
            else if (this.isIn(mx, my, this.getBox("exit", w, h))) return "EXIT";
        } else {
            const back = this.view === "left" ? "right" : "left";
            if (this.isIn(mx, my, this.getBox(back, w, h))) this.view = "center";
        }
    }

    isIn = (mx, my, r) => mx > r.x && mx < r.x + r.w && my > r.y && my < r.y + r.h;
    default = () => ({ views: { center: { bg: "#111", objects: [] }, left: { bg: "#000", objects: [] }, right: { bg: "#222", objects: [] } } });
}