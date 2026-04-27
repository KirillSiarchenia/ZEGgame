class RoomManager {
    constructor() {
        this.currentRoom = null;
        this.view = "center"; 
        this.nav = {
            left: { x: 0, y: 200, w: 100, h: 320, next: "left", back: "center" },
            right: { x: 1180, y: 200, w: 100, h: 320, next: "right", back: "center" },
            exit: { x: 440, y: 620, w: 400, h: 100 }
        };
    }

    enter(mapId, gx, gy) {
        this.currentRoom = roomsData[mapId]?.[`${gx},${gy}`] || this.defaultRoom();
        this.view = "center";
    }

    draw(ctx, w, h) {
        if (!this.currentRoom) return;
        const v = this.currentRoom.views[this.view];
        
        ctx.fillStyle = v.bg;
        ctx.fillRect(0, 0, w, h);

        // Отрисовка объектов
        v.objects.forEach(o => {
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.fillRect(o.x, o.y, o.w, o.h);
        });

        // Навигация
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        if (this.view === "center") {
            ["left", "right", "exit"].forEach(k => ctx.fillRect(this.nav[k].x, this.nav[k].y, this.nav[k].w, this.nav[k].h));
        } else {
            const side = this.view === "left" ? "right" : "left";
            ctx.fillRect(this.nav[side].x, this.nav[side].y, this.nav[side].w, this.nav[side].h);
        }
    }

    handleMouseClick(mx, my) {
        if (this.view === "center") {
            if (this.isInside(mx, my, this.nav.left)) this.view = "left";
            else if (this.isInside(mx, my, this.nav.right)) this.view = "right";
            else if (this.isInside(mx, my, this.nav.exit)) return "EXIT";
        } else {
            const side = this.view === "left" ? "right" : "left";
            if (this.isInside(mx, my, this.nav[side])) this.view = "center";
        }
    }

    isInside = (mx, my, r) => mx > r.x && mx < r.x + r.w && my > r.y && my < r.y + r.h;

    defaultRoom = () => ({ views: { center: { bg: "#222", objects: [] }, left: { bg: "#111", objects: [] }, right: { bg: "#333", objects: [] } } });
}