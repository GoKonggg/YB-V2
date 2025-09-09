// File: edit-routine.js (Versi Final dengan Pre-population Logic)

document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENT SELECTORS ---
    const pageTitle = document.getElementById('page-title');
    const routineNameInput = document.getElementById('routine-name');
    const scheduleToggle = document.getElementById('schedule-toggle');
    const scheduleOptions = document.getElementById('schedule-options');
    const mealSectionContainer = document.querySelector('#schedule-options .grid-cols-2');
    const daySelectorContainer = document.querySelector('#schedule-options .grid-cols-7');
    const foodItemsListContainer = document.getElementById('food-items-list');
    const addFoodBtn = document.getElementById('add-food-btn');
    const saveRoutineBtn = document.getElementById('save-btn');
    const deleteRoutineBtn = document.getElementById('delete-btn');

    // Pastikan kita berada di halaman yang benar sebelum melanjutkan
    if (!pageTitle || !routineNameInput || !saveRoutineBtn) return;

    // --- STATE MANAGEMENT ---
    let currentRoutine = {
        id: null,
        name: '',
        schedule: { enabled: false, mealSection: 'breakfast', days: [] },
        foods: []
    };
    let isEditMode = false;

    // --- FUNGSI UNTUK MENGISI & MEMBERSIHKAN DIARY ---
    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    /**
     * Membersihkan semua entri makanan dari rutinitas ini di diary masa depan.
     * @param {number} routineId - ID dari rutinitas yang akan dibersihkan.
     * @param {object} allFoodData - Objek database diary.
     */
    const clearFutureDiary = (routineId, allFoodData) => {
        console.log(`Clearing future entries for routine ID: ${routineId}`);
        for (let i = 0; i < 60; i++) { // Cek 60 hari ke depan
            let futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + i);
            const dateKey = formatDateKey(futureDate);

            if (allFoodData[dateKey]) {
                ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealSection => {
                    if (allFoodData[dateKey][mealSection]) {
                        // Filter dan hapus semua item makanan yang memiliki routineId yang cocok
                        allFoodData[dateKey][mealSection] = allFoodData[dateKey][mealSection].filter(food => food.routineId !== routineId);
                    }
                });
            }
        }
    };
    
    /**
     * Mengisi diary masa depan dengan item makanan dari rutinitas yang dijadwalkan.
     * @param {object} routine - Objek rutinitas yang akan di-log.
     * @param {object} allFoodData - Objek database diary.
     */
    const populateFutureDiary = (routine, allFoodData) => {
        if (!routine.schedule.enabled) return; // Keluar jika jadwal tidak aktif
        console.log(`Populating future diary for routine: "${routine.name}"`);
        for (let i = 0; i < 60; i++) { // Loop untuk 60 hari ke depan
            let futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + i);
            const dayOfWeek = futureDate.getDay(); // 0=Minggu, 1=Senin, dst.

            // Jika hari di masa depan cocok dengan jadwal
            if (routine.schedule.days.includes(dayOfWeek)) {
                const dateKey = formatDateKey(futureDate);
                const mealSection = routine.schedule.mealSection;
                
                if (!allFoodData[dateKey]) {
                    allFoodData[dateKey] = { breakfast: [], lunch: [], dinner: [], snack: [] };
                }

                // Tambahkan makanan ke sesi yang sesuai
                routine.foods.forEach(foodItem => {
                    const newFoodEntry = {
                        ...foodItem,
                        id: `food-${Date.now()}-${Math.random()}`,
                        time: "Auto-logged",
                        routineId: routine.id // Tandai bahwa makanan ini dari rutinitas
                    };
                    allFoodData[dateKey][mealSection].push(newFoodEntry);
                });
            }
        }
    };

    // --- FUNGSI SAVE & DELETE ---
    const saveRoutine = () => {
        currentRoutine.name = routineNameInput.value.trim();
        if (!currentRoutine.name) {
            alert("Please enter a name for the routine.");
            return;
        }

        let allRoutines = JSON.parse(localStorage.getItem('routineMealsList')) || [];
        let allFoodData = JSON.parse(localStorage.getItem('allFoodData')) || {};

        // 1. Selalu bersihkan jadwal lama dari diary sebelum menyimpan yang baru
        clearFutureDiary(currentRoutine.id, allFoodData);

        // 2. Jika jadwal aktif, isi kembali diary dengan jadwal yang baru
        if (currentRoutine.schedule.enabled) {
            populateFutureDiary(currentRoutine, allFoodData);
        }

        // 3. Simpan data rutinitas itu sendiri
        if (isEditMode) {
            const index = allRoutines.findIndex(r => r.id === currentRoutine.id);
            if (index > -1) { allRoutines[index] = currentRoutine; } 
            else { allRoutines.push(currentRoutine); }
        } else {
            allRoutines.push(currentRoutine);
        }

        // 4. Simpan kedua database yang sudah diperbarui
        localStorage.setItem('routineMealsList', JSON.stringify(allRoutines));
        localStorage.setItem('allFoodData', JSON.stringify(allFoodData));
        
        alert('Routine saved and diary updated!');
        window.location.href = 'routines.html';
    };

    const deleteRoutine = () => {
        if (!isEditMode) {
            window.location.href = 'routines.html';
            return;
        }
        if (confirm(`Are you sure you want to delete the "${currentRoutine.name}" routine? This will also remove its future entries from your diary.`)) {
            let allRoutines = JSON.parse(localStorage.getItem('routineMealsList')) || [];
            let allFoodData = JSON.parse(localStorage.getItem('allFoodData')) || {};
            
            // 1. Bersihkan entri rutinitas ini dari diary masa depan
            clearFutureDiary(currentRoutine.id, allFoodData);
            
            // 2. Hapus rutinitas dari daftarnya
            allRoutines = allRoutines.filter(r => r.id !== currentRoutine.id);

            // 3. Simpan kedua database yang sudah diperbarui
            localStorage.setItem('routineMealsList', JSON.stringify(allRoutines));
            localStorage.setItem('allFoodData', JSON.stringify(allFoodData));

            alert('Routine deleted.');
            window.location.href = 'routines.html';
        }
    };

    // --- FUNGSI UI & INITIALIZATION ---
    // (Fungsi-fungsi di bawah ini tidak berubah dari versi sebelumnya)
    const initializePage = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const routineId = parseInt(urlParams.get('id'), 10);
        const newFoodItemJSON = sessionStorage.getItem('newRoutineFood');
        const savedStateJSON = sessionStorage.getItem('currentEditingRoutine');

        if (savedStateJSON) {
            currentRoutine = JSON.parse(savedStateJSON);
            isEditMode = true;
            if (newFoodItemJSON) {
                currentRoutine.foods.push(JSON.parse(newFoodItemJSON));
            }
            sessionStorage.removeItem('newRoutineFood');
            sessionStorage.removeItem('currentEditingRoutine');
        } else if (routineId) {
            isEditMode = true;
            const allRoutines = JSON.parse(localStorage.getItem('routineMealsList')) || [];
            const foundRoutine = allRoutines.find(r => r.id === routineId);
            if (foundRoutine) {
                currentRoutine = JSON.parse(JSON.stringify(foundRoutine));
            } else {
                isEditMode = false;
                currentRoutine.id = Date.now();
            }
        } else {
            isEditMode = false;
            currentRoutine.id = Date.now();
        }
        pageTitle.textContent = (isEditMode && currentRoutine.name) ? 'Edit Routine' : 'Create Routine';
        populateForm();
        addEventListeners();
    };

    const populateForm = () => {
        routineNameInput.value = currentRoutine.name;
        scheduleToggle.checked = currentRoutine.schedule.enabled;
        updateScheduleVisibility();
        renderMealSectionButtons();
        renderDaySelectorButtons();
        renderFoodList();
    };

    const updateScheduleVisibility = () => {
        scheduleOptions.classList.toggle('hidden', !scheduleToggle.checked);
    };

    const renderMealSectionButtons = () => {
        const sections = ['breakfast', 'lunch', 'dinner', 'snack'];
        mealSectionContainer.innerHTML = '';
        sections.forEach(section => {
            const button = document.createElement('button');
            button.className = 'p-2 border rounded-md text-sm text-left';
            button.textContent = section.charAt(0).toUpperCase() + section.slice(1);
            button.dataset.section = section;
            if (currentRoutine.schedule.mealSection === section) {
                button.classList.add('day-btn-active');
            }
            mealSectionContainer.appendChild(button);
        });
    };

    const renderDaySelectorButtons = () => {
        const days = [{label: 'M', value: 1}, {label: 'T', value: 2}, {label: 'W', value: 3}, {label: 'T', value: 4}, {label: 'F', value: 5}, {label: 'S', value: 6}, {label: 'S', value: 0}];
        daySelectorContainer.innerHTML = '';
        days.forEach(day => {
            const button = document.createElement('button');
            button.className = 'w-9 h-9 border rounded-full text-sm font-semibold';
            button.textContent = day.label;
            button.dataset.day = day.value;
            if (currentRoutine.schedule.days.includes(day.value)) {
                button.classList.add('day-btn-active');
            }
            daySelectorContainer.appendChild(button);
        });
    };

    const renderFoodList = () => {
        foodItemsListContainer.innerHTML = '';
        if (currentRoutine.foods.length === 0) {
            foodItemsListContainer.innerHTML = `<p class="text-center text-gray-500 text-sm py-4">No food items added yet.</p>`;
            return;
        }
        currentRoutine.foods.forEach(food => {
            const foodEl = document.createElement('div');
            foodEl.className = 'flex items-center justify-between';
            foodEl.dataset.foodId = food.id;
            foodEl.innerHTML = `
                <div>
                    <p class="font-semibold text-gray-800">${food.name}</p>
                    <p class="text-sm text-gray-500">${food.calories} kcal, ${food.serving}</p>
                </div>
                <button class="delete-food-btn text-gray-400 hover:text-red-500">
                     <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            foodItemsListContainer.appendChild(foodEl);
        });
    };

    const addEventListeners = () => {
        scheduleToggle.addEventListener('change', () => { currentRoutine.schedule.enabled = scheduleToggle.checked; updateScheduleVisibility(); });
        mealSectionContainer.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') { currentRoutine.schedule.mealSection = e.target.dataset.section; renderMealSectionButtons(); } });
        daySelectorContainer.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') { const dayValue = parseInt(e.target.dataset.day, 10); const dayIndex = currentRoutine.schedule.days.indexOf(dayValue); if (dayIndex > -1) { currentRoutine.schedule.days.splice(dayIndex, 1); } else { currentRoutine.schedule.days.push(dayValue); } renderDaySelectorButtons(); } });
        foodItemsListContainer.addEventListener('click', (e) => { if (e.target.closest('.delete-food-btn')) { const foodId = e.target.closest('[data-food-id]').dataset.foodId; currentRoutine.foods = currentRoutine.foods.filter(f => f.id !== foodId); renderFoodList(); } });
        addFoodBtn.addEventListener('click', () => { currentRoutine.name = routineNameInput.value.trim(); sessionStorage.setItem('currentEditingRoutine', JSON.stringify(currentRoutine)); window.location.href = `add-food.html?context=routine&routineId=${currentRoutine.id}`; });
        saveRoutineBtn.addEventListener('click', saveRoutine);
        deleteRoutineBtn.addEventListener('click', deleteRoutine);
    };
    
    initializePage();
});