const UI = {
    healthBar: document.getElementById("health-bar"),
    
    getContainer() {
        return document.getElementById("health-bar");
    },
    
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

    renderInventory(items) {
        const invContainer = document.getElementById('inventory-slots');
        if (!invContainer) return;

        invContainer.innerHTML = ''; 

        items.forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'inv-slot filled';
            slot.title = item.name; // Подсказка при наведении
            slot.style.backgroundImage = `url(${item.icon})`; // Если будут картинки
            invContainer.appendChild(slot);
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