const Inventory = {
    items:[],

    // добавление предмета с генерацией уникального ID | dodanie przedmiotu z generowaniem unikalnego ID
    addItem(item) {
        const instance = { ...item, instanceId: Date.now() + Math.random() };
        this.items.push(instance);
        
        if (currentState === GameState.MAZE) {
            UI.updateConsumables(this.items);
        }
        UI.renderInventory(Inventory.items);
    },

    // проверка наличия предмета в инвентаре | sprawdzanie obecności przedmiotu w ekwipunku
    has(itemId) {
        return this.items.some(item => item.id === itemId);
    },

    // удаление конкретного экземпляра предмета | usunięcie konkretnego egzemplarza przedmiotu
    removeItem(instanceId) {
        this.items = this.items.filter(i => i.instanceId !== instanceId);
    },

    // перерисовка интерфейса инвентаря | przerysowanie interfejsu ekwipunku
    updateUI() {
        if (typeof UI !== 'undefined' && UI.renderInventory) {
            UI.renderInventory(this.items);
        }
    },

    // обработка использования предмета (мгновенного или экипировки) | obsługa użycia przedmiotu (natychmiastowego lub wyposażenia)
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
        
        UI.updateCursor(item); 
        
        document.body.classList.add('item-equipped');
    },
};