Object.assign(UI, {
    settingsParent: 'main-menu',
    isFullscreenPaused: false,
    wasPausedBeforeFS: false,

    
    showDeathMenu() {
        setGameState(GameState.DEAD);
        const deathMenu = document.getElementById('death-menu');
        if (deathMenu) deathMenu.classList.remove('hidden');
        const invModal = document.getElementById('inventory-modal');
        if (invModal) invModal.classList.add('hidden');
        const confirmModal = document.getElementById('confirm-modal');
        if (confirmModal) confirmModal.classList.add('hidden');
        const msgBox = document.getElementById('msg-box');
        if (msgBox) msgBox.classList.add('hidden');
    },

    // вызов окна паузы при потере полноэкранного режима | wywołanie okna pauzy po utracie trybu pełnoekranowego
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

        if (typeof SoundManager !== 'undefined') {
            SoundManager.setPauseMuffle(true);
        }
    },

    hideFullscreenPause() {
        this.isFullscreenPaused = false;
        if (!this.wasPausedBeforeFS) {
            this.isPaused = false;
        }
        const fsPauseMenu = document.getElementById('fullscreen-pause-menu');
        if (fsPauseMenu) fsPauseMenu.classList.add('hidden');

        if (typeof SoundManager !== 'undefined') {
            SoundManager.setPauseMuffle(this.isPaused);
        }
    },
    
    // открытие/закрытие главного меню паузы | otwieranie/zamykanie głównego menu pauzy
    togglePauseMenu() {
        if (this.isMessageActive || this.isFullscreenPaused) return;

        const pauseMenu = document.getElementById('pause-menu');
        if (!pauseMenu) return;

        const isHidden = pauseMenu.classList.toggle('hidden');
        this.isPaused = !isHidden;

        if (typeof SoundManager !== 'undefined') {
            SoundManager.setPauseMuffle(this.isPaused);
        }

        if (this.isPaused) {
            const inv = document.getElementById('inventory-modal');
            if (inv) inv.classList.add('hidden');

            const levelIndicator = document.getElementById('pause-level-indicator');
            if (levelIndicator && typeof currentLevelIndex !== 'undefined') {
                levelIndicator.innerText = `${t.menu.level}: ${currentLevelIndex + 1}`;
            }
        }
    },

    renderVolumeBars() {
        const createBones = (containerId, currentVolume) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';
            
            const activeSegmentsCount = Math.round(currentVolume * 10);
            
            for (let i = 1; i <= 10; i++) {
                const bone = document.createElement('div');
                bone.className = 'bone-segment';
                if (i > activeSegmentsCount) {
                    bone.classList.add('inactive');
                }
                container.appendChild(bone);
            }
        };

        createBones('bar-music', SoundManager.musicVolume);
        createBones('bar-sfx', SoundManager.sfxVolume);
    },

    // вызов модального окна подтверждения | wywołanie modalnego okna potwierdzenia
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

    // обновление всех текстов интерфейса при смене языка | aktualizacja wszystkich tekstów interfejsu przy zmianie języka
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
        setText('header-death', t.menu.death_title);
        setText('btn-restart', t.menu.restart);
        setText('btn-pause-restart', t.menu.restart);
        setText('btn-death-to-main', t.menu.to_main);
        setText('btn-play', t.menu.play);
        setText('btn-tutorial', t.menu.tutorial);
        setText('btn-skip-cutscene', t.menu.skip);
        setText('label-music', t.menu.music);
        setText('label-sfx', t.menu.sfx);

        const invHeader = document.querySelector('.inventory-header h2');
        if (invHeader) invHeader.innerText = t.ui.inventory;

        setText('confirm-text', t.menu.confirm_exit);
        setText('btn-confirm-yes', t.menu.yes);
        setText('btn-confirm-no', t.menu.no);
        
        setText('header-fs-pause', t.menu.fs_pause_title);
        setText('subheader-fs-pause', t.menu.fs_pause_desc);
        setText('btn-fs-resume', t.menu.fs_resume);

        setText('header-end', t.menu.the_end);

        setText('header-difficulty', t.menu.select_difficulty);
        setText('btn-diff-easy', t.menu.diff_easy);
        setText('btn-diff-hard', t.menu.diff_hard);

        const diffLabel = gameDifficulty === 'easy' ? t.menu.diff_easy : t.menu.diff_hard;
        setText('btn-settings-diff', `${t.menu.difficulty}: ${diffLabel}`);

        setText('credits-role-dev', t.menu.credits_lead_dev);
        setText('credits-name-dev', t.menu.credits_dev_name);
        setText('credits-role-design', t.menu.credits_design);
        setText('credits-name-design', t.menu.credits_design_names);
    },

    initMenuEvents() {
        const mainMenu = document.getElementById('main-menu');
        const pauseMenu = document.getElementById('pause-menu');
        const settingsMenu = document.getElementById('settings-menu');
        const difficultyMenu = document.getElementById('difficulty-menu');
        
        const attemptFullscreenAndLock = (onSuccess) => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().then(() => {
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
            mainMenu.classList.add('hidden');
            difficultyMenu.classList.remove('hidden');
        };

        const startGameWithDifficulty = (selectedDifficulty) => {
            gameDifficulty = selectedDifficulty;
            localStorage.setItem('game_difficulty', selectedDifficulty);
            UI.updateStaticTexts();

            difficultyMenu.classList.add('hidden');
            
            attemptFullscreenAndLock(() => {
                CutsceneManager.play('intro', () => {
                    setGameState(GameState.MAZE);
                    SoundManager.playAmbient('main');
                });
            });
        };

        document.getElementById('btn-diff-easy').onclick = () => startGameWithDifficulty('easy');
        document.getElementById('btn-diff-hard').onclick = () => startGameWithDifficulty('hard');

        document.getElementById('btn-settings-diff').onclick = () => {
            gameDifficulty = (gameDifficulty === 'easy') ? 'hard' : 'easy';
            localStorage.setItem('game_difficulty', gameDifficulty);
            UI.updateStaticTexts();
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
            this.renderVolumeBars();
        };

        document.getElementById('btn-pause-settings').onclick = () => {
            this.settingsParent = 'pause-menu';
            pauseMenu.classList.add('hidden');
            settingsMenu.classList.remove('hidden');
            this.renderVolumeBars();
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
        document.getElementById('btn-restart').onclick = () => {
            document.getElementById('death-menu').classList.add('hidden');
            restartGame();
        };

        document.getElementById('btn-pause-restart').onclick = () => {
            this.showConfirm(t.menu.restart + "?", () => {
                this.togglePauseMenu();
                restartGame(); 
            });
        };

        document.getElementById('btn-death-to-main').onclick = () => {
            location.reload();
        };

        const btnTutorial = document.getElementById('btn-tutorial');
        if (btnTutorial) {
            btnTutorial.onclick = () => {
                mainMenu.classList.add('hidden');
                CutsceneManager.play('tutorial', () => {
                    mainMenu.classList.remove('hidden');
                    setGameState(GameState.MENU);
                });
            };
        }

        document.getElementById('btn-music-down').onclick = () => {
            let vol = Math.max(0, SoundManager.musicVolume - 0.1);
            SoundManager.setMusicVolume(vol);
            this.renderVolumeBars();
        };
        document.getElementById('btn-music-up').onclick = () => {
            let vol = Math.min(1.0, SoundManager.musicVolume + 0.1);
            SoundManager.setMusicVolume(vol);
            this.renderVolumeBars();
        };

        document.getElementById('btn-sfx-down').onclick = () => {
            let vol = Math.max(0, SoundManager.sfxVolume - 0.1);
            SoundManager.setSfxVolume(vol);
            this.renderVolumeBars();
            SoundManager.play('button');
        };
        document.getElementById('btn-sfx-up').onclick = () => {
            let vol = Math.min(1.0, SoundManager.sfxVolume + 0.1);
            SoundManager.setSfxVolume(vol);
            this.renderVolumeBars();
            SoundManager.play('button');
        };
    },
});