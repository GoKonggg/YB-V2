// File: add-food.js

document.addEventListener('DOMContentLoaded', () => {
    // Cek apakah kita berada di halaman add-food dengan mencari elemen uniknya
    const subTabAll = document.getElementById('subtab-all');
    if (!subTabAll) return; // Hentikan jika bukan di halaman add-food

    const urlParams = new URLSearchParams(window.location.search);
    let mealType = urlParams.get('meal') || 'breakfast';

    // ▼▼▼ LOGIKA BARU UNTUK MEMBUAT TAB MAKANAN INTERAKTIF ▼▼▼
    const mealTabsContainer = {
        breakfast: document.getElementById('tab-breakfast'),
        lunch: document.getElementById('tab-lunch'),
        dinner: document.getElementById('tab-dinner'),
        snacks: document.getElementById('tab-snacks')
    };

    // Fungsi untuk mengatur tab mana yang aktif
    const setActiveMealTab = (selectedMeal) => {
        mealType = selectedMeal; // Update mealType saat ini

        // Loop melalui semua tab
        for (const key in mealTabsContainer) {
            const tab = mealTabsContainer[key];
            // Hapus style aktif dari semua tab
            tab.classList.remove('bg-pink-500', 'text-white', 'shadow');
            tab.classList.add('text-gray-500');
        }
        // Tambahkan style aktif hanya ke tab yang dipilih
        mealTabsContainer[selectedMeal].classList.add('bg-pink-500', 'text-white', 'shadow');
        mealTabsContainer[selectedMeal].classList.remove('text-gray-500');
    };

    // Tambahkan event listener untuk setiap tombol tab
    mealTabsContainer.breakfast.addEventListener('click', () => setActiveMealTab('breakfast'));
    mealTabsContainer.lunch.addEventListener('click', () => setActiveMealTab('lunch'));
    mealTabsContainer.dinner.addEventListener('click', () => setActiveMealTab('dinner'));
    mealTabsContainer.snacks.addEventListener('click', () => setActiveMealTab('snacks'));

    // Atur tab aktif saat halaman pertama kali dimuat
    setActiveMealTab(mealType);
    // ▲▲▲ LOGIKA BARU SELESAI ▲▲▲


    // Logika untuk Sub-Tab (All Food, My Food, Quick Add)
    const subTabMy = document.getElementById('subtab-my');
    const subTabQuick = document.getElementById('subtab-quick');
    
    const contentAll = document.getElementById('content-all');
    const contentMy = document.getElementById('content-my');
    const contentQuick = document.getElementById('content-quick');

    const setActiveSubTab = (activeTab) => {
        [subTabAll, subTabMy, subTabQuick].forEach(tab => {
            tab.classList.remove('border-pink-500', 'text-pink-500');
            tab.classList.add('border-transparent', 'text-gray-500');
        });
        [contentAll, contentMy, contentQuick].forEach(content => content.classList.add('hidden'));

        activeTab.classList.add('border-pink-500', 'text-pink-500');
        activeTab.classList.remove('border-transparent', 'text-gray-500');

        if (activeTab === subTabAll) contentAll.classList.remove('hidden');
        if (activeTab === subTabMy) contentMy.classList.remove('hidden');
        if (activeTab === subTabQuick) contentQuick.classList.remove('hidden');
    };

    subTabAll.addEventListener('click', () => setActiveSubTab(subTabAll));
    subTabMy.addEventListener('click', () => setActiveSubTab(subTabMy));
    subTabQuick.addEventListener('click', () => setActiveSubTab(subTabQuick));

    // Logika untuk mengisi daftar "All Food"
    const foods = [
        { name: 'Chicken Breast', calories: 165, serving: '100 gr', carbs: 0, fat: 3.6, protein: 31 },
        { name: 'Brown Rice', calories: 111, serving: '1 cup', carbs: 23, fat: 0.9, protein: 2.6 },
        { name: 'Broccoli', calories: 55, serving: '1 cup', carbs: 11, fat: 0.6, protein: 3.7 },
        { name: 'Salmon', calories: 208, serving: '100 gr', carbs: 0, fat: 13, protein: 20 }
    ];

    let foodListHTML = '';
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
    contentAll.innerHTML = foodListHTML;
});