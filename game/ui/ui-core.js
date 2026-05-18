const UI = {
    healthBar: document.getElementById("health-bar"),
    isMessageActive: false,
    selectedItemForUse: null,
    isTyping: false,
    typingTimer: null,
    isPaused: false,        
    lastHp: -1,

    // обновление UI здоровья | aktualizacja UI zdrowia
    updateHealth(currentHp, maxHp = 3) {
        const container = this.getContainer();
        if (!container || currentHp === this.lastHp) return;
        
        if (container.children.length === 0) {
            container.innerHTML = '<div class="heart"></div>'.repeat(maxHp);
        }
        
        const hearts = container.children;
        
        for (let i = 0; i < maxHp; i++) {
            const heart = hearts[i];
            const isLost = i >= currentHp;
            
            if (isLost && !heart.classList.contains("lost")) {
                heart.classList.remove("healed");
                heart.classList.add("lost");
            } else if (!isLost && heart.classList.contains("lost")) {
                heart.classList.remove("lost");
                heart.classList.add("healed");
            }
        }
        
        this.lastHp = currentHp;
    },
    
    getContainer() {
        return document.getElementById("health-bar");
    },

    // установка кастомного курсора при выборе предмета | ustawienie niestandardowego kursora przy wyborze przedmiotu
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

    // сброс курсора в исходное состояние | resetowanie kursora do stanu początkowego
    resetCursor() {
        document.body.style.cursor = 'default';
        document.body.classList.remove('cursor-locked');
        document.body.classList.remove('item-equipped');
        this.selectedItemForUse = null;
    },
};