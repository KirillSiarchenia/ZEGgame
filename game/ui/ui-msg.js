Object.assign(UI, {
    showMessage(text) {
        if(!text) text = "...";

        const box = document.getElementById('msg-box');
        const content = document.getElementById('msg-content');
        if (!box || !content) return;

        if (this.typingTimer) clearTimeout(this.typingTimer);

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
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();

            if (e.button !== 0) return; 

            if (e.type === 'mousedown') return;

            if (e.type === 'mouseup' && e.button === 0) {
                if (this.isTyping) {
                    clearTimeout(this.typingTimer);
                    content.innerText = text;
                    this.isTyping = false;
                } else {
                    box.classList.add('hidden');                    
                    window.removeEventListener('mousedown', handleInteraction, true);
                    window.removeEventListener('mouseup', handleInteraction, true);

                    setTimeout(() => { 
                        this.isMessageActive = false; 
                    }, 100);
                }
            }
        };

        setTimeout(() => {
            window.addEventListener('mousedown', handleInteraction, true);
            window.addEventListener('mouseup', handleInteraction, true);
        }, 50);
    },
});