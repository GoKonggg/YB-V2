// File: chat-view.js
document.addEventListener('DOMContentLoaded', () => {
    // --- MOCK DATA (Simulasi database klien dan riwayat chat) ---
    const coachClients = [
        { id: 'client001', name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=jane-doe' },
        { id: 'client002', name: 'John Smith', avatar: 'https://i.pravatar.cc/150?u=john-smith' },
        { id: 'client003', name: 'Emily White', avatar: 'https://i.pravatar.cc/150?u=emily-white' }
    ];

    const chatHistory = {
        'client001': [
            { sender: 'client', text: "Hey! Just checking in for the week.", timestamp: "10:30 AM" },
            { sender: 'coach', text: "Hi Jane! Great to hear from you. How was the new breakfast suggestion?", timestamp: "10:31 AM" },
            { sender: 'client', text: "Okay, I'll try that for tomorrow's breakfast!", timestamp: "10:32 AM" }
        ],
        'client002': [
            { sender: 'coach', text: "Hey John, I noticed you didn't log your food yesterday. Everything alright?", timestamp: "8:45 AM" },
            { sender: 'client', text: "I missed my workout yesterday, feeling a bit demotivated.", timestamp: "9:15 AM" }
        ],
        'client003': [
            { sender: 'client', text: "Just hit a new PR on my squats! Thanks for the tip.", timestamp: "Yesterday" }
        ]
    };

    // --- ELEMENT SELECTORS ---
    const clientAvatar = document.getElementById('client-avatar');
    const clientName = document.getElementById('client-name');
    const chatContainer = document.getElementById('chat-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');

    // --- RENDER FUNCTION ---
    const renderMessages = (messages = []) => {
        chatContainer.innerHTML = ''; // Clear existing messages
        messages.forEach(msg => {
            const isCoach = msg.sender === 'coach';
            const bubbleClasses = isCoach 
                ? 'bg-pink-500 text-white self-end' 
                : 'bg-gray-200 text-gray-800 self-start';
            
            const messageEl = document.createElement('div');
            messageEl.className = `flex flex-col ${isCoach ? 'items-end' : 'items-start'}`;
            
            messageEl.innerHTML = `
                <div class="max-w-xs md:max-w-md p-3 rounded-2xl ${bubbleClasses}">
                    <p class="text-sm">${msg.text}</p>
                </div>
                <p class="text-xs text-gray-400 mt-1 px-1">${msg.timestamp}</p>
            `;
            chatContainer.appendChild(messageEl);
        });

        // Auto-scroll to the bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    // --- MAIN LOGIC ---
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId');
    
    const client = coachClients.find(c => c.id === clientId);
    const messages = chatHistory[clientId] || [];

    if (!client) {
        document.body.innerHTML = '<h1>Client not found.</h1>';
        return;
    }

    // Populate header
    clientAvatar.src = client.avatar;
    clientName.textContent = client.name;
    
    // --- EVENT LISTENERS ---
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (text === '') return;

        // Add new message to the history
        const newMessage = {
            sender: 'coach',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        messages.push(newMessage);

        // Re-render the chat
        renderMessages(messages);

        // Clear the input
        messageInput.value = '';
    });

    // --- INITIALIZATION ---
    renderMessages(messages);
});