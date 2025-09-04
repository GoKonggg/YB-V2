// File: discussion.js (Versi yang Diperbarui)

document.addEventListener('DOMContentLoaded', () => {

    // --- STATE & DATA ---
    const currentUser = {
        id: 'user_me', // ID unik untuk pengguna saat ini
        name: 'You',
        avatarUrl: 'https://i.pravatar.cc/150?u=me'
    };

    let messages = JSON.parse(localStorage.getItem('groupDiscussionMessages')) || [
        {
            id: 1,
            userId: 'user_jenna',
            userName: 'Jenna Ortega',
            avatarUrl: 'https://i.pravatar.cc/150?u=jenna',
            text: "Hey everyone! Just finished day 3, my legs are on fire! 🔥 How's everyone else doing?",
            timestamp: new Date(new Date().getTime() - 10 * 60000).toISOString()
        },
        {
            id: 2,
            userId: 'user_me',
            userName: 'You',
            avatarUrl: 'https://i.pravatar.cc/150?u=me',
            text: "Same here! That last set of squats was brutal but feels so good. Keep it up! 💪",
            timestamp: new Date(new Date().getTime() - 8 * 60000).toISOString()
        },
        {
            id: 3,
            userId: 'user_alex',
            userName: 'Alex Morgan',
            avatarUrl: 'https://i.pravatar.cc/150?u=alex',
            text: "Just a tip, I found that focusing on my breathing really helped me push through. Has anyone tried the protein shake recipe they shared?",
            timestamp: new Date(new Date().getTime() - 5 * 60000).toISOString()
        },
        // [BARU] Menambahkan contoh pesan dari Coach
        {
            id: 4,
            userId: 'user_coach_dave',
            userName: 'Coach Dave',
            avatarUrl: 'https://i.pravatar.cc/150?u=coachdave',
            text: "Great work everyone! Remember to listen to your body and don't push through pain. Proper form is key!",
            timestamp: new Date(new Date().getTime() - 4 * 60000).toISOString(),
            isCoach: true // Properti baru untuk menandai coach
        }
    ];

    // --- ELEMENT SELECTORS ---
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // --- HELPER FUNCTIONS ---
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

    // --- RENDER FUNCTION ---
    function renderMessages() {
        messagesContainer.innerHTML = '';
        let lastUserId = null;

        messages.forEach(msg => {
            const isCurrentUser = msg.userId === currentUser.id;
            const isGrouped = msg.userId === lastUserId;
            
            // [DIUBAH] HTML untuk badge coach
            const coachBadge = msg.isCoach 
                ? `<svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>` 
                : '';

            const messageWrapper = document.createElement('div');
            messageWrapper.className = `flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''} ${isGrouped ? 'mt-1' : 'mt-4'}`;
            
            let content = '';

            if (isCurrentUser) {
                content = `
                    <div class="flex flex-col items-end max-w-[80%]">
                        ${!isGrouped ? `<div class="flex items-center gap-1 mb-1"><span class="text-sm font-bold text-slate-700">${msg.userName}</span>${coachBadge}</div>` : ''}
                        <div class="bg-fuchsia-500 text-white p-3 rounded-xl ${isGrouped ? 'rounded-tr-none' : 'rounded-br-none'}">
                            <p>${msg.text}</p>
                        </div>
                        <span class="text-xs text-slate-400 mt-1">${formatTimestamp(msg.timestamp)}</span>
                    </div>
                `;
            } else {
                content = `
                    <div class="${isGrouped ? 'w-8' : ''} flex-shrink-0">
                        ${!isGrouped ? `<img src="${msg.avatarUrl}" alt="${msg.userName}'s avatar" class="w-8 h-8 rounded-full">` : ''}
                    </div>
                    <div class="flex flex-col max-w-[80%]">
                        ${!isGrouped ? `<div class="flex items-center gap-1 mb-1"><span class="text-sm font-bold text-slate-700">${msg.userName}</span>${coachBadge}</div>` : ''}
                        <div class="bg-slate-200 text-slate-800 p-3 rounded-xl ${isGrouped ? 'rounded-tl-none' : 'rounded-bl-none'}">
                            <p>${msg.text}</p>
                        </div>
                        <span class="text-xs text-slate-400 mt-1 self-start">${formatTimestamp(msg.timestamp)}</span>
                    </div>
                `;
            }
            messageWrapper.innerHTML = content;
            messagesContainer.appendChild(messageWrapper);
            lastUserId = msg.userId;
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // --- EVENT HANDLERS ---
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === '') return;

        const newMessage = {
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            avatarUrl: currentUser.avatarUrl,
            text: text,
            timestamp: new Date().toISOString()
        };

        messages.push(newMessage);
        localStorage.setItem('groupDiscussionMessages', JSON.stringify(messages));
        
        messageInput.value = '';
        renderMessages();
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