// File: community.js
// Fungsi: Mengontrol tab, menampilkan post, dan menangani penyimpanan makanan dengan feedback yang jelas.

document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen Tab & Feed ---
    const tabExplore = document.getElementById('tab-explore');
    const tabFriends = document.getElementById('tab-friends');
    const tabTransformations = document.getElementById('tab-transformations');

    const feedExploreContainer = document.getElementById('feed-explore');
    const feedFriendsContainer = document.getElementById('feed-friends');
    const feedTransformationsContainer = document.getElementById('feed-transformations');

    // Kumpulan semua tab dan feed untuk mempermudah logika
    const TABS = {
        explore: { button: tabExplore, feed: feedExploreContainer },
        friends: { button: tabFriends, feed: feedFriendsContainer },
        transformations: { button: tabTransformations, feed: feedTransformationsContainer }
    };

    // --- FUNGSI: Menampilkan notifikasi "Toast" ---
    const showToast = (message) => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = message;

        container.appendChild(toast);

        // Hapus toast setelah 3 detik
        setTimeout(() => {
            toast.remove();
        }, 3000);
    };
    
    // --- Logika Tab (Dibuat fleksibel untuk menangani banyak tab) ---
    const setActiveTab = (activeKey) => {
        // Loop melalui semua tab yang ada di objek TABS
        Object.keys(TABS).forEach(key => {
            const tab = TABS[key];
            
            // Periksa apakah elemen tombol dan feed ada sebelum memanipulasinya
            if (!tab.button || !tab.feed) {
                console.error(`Elemen untuk tab '${key}' tidak ditemukan.`);
                return;
            }

            if (key === activeKey) {
                // Aktifkan tab yang dipilih
                tab.button.classList.add('border-pink-500', 'text-pink-500');
                tab.button.classList.remove('text-gray-400', 'border-transparent');
                tab.feed.classList.remove('hidden');
            } else {
                // Non-aktifkan tab lainnya
                tab.button.classList.remove('border-pink-500', 'text-pink-500');
                tab.button.classList.add('text-gray-400', 'border-transparent');
                tab.feed.classList.add('hidden');
            }
        });
    };

    // Tambahkan event listener untuk setiap tombol tab
    if (tabExplore) {
        tabExplore.addEventListener('click', () => setActiveTab('explore'));
    }
    if (tabFriends) {
        tabFriends.addEventListener('click', () => setActiveTab('friends'));
    }
    if (tabTransformations) {
        tabTransformations.addEventListener('click', () => setActiveTab('transformations'));
    }
    
    // --- Fungsi Pembuatan Elemen Post ---
    const createPostElement = (post) => {
        const postElement = document.createElement('div');
        postElement.className = 'glass-card rounded-xl p-4';

        if (post.postType === 'meal' && post.food) {
            postElement.dataset.foodJson = JSON.stringify(post.food);
        }

        const mealHTML = (post.postType === 'meal' && post.food) ? `
            <div class="p-3 bg-white/50 rounded-lg my-3">
                <p class="font-bold text-gray-800">${post.food.name}</p>
                <p class="text-sm text-gray-600">${post.food.calories} Calories, ${post.food.serving}</p>
            </div>` : '';

        const saveButtonHTML = (post.postType === 'meal' && post.food) ? `
            <button class="save-food-btn flex items-center ml-auto px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100/80 rounded-full border border-gray-200 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                <svg class="w-4 h-4 -ml-1 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg>
                Add Food
            </button>` : '';

        postElement.innerHTML = `
            <div class="flex items-center mb-3">
                <img src="${post.user.avatar}" alt="Avatar" class="w-10 h-10 rounded-full mr-3 border-2 border-white">
                <div><p class="font-bold text-gray-800">${post.user.name}</p><p class="text-xs text-gray-500">${post.time}</p></div>
            </div>
            <p class="mb-2 text-gray-800">${post.caption || ''}</p>
            ${mealHTML}
            <div class="flex items-center text-gray-500 mt-4">
                <button class="flex items-center space-x-1 hover:text-pink-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path></svg><span>${post.likes}</span></button>
                <button class="flex items-center space-x-1 hover:text-pink-500 ml-4"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.158 2.098.286 3.15 0.405a21.23 21.23 0 01-2.672 3.11a.75.75 0 00.058 1.141 22.536 22.536 0 005.102-2.192.53.53 0 00.27-0.215c.012-.02.023-.04.033-.06a21.23 21.23 0 012.894 0c.01.02.021.04.033.06.096.106.18.204.27.215a22.536 22.536 0 005.102 2.192.75.75 0 00.058-1.141 21.23 21.23 0 01-2.672-3.11c1.052-.119 2.082-.247 3.15-.405 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.344 48.344 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"></path></svg><span>${post.comments}</span></button>
                ${saveButtonHTML}
            </div>
        `;
        return postElement;
    };
    
    // --- Fungsi Handler untuk tombol "Add Food" ---
    const handleSaveFoodClick = (event) => {
        const saveButton = event.target.closest('.save-food-btn');
        if (!saveButton) return;

        const postElement = event.target.closest('.glass-card');
        const foodDataJSON = postElement.dataset.foodJson;

        if (foodDataJSON) {
            const foodData = JSON.parse(foodDataJSON);
            const myFoods = JSON.parse(localStorage.getItem('myFoodList')) || [];
            const isDuplicate = myFoods.some(item => item.name.toLowerCase() === foodData.name.toLowerCase());

            if (!isDuplicate) {
                myFoods.push(foodData);
                localStorage.setItem('myFoodList', JSON.stringify(myFoods));
                
                showToast(`✅&nbsp; <strong>${foodData.name}</strong> added to My Food.`);
            } else {
                showToast(`ℹ️&nbsp; <strong>${foodData.name}</strong> is already in My Food.`);
            }

            saveButton.innerHTML = `<svg class="w-4 h-4 -ml-1 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg> Added`;
            saveButton.classList.remove('text-gray-600', 'bg-gray-100/80', 'hover:border-pink-300', 'hover:bg-pink-50', 'hover:text-pink-600');
            saveButton.classList.add('text-green-700', 'bg-green-50', 'border-green-200');
            saveButton.disabled = true;
        }
    };

    // --- Event Listener Utama untuk tombol "Add Food" ---
    if (feedExploreContainer) {
        feedExploreContainer.addEventListener('click', handleSaveFoodClick);
    }
    if (feedFriendsContainer) {
        feedFriendsContainer.addEventListener('click', handleSaveFoodClick);
    }

    // --- Logika Menampilkan Post Baru setelah dibuat ---
    const newPostJSON = sessionStorage.getItem('newPost');
    const urlParams = new URLSearchParams(window.location.search);
    if (newPostJSON) {
        setActiveTab('friends');
        const post = JSON.parse(newPostJSON);
        const postElement = createPostElement(post);
        if (feedFriendsContainer) {
            feedFriendsContainer.prepend(postElement);
        }
        sessionStorage.removeItem('newPost');
    } else if (urlParams.get('tab') === 'friends') {
        setActiveTab('friends');
    } else {
        // Default tab saat halaman pertama kali dibuka
        setActiveTab('explore');
    }
});