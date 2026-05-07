Object.assign(UI, {
    togglePauseMenu() {
    if (this.isMessageActive) return;

        const pauseMenu = document.getElementById('pause-menu');
        if (!pauseMenu) return;

        const isHidden = pauseMenu.classList.toggle('hidden');
        this.isPaused = !isHidden;

        if (this.isPaused) {
            const inv = document.getElementById('inventory-modal');
            if (inv) inv.classList.add('hidden');
        }
    },

    updateStaticTexts() {
        const playBtn = document.getElementById('btn-play');
        const langBtn = document.getElementById('btn-lang');
        const invBtn = document.getElementById('inventory-btn');
        const invHeader = document.querySelector('.inventory-header h2');
        const resumeBtn = document.getElementById('btn-resume');
        const restartBtn = document.getElementById('btn-restart');
        const toMainBtn = document.getElementById('btn-to-main');

        if (playBtn) playBtn.innerText = t.menu.play;
        if (langBtn) langBtn.innerText = t.menu.language;
        if (invBtn) invBtn.innerText = t.ui.inventory;
        if (invHeader) invHeader.innerText = t.ui.inventory;
        
        if (resumeBtn) resumeBtn.innerText = t.menu.resume;
        if (restartBtn) restartBtn.innerText = t.menu.restart;
        if (toMainBtn) toMainBtn.innerText = t.menu.to_main;
    },

    initMenuEvents() {
        const playBtn = document.getElementById('btn-play');
        const langBtn = document.getElementById('btn-lang');
        const resumeBtn = document.getElementById('btn-resume');
        const restartBtn = document.getElementById('btn-restart');

        if (playBtn) {
            playBtn.onmouseup = () => initGame(true);
        }
        if (langBtn) {
            langBtn.onmouseup = () => {
                const nextLang = (currentLang === 'ru') ? 'pl' : 'ru';
                setLanguage(nextLang);
            };
        }
        if (resumeBtn) {
            resumeBtn.onmouseup = () => this.togglePauseMenu();
        }
        if (restartBtn) {
            restartBtn.onmouseup = () => {
                if(confirm(currentLang === 'ru' ? "Начать заново?" : "Zacząć od ново?")) {
                    initGame(true);
                    this.togglePauseMenu();
                }
            };
        }
    },
});