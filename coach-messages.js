// File: coach-messages.js
document.addEventListener('DOMContentLoaded', () => {
    // --- MOCK DATA (Simulasi database klien dan percakapan) ---
    const coachClients = [
        { id: 'client001', name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=jane-doe' },
        { id: 'client002', name: 'John Smith', avatar: 'https://i.pravatar.cc/150?u=john-smith' },
        { id: 'client003', name: 'Emily White', avatar: 'https://i.pravatar.cc/150?u=emily-white' }
    ];

    const conversations = [
        { clientId: 'client001', lastMessage: "Okay, I'll try that for tomorrow's breakfast!", timestamp: "10:32 AM", unread: false },
        { clientId: 'client002', lastMessage: "I missed my workout yesterday, feeling a bit demotivated.", timestamp: "9:15 AM", unread: true },
        { clientId: 'client003', lastMessage: "Just hit a new PR on my squats! Thanks for the tip.", timestamp: "Yesterday", unread: false }
    ];

    // --- ELEMENT SELECTOR ---
    const conversationsList = document.getElementById('conversations-list');

    // --- RENDER FUNCTION ---
    const renderConversations = () => {
        conversationsList.innerHTML = ''; // Kosongkan daftar

        if (conversations.length === 0) {
            conversationsList.innerHTML = `<p class="text-center text-gray-400 pt-16">No messages yet.</p>`;
            return;
        }

        conversations.forEach(convo => {
            const client = coachClients.find(c => c.id === convo.clientId);
            if (!client) return; // Lewati jika data klien tidak ditemukan

            const fontWeightClass = convo.unread ? 'font-bold' : 'font-medium';
            const textColorClass = convo.unread ? 'text-gray-800' : 'text-gray-500';
            const unreadDot = convo.unread ? `<div class="w-3 h-3 bg-pink-500 rounded-full flex-shrink-0"></div>` : '<div class="w-3 h-3"></div>';

            const conversationEl = document.createElement('a');
            conversationEl.href = `chat-view.html?clientId=${client.id}`;
            conversationEl.className = 'flex items-center space-x-4 p-3 bg-white/50 rounded-lg hover:bg-white transition-colors';
            
            conversationEl.innerHTML = `
                <img src="${client.avatar}" alt="${client.name}" class="w-12 h-12 rounded-full object-cover flex-shrink-0">
                <div class="flex-grow overflow-hidden">
                    <div class="flex justify-between items-center">
                        <p class="font-bold text-gray-800 truncate">${client.name}</p>
                        <p class="text-xs ${textColorClass} flex-shrink-0 ml-2">${convo.timestamp}</p>
                    </div>
                    <div class="flex justify-between items-start mt-1">
                        <p class="text-sm ${textColorClass} truncate pr-4">${convo.lastMessage}</p>
                        ${unreadDot}
                    </div>
                </div>
            `;
            conversationsList.appendChild(conversationEl);
        });
    };

    // --- INITIALIZATION ---
    renderConversations();
});