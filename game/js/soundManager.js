const SoundManager = {
    sounds: {},
    ambients: {},
    currentAmbient: null,
    previewTimeout: null, 
    isMuffled: false,   

    sfxVolume: localStorage.getItem('game_sfx_volume') !== null ? parseFloat(localStorage.getItem('game_sfx_volume')) : 1.0,
    musicVolume: localStorage.getItem('game_music_volume') !== null ? parseFloat(localStorage.getItem('game_music_volume')) : 1.0,

    init() {
        const path = 'ui/assets/sounds/';
        
        const soundFiles = {
            attack: 'attack.ogg',
            button: 'button.ogg',
            crate: 'crate.ogg',
            doorLocked: 'door-locked.ogg',
            doorOpen: 'door-open.ogg',
            enemyStep: 'enemy-step.ogg',
            eye: 'eye.ogg',
            statue: 'statue.ogg',
            step: 'step.ogg',
            hit: 'hit.ogg', 
            meat: 'meat.ogg',
            typewriter: 'typewriter.ogg',
        };
        for (let key in soundFiles) {
            this.sounds[key] = new Audio(path + soundFiles[key]);
        }

        const ambientFiles = {
            main: 'main-ambient.ogg',
            end: 'end-ambient.ogg'
        };
        for (let key in ambientFiles) {
            const audio = new Audio(path + ambientFiles[key]);
            audio.loop = true;
            audio.volume = this.musicVolume * 0.3;
            this.ambients[key] = audio;
        }
    },

    play(key, customVolume = null, customPitch = null) {
        const original = this.sounds[key];
        if (original) {
            let soundToPlay;
            
            if (original.readyState >= 1) { 
                soundToPlay = original.cloneNode();
            } else {
                soundToPlay = original;
                soundToPlay.currentTime = 0;
            }
            
            const targetVolume = customVolume !== null ? (customVolume * this.sfxVolume) : this.sfxVolume;
            soundToPlay.volume = Math.max(0, Math.min(1, targetVolume));

            if (customPitch !== null) {
                soundToPlay.playbackRate = customPitch;
            }

            soundToPlay.play().catch(e => {
                console.warn(`Звук ${key} заблокирован или не загружен:`, e);
            });
        }
    },

    playAmbient(key) {
        if (this.currentAmbient === this.ambients[key]) return;
        this.stopAmbient();

        const ambient = this.ambients[key];
        if (ambient) {
            this.currentAmbient = ambient;
            ambient.currentTime = 0;
            this.applyMusicVolume();
            ambient.play().catch(e => {
                console.warn(`Браузер заблокировал запуск эмбиента "${key}":`, e);
            });
        }
    },

    stopAmbient() {
        if (this.currentAmbient) {
            this.currentAmbient.pause();
            this.currentAmbient.currentTime = 0;
            this.currentAmbient = null;
        }
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
            this.previewTimeout = null;
        }
    },

    setPauseMuffle(isMuffled) {
        this.isMuffled = isMuffled;
        this.applyMusicVolume();
    },

    applyMusicVolume() {
        let targetVol = this.musicVolume;
        
        if (this.isMuffled) {
            targetVol = Math.max(0.1, this.musicVolume - 0.2);
        }
        
        const baseline = 0.3;
        for (let key in this.ambients) {
            this.ambients[key].volume = targetVol * baseline;
        }
    },

    setMusicVolume(vol) {
        this.musicVolume = vol;
        localStorage.setItem('game_music_volume', vol);
        this.applyMusicVolume();
    },

    setSfxVolume(vol) {
        this.sfxVolume = vol;
        localStorage.setItem('game_sfx_volume', vol);
    },

};

SoundManager.init();
