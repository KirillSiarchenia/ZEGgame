const Inventory = {
    items:[],

    addItem(item) {
        const instance = { ...item, instanceId: Date.now() + Math.random() };
        this.items.push(instance);
        
        if (currentState === GameState.MAZE) {
            UI.updateConsumables(this.items);
        }
        UI.renderInventory(Inventory.items);
    },

    has(itemId) {
        return this.items.some(item => item.id === itemId);
    },

    removeItem(instanceId) {
        this.items = this.items.filter(i => i.instanceId !== instanceId);
    },

    updateUI() {
        if (typeof UI !== 'undefined' && UI.renderInventory) {
            UI.renderInventory(this.items);
        }
    },

    useItem(item) {
        if (item.isConsumable && typeof item.action === "function") {
            const response = item.action();
            
            if (response && typeof response === "object") {
                if (response.deleteItem) {
                    this.removeItem(item.instanceId);
                    if (currentState === GameState.MAZE) UI.updateConsumables(this.items);
                    this.updateUI();
                }
                if (response.message) {
                    UI.showMessage(response.message);
                }
            }
            return;
        }
        
        const modal = document.getElementById('inventory-modal');
        const btn = document.getElementById('inventory-btn');
        
        if (modal) modal.classList.add('hidden');
        if (btn) btn.classList.remove('modal-open'); 

        UI.selectedItemForUse = item;        
        UI.updateCursor(item.color);
        document.body.classList.add('item-equipped');
    }
};