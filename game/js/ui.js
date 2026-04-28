const UI = {
    healthBar: document.getElementById("health-bar"),
        
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

    // Делает кнопку инвентаря невидимой в лабиринтах | nie widać przycisku ekwipunek w labiryntach
    setInventoryBtnVisibility(visible) {
        const btn = document.getElementById('inventory-btn');
        if (btn) btn.style.display = visible ? 'block' : 'none';
        
        if (!visible) {
            const modal = document.getElementById('inventory-modal');
            if (modal) modal.classList.add('hidden');
        }
    },

    toggleInventory() {
        const modal = document.getElementById('inventory-modal');
        if (!modal) return;
        
        modal.classList.toggle('hidden');
    },

    renderInventory(items) {
        const container = document.getElementById('inventory-slots');
        if (!container) return;
        container.innerHTML = '';
        
        items.forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'inv-slot';
            slot.style.backgroundColor = item.color || 'gray';
            container.appendChild(slot);
        });
    },

    showGameOver() {
        alert("Игра окончена!");
        location.reload();
    },

    showWin() {
        alert("Поздравляю! Вы прошли все лабиринты!");
        location.reload();
    }
};