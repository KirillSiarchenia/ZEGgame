const Inventory = {
    items: [],

    addItem(item) {
        this.items.push(item);
        this.updateUI();
        return true;
    },

    has(itemId) {
        return this.items.some(item => item.id === itemId);
    },

    removeItem(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.items.splice(index, 1);
            this.updateUI();
        }
    },

    updateUI() {
        if (typeof UI !== 'undefined' && UI.renderInventory) {
            UI.renderInventory(this.items);
        }
    }
};