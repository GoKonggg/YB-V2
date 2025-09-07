document.addEventListener('DOMContentLoaded', () => {
    // --- MOCK DATA (Simulasi database klien dan percakapan) ---
    const coachClients = [
        { id: 'client001', name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=jane-doe' },
        { id: 'client002', name: 'John Smith', avatar: 'https://i.pravatar.cc/150?u=john-smith' },
        { id: 'client003', name: 'Emily White', avatar: 'https://i.pravatar.cc/150?u=emily-white' }
    ];

    const groups = [
        { 
            id: 'group001', 
            name: 'General Program - Sept 2025', 
            avatar: 'https://static.thenounproject.com/png/493922-200.png', // Ikon grup yang lebih simpel
            members: ['client001', 'client002', 'client003'] 
        }
    ];

    const conversations = [
        { type: 'group', id: 'group001', lastMessage: "Hey everyone, welcome to the group!", lastSender: "Coach", timestamp: "11:05 AM", unread: true },
        { type: 'dm', id: 'client001', lastMessage: "Okay, I'll try that for tomorrow's breakfast!", timestamp: "10:32 AM", unread: false },
        { type: 'dm', id: 'client002', lastMessage: "I missed my workout yesterday, feeling a bit demotivated.", timestamp: "9:15 AM", unread: true },
        { type: 'dm', id: 'client003', lastMessage: "Just hit a new PR on my squats! Thanks for the tip.", timestamp: "Yesterday", unread: false }
    ];

    // --- ELEMENT SELECTORS ---
    const conversationsList = document.getElementById('conversations-list');
    const tabAll = document.getElementById('tab-all');
    const tabDm = document.getElementById('tab-dm');
    const tabGroup = document.getElementById('tab-group');
    const tabs = [tabAll, tabDm, tabGroup];

    let currentFilter = 'all'; // State untuk menyimpan filter aktif

    // --- RENDER FUNCTION ---
    const renderConversations = () => {
        conversationsList.innerHTML = ''; // Kosongkan daftar sebelum render ulang

        // Filter percakapan berdasarkan tab yang aktif
        const filteredConversations = conversations.filter(convo => {
            if (currentFilter === 'all') return true;
            return convo.type === currentFilter;
        });

        if (filteredConversations.length === 0) {
            conversationsList.innerHTML = `<p class="text-center text-gray-400 pt-16">No messages in this category.</p>`;
            return;
        }

        // Looping untuk setiap percakapan yang sudah difilter
        filteredConversations.forEach(convo => {
            let name, avatar, lastMessage, href;
            const textColorClass = convo.unread ? 'text-gray-800' : 'text-gray-500';
            const unreadDot = convo.unread ? `<div class="w-3 h-3 bg-pink-500 rounded-full flex-shrink-0"></div>` : '<div class="w-3 h-3"></div>';

            // Cek tipe percakapan untuk menentukan data dan tampilan
            if (convo.type === 'group') {
                const group = groups.find(g => g.id === convo.id);
                if (!group) return;
                
                name = group.name;
                avatar = group.avatar;
                lastMessage = `${convo.lastSender}: ${convo.lastMessage}`; // Tampilkan pengirim terakhir
                href = `./coach-stuff/chat-view-group.html?groupId=${group.id}`;
            } else { // type === 'dm'
                const client = coachClients.find(c => c.id === convo.id);
                if (!client) return;
                
                name = client.name;
                avatar = client.avatar;
                lastMessage = convo.lastMessage;
                href = `chat-view.html?clientId=${client.id}`;
            }

            // Buat elemen HTML untuk setiap item percakapan
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
            conversationsList.appendChild(conversationEl);
        });
    };

    // --- EVENT LISTENERS UNTUK TABS ---
    const handleTabClick = (filter, clickedTab) => {
        currentFilter = filter;
        // Hapus class 'tab-active' dari semua tab, lalu tambahkan ke yang diklik
        tabs.forEach(tab => tab.classList.remove('tab-active'));
        clickedTab.classList.add('tab-active');
        renderConversations(); // Render ulang daftar dengan filter baru
    };

    tabAll.addEventListener('click', () => handleTabClick('all', tabAll));
    tabDm.addEventListener('click', () => handleTabClick('dm', tabDm));
    tabGroup.addEventListener('click', () => handleTabClick('group', tabGroup));

    // --- INITIALIZATION ---
    renderConversations(); // Panggil fungsi ini saat halaman pertama kali dimuat
});