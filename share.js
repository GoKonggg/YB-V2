// File: share.js
// Fungsi: Logika untuk halaman share-food.html dan create-post.html (versi share meal).

document.addEventListener('DOMContentLoaded', () => {
    // Data Makanan (Sementara)
    const foods = [
        { name: 'Chicken Breast', calories: 165, serving: '100 gr', carbs: 0, fat: 3.6, protein: 31 },
        { name: 'Brown Rice', calories: 111, serving: '1 cup', carbs: 23, fat: 0.9, protein: 2.6 },
        { name: 'Broccoli', calories: 55, serving: '1 cup', carbs: 11, fat: 0.6, protein: 3.7 },
        { name: 'Salmon', calories: 208, serving: '100 gr', carbs: 0, fat: 13, protein: 20 }
    ];

    // =================================================================
    // LOGIKA UNTUK HALAMAN share-food.html
    // =================================================================
    const shareFoodListContainer = document.getElementById('share-food-list');
    if (shareFoodListContainer) {
        // Logika untuk ganti Tab
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

        // Isi daftar makanan di tab "Find From List"
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
                name: document.getElementById('create-name').value || 'Custom Food',
                serving: document.getElementById('create-serving').value || '1 serving',
                calories: document.getElementById('create-calories').value || 0,
                carbs: document.getElementById('create-carbs').value || 0,
                fat: document.getElementById('create-fat').value || 0,
                protein: document.getElementById('create-protein').value || 0,
            };
            const foodParams = new URLSearchParams(customFood).toString();
            window.location.href = `create-post.html?${foodParams}`;
        });
    }

    // =================================================================
    // LOGIKA UNTUK HALAMAN create-post.html (Versi Meal)
    // =================================================================
    const foodToShareDiv = document.getElementById('food-to-share');
    if (foodToShareDiv) {
        const urlParams = new URLSearchParams(window.location.search);
        const food = Object.fromEntries(urlParams.entries());

        // Mengisi div dengan data dari URL
        foodToShareDiv.innerHTML = `
            <p class="font-bold text-gray-800">${food.name || 'N/A'}</p>
            <p class="text-sm text-gray-600">${food.calories || 'N/A'} Calories, ${food.serving || 'N/A'}</p>
        `;

        // Membuat tombol "Share" terakhir berfungsi
        document.getElementById('final-share-btn').addEventListener('click', () => {
            const newPost = {
                postType: 'meal',
                user: { name: 'You', avatar: 'https://i.pravatar.cc/150?u=me' },
                time: 'Just now',
                caption: document.getElementById('caption').value,
                food: food,
                likes: 0,
                comments: 0
            };
            sessionStorage.setItem('newPost', JSON.stringify(newPost));
            window.location.replace('community.html?tab=friends');
        });
    }
});