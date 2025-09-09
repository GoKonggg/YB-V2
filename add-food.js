// File: add-food.js (Versi Final & Bersih)

document.addEventListener('DOMContentLoaded', () => {
    // Pastikan kita ada di halaman yang benar dengan memeriksa keberadaan salah satu elemen
    const subTabAll = document.getElementById('subtab-all');
    if (!subTabAll) return;

    // -------------------------------------------------------------------
    // 1. PENGATURAN STATUS USER & URL
    // -------------------------------------------------------------------
    const userStatusToggle = document.getElementById('user-status-toggle');
    let isPremiumUser = localStorage.getItem('userStatus') === 'premium';

    const syncUserStatus = () => {
        isPremiumUser = userStatusToggle.checked;
        localStorage.setItem('userStatus', isPremiumUser ? 'premium' : 'free');
        // Render ulang form jika tab Quick Add sedang aktif
        if (!document.getElementById('content-quick').classList.contains('hidden')) {
            renderQuickAddForm();
        }
    };
    
    userStatusToggle.checked = isPremiumUser;
    userStatusToggle.addEventListener('change', syncUserStatus);

    // Membaca semua parameter dari URL untuk menentukan state halaman
    const urlParams = new URLSearchParams(window.location.search);
    let mealType = urlParams.get('meal') || 'breakfast';
    const context = urlParams.get('context') || 'diary'; // Konteks: 'diary' atau 'routine'
    const routineId = urlParams.get('routineId') || '';

    // -------------------------------------------------------------------
    // 2. LOGIKA TAB (WAKTU MAKAN & SUB-TAB)
    // -------------------------------------------------------------------
    const mealTabsContainer = {
        breakfast: document.getElementById('tab-breakfast'),
        lunch: document.getElementById('tab-lunch'),
        dinner: document.getElementById('tab-dinner'),
        snacks: document.getElementById('tab-snacks') // Sesuai dengan ID di HTML
    };
    const subTabMy = document.getElementById('subtab-my');
    const subTabQuick = document.getElementById('subtab-quick');
    const contentAll = document.getElementById('content-all');
    const contentMy = document.getElementById('content-my');
    const contentQuick = document.getElementById('content-quick');

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
        
        [subTabAll, subTabMy, subTabQuick].forEach(tab => {
            tab.classList.remove('border-pink-500', 'text-pink-500');
            tab.classList.add('border-transparent', 'text-gray-500');
        });
        [contentAll, contentMy, contentQuick].forEach(content => content.classList.add('hidden'));
        
        createFoodBtnWrapper.classList.add('hidden');
        userStatusContainer.classList.add('hidden');

        activeTab.classList.add('border-pink-500', 'text-pink-500');
        activeTab.classList.remove('border-transparent', 'text-gray-500');

        if (activeTab === subTabAll) {
            contentAll.classList.remove('hidden');
        }
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
    
    // Setup event listeners untuk semua tab
    Object.keys(mealTabsContainer).forEach(meal => {
        if(mealTabsContainer[meal]) {
            mealTabsContainer[meal].addEventListener('click', () => setActiveMealTab(meal));
        }
    });
    subTabAll.addEventListener('click', () => setActiveSubTab(subTabAll));
    subTabMy.addEventListener('click', () => setActiveSubTab(subTabMy));
    subTabQuick.addEventListener('click', () => setActiveSubTab(subTabQuick));

    // -------------------------------------------------------------------
    // 3. FUNGSI-FUNGSI UTAMA (ALL FOOD, MY FOOD, QUICK ADD)
    // -------------------------------------------------------------------

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

    const quickAddContainer = document.getElementById('quick-add-form-container');
    const addQuickFoodBtn = document.getElementById('add-quick-food-btn');

    const renderQuickAddForm = () => {
        let formHTML = '';
        if (isPremiumUser) {
            formHTML = `<input type="text" id="quick-food-name" placeholder="Food name (optional)" class="w-full p-3 border rounded-lg mb-4"><input type="number" id="quick-food-calories" placeholder="Total Calories" class="w-full p-3 border rounded-lg mb-4"><div id="macros-container" class="grid grid-cols-3 gap-2 mb-4"><input type="number" id="quick-food-carbs" placeholder="Carbs (g)" class="w-full p-2 border rounded-lg text-sm"><input type="number" id="quick-food-fat" placeholder="Fat (g)" class="w-full p-2 border rounded-lg text-sm"><input type="number" id="quick-food-protein" placeholder="Protein (g)" class="w-full p-2 border rounded-lg text-sm"></div>`;
        } else {
            formHTML = `<input type="number" id="quick-food-calories" placeholder="Total Calories" class="w-full p-3 border rounded-lg mb-4">`;
        }
        quickAddContainer.innerHTML = formHTML;
    };
    
    addQuickFoodBtn.addEventListener('click', () => {
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
        const calories = parseInt(caloriesInput.value, 10);
        
        let foodName = 'Quick Add';
        if (isPremiumUser) {
            const nameInput = document.getElementById('quick-food-name');
            if (nameInput && nameInput.value.trim() !== '') {
                foodName = nameInput.value.trim();
            }
        }
        
        const foodData = { meal: mealType, name: foodName, calories: calories, serving: '1 serving', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), carbs: 0, fat: 0, protein: 0 };
        if (isPremiumUser) {
            foodData.carbs = parseInt(document.getElementById('quick-food-carbs').value, 10) || 0;
            foodData.fat = parseInt(document.getElementById('quick-food-fat').value, 10) || 0;
            foodData.protein = parseInt(document.getElementById('quick-food-protein').value, 10) || 0;
        }
        
        sessionStorage.setItem('newlyAddedFood', JSON.stringify(foodData));
        window.location.href = 'diary.html';
    });

    const renderAllFoodList = () => {
        const foods = [
            { name: 'Chicken Breast', calories: 165, serving: '100 gr', carbs: 0, fat: 3.6, protein: 31 },
            { name: 'Brown Rice', calories: 111, serving: '1 cup', carbs: 23, fat: 0.9, protein: 2.6 },
            { name: 'Broccoli', calories: 55, serving: '1 cup', carbs: 11, fat: 0.6, protein: 3.7 },
            { name: 'Salmon', calories: 208, serving: '100 gr', carbs: 0, fat: 13, protein: 20 }
        ];
        
        contentAll.innerHTML = '';
        
        foods.forEach(food => {
            const detailUrl = `add-food-details.html?meal=${mealType}&context=${context}&routineId=${routineId}&name=${encodeURIComponent(food.name)}&calories=${food.calories}&serving=${encodeURIComponent(food.serving)}&carbs=${food.carbs}&fat=${food.fat}&protein=${food.protein}`;
            const foodHTML = `<div class="food-item flex items-center justify-between p-3 rounded-lg bg-white/50"><div><p class="font-bold text-gray-800">${food.name}</p><p class="text-sm text-gray-500">${food.calories} kcal, ${food.serving}</p></div><a href="${detailUrl}" class="add-food-btn p-2 text-pink-500 rounded-full hover:bg-pink-100"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></a></div>`;
            contentAll.innerHTML += foodHTML;
        });
    };

    // -------------------------------------------------------------------
    // 4. INISIALISASI HALAMAN
    // -------------------------------------------------------------------
    setActiveMealTab(mealType);
    setActiveSubTab(subTabAll);
    renderAllFoodList();
    renderQuickAddForm();
});