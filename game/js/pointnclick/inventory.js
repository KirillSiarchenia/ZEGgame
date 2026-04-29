const Inventory = {
    items: [],

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
    }
};