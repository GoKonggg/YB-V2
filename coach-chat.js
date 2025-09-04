document.addEventListener('DOMContentLoaded', () => {
    // --- Mendapatkan Data Coach dari URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const coachId = urlParams.get('coachId');
    const coach = coachesData.find(c => c.id === coachId);

    if (!coach) {
        document.getElementById('app-container').innerHTML = '<p class="p-8 text-center">Coach not found.</p>';
        return;
    }

    // --- STATE & DATA ---
    const currentUser = { id: 'user_me', name: 'You' };
    const storageKey = `chatHistory_${coachId}`; // Key unik untuk setiap chat coach
    
    // Contoh pesan awal jika riwayat chat kosong
    const initialMessages = [
        {
            id: 1,
            userId: coach.id,
            userName: coach.name,
            avatarUrl: coach.avatarUrl,
            text: `Hey! Welcome. I'm excited to start working with you. What's the number one goal you'd like to achieve?`,
            timestamp: new Date(new Date().getTime() - 10 * 60000).toISOString()
        }
    ];

    let messages = JSON.parse(localStorage.getItem(storageKey)) || initialMessages;

    // --- ELEMENT SELECTORS ---
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const coachChatName = document.getElementById('coach-chat-name');
    const backLink = document.getElementById('back-link');

    // --- Update UI ---
    coachChatName.textContent = `Chat with ${coach.name}`;
    backLink.href = `my-coach.html?coachId=${coachId}`;

    // --- HELPER & RENDER FUNCTIONS (Sama seperti discussion.js) ---
    function formatTimestamp(isoString) {
        // ... (fungsi formatTimestamp tetap sama)
    }

    function renderMessages() {
        // ... (seluruh fungsi renderMessages dari discussion.js bisa disalin ke sini, tanpa perubahan)
    }

    // --- EVENT HANDLERS ---
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === '') return;

        const newMessage = {
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            text: text,
            timestamp: new Date().toISOString()
        };

        messages.push(newMessage);
        localStorage.setItem(storageKey, JSON.stringify(messages)); // Simpan ke key yang benar
        
        messageInput.value = '';
        renderMessages();
    }
    
    // --- Ambil fungsi renderMessages & formatTimestamp dari discussion.js ---
    // (Karena isinya identik, kita salin saja untuk menjaga file ini tetap mandiri)
    function formatTimestamp(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }

    function renderMessages() {
        messagesContainer.innerHTML = '';
        let lastUserId = null;

        messages.forEach(msg => {
            const isCurrentUser = msg.userId === currentUser.id;
            const isGrouped = msg.userId === lastUserId;
            
            const messageWrapper = document.createElement('div');
            messageWrapper.className = `flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''} ${isGrouped ? 'mt-1' : 'mt-4'}`;
            
            let content = '';
            if (isCurrentUser) {
                content = `<div class="flex flex-col items-end max-w-[80%]">${!isGrouped ? `<span class="text-sm font-bold text-slate-700 mb-1">${msg.userName}</span>` : ''}<div class="bg-fuchsia-500 text-white p-3 rounded-xl ${isGrouped ? 'rounded-tr-none' : 'rounded-br-none'}"><p>${msg.text}</p></div><span class="text-xs text-slate-400 mt-1">${formatTimestamp(msg.timestamp)}</span></div>`;
            } else {
                content = `<div class="${isGrouped ? 'w-8' : ''} flex-shrink-0">${!isGrouped ? `<img src="${msg.avatarUrl}" alt="${msg.userName}'s avatar" class="w-8 h-8 rounded-full">` : ''}</div><div class="flex flex-col max-w-[80%]">${!isGrouped ? `<span class="text-sm font-bold text-slate-700 mb-1">${msg.userName}</span>` : ''}<div class="bg-slate-200 text-slate-800 p-3 rounded-xl ${isGrouped ? 'rounded-tl-none' : 'rounded-bl-none'}"><p>${msg.text}</p></div><span class="text-xs text-slate-400 mt-1 self-start">${formatTimestamp(msg.timestamp)}</span></div>`;
            }
            messageWrapper.innerHTML = content;
            messagesContainer.appendChild(messageWrapper);
            lastUserId = msg.userId;
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // --- INITIALIZATION ---
    renderMessages();
});