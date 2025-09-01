// File: community.js
// Fungsi: Mengontrol tab Explore/Friends dan menampilkan post baru.

document.addEventListener('DOMContentLoaded', () => {
    const feedFriendsContainer = document.getElementById('feed-friends');
    if (!feedFriendsContainer) return; // Hanya berjalan di halaman community

    const tabExplore = document.getElementById('tab-explore');
    const tabFriends = document.getElementById('tab-friends');
    
    // --- PERBAIKAN DI SINI ---
    // Deklarasikan variabel feed di sini agar bisa diakses oleh semua fungsi di bawahnya
    const feedExplore = document.getElementById('feed-explore');
    const feedFriends = document.getElementById('feed-friends'); 
    // --- PERBAIKAN SELESAI ---

    const setActiveTab = (activeTab, inactiveTab, activeFeed, inactiveFeed) => {
         activeTab.classList.add('border-pink-500', 'text-pink-500');
         inactiveTab.classList.remove('border-pink-500', 'text-pink-500');
         inactiveTab.classList.add('text-gray-400', 'border-transparent');
         activeFeed.classList.remove('hidden');
         inactiveFeed.classList.add('hidden');
    };
    
    tabExplore.addEventListener('click', () => setActiveTab(tabExplore, tabFriends, feedExplore, feedFriends));
    tabFriends.addEventListener('click', () => setActiveTab(tabFriends, tabExplore, feedFriends, feedExplore));
    
    const newPostJSON = sessionStorage.getItem('newPost');
    const urlParams = new URLSearchParams(window.location.search);

    if (newPostJSON) {
        setActiveTab(tabFriends, tabExplore, feedFriends, feedExplore);

        const post = JSON.parse(newPostJSON);
        const postElement = document.createElement('div');
        postElement.className = 'glass-card rounded-xl p-4';
        
        // ... (kode innerHTML untuk menampilkan post tetap sama) ...
        postElement.innerHTML = `
            <div class="flex items-center mb-3">
                <img src="${post.user.avatar}" alt="Avatar" class="w-10 h-10 rounded-full mr-3 border-2 border-white">
                <div><p class="font-bold text-gray-800">${post.user.name}</p><p class="text-xs text-gray-500">${post.time}</p></div>
            </div>
            <p class="mb-2 text-gray-800">${post.caption || ''}</p>
            ${post.postType === 'meal' && post.food ? `
            <div class="p-3 bg-white/50 rounded-lg mb-3">
                <p class="font-bold text-gray-800">${post.food.name}</p>
                <p class="text-sm text-gray-600">${post.food.calories} Calories, ${post.food.serving}</p>
            </div>` : ''}
            ${post.postType === 'workout' && post.workout ? `
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                <p class="font-bold text-blue-800">${post.workout.type}</p>
                <p class="text-sm text-blue-600">${post.workout.duration} minutes - ${post.workout.calories || 0} Cal burned</p>
            </div>` : ''}
            <div class="flex items-center text-gray-500 space-x-6">
                <button class="flex items-center space-x-1 hover:text-pink-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg><span>${post.likes}</span></button>
                <button class="flex items-center space-x-1 hover:text-pink-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg><span>${post.comments}</span></button>
            </div>
        `;
        
        feedFriendsContainer.prepend(postElement);
        sessionStorage.removeItem('newPost');
    } 
    else if (urlParams.get('tab') === 'friends') {
        setActiveTab(tabFriends, tabExplore, feedFriends, feedExplore);
    }
});