const UI = {
    healthBar: document.getElementById("health-bar"),
    isMessageActive: false,
    selectedItemForUse: null,
    isTyping: false,
    typingTimer: null,
        
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
        useBtn.innerText = "Использовать";
        useBtn.style.pointerEvents = "auto"; 
        useBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.useItem(item);
            menu.remove();
        };

        const examineBtn = document.createElement('button');
        examineBtn.innerText = "Осмотреть";
        examineBtn.style.pointerEvents = "auto";
        examineBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showMessage(item.examineText || "Ничего особенного.");
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
            
            slot.onclick = (e) => {
                e.stopPropagation(); 
                this.showItemActions(item, e);
            };
            
            container.appendChild(slot);
        });
    },


    showMessage(text) {
        const box = document.getElementById('msg-box');
        const content = document.getElementById('msg-content');
        if (!box || !content) return;

        box.classList.remove('hidden');
        this.isMessageActive = true;
        content.innerText = "";
        
        this.isTyping = true;
        let i = 0;
        const speed = 40;

        const typeWriter = () => {
            if (i < text.length) {
                content.innerText += text.charAt(i);
                i++;
                this.typingTimer = setTimeout(typeWriter, speed);
            } else {
                this.isTyping = false;
            }
        };

        typeWriter();

        const handleInteraction = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;

            if (this.isTyping) {
                clearTimeout(this.typingTimer);
                content.innerText = text;
                this.isTyping = false;
            } else {
                box.classList.add('hidden');
                this.isMessageActive = false;
                window.removeEventListener('keydown', handleInteraction);
                window.removeEventListener('mousedown', handleInteraction);
            }
        };

        setTimeout(() => {
            window.addEventListener('keydown', handleInteraction);
            window.addEventListener('mousedown', handleInteraction);
        }, 100);
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
            this.showMessage("я похавал"); // пока что для отладки 
            return;
        }
        const modal = document.getElementById('inventory-modal');
        if (modal) modal.classList.add('hidden');

        this.selectedItemForUse = item;        
        this.updateCursor(item.color);
    },
    updateCursor(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Рисуем иконку предмета вместо курсора
        ctx.fillStyle = color || 'white';
        ctx.fillRect(4, 4, 24, 24);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, 24, 24);

        const url = canvas.toDataURL();
        document.body.style.cursor = `url(${url}) 12 12, auto`;
    },

    resetCursor() {
        document.body.style.cursor = 'default';
        this.selectedItemForUse = null;
    },
};