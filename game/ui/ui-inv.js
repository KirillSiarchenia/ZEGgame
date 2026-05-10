Object.assign(UI, {
    setInventoryBtnVisibility(visible) {
        const btn = document.getElementById('inventory-btn');
        if (btn) btn.style.display = visible ? 'block' : 'none';
        
        if (!visible) {
            const modal = document.getElementById('inventory-modal');
            if (modal) modal.classList.add('hidden');
            if (btn) btn.classList.remove('modal-open'); 
        }
    },

    // вкл/выкл инвентаря | włącza/wyłącza ekwipunek
    toggleInventory() {
        if (this.isMessageActive || this.selectedItemForUse) return;

        const modal = document.getElementById('inventory-modal');
        const btn = document.getElementById('inventory-btn');
        if (!modal) return;
        
        const isHidden = modal.classList.toggle('hidden');
        
        if (btn) {
            if (!isHidden) {
                btn.classList.add('modal-open');
            } else {
                btn.classList.remove('modal-open');
            }
        }
    },

    // контекстное меню | 
    showItemActions(item, mouseEvent) {
        const oldMenu = document.getElementById('item-context-menu');
        if (oldMenu) oldMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'item-context-menu';
        
        menu.style.position = 'fixed';
        menu.style.left = mouseEvent.clientX + 'px';
        menu.style.top = mouseEvent.clientY + 'px';
        menu.style.zIndex = '5001'; 

        const useBtn = document.createElement('button');
        useBtn.innerText = t.ui.use;
        useBtn.style.pointerEvents = "auto"; 
        useBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.useItem(item);
            menu.remove();
        };

        const examineBtn = document.createElement('button');
        examineBtn.innerText = t.ui.examine;
        examineBtn.style.pointerEvents = "auto";
        examineBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showMessage(t.itemDescription[item.id] || "???");
            menu.remove();
        };

        menu.appendChild(useBtn);
        menu.appendChild(examineBtn);
        document.body.appendChild(menu);

        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('mousedown', closeMenu);
            }
        };
        
        setTimeout(() => document.addEventListener('mousedown', closeMenu), 50);
    },

    renderInventory(items) {
        const container = document.getElementById('inventory-slots');
        if (!container) return;
        container.innerHTML = '';
        
        items.forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'inv-slot';
            slot.style.backgroundColor = item.color || 'gray';
            
            slot.onmouseup = (e) => {
                e.stopPropagation();
                if (this.isMessageActive || this.selectedItemForUse) return;
                this.showItemActions(item, e);
            };
            
            container.appendChild(slot);
        });
    },

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
            const displayName = t.itemName[item.id] || item.id;
            btn.className = 'consumable-btn';
            btn.style.backgroundColor = item.color || 'gray';
            btn.innerText = displayName;
            
            btn.onclick = () => {
                if (this.isMessageActive || this.selectedItemForUse) return;
                this.useItem(item);
            }
                
            
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
            this.showMessage(t.ui.hp_up); 
            return;
        }
        
        const modal = document.getElementById('inventory-modal');
        const btn = document.getElementById('inventory-btn');
        
        if (modal) modal.classList.add('hidden');
        if (btn) btn.classList.remove('modal-open'); 

        this.selectedItemForUse = item;        
        this.updateCursor(item.color);
        document.body.classList.add('item-equipped');
    },
});