document.addEventListener('DOMContentLoaded', () => {

    // --- MOCK DATA (Simulasi database untuk klien & status mereka) ---
   // [BARU] Data klien dan fungsi pengecekan status
const coachClients = [
    { id: 'client001', name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=jane-doe' },
    { id: 'client002', name: 'John Smith', avatar: 'https://i.pravatar.cc/150?u=john-smith' },
    { id: 'client003', name: 'Emily White', avatar: 'https://i.pravatar.cc/150?u=emily-white' }
];

// Fungsi untuk memeriksa apakah klien mengisi log makanan kemarin
const checkClientStatus = (client) => {
    const allFoodData = JSON.parse(localStorage.getItem('allFoodData')) || {};
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

    const yesterdayFood = allFoodData[yesterdayKey];

    // Jika tidak ada data sama sekali untuk kemarin, atau ada tapi kosong
    if (!yesterdayFood || Object.values(yesterdayFood).every(meal => meal.length === 0)) {
        return 'needs-attention';
    }
    return 'on-track';
};

    // --- ELEMENT SELECTORS ---
    const dashboardView = document.getElementById('dashboard-view');
    const clientDetailView = document.getElementById('client-detail-view');
    const clientListContainer = document.getElementById('client-list-container');
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
    
    // Summary Card Elements
    const totalClientsEl = document.getElementById('total-clients');
    const needsAttentionEl = document.getElementById('needs-attention');

    // --- STATE MANAGEMENT ---
    let currentDetailClient = null;
    let currentDetailDate = new Date();
    let currentDetailTab = 'diary';

    // --- HELPER FUNCTIONS ---
    const formatDateKey = (date) => date.toISOString().split('T')[0];

    // --- RENDER FUNCTIONS ---

    // [UBAH] Ganti fungsi renderSummaryCards
const renderSummaryCards = () => {
    totalClientsEl.textContent = coachClients.length;
    // Hitung status "needs-attention" secara dinamis
    const attentionCount = coachClients.filter(c => checkClientStatus(c) === 'needs-attention').length;
    needsAttentionEl.textContent = attentionCount;
};

    // [UBAH] Ganti fungsi renderClientList
const renderClientList = () => {
    clientListContainer.innerHTML = '';
    const allFoodData = JSON.parse(localStorage.getItem('allFoodData')) || {};
    const todayKey = formatDateKey(new Date());
    const calorieGoal = parseInt(localStorage.getItem('calorieGoal') || 1800, 10);

    coachClients.forEach(client => {
        // Simulasi: Semua klien melihat data yang sama dari localStorage
        const todayFood = allFoodData[todayKey] || {};
        let totalCalories = 0;
        if (todayFood) {
            Object.values(todayFood).forEach(meal => {
                if(Array.isArray(meal)) {
                    meal.forEach(food => { totalCalories += food.calories; });
                }
            });
        }
        const adherence = Math.min((totalCalories / calorieGoal) * 100, 100).toFixed(0);
        
        // Dapatkan status dinamis
        const status = checkClientStatus(client);
        const statusColorClass = status === 'needs-attention' ? 'bg-yellow-500' : 'bg-pink-500';

        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-xl shadow-sm flex items-center space-x-4';
        card.innerHTML = `
            <img src="${client.avatar}" alt="${client.name}" class="w-14 h-14 rounded-full object-cover">
            <div class="flex-grow">
                <p class="font-bold text-gray-800">${client.name}</p>
                <div class="flex items-center text-xs text-gray-500 mt-1">
                    <div class="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                        <div class="${statusColorClass} h-1.5 rounded-full" style="width: ${adherence}%"></div>
                    </div>
                    <span>${adherence}%</span>
                </div>
            </div>
            <button data-client-id="${client.id}" class="view-details-btn p-2 text-gray-500 rounded-full hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
        `;
        clientListContainer.appendChild(card);
    });
};

    const renderClientFoodDiary = (date) => {
        const dateKey = formatDateKey(date);
        const allFoodData = JSON.parse(localStorage.getItem('allFoodData')) || {};
        const dailyFood = allFoodData[dateKey] || { breakfast: [], lunch: [], dinner: [], snack: [] };
        const calorieGoal = parseInt(localStorage.getItem('calorieGoal') || 1800, 10);
        let totalCalories = 0;

        clientLogContent.innerHTML = ''; // Clear previous content

        let diaryHTML = '';
        
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        mealTypes.forEach(meal => {
            let mealHTML = `<div class="mb-4"><h4 class="font-bold text-gray-700 mb-2 capitalize">${meal}</h4><div class="space-y-2">`;
            const foodList = dailyFood[meal];
            if (foodList && foodList.length > 0) {
                foodList.forEach(food => {
                    totalCalories += food.calories;
                    mealHTML += `
                        <div class="bg-white/50 p-2 rounded-lg flex justify-between items-center text-sm">
                            <div>
                                <p class="font-semibold">${food.name}</p>
                                <p class="text-xs text-gray-500">${food.serving}</p>
                            </div>
                            <p class="font-semibold">${food.calories} kal</p>
                        </div>
                    `;
                });
            } else {
                mealHTML += `<p class="text-sm text-gray-400">No ${meal} logged.</p>`;
            }
            mealHTML += `</div></div>`;
            diaryHTML += mealHTML;
        });

        const adherence = Math.min((totalCalories / calorieGoal) * 100, 100).toFixed(0);
        const summaryCardHTML = `
            <div class="glass-card rounded-xl p-4 mb-6">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-bold text-gray-900">${totalCalories} / ${calorieGoal}</span>
                    <span class="text-pink-500 font-semibold">Calories</span>
                </div>
                <div class="w-full progress-track-bg rounded-full h-2">
                    <div class="bg-pink-500 h-2 rounded-full" style="width: ${adherence}%"></div>
                </div>
            </div>
        `;

        clientLogContent.innerHTML = summaryCardHTML + diaryHTML;
    };

    const renderClientWorkoutLog = (date) => {
        const dateKey = formatDateKey(date);
        const allWorkouts = JSON.parse(localStorage.getItem('workouts')) || {};
        const dailyWorkouts = allWorkouts[dateKey] || [];
        
        clientLogContent.innerHTML = ''; // Clear previous content

        if (dailyWorkouts.length === 0) {
            clientLogContent.innerHTML = `<p class="text-center text-gray-500 py-16">No workout logged for this day.</p>`;
            return;
        }

        dailyWorkouts.forEach(exercise => {
            const isCardio = exercise.categories.includes("Cardio");
            let setsHTML = '';
            exercise.sets.forEach((set, index) => {
                if (isCardio) {
                    setsHTML += `<li class="text-sm text-gray-600">Set ${index + 1}: ${set.time || 'N/A'} minutes</li>`;
                } else {
                    setsHTML += `<li class="text-sm text-gray-600">Set ${index + 1}: ${set.weight || 'N/A'} kg × ${set.reps || 'N/A'} reps</li>`;
                }
            });
            
            const exerciseCard = document.createElement('div');
            exerciseCard.className = 'bg-white/50 p-4 rounded-lg mb-3';
            exerciseCard.innerHTML = `
                <h4 class="font-bold text-gray-800">${exercise.name}</h4>
                <ul class="list-disc list-inside mt-2 space-y-1">${setsHTML}</ul>
                ${exercise.note ? `<div class="mt-2 pt-2 border-t border-gray-200"><p class="text-xs text-gray-500 italic">Note: ${exercise.note}</p></div>` : ''}
            `;
            clientLogContent.appendChild(exerciseCard);
        });
    };

    const updateDetailDateDisplay = () => {
        const today = new Date();
        if (formatDateKey(currentDetailDate) === formatDateKey(today)) {
            detailDateDisplay.textContent = 'Today';
        } else {
            detailDateDisplay.textContent = currentDetailDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };
    
    // --- VIEW SWITCHING LOGIC ---
    
    const showClientDetail = (clientId) => {
        currentDetailClient = coachClients.find(c => c.id === clientId);
        if (!currentDetailClient) return;

        // Reset state
        currentDetailDate = new Date();
        currentDetailTab = 'diary';

        // Populate header
        clientDetailAvatar.src = currentDetailClient.avatar;
        clientDetailName.textContent = currentDetailClient.name;
        
        // Switch tabs to default
        diaryTabBtn.classList.add('tab-active');
        workoutTabBtn.classList.remove('tab-active');

        // Render content
        updateDetailDateDisplay();
        renderClientFoodDiary(currentDetailDate);

        // Switch views
        dashboardView.classList.add('hidden');
        clientDetailView.classList.remove('hidden');
    };

    const showDashboard = () => {
        clientDetailView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        currentDetailClient = null;
    };
    
    // --- EVENT LISTENERS ---

    backToDashboardBtn.addEventListener('click', showDashboard);

    clientListContainer.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-details-btn');
        if (viewBtn) {
            const clientId = viewBtn.dataset.clientId;
            showClientDetail(clientId);
        }
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
    renderSummaryCards();
    renderClientList();
});