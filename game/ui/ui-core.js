const UI = {
    healthBar: document.getElementById("health-bar"),
    isMessageActive: false,
    selectedItemForUse: null,
    isTyping: false,
    typingTimer: null,
    isPaused: false,        
    lastHp: -1,
    cursorElement: null,
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,

    // обновление UI здоровья | aktualizacja UI zdrowia
    updateHealth(currentHp, maxHp = PLAYER_CONFIG.MAX_HP) {
        const container = this.getContainer();
        if (!container || currentHp === this.lastHp) return;
        
        // создание элементов сердец, если контейнер пуст
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

    // обновление кастомного курсора | aktualizacja niestandardowego kursora
    initCustomCursor() {
        if (!this.cursorElement) {
            this.cursorElement = document.createElement('div');
            this.cursorElement.id = 'floating-cursor';
            this.cursorElement.style.position = 'fixed';
            this.cursorElement.style.pointerEvents = 'none'; 
            this.cursorElement.style.zIndex = '9999';
            this.cursorElement.style.display = 'none';
            this.cursorElement.style.imageRendering = 'pixelated';
            
            window.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                if (this.cursorElement.style.display === 'block') {
                    this.cursorElement.style.left = this.mouseX + 'px';
                    this.cursorElement.style.top = this.mouseY + 'px';
                }
            });
            
            document.body.appendChild(this.cursorElement);
        }
    },

    // обновление кастомного курсора | aktualizacja niestandardowego kursora
    updateCursor(item) {
        this.initCustomCursor();

        if (item.spriteIndex !== undefined) {
            this.cursorElement.style.width = '100px';
            this.cursorElement.style.height = '100px';
            this.cursorElement.style.backgroundImage = "url('ui/assets/inventory-items.png')";
            this.cursorElement.style.backgroundRepeat = "no-repeat";
            this.cursorElement.style.backgroundSize = "auto 200%"; 
            this.cursorElement.style.backgroundPosition = `-${item.spriteIndex * 100}px 0px`;
            
            this.cursorElement.style.transform = 'translate(-50%, -50%)';
            this.cursorElement.style.backgroundColor = 'transparent';
            this.cursorElement.style.border = 'none';
        } else {
            this.cursorElement.style.width = '30px';
            this.cursorElement.style.height = '30px';
            this.cursorElement.style.backgroundImage = 'none';
            this.cursorElement.style.backgroundColor = item.color || 'white';
            this.cursorElement.style.border = '2px solid white';
            this.cursorElement.style.transform = 'translate(-50%, -50%)';
        }

        this.cursorElement.style.display = 'block';
        this.cursorElement.style.left = this.mouseX + 'px';
        this.cursorElement.style.top = this.mouseY + 'px';

        document.body.style.cursor = 'none'; 
        document.body.classList.add('cursor-locked');
    },

    resetCursor() {
        if (this.cursorElement) {
            this.cursorElement.style.display = 'none';
        }
        document.body.style.cursor = 'default';
        document.body.classList.remove('cursor-locked', 'item-equipped');
        this.selectedItemForUse = null;
    },
};
