const CutsceneManager = {
    active: false,
    sceneId: null,
    frameIndex: 0,
    textIndex: 0,
    isTyping: false,
    typingTimer: null,
    fullText: "",
    onFinish: null,

    play(sceneId, onFinishCallback) {
        if (!CutscenesData[sceneId]) {
            console.warn(`Катсцена ${sceneId} не найдена!`);
            if (onFinishCallback) onFinishCallback();
            return;
        }

        this.active = true;
        this.sceneId = sceneId;
        this.frameIndex = 0;
        this.textIndex = 0;
        this.onFinish = onFinishCallback;
        
        setGameState(GameState.CUTSCENE);
        
        const ui = document.getElementById('cutscene-ui');
        ui.classList.remove('hidden');
        
        this.showCurrentFrame();
    },

    showCurrentFrame() {
        const scene = CutscenesData[this.sceneId];
        if (this.frameIndex >= scene.length) {
            this.skip();
            return;
        }

        const frame = scene[this.frameIndex];
        const imgDiv = document.getElementById('cutscene-image');
        
        // Устанавливаем спрайт-лист и сдвигаем кадр
        imgDiv.style.backgroundImage = `url('${frame.sheet}')`;
        imgDiv.style.backgroundPosition = `-${frame.index * 800}px 0px`;
        
        this.textIndex = 0;
        this.showTextLine();
    },

    showTextLine() {
        const scene = CutscenesData[this.sceneId];
        const frame = scene[this.frameIndex];
        
        const texts = t.cutscenes[frame.textKey] || ["TEXT MISSING"];
        
        if (this.textIndex >= texts.length) {
            this.frameIndex++;
            this.showCurrentFrame();
            return;
        }

        this.fullText = texts[this.textIndex];
        const content = document.getElementById('cutscene-text');
        content.innerText = "";
        
        this.isTyping = true;
        let i = 0;
        
        if (this.typingTimer) clearTimeout(this.typingTimer);
        
        const typeWriter = () => {
            // Ждём, если игра на паузе (например, нажат Escape)
            if (UI.isPaused || UI.isFullscreenPaused) {
                this.typingTimer = setTimeout(typeWriter, 100);
                return;
            }

            if (i < this.fullText.length) {
                content.innerText += this.fullText.charAt(i++);
                this.typingTimer = setTimeout(typeWriter, 40);
            } else {
                this.isTyping = false;
            }
        };
        
        typeWriter();
    },

    advance() {
        if (!this.active || UI.isPaused || UI.isFullscreenPaused) return;

        if (this.isTyping) {
            // Если печатается - моментально выводим
            if (this.typingTimer) clearTimeout(this.typingTimer);
            document.getElementById('cutscene-text').innerText = this.fullText;
            this.isTyping = false;
        } else {
            // Если вывелось - следующая строка
            this.textIndex++;
            this.showTextLine();
        }
    },

    skip() {
        if (!this.active) return;
        this.active = false;
        
        if (this.typingTimer) clearTimeout(this.typingTimer);
        
        document.getElementById('cutscene-ui').classList.add('hidden');
        
        if (this.onFinish) this.onFinish();
    }
};

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cutscene-ui').addEventListener('mouseup', (e) => {
        if (e.target.id === 'btn-skip-cutscene') return;
        if (e.button === 0) CutsceneManager.advance();
    });

    document.getElementById('btn-skip-cutscene').addEventListener('click', (e) => {
        e.stopPropagation();
        CutsceneManager.skip();
    });
});
