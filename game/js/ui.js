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
        // Отладка: если сердец не видно, эта строка покажет, создались ли они в коде
        console.log("UI Updated: HP is", currentHp); 
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