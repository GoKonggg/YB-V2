document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const backButton = document.getElementById('back-button');
    const groupAvatarEl = document.getElementById('group-avatar');
    const groupNameEl = document.getElementById('group-name');
    const groupMembersEl = document.getElementById('group-members');
    const chatContainer = document.getElementById('chat-container-group');
    const messageForm = document.getElementById('message-form-group');
    const messageInput = document.getElementById('message-input-group');

    // --- MAIN LOGIC ---
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('groupId');
    const fromFilter = urlParams.get('fromFilter'); // Ambil filter asal dari URL

    // Atur link tombol back secara dinamis
    if (fromFilter) {
        backButton.href = `coach-messages.html?filter=${fromFilter}`;
    }

    // Cari data grup dari 'data.js'
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        document.body.innerHTML = `<p class="text-center text-red-500 p-8">Error: Group not found.</p>`;
        return;
    }

    // Update header dengan info grup
    groupAvatarEl.src = group.avatar;
    groupNameEl.textContent = group.name;
    groupMembersEl.textContent = `${group.members.length} Members`;

    // Ambil riwayat chat grup dari 'data.js'
    let currentHistory = groupChatHistory[groupId] || [];

    // --- RENDER FUNCTION ---
    const renderMessages = (messages) => {
        chatContainer.innerHTML = '';
        messages.forEach(msg => {
            const isCoach = msg.sender === 'coach';
            const messageWrapper = document.createElement('div');
            messageWrapper.className = 'flex items-end gap-2 ' + (isCoach ? 'justify-end' : 'justify-start');

            let senderAvatarHTML = '';
            let bubbleContentHTML = '';

            if (isCoach) {
                bubbleContentHTML = `
                    <div class="max-w-xs md:max-w-md">
                        <div class="p-3 rounded-2xl bg-primary-gradient text-white rounded-br-none">
                            <p class="text-sm">${msg.text}</p>
                        </div>
                        <p class="text-xs text-gray-400 mt-1 px-1 text-right">${msg.timestamp}</p>
                    </div>`;
            } else {
                const client = coachClients.find(c => c.id === msg.senderId);
                senderAvatarHTML = `<img src="${client ? client.avatar : ''}" class="w-8 h-8 rounded-full object-cover">`;
                bubbleContentHTML = `
                    <div class="max-w-xs md:max-w-md">
                        <p class="text-xs font-bold text-pink-600 mb-1">${client ? client.name : 'Unknown User'}</p>
                        <div class="p-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                            <p class="text-sm">${msg.text}</p>
                        </div>
                        <p class="text-xs text-gray-400 mt-1 px-1">${msg.timestamp}</p>
                    </div>`;
            }

            messageWrapper.innerHTML = senderAvatarHTML + bubbleContentHTML;
            chatContainer.appendChild(messageWrapper);
        });
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    // --- FORM SUBMISSION ---
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (text === '') return;
        
        const newMessage = {
            sender: 'coach',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        currentHistory.push(newMessage);
        renderMessages(currentHistory);
        messageInput.value = '';
    });

    // --- INITIAL RENDER ---
    renderMessages(currentHistory);
});