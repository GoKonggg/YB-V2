document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const groupTitleEl = document.getElementById('group-title');
    const messagesContainer = document.getElementById('chat-messages-container');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    // --- STATE ---
    let currentProgramId = null;

    // --- FUNCTIONS ---

    /**
     * Mengambil ID program dari URL.
     */
    const getProgramIdFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('programId');
    };

    /**
     * Memuat dan menampilkan pesan dari localStorage.
     */
    const renderMessages = () => {
        if (!currentProgramId) return;

        const allMessages = JSON.parse(localStorage.getItem('groupMessages')) || {};
        const groupMessages = allMessages[currentProgramId] || [];

        // Hapus pesan lama (kecuali pesan contoh)
        messagesContainer.querySelectorAll('.user-message').forEach(el => el.remove());

        // Tampilkan setiap pesan
        groupMessages.forEach(msg => {
            appendMessage(msg.text, msg.sender);
        });

        // Auto-scroll ke pesan terbaru
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    /**
     * Menambahkan satu bubble pesan ke UI.
     */
    const appendMessage = (text, sender = 'You') => {
        const isCurrentUser = sender === 'You';
        
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `flex items-start gap-3 user-message ${isCurrentUser ? 'justify-end' : ''}`;

        const bubbleContent = `
            <div class="flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}">
                <div class="${isCurrentUser ? 'chat-bubble-user' : 'chat-bubble-other'} rounded-xl ${isCurrentUser ? 'rounded-tr-none' : 'rounded-tl-none'} p-3 max-w-xs">
                    <p class="font-semibold ${isCurrentUser ? 'text-fuchsia-700' : 'text-slate-600'} text-sm">${sender}</p>
                    <p class="text-slate-800">${text}</p>
                </div>
                <span class="text-xs text-slate-400 mt-1">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
        
        // Urutan elemen dibalik untuk pesan pengguna
        if (isCurrentUser) {
            messageWrapper.innerHTML = `
                ${bubbleContent}
                <img src="https://i.pravatar.cc/50?u=currentuser" alt="You" class="w-10 h-10 rounded-full object-cover">
            `;
        } else {
             messageWrapper.innerHTML = `
                <img src="https://i.pravatar.cc/50?u=${sender}" alt="${sender}" class="w-10 h-10 rounded-full object-cover">
                ${bubbleContent}
            `;
        }
        
        messagesContainer.appendChild(messageWrapper);
    };

    /**
     * Menyimpan pesan baru ke localStorage.
     */
    const saveMessage = (text) => {
        if (!currentProgramId) return;

        const allMessages = JSON.parse(localStorage.getItem('groupMessages')) || {};
        if (!allMessages[currentProgramId]) {
            allMessages[currentProgramId] = [];
        }

        allMessages[currentProgramId].push({
            sender: 'You',
            text: text,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('groupMessages', JSON.stringify(allMessages));
    };

    /**
     * Handler untuk submit form chat.
     */
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const messageText = chatInput.value.trim();
        if (messageText) {
            saveMessage(messageText);
            appendMessage(messageText, 'You');
            chatInput.value = '';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    };

    // --- INITIALIZATION ---
    currentProgramId = getProgramIdFromUrl();
    if (currentProgramId && typeof PROGRAM_DATABASE !== 'undefined') {
        const program = PROGRAM_DATABASE[currentProgramId];
        if (program) {
            groupTitleEl.textContent = program.title;
        }
        renderMessages();
    } else {
        groupTitleEl.textContent = 'Group Not Found';
    }

    chatForm.addEventListener('submit', handleFormSubmit);
});
