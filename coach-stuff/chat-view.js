// Di dalam file: chat-view.js (Versi Final)

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const backButton = document.getElementById('back-button'); // Selector untuk tombol back
    const clientAvatarEl = document.getElementById('client-avatar');
    const clientNameEl = document.getElementById('client-name');
    const chatContainer = document.getElementById('chat-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const requestInfoBanner = document.getElementById('request-info-banner');

    // --- MAIN LOGIC ---
    
    // Ambil semua parameter dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId');
    const isRequest = urlParams.get('isRequest') === 'true';
    const requestType = urlParams.get('requestType');
    const fromFilter = urlParams.get('fromFilter'); // Ambil filter asal

    // MODIFIKASI UTAMA: Atur link tombol back secara dinamis
    if (fromFilter) {
        backButton.href = `coach-messages.html?filter=${fromFilter}`;
    }

    const client = coachClients.find(c => c.id === clientId);
    if (!client) {
        document.body.innerHTML = `<p class="text-center text-red-500 p-8">Error: Client not found.</p>`;
        return;
    }

    // Update header dengan info klien
    clientAvatarEl.src = client.avatar;
    clientNameEl.textContent = client.name;

    let currentHistory = [];

    // Cek apakah ini chat dari sebuah request
    if (isRequest && requestType) {
        requestInfoBanner.innerHTML = `<p class="text-sm text-sky-800">Responding to request for <strong>${requestType}</strong></p>`;
        requestInfoBanner.classList.remove('hidden');

        currentHistory = [{
            sender: 'coach',
            text: `Hi ${client.name}, thanks for your request about the "${requestType}". To get us started, could you tell me a bit more about your goals?`,
            timestamp: 'Just now'
        }];
    } else {
        // Muat riwayat chat yang sudah ada
        currentHistory = chatHistory[clientId] || [];
    }

    // --- RENDER FUNCTION ---
    const renderMessages = (messages) => {
        chatContainer.innerHTML = '';
        messages.forEach(msg => {
            const isCoach = msg.sender === 'coach';
            const bubbleClasses = isCoach 
                ? 'bg-primary-gradient text-white rounded-br-none self-end' 
                : 'bg-gray-200 text-gray-800 rounded-bl-none self-start';
            
            const messageWrapper = document.createElement('div');
            messageWrapper.className = 'flex flex-col';

            messageWrapper.innerHTML = `
                <div class="p-3 rounded-2xl max-w-xs md:max-w-md ${bubbleClasses}">
                    <p class="text-sm">${msg.text}</p>
                </div>
                <p class="text-xs text-gray-400 mt-1 px-1 ${isCoach ? 'text-right' : ''}">${msg.timestamp}</p>
            `;
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