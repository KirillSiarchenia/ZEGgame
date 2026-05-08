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
        
        this.lastHp = currentHp;
        container.innerHTML = ""; 
        
        for (let i = 0; i < maxHp; i++) {
            const heart = document.createElement("div");
            heart.classList.add("heart");
            
            if (i >= currentHp) {
                heart.classList.add("lost");
            }
            
            container.appendChild(heart);
        }
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
        this.selectedItemForUse = null;
    },
};