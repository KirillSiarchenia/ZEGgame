Object.assign(UI, {
    settingsParent: 'main-menu',
    isFullscreenPaused: false,
    wasPausedBeforeFS: false,

    showFullscreenPause() {
        if (typeof currentState !== 'undefined' && currentState === 'MENU') return;
        this.isFullscreenPaused = true;
        
        if (!this.isPaused) {
            this.wasPausedBeforeFS = false;
            this.isPaused = true;
        } else {
            this.wasPausedBeforeFS = true;
        }

        const fsPauseMenu = document.getElementById('fullscreen-pause-menu');
        if (fsPauseMenu) fsPauseMenu.classList.remove('hidden');
    },

    hideFullscreenPause() {
        this.isFullscreenPaused = false;
        if (!this.wasPausedBeforeFS) {
            this.isPaused = false;
        }
        const fsPauseMenu = document.getElementById('fullscreen-pause-menu');
        if (fsPauseMenu) fsPauseMenu.classList.add('hidden');
    },

    togglePauseMenu() {
        if (this.isMessageActive || this.isFullscreenPaused) return;

        const pauseMenu = document.getElementById('pause-menu');
        if (!pauseMenu) return;

        const isHidden = pauseMenu.classList.toggle('hidden');
        this.isPaused = !isHidden;

        if (this.isPaused) {
            const inv = document.getElementById('inventory-modal');
            if (inv) inv.classList.add('hidden');

            const levelIndicator = document.getElementById('pause-level-indicator');
            if (levelIndicator && typeof currentLevelIndex !== 'undefined') {
                levelIndicator.innerText = `${t.menu.level}: ${currentLevelIndex + 1}`;
            }
        }
    },

    showConfirm(message, onYes) {
        const modal = document.getElementById('confirm-modal');
        const textEl = document.getElementById('confirm-text');
        const yesBtn = document.getElementById('btn-confirm-yes');
        const noBtn = document.getElementById('btn-confirm-no');

        textEl.innerText = message.toUpperCase();
        modal.classList.remove('hidden');

        yesBtn.onclick = () => {
            modal.classList.add('hidden');
            onYes();
        };
        
        noBtn.onclick = () => {
            modal.classList.add('hidden');
        };
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
        setText('btn-to-main', t.menu.to_main);
        setText('btn-main-settings', t.menu.settings);
        setText('btn-pause-settings', t.menu.settings);
        setText('btn-settings-back', t.menu.back);
        setText('pause-level-indicator', `${t.menu.level}: ${currentLevelIndex + 1}`);

        const invHeader = document.querySelector('.inventory-header h2');
        if (invHeader) invHeader.innerText = t.ui.inventory;

        setText('confirm-text', t.menu.confirm_exit);
        setText('btn-confirm-yes', t.menu.yes);
        setText('btn-confirm-no', t.menu.no);
        
        setText('header-fs-pause', t.menu.fs_pause_title);
        setText('subheader-fs-pause', t.menu.fs_pause_desc);
        setText('btn-fs-resume', t.menu.fs_resume);
    },

    initMenuEvents() {
        const mainMenu = document.getElementById('main-menu');
        const pauseMenu = document.getElementById('pause-menu');
        const settingsMenu = document.getElementById('settings-menu');
        
        // Универсальная функция запроса полного экрана и блокировки Escape
        const attemptFullscreenAndLock = (onSuccess) => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().then(() => {
                    // Блокируем выход из фуллскрина по одному нажатию Esc
                    if ('keyboard' in navigator && navigator.keyboard && navigator.keyboard.lock) {
                        navigator.keyboard.lock(['Escape']).catch(err => console.warn("Keyboard lock failed:", err));
                    }
                    if (onSuccess) onSuccess();
                }).catch(err => {
                    console.warn("Fullscreen request failed:", err);
                    if (onSuccess) onSuccess();
                });
            } else {
                if (onSuccess) onSuccess();
            }
        };

        document.getElementById('btn-play').onclick = () => {
            attemptFullscreenAndLock(() => {
                mainMenu.classList.add('hidden');
                setGameState(GameState.MAZE);
            });
        };

        const btnFsResume = document.getElementById('btn-fs-resume');
        if (btnFsResume) {
            btnFsResume.onclick = () => {
                attemptFullscreenAndLock();
            };
        }

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

        document.getElementById('btn-resume').onclick = () => this.togglePauseMenu();

        document.getElementById('btn-lang').onclick = () => {
            toggleNextLanguage();
        };

        document.getElementById('btn-to-main').onclick = () => {
            this.showConfirm(t.menu.confirm_exit, () => {
                location.reload();
            });
        };
    },
});