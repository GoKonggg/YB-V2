// File: main.js

document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================================
    // DATA MAKANAN (SEMENTARA)
    // =================================================================
    const foods = [
        { name: 'Chicken Breast', calories: 165, serving: '100 gr', carbs: 0, fat: 3.6, protein: 31 },
        { name: 'Brown Rice', calories: 111, serving: '1 cup', carbs: 23, fat: 0.9, protein: 2.6 },
        { name: 'Broccoli', calories: 55, serving: '1 cup', carbs: 11, fat: 0.6, protein: 3.7 },
        { name: 'Salmon', calories: 208, serving: '100 gr', carbs: 0, fat: 13, protein: 20 },
        { name: 'Avocado', calories: 160, serving: '1/2 fruit', carbs: 9, fat: 15, protein: 2 },
        { name: 'Egg', calories: 78, serving: '1 large', carbs: 0.6, fat: 5, protein: 6 },
        { name: 'Oatmeal, cooked', calories: 158, serving: '1 cup', carbs: 27.3, fat: 2.6, protein: 5.3 }
    ];

    // =================================================================
    // LOGIKA UNTUK HALAMAN share-food.html
    // =================================================================
    const shareFoodListContainer = document.getElementById('share-food-list');
    if (shareFoodListContainer) {
        // Logika Tab
        const tabCreate = document.getElementById('tab-create');
        const tabFind = document.getElementById('tab-find');
        const contentCreate = document.getElementById('content-create');
        const contentFind = document.getElementById('content-find');

        tabCreate.addEventListener('click', () => {
            contentCreate.classList.remove('hidden');
            contentFind.classList.add('hidden');
            tabCreate.classList.add('border-pink-500', 'text-pink-500');
            tabFind.classList.remove('border-pink-500', 'text-pink-500');
            tabFind.classList.add('border-transparent', 'text-gray-400');
        });

        tabFind.addEventListener('click', () => {
            contentFind.classList.remove('hidden');
            contentCreate.classList.add('hidden');
            tabFind.classList.add('border-pink-500', 'text-pink-500');
            tabCreate.classList.remove('border-pink-500', 'text-pink-500');
            tabCreate.classList.add('border-transparent', 'text-gray-400');
        });

        // Isi daftar makanan "Find From List"
        let foodListHTML = '';
        foods.forEach(food => {
            const foodParams = new URLSearchParams(food).toString();
            foodListHTML += `
                <div class="flex items-center justify-between p-3 rounded-lg bg-white/50">
                    <div>
                        <p class="font-bold text-gray-800">${food.name}</p>
                        <p class="text-sm text-gray-500">${food.calories} kal, ${food.serving}</p>
                    </div>
                    <a href="create-post.html?${foodParams}" class="px-4 py-1 text-pink-500 border border-pink-500 rounded-full text-sm font-semibold hover:bg-pink-500 hover:text-white">
                        Share
                    </a>
                </div>
            `;
        });
        shareFoodListContainer.innerHTML = foodListHTML;
        
        // Logika untuk tombol share dari form "Create Food"
        document.getElementById('share-custom-food-btn').addEventListener('click', () => {
            const customFood = {
                name: document.getElementById('create-name').value,
                serving: document.getElementById('create-serving').value,
                calories: document.getElementById('create-calories').value,
                carbs: document.getElementById('create-carbs').value,
                fat: document.getElementById('create-fat').value,
                protein: document.getElementById('create-protein').value,
            };
            const foodParams = new URLSearchParams(customFood).toString();
            window.location.href = `create-post.html?${foodParams}`;
        });
    }

    // =================================================================
    // LOGIKA UNTUK HALAMAN create-post.html
    // =================================================================
    const foodToShareDiv = document.getElementById('food-to-share');
    if (foodToShareDiv) {
        const urlParams = new URLSearchParams(window.location.search);
        const food = Object.fromEntries(urlParams.entries());

        foodToShareDiv.innerHTML = `
            <p class="font-bold text-gray-800">${food.name || 'N/A'}</p>
            <p class="text-sm text-gray-600">${food.calories || 'N/A'} Calories, ${food.serving || 'N/A'}</p>
        `;

        document.getElementById('final-share-btn').addEventListener('click', () => {
            const newPost = {
                user: { name: 'You', avatar: 'https://i.pravatar.cc/150?u=me' },
                time: 'Just now',
                caption: document.getElementById('caption').value,
                food: food,
                likes: 0,
                comments: 0
            };

            sessionStorage.setItem('newPost', JSON.stringify(newPost));
            window.location.href = 'community.html?tab=friends';
        });
    }

    // =================================================================
    // LOGIKA UNTUK HALAMAN community.html
    // =================================================================
    const feedFriendsContainer = document.getElementById('feed-friends');
    if (feedFriendsContainer) {
        // Logika Tab
        const tabExplore = document.getElementById('tab-explore');
        const tabFriends = document.getElementById('tab-friends');
        const feedExplore = document.getElementById('feed-explore');
        
        const setActiveTab = (activeTab, inactiveTab, activeFeed, inactiveFeed) => {
             activeTab.classList.add('border-pink-500', 'text-pink-500');
             inactiveTab.classList.remove('border-pink-500', 'text-pink-500');
             inactiveTab.classList.add('text-gray-400', 'border-transparent');
             activeFeed.classList.remove('hidden');
             inactiveFeed.classList.add('hidden');
        };
        
        tabExplore.addEventListener('click', () => setActiveTab(tabExplore, tabFriends, feedExplore, feedFriends));
        tabFriends.addEventListener('click', () => setActiveTab(tabFriends, tabExplore, feedFriends, feedExplore));

        // Cek apakah ada post baru dari sessionStorage
        const newPostJSON = sessionStorage.getItem('newPost');
        if (newPostJSON) {
            const post = JSON.parse(newPostJSON);
            
            // Buat elemen HTML untuk post baru
            const postElement = document.createElement('div');
            postElement.className = 'glass-card rounded-xl p-4';
            postElement.innerHTML = `
                <div class="flex items-center mb-3">
                    <img src="${post.user.avatar}" alt="Avatar" class="w-10 h-10 rounded-full mr-3 border-2 border-white">
                    <div>
                        <p class="font-bold text-gray-800">${post.user.name}</p>
                        <p class="text-xs text-gray-500">${post.time}</p>
                    </div>
                </div>
                <p class="mb-2 text-gray-800">${post.caption}</p>
                <div class="p-3 bg-white/50 rounded-lg mb-3">
                    <p class="font-bold text-gray-800">${post.food.name}</p>
                    <p class="text-sm text-gray-600">${post.food.calories} Calories, ${post.food.serving}</p>
                </div>
                <div class="flex items-center text-gray-500 space-x-6">
                    <button class="flex items-center space-x-1 hover:text-pink-500 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <span class="text-sm">${post.likes}</span>
                    </button>
                    <button class="flex items-center space-x-1 hover:text-pink-500 transition-colors">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <span class="text-sm">${post.comments}</span>
                    </button>
                </div>
            `;
            
            // Tambahkan post baru ke bagian atas feed Friends
            feedFriendsContainer.prepend(postElement);

            // Hapus dari storage agar tidak muncul lagi saat refresh
            sessionStorage.removeItem('newPost');
        }

        // Cek URL untuk mengaktifkan tab Friends
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('tab') === 'friends') {
            setActiveTab(tabFriends, tabExplore, feedFriends, feedExplore);
        }
    }
});