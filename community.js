// File: community.js

document.addEventListener('DOMContentLoaded', () => {
    const tabExplore = document.getElementById('tab-explore');
    const tabFriends = document.getElementById('tab-friends');
    const feedExplore = document.getElementById('feed-explore');
    const feedFriends = document.getElementById('feed-friends');

    // Fungsi untuk mengubah tab yang aktif
    const setActiveTab = (activeTab, inactiveTab, activeFeed, inactiveFeed) => {
        // Gaya tombol tab
        activeTab.classList.add('text-pink-500', 'border-pink-500');
        activeTab.classList.remove('text-gray-400', 'border-transparent');
        
        inactiveTab.classList.add('text-gray-400', 'border-transparent');
        inactiveTab.classList.remove('text-pink-500', 'border-pink-500');

        // Tampilkan feed yang sesuai
        activeFeed.classList.remove('hidden');
        inactiveFeed.classList.add('hidden');
    };

    // Event listener untuk tab Explore
    tabExplore.addEventListener('click', () => {
        setActiveTab(tabExplore, tabFriends, feedExplore, feedFriends);
    });

    // Event listener untuk tab Friends
    tabFriends.addEventListener('click', () => {
        setActiveTab(tabFriends, tabExplore, feedFriends, feedExplore);
    });
});