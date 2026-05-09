Object.assign(UI, {
    _fullText: "",

    closeMessage(force = true) {
        const box = document.getElementById('msg-box');
        const content = document.getElementById('msg-content');

        if (!force && this.isTyping) {
            if (this.typingTimer) clearTimeout(this.typingTimer);
            content.innerText = this._fullText;
            this.isTyping = false;
            return;
        }

        if (box) box.classList.add('hidden');
        this.isMessageActive = false;
        this.isTyping = false;
        if (this.typingTimer) clearTimeout(this.typingTimer);

        window.removeEventListener('mouseup', this._msgHandler, true);
    },
    
    showMessage(text) {
        this.closeMessage(true); // Сброс предыдущего сообщения
        
        this._fullText = text;
        const box = document.getElementById('msg-box');
        const content = document.getElementById('msg-content');
        if (!box || !content) return;

        box.classList.remove('hidden');
        this.isMessageActive = true;
        this.isTyping = true;
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                content.innerText += text.charAt(i++);
                this.typingTimer = setTimeout(typeWriter, 40);
            } else {
                this.isTyping = false;
            }
        };
        content.innerText = "";
        typeWriter();

        // Сохраняем ссылку, чтобы удалить позже
        this._msgHandler = (e) => {
            if (e.button === 0) {
                e.preventDefault();
                e.stopPropagation();
                this.closeMessage(false);
            }
        };
        setTimeout(() => window.addEventListener('mouseup', this._msgHandler, true), 50);
    },
});