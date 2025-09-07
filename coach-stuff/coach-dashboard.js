

document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENT SELECTORS ---
    const dashboardView = document.getElementById('dashboard-view');
    const clientDetailView = document.getElementById('client-detail-view');
    const actionCenterContainer = document.getElementById('action-center-container');
    const clientListContainer = document.getElementById('client-list-container');
    const searchClientInput = document.getElementById('search-client-input');
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
    
    // Detail View Elements
    const clientDetailAvatar = document.getElementById('client-detail-avatar');
    const clientDetailName = document.getElementById('client-detail-name');
    const diaryTabBtn = document.getElementById('diary-tab-btn');
    const workoutTabBtn = document.getElementById('workout-tab-btn');
    const detailDateDisplay = document.getElementById('detail-date-display');
    const detailPrevDayBtn = document.getElementById('detail-prev-day-btn');
    const detailNextDayBtn = document.getElementById('detail-next-day-btn');
    const clientLogContent = document.getElementById('client-log-content');

    // --- STATE MANAGEMENT ---
    let currentDetailClient = null;
    let currentDetailDate = new Date();
    let currentDetailTab = 'diary';

    // --- HELPER FUNCTIONS ---
    const formatDateKey = (date) => date.toISOString().split('T')[0];
    const getYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
    };

    // --- CORE LOGIC & STATUS CHECKING ---
    const getClientStatus = (clientId) => {
        const clientData = allClientData[clientId] || {};
        const yesterdayKey = formatDateKey(getYesterday());
        const todayKey = formatDateKey(new Date());

        const yesterdayFood = clientData[yesterdayKey]?.food;
        const todayWorkouts = clientData[todayKey]?.workouts;
        
        if (!yesterdayFood || Object.values(yesterdayFood).every(meal => meal.length === 0)) {
            return {
                type: 'NEEDS_ATTENTION',
                reason: 'Missed food log yesterday.',
                icon: '⚠️'
            };
        }
        
        if (todayWorkouts && todayWorkouts.length > 0) {
            return {
                type: 'POSITIVE_UPDATE',
                reason: `Completed workout: ${todayWorkouts[0].name}`,
                icon: '🎉'
            };
        }

        // Could add more checks here (low calories, etc.)

        return { type: 'ON_TRACK', reason: 'All logs are up to date.', icon: '✅' };
    };


    // --- RENDER FUNCTIONS ---

    const renderActionCenter = () => {
        actionCenterContainer.innerHTML = '';
        let actionsFound = false;

        coachClients.forEach(client => {
            const status = getClientStatus(client.id);
            if (status.type === 'NEEDS_ATTENTION' || status.type === 'POSITIVE_UPDATE') {
                actionsFound = true;
                const actionCard = document.createElement('div');
                actionCard.className = 'bg-white p-3 rounded-lg shadow-sm flex items-center justify-between';
                
                // Perubahan warna di Action Center
                const bgColor = status.type === 'NEEDS_ATTENTION' ? 'bg-orange-100 text-orange-800' : 'bg-pink-100 text-pink-800'; // Menggunakan orange dan pink
                const icon = status.type === 'NEEDS_ATTENTION' ? '⚠️' : '🎉'; // Sesuaikan ikon jika perlu

                actionCard.innerHTML = `
                    <div class="flex items-center">
                        <div class="w-8 h-8 ${bgColor} rounded-full flex items-center justify-center mr-3 text-sm">${icon}</div>
                        <div>
                            <p class="font-semibold text-gray-800 text-sm">${client.name}</p>
                            <p class="text-xs text-gray-500">${status.reason}</p>
                        </div>
                    </div>
                    <button data-client-id="${client.id}" class="view-details-btn p-1 text-gray-400 rounded-full hover:bg-gray-100">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                `;
                actionCenterContainer.appendChild(actionCard);
            }
        });

        if (!actionsFound) {
            actionCenterContainer.innerHTML = `<p class="text-center text-sm text-gray-500 py-4">No urgent actions. All clients are on track!</p>`;
        }
    };
    
   const renderClientList = (filter = '') => {
    clientListContainer.innerHTML = '';
    const filteredClients = coachClients.filter(c =>
        c.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredClients.length === 0) {
        clientListContainer.innerHTML = `<p class="text-center text-gray-500 py-8">No clients found.</p>`;
        return;
    }

    filteredClients.forEach(client => {
        const status = getClientStatus(client.id);
        let statusBorderColor = 'border-transparent';
        let statusText = '';

        if (status.type === 'NEEDS_ATTENTION') {
            statusBorderColor = 'border-orange-300';
            statusText = `<p class="text-xs text-orange-500 mt-1">⚠️ ${status.reason}</p>`;
        } else if (status.type === 'POSITIVE_UPDATE') {
            statusBorderColor = 'border-pink-300';
        } else {
            statusBorderColor = 'border-gray-100';
        }

        const clientData = allClientData[client.id] || {};
        const hasFoodLog = !!clientData[formatDateKey(new Date())]?.food;
        const hasWorkoutLog = !!clientData[formatDateKey(new Date())]?.workouts;

        const card = document.createElement('div');
        // Class 'relative' sudah tidak diperlukan lagi, jadi bisa dihapus
        card.className = `bg-white p-4 rounded-xl shadow-sm border-l-4 ${statusBorderColor} flex items-center space-x-4`;

        card.innerHTML = `
            <img src="${client.avatar}" alt="${client.name}" class="w-14 h-14 rounded-full object-cover">
            
            <div class="flex-grow">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-gray-800">${client.name}</p>
                        <p class="text-xs text-gray-500">🔥 ${client.streak} day streak</p>
                        ${statusText}
                    </div>
                </div>

                <div class="flex items-center text-xs text-gray-400 mt-2 space-x-3">
                    <span class="${hasFoodLog ? 'text-emerald-600' : 'text-gray-300'}">🍎 Food</span>
                    <span class="${hasWorkoutLog ? 'text-emerald-600' : 'text-gray-300'}">🏋️ Workout</span>
                </div>
            </div>
            
            <button data-client-id="${client.id}" class="view-details-btn p-2 text-gray-500 rounded-full hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
            
            `;
        clientListContainer.appendChild(card);
    });
};
    
    // Di dalam file coach-dashboard.js

// GANTI FUNGSI LAMA ANDA DENGAN YANG INI di file coach-dashboard.js

// GANTI FUNGSI LAMA ANDA DENGAN VERSI FINAL INI di coach-dashboard.js

const renderClientFoodDiary = (date) => {
    const dateKey = formatDateKey(date);
    const clientData = allClientData[currentDetailClient.id] || {};
    const dailyFood = clientData[dateKey]?.food || { breakfast: [], lunch: [], dinner: [], snack: [] };
    const calorieGoal = 1800;
    let totalCalories = 0;

    Object.values(dailyFood).forEach(mealArray => {
        mealArray.forEach(food => {
            totalCalories += food.calories;
        });
    });

    const remainingCalories = Math.max(0, calorieGoal - totalCalories);
    const progressPercentage = Math.min((totalCalories / calorieGoal) * 100, 100);

    // ## BAGIAN 1: HERO CARD DENGAN STATISTIK YANG DIPERBARUI ##
    const heroCardHTML = `
        <div class="bg-white p-4 rounded-xl shadow-sm">
            <p class="text-sm font-semibold text-gray-500 text-center mb-2">Calorie Intake</p>
            <div class="relative w-32 h-32 mx-auto">
                <svg class="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" stroke-width="3"></path>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          fill="none" stroke="#ec4899" stroke-width="3" 
                          stroke-dasharray="${progressPercentage}, 100" stroke-linecap="round"></path>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-2xl font-bold text-gray-800">${totalCalories}</span>
                    <span class="text-xs text-gray-500">kcal</span>
                </div>
            </div>
            <div class="flex justify-around items-center text-center mt-4 pt-4 border-t border-gray-100">
                <div>
                    <p class="text-xs text-gray-500">Goal</p>
                    <p class="font-bold text-gray-800 text-sm">${calorieGoal}</p>
                </div>
                <div class="border-l border-gray-200 h-8"></div>
                <div>
                    <p class="text-xs text-gray-500">Food</p>
                    <p class="font-bold text-gray-800 text-sm">${totalCalories}</p>
                </div>
                <div class="border-l border-gray-200 h-8"></div>
                <div>
                    <p class="text-xs text-gray-500">Remaining</p>
                    <p class="font-bold text-gray-800 text-sm">${remainingCalories}</p>
                </div>
            </div>
        </div>
    `;

    // ## BAGIAN 2: TIMELINE YANG TIDAK TERPUTUS ##
    let mealsHTML = '<div class="relative">'; // Wadah utama untuk timeline
    // Garis vertikal tunggal yang menjadi tulang punggung
    mealsHTML += '<div class="absolute left-5 top-2 h-full w-0.5 bg-gray-200"></div>';

    let mealNodesHTML = '<div class="relative space-y-6">';
    const mealTypes = [
        { name: 'Breakfast', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z"></path><path d="M9.879 16.121A3 3 0 1014.12 11.88"></path></svg>`, color: 'text-pink-600', bg: 'bg-pink-100' },
        { name: 'Lunch', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`, color: 'text-orange-600', bg: 'bg-orange-100'},
        { name: 'Dinner', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`, color: 'text-indigo-600', bg: 'bg-indigo-100'},
        { name: 'Snack', icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 12.572l-7.5 7.428-7.5-7.428m0 0a4.5 4.5 0 117.5 4.428 4.5 4.5 0 117.5-4.428z"></path></svg>`, color: 'text-cyan-600', bg: 'bg-cyan-100'}
    ];

    mealTypes.forEach(mealType => {
        const mealName = mealType.name.toLowerCase();
        const mealItems = dailyFood[mealName] || [];
        if (mealItems.length === 0) return; // Lewati jika tidak ada makanan

        const mealCalories = mealItems.reduce((sum, item) => sum + item.calories, 0);

        let itemsHTML = '';
        mealItems.forEach(item => {
            itemsHTML += `
                <div class="flex justify-between items-center text-sm">
                    <div>
                        <p class="font-semibold text-gray-800">${item.name}</p>
                        <p class="text-xs text-gray-400">${item.time || ''}</p>
                    </div>
                    <p class="font-medium text-gray-600">${item.calories} kcal</p>
                </div>`;
        });
        
        mealNodesHTML += `
            <div class="flex items-start">
                <div class="z-10 ${mealType.bg} ${mealType.color} p-3 rounded-full shadow-sm">
                    ${mealType.icon}
                </div>
                <div class="ml-4 flex-grow bg-white p-4 rounded-xl shadow-sm">
                    <p class="font-bold text-gray-800">${mealType.name}</p>
                    <p class="text-xs text-gray-500 mb-3">${mealItems.length} item${mealItems.length > 1 ? 's' : ''}, ${mealCalories} kcal</p>
                    <div class="space-y-3 border-t border-gray-100 pt-3">
                        ${itemsHTML}
                    </div>
                </div>
            </div>
        `;
    });
    mealNodesHTML += '</div>';
    mealsHTML += mealNodesHTML + '</div>';

    clientLogContent.innerHTML = heroCardHTML + '<div class="mt-6">' + mealsHTML + '</div>';
};

    // GANTI FUNGSI LAMA ANDA DENGAN YANG INI di file coach-dashboard.js

// GANTI FUNGSI LAMA ANDA DENGAN VERSI PREMIUM INI

// GANTI FUNGSI LAMA ANDA DENGAN VERSI FINAL REVISI INI

// GANTI FUNGSI LAMA ANDA DENGAN VERSI FINAL YANG DISEMPURNAKAN INI

const renderClientWorkoutLog = (date) => {
    const dateKey = formatDateKey(date);
    const clientData = allClientData[currentDetailClient.id] || {};
    const dailyWorkouts = clientData[dateKey]?.workouts || [];
    const clientNotes = clientData[dateKey]?.notes;

    if (dailyWorkouts.length === 0) {
        // ... (kode untuk 'No workout' tidak berubah) ...
        clientLogContent.innerHTML = `
            <div class="text-center py-16">
                <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="mt-4 text-sm text-gray-500">No workout logged for this day.</p>
            </div>`;
        return;
    }
    
    // ... (kalkulasi summary tidak berubah) ...
    let totalExercises = dailyWorkouts.length;
    let totalSets = 0;
    let totalPRs = 0;
    dailyWorkouts.forEach(exercise => {
        totalSets += exercise.sets.length;
        exercise.sets.forEach(set => { if (set.isPR) totalPRs++; });
    });
    
    const summaryCardHTML = `
        <div class="bg-white p-4 rounded-xl shadow-sm">
            <p class="text-sm font-semibold text-gray-500 text-center mb-4">Workout Summary</p>
            <div class="flex justify-around items-center text-center">
                <div><p class="text-xs text-gray-500">Exercises</p><p class="font-bold text-gray-800 text-lg">${totalExercises}</p></div>
                <div class="border-l border-gray-200 h-8"></div>
                <div><p class="text-xs text-gray-500">Total Sets</p><p class="font-bold text-gray-800 text-lg">${totalSets}</p></div>
                <div class="border-l border-gray-200 h-8"></div>
                <div><p class="text-xs text-gray-500">PRs Achieved</p><p class="font-bold text-pink-500 text-lg">${totalPRs} 🔥</p></div>
            </div>
        </div>
    `;

    // **FUNGSI HELPER YANG SUDAH DIPERBAIKI**
    const getExerciseIconAndColors = (muscleGroup) => {
        const iconMap = {
            legs: { icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l-2 2M9 19l3 3m-3-3l-3 3M17 14v6m-3-3h6m-1-7h-1" /></svg>`, bg: 'bg-indigo-100', text: 'text-indigo-600' },
            back: { icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12V6a2 2 0 012-2h12a2 2 0 012 2v6M10 16h4m-4 0v4m0-4h-4a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2z" /></svg>`, bg: 'bg-purple-100', text: 'text-purple-600' },
            chest: { icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3 1.343 3 3v2a3 3 0 01-3 3v0a3 3 0 01-3-3v-2c0-1.657 1.343-3 3-3zM12 8a7 7 0 00-7 7v0a7 7 0 007 7m0-14a7 7 0 017 7v0a7 7 0 01-7 7" /></svg>`, bg: 'bg-red-100', text: 'text-red-600' },
            arms: { icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM12 18V6M4 12H2m20 0h-2" /></svg>`, bg: 'bg-orange-100', text: 'text-orange-600' },
            core: { icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>`, bg: 'bg-teal-100', text: 'text-teal-600' },
            cardio: { icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`, bg: 'bg-pink-100', text: 'text-pink-600' },
            'full-body': { icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`, bg: 'bg-green-100', text: 'text-green-600' }
        };
        const defaultStyle = { icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.25a5.75 5.75 0 100 11.5 5.75 5.75 0 000-11.5z" /></svg>`, bg: 'bg-gray-100', text: 'text-gray-600' };
        return iconMap[muscleGroup] || defaultStyle;
    };
    
    let exercisesHTML = '<div class="space-y-4">';
    dailyWorkouts.forEach(exercise => {
        const { icon, bg, text } = getExerciseIconAndColors(exercise.muscleGroup);
        // ... (sisa dari loop exercisesHTML tidak berubah) ...
        let setsHTML = '';
        exercise.sets.forEach((set, index) => {
            let performance = '';
            if (set.weight && set.reps) { performance = `<span class="font-medium text-gray-800">${set.weight} kg x ${set.reps} reps</span>`;} 
            else if (set.reps) { performance = `<span class="font-medium text-gray-800">${set.reps} reps</span>`; } 
            else if (set.time) { performance = `<span class="font-medium text-gray-800">${set.time} mins</span>`; }
            let prBadge = set.isPR ? `<div class="w-14 flex justify-end"><span class="text-xs font-bold text-pink-500 bg-pink-100 px-2 py-0.5 rounded-full">🔥 PR</span></div>` : `<div class="w-14"></div>`;
            setsHTML += `
                <div class="flex justify-between items-center text-sm">
                    <p class="text-gray-500 w-12">Set ${index + 1}</p>
                    <div class="flex items-center justify-end flex-grow">
                        <div class="w-32 text-right">${performance}</div>
                        ${prBadge}
                    </div>
                </div>
            `;
        });
        const noteHTML = exercise.notes ? `
            <div class="mt-3 pt-3 border-t border-gray-100">
                <div class="flex items-start space-x-2 text-xs">
                    <div class="text-gray-400 flex-shrink-0 mt-0.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg></div>
                    <p class="text-gray-600 italic">"${exercise.notes}"</p>
                </div>
            </div>` : '';
        exercisesHTML += `
            <div class="bg-white p-4 rounded-xl shadow-sm">
                <div class="flex items-center mb-3">
                    <div class="${bg} ${text} p-2 rounded-full mr-3">${icon}</div>
                    <p class="font-bold text-gray-800">${exercise.name}</p>
                </div>
                <div class="space-y-2">${setsHTML}</div>
                ${noteHTML}
            </div>
        `;
    });
    exercisesHTML += '</div>';

    clientLogContent.innerHTML = [summaryCardHTML, exercisesHTML].filter(Boolean).join('<div class="my-6"></div>');
};
    const updateDetailDateDisplay = () => {
        const today = new Date();
        if (formatDateKey(currentDetailDate) === formatDateKey(today)) {
            detailDateDisplay.textContent = 'Today';
        } else {
            detailDateDisplay.textContent = currentDetailDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };
    
    // --- VIEW SWITCHING & EVENT LISTENERS ---
    
    const showClientDetail = (clientId) => {
        currentDetailClient = coachClients.find(c => c.id === clientId);
        if (!currentDetailClient) return;
        
        currentDetailDate = new Date();
        currentDetailTab = 'diary';

        clientDetailAvatar.src = currentDetailClient.avatar;
        clientDetailName.textContent = currentDetailClient.name;
        
        diaryTabBtn.classList.add('tab-active');
        workoutTabBtn.classList.remove('tab-active', 'text-emerald-600');
        
        updateDetailDateDisplay();
        renderClientFoodDiary(currentDetailDate);

        dashboardView.classList.add('hidden');
        clientDetailView.classList.remove('hidden');
    };

    const showDashboard = () => {
        clientDetailView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        currentDetailClient = null;
        renderActionCenter();
        renderClientList();
    };
    
    backToDashboardBtn.addEventListener('click', showDashboard);

    document.body.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-details-btn');
        if (viewBtn) {
            const clientId = viewBtn.dataset.clientId;
            showClientDetail(clientId);
        }
    });

    searchClientInput.addEventListener('input', (e) => {
        renderClientList(e.target.value);
    });

    diaryTabBtn.addEventListener('click', () => {
        if (currentDetailTab === 'diary') return;
        currentDetailTab = 'diary';
        workoutTabBtn.classList.remove('tab-active');
        diaryTabBtn.classList.add('tab-active');
        renderClientFoodDiary(currentDetailDate);
    });

    workoutTabBtn.addEventListener('click', () => {
        if (currentDetailTab === 'workout') return;
        currentDetailTab = 'workout';
        diaryTabBtn.classList.remove('tab-active');
        workoutTabBtn.classList.add('tab-active');
        renderClientWorkoutLog(currentDetailDate);
    });

    detailPrevDayBtn.addEventListener('click', () => {
        currentDetailDate.setDate(currentDetailDate.getDate() - 1);
        updateDetailDateDisplay();
        if (currentDetailTab === 'diary') renderClientFoodDiary(currentDetailDate);
        else renderClientWorkoutLog(currentDetailDate);
    });

    detailNextDayBtn.addEventListener('click', () => {
        currentDetailDate.setDate(currentDetailDate.getDate() + 1);
        updateDetailDateDisplay();
        if (currentDetailTab === 'diary') renderClientFoodDiary(currentDetailDate);
        else renderClientWorkoutLog(currentDetailDate);
    });

    // --- INITIALIZATION ---
    renderActionCenter();
    renderClientList();
});