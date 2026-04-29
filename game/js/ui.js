const UI = {
    healthBar: document.getElementById("health-bar"),
        
    lastHp: -1,
    
    // обработка хп | przetwarzanie zdrowia
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

    // вкл/выкл инвентаря | włącza/wyłącza ekwipunek
    toggleInventory() {
        const modal = document.getElementById('inventory-modal');
        if (!modal) return;
        
        modal.classList.toggle('hidden');
    },

    // отрисовка инвентаря | rysowanie ekwipunku
    renderInventory(items) {
        const container = document.getElementById('inventory-slots');
        if (!container) return;
        container.innerHTML = '';
        
        items.forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'inv-slot';
            slot.style.backgroundColor = item.color || 'gray';
            
            if (item.isConsumable) {
                slot.style.cursor = 'pointer';
                slot.onclick = () => this.useItem(item);
                slot.title = "Нажмите, чтобы использовать";
            }
            
            container.appendChild(slot);
        });
    },

    // рисует расходники | rysuje consumables
    updateConsumables(items) {
        const panel = document.getElementById('consumables-panel');
        if (!panel) return;

        panel.innerHTML = '';
        
        const consumables = items.filter(item => item.isConsumable === true);
        if (consumables.length > 0 && currentState === GameState.MAZE) {
            panel.classList.remove('hidden-ui');
        }

        consumables.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'consumable-btn';
            btn.style.backgroundColor = item.color || 'gray';
            btn.innerText = item.name;
            
            btn.onclick = () => this.useItem(item);
            
            panel.appendChild(btn);
        });
    },

    // na razie tylko dla heal consumable
    useItem(item) {
        if (item.effect === 'heal') {
            player.hp = Math.min(player.hp + 1, 3);
            this.updateHealth(player.hp);
            Inventory.removeItem(item.instanceId); 
            this.updateConsumables(Inventory.items);
            this.renderInventory(Inventory.items);  
        }

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