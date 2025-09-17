document.addEventListener('DOMContentLoaded', () => {
    // Pastikan kita ada di halaman yang benar
    const subTabAll = document.getElementById('subtab-all');
    if (!subTabAll) return;

    // ===================================================================
    // 1. SETUP & ELEMENT SELECTORS
    // ===================================================================
    const userStatusToggle = document.getElementById('user-status-toggle');
    const urlParams = new URLSearchParams(window.location.search);
    let mealType = urlParams.get('meal') || 'breakfast';
    const context = urlParams.get('context') || 'diary';
    const routineId = urlParams.get('routineId') || '';

    
    
    // Elemen untuk Tab
    const mealTabsContainer = {
        breakfast: document.getElementById('tab-breakfast'),
        lunch: document.getElementById('tab-lunch'),
        dinner: document.getElementById('tab-dinner'),
        snacks: document.getElementById('tab-snacks')
    };
    const subTabMy = document.getElementById('subtab-my');
    const subTabQuick = document.getElementById('subtab-quick');
    const contentAll = document.getElementById('content-all');
    const contentMy = document.getElementById('content-my');
    const contentQuick = document.getElementById('content-quick');

    // Elemen untuk pencarian API
    const searchApiForm = document.getElementById('search-api-form');
    const searchApiInput = document.getElementById('search-api-input');
    const searchResultsContainer = document.getElementById('search-results-container');
    
    // Elemen lain
    const addQuickFoodBtn = document.getElementById('add-quick-food-btn');
    const quickAddContainer = document.getElementById('quick-add-form-container');
    let isPremiumUser = localStorage.getItem('userStatus') === 'premium';

    // ===================================================================
    // 2. LOGIKA TAB
    // ===================================================================
    const setActiveMealTab = (selectedMeal) => {
        mealType = selectedMeal;
        for (const key in mealTabsContainer) {
            mealTabsContainer[key].classList.remove('bg-pink-500', 'text-white', 'shadow');
            mealTabsContainer[key].classList.add('text-gray-500');
        }
        mealTabsContainer[selectedMeal].classList.add('bg-pink-500', 'text-white', 'shadow');
        mealTabsContainer[selectedMeal].classList.remove('text-gray-500');
    };

    const setActiveSubTab = (activeTab) => {
        const createFoodBtnWrapper = document.getElementById('create-food-button-wrapper');
        const userStatusContainer = document.getElementById('user-status-container');
        
        [subTabAll, subTabMy, subTabQuick].forEach(tab => tab.classList.remove('border-pink-500', 'text-pink-500'));
        [contentAll, contentMy, contentQuick].forEach(content => content.classList.add('hidden'));
        
        createFoodBtnWrapper.classList.add('hidden');
        userStatusContainer.classList.add('hidden');

        activeTab.classList.add('border-pink-500', 'text-pink-500');

        if (activeTab === subTabAll) contentAll.classList.remove('hidden');
        if (activeTab === subTabMy) {
            contentMy.classList.remove('hidden');
            createFoodBtnWrapper.classList.remove('hidden');
            renderMyFoodList(); 
        }
        if (activeTab === subTabQuick) {
            contentQuick.classList.remove('hidden');
            userStatusContainer.classList.remove('hidden');
        }
    };

    // ===================================================================
    // 3. FUNGSI-FUNGSI UTAMA
    // ===================================================================

    // --- FUNGSI BARU: Pencarian via API ---
    async function performSearch(query) {
        if (!query) return;
        searchResultsContainer.innerHTML = `<p class="text-center text-gray-500">Searching...</p>`;
        try {
            const response = await fetch(`https://yb-backend-omega.vercel.app/api/makanan/cari?q=${query}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            displaySearchResults(data);
        } catch (error) {
            console.error('Fetch error:', error);
            searchResultsContainer.innerHTML = '<p class="text-center text-red-500">Failed to fetch data.</p>';
        }
    }

    function displaySearchResults(foods) {
        searchResultsContainer.innerHTML = '';
        if (!foods || foods.length === 0) {
            searchResultsContainer.innerHTML = '<p class="text-center text-gray-500">No food found.</p>';
            return;
        }
        foods.forEach(food => {
            const detailUrl = `add-food-details.html?meal=${mealType}&context=${context}&routineId=${routineId}&foodId=${food.food_id}`;
            const foodHTML = `
                <div class="food-item flex items-center justify-between p-3 rounded-lg bg-white/50">
                    <div>
                        <p class="font-bold text-gray-800">${food.food_name}</p>
                        <p class="text-sm text-gray-500">${food.food_description}</p>
                    </div>
                    <a href="${detailUrl}" class="add-food-btn p-2 text-pink-500 rounded-full hover:bg-pink-100">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </a>
                </div>`;
            searchResultsContainer.innerHTML += foodHTML;
        });
    }

    // --- FUNGSI LAMA ANDA: My Food (dari localStorage) ---
    const renderMyFoodList = () => {
        const myFoodListContainer = document.getElementById('my-food-list-container');
        const myFoods = JSON.parse(localStorage.getItem('myFoodList')) || [];
        myFoodListContainer.innerHTML = '';

        if (myFoods.length === 0) {
            myFoodListContainer.innerHTML = `<div class="flex items-center justify-center h-full text-center"><p class="text-gray-500">You haven't created any custom food yet.<br>Let's add one!</p></div>`;
            return;
        }

        myFoods.forEach(food => {
            const detailUrl = `add-food-details.html?meal=${mealType}&context=${context}&routineId=${routineId}&name=${encodeURIComponent(food.name)}&calories=${food.calories}&serving=${encodeURIComponent(food.serving)}&carbs=${food.carbs}&fat=${food.fat}&protein=${food.protein}`;
            const foodHTML = `
                <div class="food-item flex items-center justify-between p-3 rounded-lg bg-white/50">
                    <div>
                        <p class="font-bold text-gray-800">${food.name}</p>
                        <p class="text-sm text-gray-500">${food.calories} kcal, ${food.serving}</p>
                    </div>
                    <a href="${detailUrl}" class="add-food-btn p-2 text-pink-500 rounded-full hover:bg-pink-100">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </a>
                </div>`;
            myFoodListContainer.innerHTML += foodHTML;
        });
    };

    // --- FUNGSI LAMA ANDA: Quick Add ---
    const renderQuickAddForm = () => {
        let formHTML = isPremiumUser
            ? `<input type="text" id="quick-food-name" placeholder="Food name (optional)" class="w-full p-3 border rounded-lg mb-4"><input type="number" id="quick-food-calories" placeholder="Total Calories" class="w-full p-3 border rounded-lg mb-4"><div id="macros-container" class="grid grid-cols-3 gap-2 mb-4"><input type="number" id="quick-food-carbs" placeholder="Carbs (g)" class="w-full p-2 border rounded-lg text-sm"><input type="number" id="quick-food-fat" placeholder="Fat (g)" class="w-full p-2 border rounded-lg text-sm"><input type="number" id="quick-food-protein" placeholder="Protein (g)" class="w-full p-2 border rounded-lg text-sm"></div>`
            : `<input type="number" id="quick-food-calories" placeholder="Total Calories" class="w-full p-3 border rounded-lg mb-4">`;
        quickAddContainer.innerHTML = formHTML;
    };

    const handleQuickAdd = () => {
        if (context === 'routine') {
            alert("Quick Add is for logging directly to the diary. Please select a detailed food item for your routine.");
            if(routineId) window.location.href = `edit-routine.html?id=${routineId}`;
            return;
        }

        const caloriesInput = document.getElementById('quick-food-calories');
        if (!caloriesInput || !caloriesInput.value || parseInt(caloriesInput.value, 10) <= 0) {
            alert('Please fill in a valid calorie amount.');
            return;
        }
        
        let foodName = 'Quick Add';
        if (isPremiumUser) {
            const nameInput = document.getElementById('quick-food-name');
            if (nameInput && nameInput.value.trim() !== '') foodName = nameInput.value.trim();
        }
        
        const foodData = { 
            meal: mealType, 
            name: foodName, 
            calories: parseInt(caloriesInput.value, 10), 
            serving: '1 serving', 
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), 
            carbs: isPremiumUser ? parseInt(document.getElementById('quick-food-carbs').value, 10) || 0 : 0, 
            fat: isPremiumUser ? parseInt(document.getElementById('quick-food-fat').value, 10) || 0 : 0, 
            protein: isPremiumUser ? parseInt(document.getElementById('quick-food-protein').value, 10) || 0 : 0 
        };
        
        sessionStorage.setItem('newlyAddedFood', JSON.stringify(foodData));
        window.location.href = 'diary.html';
    };

    // ===================================================================
    // 4. EVENT LISTENERS
    // ===================================================================
    const syncUserStatus = () => {
        isPremiumUser = userStatusToggle.checked;
        localStorage.setItem('userStatus', isPremiumUser ? 'premium' : 'free');
        if (!contentQuick.classList.contains('hidden')) {
            renderQuickAddForm();
        }
    };
    userStatusToggle.addEventListener('change', syncUserStatus);

    Object.keys(mealTabsContainer).forEach(meal => {
        if(mealTabsContainer[meal]) {
            mealTabsContainer[meal].addEventListener('click', () => setActiveMealTab(meal));
        }
    });

    subTabAll.addEventListener('click', () => setActiveSubTab(subTabAll));
    subTabMy.addEventListener('click', () => setActiveSubTab(subTabMy));
    subTabQuick.addEventListener('click', () => setActiveSubTab(subTabQuick));

    searchApiForm.addEventListener('submit', (event) => {
        event.preventDefault();
        performSearch(searchApiInput.value.trim());
    });
    
    addQuickFoodBtn.addEventListener('click', handleQuickAdd);

    // ===================================================================
    // 5. INISIALISASI HALAMAN
    // ===================================================================
    setActiveMealTab(mealType);
    setActiveSubTab(subTabAll);
    renderQuickAddForm();
});