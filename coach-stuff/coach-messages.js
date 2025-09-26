document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const conversationsList = document.getElementById('conversations-list');
    const tabAll = document.getElementById('tab-all');
    const tabDm = document.getElementById('tab-dm');
    const tabGroup = document.getElementById('tab-group');
    const tabRequests = document.getElementById('tab-requests');
    const requestsCountBadge = document.getElementById('requests-count-badge');
    
    // Elemen spesifik untuk Desktop
    const chatPlaceholder = document.getElementById('chat-placeholder');
    const dmChatWindow = document.getElementById('dm-chat-window');
    const groupChatWindow = document.getElementById('group-chat-window');

    const isDesktop = chatPlaceholder !== null; // Cara andal mendeteksi tampilan desktop
    const tabs = [tabAll, tabDm, tabGroup, tabRequests];
    let currentFilter = 'all';

    // --- RENDER FUNCTION ---
    const renderConversations = () => {
        conversationsList.innerHTML = ''; 

        const pendingRequests = (typeof bookingRequests !== 'undefined') 
            ? bookingRequests.filter(req => req.status === 'pending') 
            : [];

        if (requestsCountBadge) {
            if (pendingRequests.length > 0) {
                requestsCountBadge.textContent = pendingRequests.length;
                requestsCountBadge.classList.remove('hidden');
            } else {
                requestsCountBadge.classList.add('hidden');
            }
        }

        let itemsToRender;

        if (currentFilter === 'requests') {
            itemsToRender = pendingRequests.map(req => {
                const client = coachClients.find(c => c.id === req.clientId);
                return { isRequest: true, client, request: req };
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
            const conversationEl = document.createElement('a');
            let name, avatar, lastMessage, href;

            if (item.isRequest) {
                const { client, request } = item;
                name = client.name;
                avatar = client.avatar;
                href = `chat-view.html?clientId=${client.id}&isRequest=true&requestType=${encodeURIComponent(request.type)}&fromFilter=requests`;
                conversationEl.href = isDesktop ? '#' : href;
                
                conversationEl.className = 'flex items-center space-x-4 p-3 bg-sky-50 rounded-lg border border-sky-200 hover:bg-sky-100 transition-colors';
                conversationEl.innerHTML = `
                    <img src="${avatar}" alt="${name}" class="w-12 h-12 rounded-full object-cover flex-shrink-0">
                    <div class="flex-grow overflow-hidden">
                        <p class="font-bold text-gray-800 truncate">${name}</p>
                        <p class="text-sm text-sky-700 font-semibold truncate pr-4">Request: ${request.type}</p>
                    </div>
                    <div class="text-sky-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>`;
            } else { 
                const convo = item;
                const textColorClass = convo.unread ? 'text-gray-800' : 'text-gray-500';
                const unreadDot = convo.unread ? `<div class="w-3 h-3 bg-pink-500 rounded-full flex-shrink-0"></div>` : '<div class="w-3 h-3"></div>';

                if (convo.type === 'group') {
                    const group = groups.find(g => g.id === convo.id);
                    if (!group) return;
                    name = group.name;
                    avatar = group.avatar;
                    lastMessage = `${convo.lastSender}: ${convo.lastMessage}`;
                    href = `chat-view-group.html?groupId=${group.id}&fromFilter=${currentFilter}`;
                } else {
                    const client = coachClients.find(c => c.id === convo.id);
                    if (!client) return;
                    name = client.name;
                    avatar = client.avatar;
                    lastMessage = convo.lastMessage;
                    href = `chat-view.html?clientId=${client.id}&fromFilter=${currentFilter}`;
                }
                
                conversationEl.href = isDesktop ? '#' : href;
                conversationEl.className = 'flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100 transition-colors';
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
                    </div>`;
            }
            
            if (isDesktop) {
                conversationEl.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    document.querySelectorAll('#conversations-list a').forEach(el => el.classList.remove('conversation-active'));
                    conversationEl.classList.add('conversation-active');
                    
                    if (item.isRequest) {
                        const convoData = { type: 'dm', id: item.client.id };
                        showChatWindow(convoData, item.request); 
                    } else {
                        showChatWindow(item);
                    }
                });
            }
            
            conversationsList.appendChild(conversationEl);
        });
    };

    // --- FUNGSI UNTUK MERENDER ISI PESAN (Hanya untuk Desktop) ---
    const renderMessages = (messages = [], container, chatType = 'dm') => {
        if (!container) return;
        container.innerHTML = '';
        messages.forEach(msg => {
            const isCoach = msg.sender === 'coach';
            const bubbleClasses = isCoach ? 'bg-primary-gradient text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none';
            const messageEl = document.createElement('div');
            messageEl.className = `flex items-end gap-2 ${isCoach ? 'justify-end' : 'justify-start'}`;
            let senderAvatar = '', senderName = '';

            if (chatType === 'group' && !isCoach) {
                const client = coachClients.find(c => c.id === msg.senderId);
                if (client) {
                    senderAvatar = `<img src="${client.avatar}" class="w-8 h-8 rounded-full object-cover">`;
                    senderName = `<p class="text-xs font-bold text-pink-600 mb-1">${client.name}</p>`;
                }
            }
            
            const bubbleHTML = `
                <div class="max-w-xs md:max-w-md">
                    ${senderName}
                    <div class="p-3 rounded-2xl ${bubbleClasses}">
                        <p class="text-sm">${msg.text}</p>
                    </div>
                    <p class="text-xs text-gray-400 mt-1 px-1 ${isCoach ? 'text-right' : ''}">${msg.timestamp}</p>
                </div>
            `;
            
            messageEl.innerHTML = (chatType === 'group' && !isCoach) ? senderAvatar + bubbleHTML : bubbleHTML;
            container.appendChild(messageEl);
        });
        container.scrollTop = container.scrollHeight;
    };

    // --- FUNGSI UNTUK MENAMPILKAN CHAT DI PANEL KANAN (Hanya untuk Desktop) ---
    const showChatWindow = (convoData, requestDetails = null) => {
        if (!isDesktop) return;

        chatPlaceholder.classList.add('hidden');
        const requestInfoContainer = document.getElementById('dm-request-info');

        if (convoData.type === 'dm') {
            groupChatWindow.classList.add('hidden');
            dmChatWindow.classList.remove('hidden');
            const client = coachClients.find(c => c.id === convoData.id);
            if (!client) return;
            
            document.getElementById('client-avatar').src = client.avatar;
            document.getElementById('client-name').textContent = client.name;
            
            if (requestDetails) {
                requestInfoContainer.innerHTML = `<p class="text-sm text-sky-800">Responding to request for <strong>${requestDetails.type}</strong></p>`;
                requestInfoContainer.classList.remove('hidden');
            } else {
                requestInfoContainer.classList.add('hidden');
            }

            let history;
            if (requestDetails) {
                const clientName = client.name;
                const requestType = requestDetails.type;
                history = [{
                    sender: 'coach',
                    text: `Hi ${clientName}, thanks for reaching out about the "${requestType}". To get us started, could you tell me a bit about what you're hoping to achieve?`,
                    timestamp: 'Just now'
                }];
            } else {
                history = chatHistory[client.id] || [];
            }

            const container = document.getElementById('chat-container-dm');
            renderMessages(history, container, 'dm');

        } else if (convoData.type === 'group') {
            dmChatWindow.classList.add('hidden');
            groupChatWindow.classList.remove('hidden');
            if (requestInfoContainer) requestInfoContainer.classList.add('hidden');
            const group = groups.find(g => g.id === convoData.id);
            if (!group) return;
            document.getElementById('group-avatar').src = group.avatar;
            document.getElementById('group-name').textContent = group.name;
            document.getElementById('group-members').textContent = `${group.members.length} Members`;
            const history = groupChatHistory[group.id] || [];
            const container = document.getElementById('chat-container-group');
            renderMessages(history, container, 'group');
        }
    };

    // --- EVENT LISTENERS UNTUK TABS ---
    const handleTabClick = (filter, clickedTab) => {
        currentFilter = filter;
        tabs.forEach(tab => { if(tab) tab.classList.remove('tab-active') });
        if(clickedTab) clickedTab.classList.add('tab-active');
        renderConversations();
    };

    if(tabAll) tabAll.addEventListener('click', () => handleTabClick('all', tabAll));
    if(tabDm) tabDm.addEventListener('click', () => handleTabClick('dm', tabDm));
    if(tabGroup) tabGroup.addEventListener('click', () => handleTabClick('group', tabGroup));
    if(tabRequests) tabRequests.addEventListener('click', () => handleTabClick('requests', tabRequests));

    // --- INITIALIZATION ---
    // ==========================================================
    // INI ADALAH BAGIAN YANG DIPERBARUI DAN SEKARANG SUDAH BENAR
    // ==========================================================
    const urlParams = new URLSearchParams(window.location.search);
    const filterFromUrl = urlParams.get('filter');

    const tabMap = {
        'all': tabAll,
        'dm': tabDm,
        'group': tabGroup,
        'requests': tabRequests
    };

    if (filterFromUrl && tabMap[filterFromUrl]) {
        // Jika ada filter di URL dan tab-nya valid, aktifkan tab tersebut
        handleTabClick(filterFromUrl, tabMap[filterFromUrl]);
    } else {
        // Jika tidak ada filter, muat seperti biasa (default ke 'All')
        handleTabClick('all', tabAll);
    }
});