Object.assign(UI, {
    settingsParent: 'main-menu',

    togglePauseMenu() {
        if (this.isMessageActive) return;

        const pauseMenu = document.getElementById('pause-menu');
        const settingsMenu = document.getElementById('settings-menu');
        if (!pauseMenu || !settingsMenu) return;

        if (!settingsMenu.classList.contains('hidden')) {
            settingsMenu.classList.add('hidden');
            this.isPaused = false;
            return;
        }

        const isHidden = pauseMenu.classList.toggle('hidden');
        this.isPaused = !isHidden;

        if (this.isPaused) {
            const inv = document.getElementById('inventory-modal');
            if (inv) inv.classList.add('hidden');
        }
    },

    updateStaticTexts() {
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.innerText = text;
        };

        setText('header-main', "LABYRINTH");
        setText('header-pause', t.menu.pause_title);
        setText('header-settings', t.menu.settings_title || t.menu.settings);

        setText('btn-play', t.menu.play);
        setText('btn-resume', t.menu.resume);
        setText('btn-lang', t.menu.language);
        setText('btn-to-main', t.menu.to_main || "В МЕНЮ");
        setText('btn-main-settings', t.menu.settings);
        setText('btn-pause-settings', t.menu.settings);
        setText('btn-settings-back', t.menu.back || "НАЗАД");

        const invBtn = document.getElementById('inventory-btn');
        const invHeader = document.querySelector('.inventory-header h2');
        if (invBtn) invBtn.innerText = t.ui.inventory;
        if (invHeader) invHeader.innerText = t.ui.inventory;
    },

    initMenuEvents() {
        const mainMenu = document.getElementById('main-menu');
        const pauseMenu = document.getElementById('pause-menu');
        const settingsMenu = document.getElementById('settings-menu');

        document.getElementById('btn-play').onclick = () => {
            mainMenu.classList.add('hidden');
            setGameState(GameState.MAZE);
        };

        document.getElementById('btn-main-settings').onclick = () => {
            this.settingsParent = 'main-menu';
            mainMenu.classList.add('hidden');
            settingsMenu.classList.remove('hidden');
        };

        document.getElementById('btn-pause-settings').onclick = () => {
            this.settingsParent = 'pause-menu';
            pauseMenu.classList.add('hidden');
            settingsMenu.classList.remove('hidden');
        };

        document.getElementById('btn-settings-back').onclick = () => {
            settingsMenu.classList.add('hidden');
            document.getElementById(this.settingsParent).classList.remove('hidden');
        };

        document.getElementById('btn-lang').onclick = () => {
            const nextLang = (currentLang === 'ru') ? 'pl' : 'ru';
            setLanguage(nextLang);
        };

        document.getElementById('btn-resume').onclick = () => this.togglePauseMenu();

        document.getElementById('btn-to-main').onclick = () => {
            if (confirm(currentLang === 'ru' ? "Вернуться в меню?" : "Wrócić do menu?")) {
                location.reload();
            }
        };
    },
});