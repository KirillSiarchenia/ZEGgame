const UI = {
    healthBar: document.getElementById("health-bar"),
    isMessageActive: false,
    selectedItemForUse: null,
    isTyping: false,
    typingTimer: null,
    isPaused: false,        
    lastHp: -1,

    updateHealth(currentHp, maxHp = 3) {
        const container = this.getContainer();
        if (!container || currentHp === this.lastHp) return;
        
        if (container.children.length === 0) {
            for (let i = 0; i < maxHp; i++) {
                const heart = document.createElement("div");
                heart.classList.add("heart");
                container.appendChild(heart);
            }
        }
        
        const hearts = container.children;
        
        for (let i = 0; i < maxHp; i++) {
            if (i >= currentHp) {
                hearts[i].classList.remove("healed");
                hearts[i].classList.add("lost");
            } else {
                if (hearts[i].classList.contains("lost")) {
                    hearts[i].classList.remove("lost");
                    hearts[i].classList.add("healed");
                }
            }
        }
        
        this.lastHp = currentHp;
    },
    
    getContainer() {
        return document.getElementById("health-bar");
    },

    updateCursor(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = color || 'white';
        ctx.fillRect(4, 4, 24, 24);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, 24, 24);

        const url = canvas.toDataURL();
        document.body.style.cursor = `url(${url}) 12 12, auto`;
        document.body.classList.add('cursor-locked');
    },

    resetCursor() {
        document.body.style.cursor = 'default';
        document.body.classList.remove('cursor-locked');
        document.body.classList.remove('item-equipped');
        this.selectedItemForUse = null;
    },
};