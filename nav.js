// File: main.js

document.addEventListener('DOMContentLoaded', () => {

    // === BAGIAN UNTUK NAVBAR (TOMBOL PLUS & MENU) ===
    // Logik ini akan berjalan di semua halaman yang memiliki navbar.
    
    const plusButton = document.getElementById('plus-button');
    const plusMenu = document.getElementById('plus-menu');

    if (plusButton && plusMenu) {
        plusButton.addEventListener('click', (event) => {
            event.stopPropagation();
            plusMenu.classList.toggle('hidden');
        });

        window.addEventListener('click', () => {
            if (!plusMenu.classList.contains('hidden')) {
                plusMenu.classList.add('hidden');
            }
        });
    }

    // === BAGIAN KHUSUS UNTUK HALAMAN COMMUNITY (TAB) ===
    // Logik ini hanya akan berjalan jika menemukan elemen tab.

    const tabExplore = document.getElementById('tab-explore');
    const tabFriends = document.getElementById('tab-friends');
    
    if (tabExplore && tabFriends) {
        const feedExplore = document.getElementById('feed-explore');
        const feedFriends = document.getElementById('feed-friends');

        const setActiveTab = (activeTab, inactiveTab, activeFeed, inactiveFeed) => {
            activeTab.classList.add('text-pink-500', 'border-pink-500');
            activeTab.classList.remove('text-gray-400', 'border-transparent');
            
            inactiveTab.classList.add('text-gray-400', 'border-transparent');
            inactiveTab.classList.remove('text-pink-500', 'border-pink-500');

            activeFeed.classList.remove('hidden');
            inactiveFeed.classList.add('hidden');
        };

        tabExplore.addEventListener('click', () => {
            setActiveTab(tabExplore, tabFriends, feedExplore, feedFriends);
        });

        tabFriends.addEventListener('click', () => {
            setActiveTab(tabFriends, tabExplore, feedFriends, feedExplore);
        });
    }

});