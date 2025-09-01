// File: main.js (Versi Final & Lengkap)

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
    // LOGIKA UMUM (NAVBAR & MENU)
    // =================================================================
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

    // =================================================================
    // LOGIKA KHUSUS UNTUK HALAMAN diary.html
    // =================================================================
    const caloriesConsumedElement = document.getElementById('calories-consumed');
    if (caloriesConsumedElement) {
        const newFoodJSON = sessionStorage.getItem('newlyAddedFood');
        if (newFoodJSON) {
            const newFood = JSON.parse(newFoodJSON);
            const cardBody = document.getElementById(`${newFood.meal}-card-body`);
            
            if (cardBody) {
                const placeholder = cardBody.querySelector('.text-center');
                if (placeholder) {
                    placeholder.remove();
                }

                const foodElement = document.createElement('div');
                foodElement.className = 'flex justify-between items-center text-sm p-2 bg-white/30 rounded-lg';
                foodElement.innerHTML = `
                    <div>
                        <p class="font-semibold text-gray-800">${newFood.name}</p>
                        <p class="text-xs text-gray-500">${newFood.serving}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-gray-700">${newFood.calories} kal</p>
                        <p class="text-xs text-gray-500">${newFood.time || ''}</p>
                    </div>
                `;
                cardBody.appendChild(foodElement);

                let currentCalories = parseInt(caloriesConsumedElement.textContent, 10);
                currentCalories += newFood.calories;
                caloriesConsumedElement.textContent = currentCalories;
                
                const caloriesProgress = document.getElementById('calories-progress');
                const totalCaloriesGoal = 1836;
                const progressPercentage = (currentCalories / totalCaloriesGoal) * 100;
                caloriesProgress.style.width = `${Math.min(progressPercentage, 100)}%`;

                sessionStorage.removeItem('newlyAddedFood');
            }
        }
    }

    // =================================================================
    // LOGIKA KHUSUS UNTUK HALAMAN add-food.html
    // =================================================================
    const foodListContainer = document.getElementById('food-list');
    if (foodListContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const mealType = urlParams.get('meal') || 'breakfast';

        const activeTab = document.getElementById(`tab-${mealType}`);
        if (activeTab) {
            activeTab.classList.add('bg-pink-500', 'text-white', 'shadow');
            activeTab.classList.remove('text-gray-500');
        }

        let foodListHTML = '<div class="space-y-3">';
        foods.forEach(food => {
            const urlEncodedName = encodeURIComponent(food.name);
            const urlEncodedServing = encodeURIComponent(food.serving);
            
            foodListHTML += `
                <div class="food-item flex items-center justify-between p-3 rounded-lg bg-white/50">
                    <div>
                        <p class="font-bold text-gray-800">${food.name}</p>
                        <p class="text-sm text-gray-500">${food.calories} kal, ${food.serving}</p>
                    </div>
                    <a href="add-food-details.html?meal=${mealType}&name=${urlEncodedName}&calories=${food.calories}&serving=${urlEncodedServing}&carbs=${food.carbs}&fat=${food.fat}&protein=${food.protein}" class="add-food-btn p-2 text-pink-500 rounded-full hover:bg-pink-100">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </a>
                </div>
            `;
        });
        foodListHTML += '</div>';
        foodListContainer.innerHTML = foodListHTML;
    }

    // =================================================================
    // LOGIKA KHUSUS UNTUK HALAMAN add-food-details.html
    // =================================================================
    const saveFoodBtn = document.getElementById('save-food-btn');
    if(saveFoodBtn) {
        const urlParams = new URLSearchParams(window.location.search);
        
        const meal = urlParams.get('meal');
        const name = decodeURIComponent(urlParams.get('name'));
        const calories = parseInt(urlParams.get('calories'));
        const serving = decodeURIComponent(urlParams.get('serving'));
        const carbs = parseFloat(urlParams.get('carbs'));
        const fat = parseFloat(urlParams.get('fat'));
        const protein = parseFloat(urlParams.get('protein'));

        document.getElementById('food-name').textContent = name;
        document.getElementById('food-serving').textContent = serving;
        document.getElementById('meal-type').textContent = meal;
        document.getElementById('food-calories').textContent = calories;
        document.getElementById('food-carbs').textContent = carbs + ' g';
        document.getElementById('food-fat').textContent = fat + ' g';
        document.getElementById('food-protein').textContent = protein + ' g';
        document.getElementById('back-link').href = `add-food.html?meal=${meal}`;
        
        const timeDisplay = document.getElementById('food-time');
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
        timeDisplay.textContent = formattedTime;

        const caloriesFromCarbs = carbs * 4;
        const caloriesFromFat = fat * 9;
        const caloriesFromProtein = protein * 4;
        const totalMacroCalories = caloriesFromCarbs + caloriesFromFat + caloriesFromProtein || 1;
        const carbsPercent = (caloriesFromCarbs / totalMacroCalories) * 100;
        const fatPercent = (caloriesFromFat / totalMacroCalories) * 100;
        const proteinPercent = (caloriesFromProtein / totalMacroCalories) * 100;
        const carbsArc = document.querySelector('#carbs-arc circle');
        const fatArc = document.querySelector('#fat-arc circle');
        const proteinArc = document.querySelector('#protein-arc circle');
        let accumulatedPercent = 0;
        carbsArc.style.strokeDasharray = `${carbsPercent} 100`;
        accumulatedPercent += carbsPercent;
        fatArc.style.strokeDasharray = `${fatPercent} 100`;
        fatArc.style.strokeDashoffset = -accumulatedPercent;
        accumulatedPercent += fatPercent;
        proteinArc.style.strokeDasharray = `${proteinPercent} 100`;
        proteinArc.style.strokeDashoffset = -accumulatedPercent;

        saveFoodBtn.addEventListener('click', () => {
            const foodData = { name, calories, serving, meal, time: formattedTime };
            sessionStorage.setItem('newlyAddedFood', JSON.stringify(foodData));
            window.location.href = 'diary.html';
        });
    }

    // =================================================================
    // LOGIKA UNTUK HALAMAN share-food.html
    // =================================================================
    const shareFoodListContainer = document.getElementById('share-food-list');
    if (shareFoodListContainer) {
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
        const tabExplore = document.getElementById('tab-explore');
        const tabFriends = document.getElementById('tab-friends');
        
        // --- PERBAIKAN DI SINI ---
        // Pindahkan deklarasi variabel ini ke atas
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
            
            feedFriendsContainer.prepend(postElement);
            sessionStorage.removeItem('newPost');
        } 
        else if (urlParams.get('tab') === 'friends') {
            setActiveTab(tabFriends, tabExplore, feedFriends, feedExplore);
        }
    }
});