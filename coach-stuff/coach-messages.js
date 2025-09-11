document.addEventListener('DOMContentLoaded', () => {
    // KOSONGKAN BAGIAN MOCK DATA DI SINI
    // Semua data seperti coachClients, groups, conversations, dan bookingRequests
    // diasumsikan sudah dimuat dari file data.js

    // --- ELEMENT SELECTORS ---
    const conversationsList = document.getElementById('conversations-list');
    const tabAll = document.getElementById('tab-all');
    const tabDm = document.getElementById('tab-dm');
    const tabGroup = document.getElementById('tab-group');
    const tabRequests = document.getElementById('tab-requests');
    const requestsCountBadge = document.getElementById('requests-count-badge');
    
    // --- ELEMENT SELECTORS (Tambahkan ini) ---
const chatPlaceholder = document.getElementById('chat-placeholder');
const dmChatWindow = document.getElementById('dm-chat-window');
const groupChatWindow = document.getElementById('group-chat-window');
    // Kelompokkan semua tab dalam satu array
    const tabs = [tabAll, tabDm, tabGroup, tabRequests];

    let currentFilter = 'all'; // State untuk menyimpan filter aktif

    // --- RENDER FUNCTION ---
    const renderConversations = () => {
        conversationsList.innerHTML = ''; // Selalu kosongkan daftar sebelum render ulang

        // Pastikan bookingRequests sudah ada sebelum digunakan
        const pendingRequests = (typeof bookingRequests !== 'undefined') 
            ? bookingRequests.filter(req => req.status === 'pending') 
            : [];

        // Hitung jumlah request yang pending untuk ditampilkan di badge notifikasi
        if (requestsCountBadge) {
            if (pendingRequests.length > 0) {
                requestsCountBadge.textContent = pendingRequests.length;
                requestsCountBadge.classList.remove('hidden');
            } else {
                requestsCountBadge.classList.add('hidden');
            }
        }

        let itemsToRender;

        // Cek filter mana yang sedang aktif
        if (currentFilter === 'requests') {
            itemsToRender = pendingRequests.map(req => {
                const client = coachClients.find(c => c.id === req.clientId);
                return {
                    isRequest: true,
                    client: client,
                    request: req
                };
            });
        } else {
            itemsToRender = conversations.filter(convo => {
                if (currentFilter === 'all') return true;
                return convo.type === currentFilter;
            });
        }

        if (itemsToRender.length === 0) {
            conversationsList.innerHTML = `<p class="text-center text-gray-400 pt-16">No items in this category.</p>`;
            return;
        }

        itemsToRender.forEach(item => {
            if (item.isRequest) {
                const { client, request } = item;
                const conversationEl = document.createElement('a');
                conversationEl.href = `chat-view.html?clientId=${client.id}`;
                conversationEl.className = 'flex items-center space-x-4 p-3 bg-sky-50 rounded-lg border border-sky-200 hover:bg-sky-100 transition-colors';
                
                conversationEl.innerHTML = `
                    <img src="${client.avatar}" alt="${client.name}" class="w-12 h-12 rounded-full object-cover flex-shrink-0">
                    <div class="flex-grow overflow-hidden">
                        <p class="font-bold text-gray-800 truncate">${client.name}</p>
                        <p class="text-sm text-sky-700 font-semibold truncate pr-4">Request: ${request.type}</p>
                    </div>
                    <div class="text-sky-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>
                `;
                conversationsList.appendChild(conversationEl);
            } else { 
                const convo = item;
                let name, avatar, lastMessage, href;
                const textColorClass = convo.unread ? 'text-gray-800' : 'text-gray-500';
                const unreadDot = convo.unread ? `<div class="w-3 h-3 bg-pink-500 rounded-full flex-shrink-0"></div>` : '<div class="w-3 h-3"></div>';

                if (convo.type === 'group') {
                    const group = groups.find(g => g.id === convo.id);
                    if (!group) return;
                    
                    name = group.name;
                    avatar = group.avatar;
                    lastMessage = `${convo.lastSender}: ${convo.lastMessage}`;
                    href = `./coach-stuff/chat-view-group.html?groupId=${group.id}`;
                } else {
                    const client = coachClients.find(c => c.id === convo.id);
                    if (!client) return;
                    
                    name = client.name;
                    avatar = client.avatar;
                    lastMessage = convo.lastMessage;
                    href = `chat-view.html?clientId=${client.id}`;
                }

                const conversationEl = document.createElement('a');
                conversationEl.href = href;
                conversationEl.className = 'flex items-center space-x-4 p-3 bg-white/50 rounded-lg hover:bg-white transition-colors';
                
                conversationEl.innerHTML = `
                    <img src="${avatar}" alt="${name}" class="w-12 h-12 rounded-full object-cover flex-shrink-0 ${convo.type === 'group' ? 'p-1 bg-gray-200' : ''}">
                    <div class="flex-grow overflow-hidden">
                        <div class="flex justify-between items-center">
                            <p class="font-bold text-gray-800 truncate">${name}</p>
                            <p class="text-xs ${textColorClass} flex-shrink-0 ml-2">${convo.timestamp}</p>
                        </div>
                        <div class="flex justify-between items-start mt-1">
                            <p class="text-sm ${textColorClass} truncate pr-4">${lastMessage}</p>
                            ${unreadDot}
                        </div>
                    </div>
                `;

                conversationEl.addEventListener('click', (e) => {
    // Hanya berlaku untuk desktop
    if (window.innerWidth < 1024) return; 

    e.preventDefault(); // Mencegah link berpindah halaman di desktop

    // Beri highlight pada percakapan yang aktif
    document.querySelectorAll('#conversations-list a').forEach(el => el.classList.remove('conversation-active'));
    conversationEl.classList.add('conversation-active');

    // Panggil fungsi untuk menampilkan chat di panel kanan
    const convoData = item.isRequest ? { type: 'dm', id: item.client.id } : item;
                showChatWindow(convoData);
});
                conversationsList.appendChild(conversationEl);
            }
        });
    };
    // --- FUNGSI BARU UNTUK MERENDER ISI PESAN ---
const renderMessages = (messages = [], container, chatType = 'dm') => {
    container.innerHTML = ''; // Kosongkan kontainer

    messages.forEach(msg => {
        const isCoach = msg.sender === 'coach';
        
        // Menentukan style bubble
        const bubbleClasses = isCoach 
            ? 'bg-primary-gradient text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none';

        const messageEl = document.createElement('div');
        messageEl.className = `flex items-end gap-2 ${isCoach ? 'justify-end' : 'justify-start'}`;
        
        let senderAvatar = '';
        let senderName = '';

        // Untuk grup, tampilkan avatar dan nama pengirim lain
        if (chatType === 'group' && !isCoach) {
            const client = coachClients.find(c => c.id === msg.senderId);
            if (client) {
                senderAvatar = `<img src="${client.avatar}" class="w-8 h-8 rounded-full object-cover">`;
                senderName = `<p class="text-xs font-bold text-pink-600 mb-1">${client.name}</p>`;
            }
        }
        
        // Tentukan urutan bubble dan avatar
        const bubbleHTML = `
            <div class="max-w-xs md:max-w-md">
                ${senderName}
                <div class="p-3 rounded-2xl ${bubbleClasses}">
                    <p class="text-sm">${msg.text}</p>
                </div>
                <p class="text-xs text-gray-400 mt-1 px-1 ${isCoach ? 'text-right' : ''}">${msg.timestamp}</p>
            </div>
        `;
        
        messageEl.innerHTML = (chatType === 'group' && !isCoach) 
            ? senderAvatar + bubbleHTML 
            : bubbleHTML;

        container.appendChild(messageEl);
    });

    // Auto-scroll ke pesan paling bawah
    container.scrollTop = container.scrollHeight;
};

    // --- FUNGSI BARU UNTUK MENAMPILKAN CHAT DI PANEL KANAN ---
const showChatWindow = (convoData) => {
    if (!chatPlaceholder) return; 

    chatPlaceholder.classList.add('hidden');
    const convo = convoData.isRequest ? { type: 'dm', id: convoData.client.id } : convoData;

    if (convo.type === 'dm') {
        groupChatWindow.classList.add('hidden');
        dmChatWindow.classList.remove('hidden');

        const client = coachClients.find(c => c.id === convo.id);
        if (!client) return;
        
        document.getElementById('client-avatar').src = client.avatar;
        document.getElementById('client-name').textContent = client.name;
        
        // --- MODIFIKASI DI SINI ---
        const history = chatHistory[client.id] || [];
        const container = document.getElementById('chat-container-dm');
        renderMessages(history, container, 'dm');

    } else if (convo.type === 'group') {
        dmChatWindow.classList.add('hidden');
        groupChatWindow.classList.remove('hidden');

        const group = groups.find(g => g.id === convo.id);
        if (!group) return;

        document.getElementById('group-avatar').src = group.avatar;
        document.getElementById('group-name').textContent = group.name;
        document.getElementById('group-members').textContent = `${group.members.length} Members`;
        
        // --- MODIFIKASI DI SINI ---
        const history = groupChatHistory[group.id] || [];
        const container = document.getElementById('chat-container-group');
        renderMessages(history, container, 'group');
    }
};
    // --- EVENT LISTENERS UNTUK TABS ---
    const handleTabClick = (filter, clickedTab) => {
        currentFilter = filter;
        tabs.forEach(tab => tab.classList.remove('tab-active'));
        clickedTab.classList.add('tab-active');
        renderConversations();
    };

    tabAll.addEventListener('click', () => handleTabClick('all', tabAll));
    tabDm.addEventListener('click', () => handleTabClick('dm', tabDm));
    tabGroup.addEventListener('click', () => handleTabClick('group', tabGroup));
    tabRequests.addEventListener('click', () => handleTabClick('requests', tabRequests));

    // --- INITIALIZATION ---
    const urlParams = new URLSearchParams(window.location.search);
    const filterFromUrl = urlParams.get('filter');
    if (filterFromUrl === 'requests') {
        handleTabClick('requests', tabRequests);
    } else {
        renderConversations();
    }
});