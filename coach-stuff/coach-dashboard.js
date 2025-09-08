document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENT SELECTORS ---
    const dashboardView = document.getElementById('dashboard-view');
    const clientDetailView = document.getElementById('client-detail-view');
    const allActionsView = document.getElementById('all-actions-view'); 
    
    const clientListContainer = document.getElementById('client-list-container');
    const searchClientInput = document.getElementById('search-client-input');
    
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
    const backToDashboardFromActionsBtn = document.getElementById('back-to-dashboard-from-actions-btn');
    
    // Elemen untuk kartu statistik
    const statTotalClients = document.getElementById('stat-total-clients');
    const statNeedsAttention = document.getElementById('stat-needs-attention');
    const needsAttentionAvatars = document.getElementById('needs-attention-avatars');
    const needsAttentionCard = document.getElementById('needs-attention-card');

    // Detail View Elements
    const clientDetailAvatar = document.getElementById('client-detail-avatar');
    const clientDetailName = document.getElementById('client-detail-name');
    const diaryTabBtn = document.getElementById('diary-tab-btn');
    const workoutTabBtn = document.getElementById('workout-tab-btn');
    const detailDateDisplay = document.getElementById('detail-date-display');
    const detailPrevDayBtn = document.getElementById('detail-prev-day-btn');
    const detailNextDayBtn = document.getElementById('detail-next-day-btn');
    const clientLogContent = document.getElementById('client-log-content');
    const allActionsListContainer = document.getElementById('all-actions-list-container');

    const notificationBellBtn = document.getElementById('notification-bell-btn');
const notificationIndicator = document.getElementById('notification-indicator');
const notificationPanel = document.getElementById('notification-panel');
const notificationListContainer = document.getElementById('notification-list-container');
const closeNotificationPanelBtn = document.getElementById('close-notification-panel-btn');
const notificationOverlay = document.getElementById('notification-overlay');

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
            return { type: 'NEEDS_ATTENTION', reason: 'Missed food log yesterday.', icon: '⚠️' };
        }
        if (todayWorkouts && todayWorkouts.length > 0) {
            return { type: 'POSITIVE_UPDATE', reason: `Completed workout: ${todayWorkouts[0].name}`, icon: '🎉' };
        }
        return { type: 'ON_TRACK', reason: 'All logs are up to date.', icon: '✅' };
    };

    // --- RENDER FUNCTIONS ---

    // FUNGSI BARU: Untuk mengupdate kartu statistik di dashboard
    const updateDashboardStats = () => {
        if (!statTotalClients || !statNeedsAttention || !needsAttentionAvatars) return;

        // Hitung Total Klien
        const totalClients = coachClients.length;
        statTotalClients.textContent = totalClients;

        // Cari Klien yang Butuh Perhatian
        const clientsNeedingAttention = coachClients.filter(client => {
            const status = getClientStatus(client.id);
            return status.type === 'NEEDS_ATTENTION';
        });
        statNeedsAttention.textContent = clientsNeedingAttention.length;

        // Render tumpukan avatar (maksimal 3)
        needsAttentionAvatars.innerHTML = '';
        clientsNeedingAttention.slice(0, 3).forEach(client => {
            const img = document.createElement('img');
            img.className = "w-6 h-6 border-2 border-amber-50 rounded-full";
            img.src = client.avatar;
            img.alt = client.name;
            needsAttentionAvatars.appendChild(img);
        });
    };
    
    const renderClientList = (filter = '') => {
        if (!clientListContainer) return;

        let clientsToRender = coachClients;

        // Filter berdasarkan pencarian nama jika ada
        if (filter) {
            clientsToRender = coachClients.filter(c =>
                c.name.toLowerCase().includes(filter.toLowerCase())
            );
        }

        clientListContainer.innerHTML = '';

        if (clientsToRender.length === 0) {
            clientListContainer.innerHTML = `<p class="text-center text-gray-500 py-8">No clients found.</p>`;
            return;
        }

        clientsToRender.forEach(client => {
            const status = getClientStatus(client.id);
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-xl shadow-sm flex items-center space-x-4 view-details-btn cursor-pointer';
            card.dataset.clientId = client.id;
            
            const clientData = allClientData[client.id] || {};
            const hasFoodLog = !!clientData[formatDateKey(new Date())]?.food;
            const hasWorkoutLog = !!clientData[formatDateKey(new Date())]?.workouts;

            card.innerHTML = `
                <img src="${client.avatar}" alt="${client.name}" class="w-14 h-14 rounded-full object-cover">
                <div class="flex-grow">
                    <p class="font-bold text-gray-800">${client.name}</p>
                    <p class="text-xs text-gray-500">🔥 ${client.streak} day streak</p>
                    <div class="flex items-center text-xs text-gray-400 mt-2 space-x-3">
                        <span class="${hasFoodLog ? 'text-emerald-600' : 'text-gray-300'}">🍎 Food</span>
                        <span class="${hasWorkoutLog ? 'text-emerald-600' : 'text-gray-300'}">🏋️ Workout</span>
                    </div>
                </div>
                <div class="text-gray-400">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            `;
            clientListContainer.appendChild(card);
        });
    };
    
    const renderClientFoodDiary = (date) => {
        const dateKey = formatDateKey(date);
        const clientData = allClientData[currentDetailClient.id] || {};
        const dailyFood = clientData[dateKey]?.food || { breakfast: [], lunch: [], dinner: [], snack: [] };
        // ... (sisa fungsi render food diary tidak berubah) ...
        const calorieGoal=1800;let totalCalories=0;Object.values(dailyFood).forEach(mealArray=>{mealArray.forEach(food=>{totalCalories+=food.calories})});const remainingCalories=Math.max(0,calorieGoal-totalCalories);const progressPercentage=Math.min(totalCalories/calorieGoal*100,100);const heroCardHTML=`<div class="bg-white p-4 rounded-xl shadow-sm"><p class="text-sm font-semibold text-gray-500 text-center mb-2">Calorie Intake</p><div class="relative w-32 h-32 mx-auto"><svg class="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" stroke-width="3"></path><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ec4899" stroke-width="3" stroke-dasharray="${progressPercentage}, 100" stroke-linecap="round"></path></svg><div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-2xl font-bold text-gray-800">${totalCalories}</span><span class="text-xs text-gray-500">kcal</span></div></div><div class="flex justify-around items-center text-center mt-4 pt-4 border-t border-gray-100"><div><p class="text-xs text-gray-500">Goal</p><p class="font-bold text-gray-800 text-sm">${calorieGoal}</p></div><div class="border-l border-gray-200 h-8"></div><div><p class="text-xs text-gray-500">Food</p><p class="font-bold text-gray-800 text-sm">${totalCalories}</p></div><div class="border-l border-gray-200 h-8"></div><div><p class="text-xs text-gray-500">Remaining</p><p class="font-bold text-gray-800 text-sm">${remainingCalories}</p></div></div></div>`;let mealsHTML='<div class="relative"><div class="absolute left-5 top-2 h-full w-0.5 bg-gray-200"></div>';let mealNodesHTML='<div class="relative space-y-6">';const mealTypes=[{name:'Breakfast',icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z"></path><path d="M9.879 16.121A3 3 0 1014.12 11.88"></path></svg>`,color:'text-pink-600',bg:'bg-pink-100'},{name:'Lunch',icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,color:'text-orange-600',bg:'bg-orange-100'},{name:'Dinner',icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,color:'text-indigo-600',bg:'bg-indigo-100'},{name:'Snack',icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 12.572l-7.5 7.428-7.5-7.428m0 0a4.5 4.5 0 117.5 4.428 4.5 4.5 0 117.5-4.428z"></path></svg>`,color:'text-cyan-600',bg:'bg-cyan-100'}];mealTypes.forEach(mealType=>{const mealName=mealType.name.toLowerCase();const mealItems=dailyFood[mealName]||[];if(mealItems.length===0)return;const mealCalories=mealItems.reduce((sum,item)=>sum+item.calories,0);let itemsHTML='';mealItems.forEach(item=>{itemsHTML+=`<div class="flex justify-between items-center text-sm"><div><p class="font-semibold text-gray-800">${item.name}</p><p class="text-xs text-gray-400">${item.time||''}</p></div><p class="font-medium text-gray-600">${item.calories} kcal</p></div>`});mealNodesHTML+=`<div class="flex items-start"><div class="z-10 ${mealType.bg} ${mealType.color} p-3 rounded-full shadow-sm">${mealType.icon}</div><div class="ml-4 flex-grow bg-white p-4 rounded-xl shadow-sm"><p class="font-bold text-gray-800">${mealType.name}</p><p class="text-xs text-gray-500 mb-3">${mealItems.length} item${mealItems.length>1?'s':''}, ${mealCalories} kcal</p><div class="space-y-3 border-t border-gray-100 pt-3">${itemsHTML}</div></div></div>`});mealNodesHTML+='</div>';mealsHTML+=mealNodesHTML+'</div>';clientLogContent.innerHTML=heroCardHTML+'<div class="mt-6">'+mealsHTML+'</div>';
    };

    const renderClientWorkoutLog = (date) => {
        const dateKey = formatDateKey(date);
        const clientData = allClientData[currentDetailClient.id] || {};
        const dailyWorkouts = clientData[dateKey]?.workouts || [];
        // ... (sisa fungsi render workout log tidak berubah) ...
        if(dailyWorkouts.length===0){clientLogContent.innerHTML=`<div class="text-center py-16"><svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><p class="mt-4 text-sm text-gray-500">No workout logged for this day.</p></div>`;return}let totalExercises=dailyWorkouts.length;let totalSets=0;let totalPRs=0;dailyWorkouts.forEach(exercise=>{totalSets+=exercise.sets.length;exercise.sets.forEach(set=>{if(set.isPR)totalPRs++})});const summaryCardHTML=`<div class="bg-white p-4 rounded-xl shadow-sm"><p class="text-sm font-semibold text-gray-500 text-center mb-4">Workout Summary</p><div class="flex justify-around items-center text-center"><div><p class="text-xs text-gray-500">Exercises</p><p class="font-bold text-gray-800 text-lg">${totalExercises}</p></div><div class="border-l border-gray-200 h-8"></div><div><p class="text-xs text-gray-500">Total Sets</p><p class="font-bold text-gray-800 text-lg">${totalSets}</p></div><div class="border-l border-gray-200 h-8"></div><div><p class="text-xs text-gray-500">PRs Achieved</p><p class="font-bold text-pink-500 text-lg">${totalPRs} 🔥</p></div></div></div>`;const getExerciseIconAndColors=muscleGroup=>{const iconMap={legs:{icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l-2 2M9 19l3 3m-3-3l-3 3M17 14v6m-3-3h6m-1-7h-1" /></svg>`,bg:'bg-indigo-100',text:'text-indigo-600'},back:{icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12V6a2 2 0 012-2h12a2 2 0 012 2v6M10 16h4m-4 0v4m0-4h-4a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2z" /></svg>`,bg:'bg-purple-100',text:'text-purple-600'},chest:{icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3 1.343 3 3v2a3 3 0 01-3 3v0a3 3 0 01-3-3v-2c0-1.657 1.343-3 3-3zM12 8a7 7 0 00-7 7v0a7 7 0 007 7m0-14a7 7 0 017 7v0a7 7 0 01-7 7" /></svg>`,bg:'bg-red-100',text:'text-red-600'},arms:{icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM12 18V6M4 12H2m20 0h-2" /></svg>`,bg:'bg-orange-100',text:'text-orange-600'},core:{icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>`,bg:'bg-teal-100',text:'text-teal-600'},cardio:{icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`,bg:'bg-pink-100',text:'text-pink-600'},'full-body':{icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`,bg:'bg-green-100',text:'text-green-600'}};const defaultStyle={icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.25a5.75 5.75 0 100 11.5 5.75 5.75 0 000-11.5z" /></svg>`,bg:'bg-gray-100',text:'text-gray-600'};return iconMap[muscleGroup]||defaultStyle};let exercisesHTML='<div class="space-y-4">';dailyWorkouts.forEach(exercise=>{const {icon,bg,text}=getExerciseIconAndColors(exercise.muscleGroup);let setsHTML='';exercise.sets.forEach((set,index)=>{let performance='';if(set.weight&&set.reps){performance=`<span class="font-medium text-gray-800">${set.weight} kg x ${set.reps} reps</span>`}else if(set.reps){performance=`<span class="font-medium text-gray-800">${set.reps} reps</span>`}else if(set.time){performance=`<span class="font-medium text-gray-800">${set.time} mins</span>`}let prBadge=set.isPR?`<div class="w-14 flex justify-end"><span class="text-xs font-bold text-pink-500 bg-pink-100 px-2 py-0.5 rounded-full">🔥 PR</span></div>`:`<div class="w-14"></div>`;setsHTML+=`<div class="flex justify-between items-center text-sm"><p class="text-gray-500 w-12">Set ${index+1}</p><div class="flex items-center justify-end flex-grow"><div class="w-32 text-right">${performance}</div>${prBadge}</div></div>`});const noteHTML=exercise.notes?`<div class="mt-3 pt-3 border-t border-gray-100"><div class="flex items-start space-x-2 text-xs"><div class="text-gray-400 flex-shrink-0 mt-0.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg></div><p class="text-gray-600 italic">"${exercise.notes}"</p></div></div>`:'';exercisesHTML+=`<div class="bg-white p-4 rounded-xl shadow-sm"><div class="flex items-center mb-3"><div class="${bg} ${text} p-2 rounded-full mr-3">${icon}</div><p class="font-bold text-gray-800">${exercise.name}</p></div><div class="space-y-2">${setsHTML}</div>${noteHTML}</div>`});exercisesHTML+='</div>';clientLogContent.innerHTML=[summaryCardHTML,exercisesHTML].filter(Boolean).join('<div class="my-6"></div>');
    };

    const updateDetailDateDisplay = () => {
        const today = new Date();
        if (formatDateKey(currentDetailDate) === formatDateKey(today)) {
            detailDateDisplay.textContent = 'Today';
        } else {
            detailDateDisplay.textContent = currentDetailDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };
    

    // --- NOTIFICATION LOGIC ---

// 1. Fungsi untuk membuat daftar notifikasi
const generateNotifications = () => {
    return coachClients
        .map(client => ({ client, status: getClientStatus(client.id) }))
        .filter(item => item.status.type === 'NEEDS_ATTENTION' || item.status.type === 'POSITIVE_UPDATE')
        .map(item => {
            const isAttention = item.status.type === 'NEEDS_ATTENTION';
            return {
                clientId: item.client.id,
                avatar: item.client.avatar,
                name: item.client.name,
                reason: item.status.reason,
                icon: isAttention 
                    ? `<div class="bg-amber-100 text-amber-600 p-2 rounded-full"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>`
                    : `<div class="bg-pink-100 text-pink-600 p-2 rounded-full"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>`,
            };
        });
};

// 2. Fungsi untuk menampilkan notifikasi di panel
const renderNotifications = (notifications) => {
    if (!notificationListContainer) return;
    notificationListContainer.innerHTML = ''; // Kosongkan dulu

    if (notifications.length === 0) {
        notificationListContainer.innerHTML = `<p class="text-center text-gray-500 py-16">No new activity.</p>`;
        return;
    }

    notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = 'flex items-center p-3 space-x-4 hover:bg-gray-100 rounded-lg cursor-pointer view-details-btn';
        item.dataset.clientId = notif.clientId; // Tambahkan data-client-id agar bisa diklik

        item.innerHTML = `
            ${notif.icon}
            <div class="flex-grow">
                <p class="text-sm font-semibold text-gray-800">${notif.name}</p>
                <p class="text-xs text-gray-600">${notif.reason}</p>
            </div>
            <img src="${notif.avatar}" class="w-10 h-10 rounded-full object-cover">
        `;
        notificationListContainer.appendChild(item);
    });
};

// 3. Fungsi untuk update titik merah (indikator)
const updateNotificationIndicator = (notifications) => {
    if (!notificationIndicator) return;
    if (notifications.length > 0) {
        notificationIndicator.classList.remove('hidden');
    } else {
        notificationIndicator.classList.add('hidden');
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
        workoutTabBtn.classList.remove('tab-active');
        
        updateDetailDateDisplay();
        renderClientFoodDiary(currentDetailDate);

        dashboardView.classList.add('hidden');
        if (allActionsView) allActionsView.classList.add('hidden');
        clientDetailView.classList.remove('hidden');
    };

    const showDashboard = () => {
        clientDetailView.classList.add('hidden');
        if (allActionsView) allActionsView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        currentDetailClient = null;
        updateDashboardStats(); 
        renderClientList(); 
    };

    // Event listener untuk membuka panel notifikasi
if (notificationBellBtn) {
    notificationBellBtn.addEventListener('click', () => {
        notificationPanel.classList.remove('translate-x-full');
        notificationOverlay.classList.remove('hidden');
        notificationIndicator.classList.add('hidden'); // Sembunyikan titik merah saat panel dibuka
    });
}

// Fungsi untuk menutup panel
const closeNotificationPanel = () => {
    notificationPanel.classList.add('translate-x-full');
    notificationOverlay.classList.add('hidden');
};

// Event listener untuk menutup panel
if (closeNotificationPanelBtn) closeNotificationPanelBtn.addEventListener('click', closeNotificationPanel);
if (notificationOverlay) notificationOverlay.addEventListener('click', closeNotificationPanel);

    const showAllActions = () => {
        dashboardView.classList.add('hidden');
        clientDetailView.classList.add('hidden');
        if (allActionsView) allActionsView.classList.remove('hidden');
        renderAllActionsView();
    };
    
    const renderAllActionsView = () => {
        if (!allActionsListContainer) return;
        allActionsListContainer.innerHTML = '';

        const allClientsWithActions = coachClients.filter(client => {
            const status = getClientStatus(client.id);
            return status.type === 'NEEDS_ATTENTION' || status.type === 'POSITIVE_UPDATE';
        });

        if (allClientsWithActions.length === 0) {
            allActionsListContainer.innerHTML = '<p class="text-center text-gray-500">No action items to show.</p>';
            return;
        }

        allClientsWithActions.forEach(client => {
            const status = getClientStatus(client.id);
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-xl shadow-sm flex items-center space-x-4 view-details-btn cursor-pointer';
            card.dataset.clientId = client.id;
            const statusColor = status.type === 'NEEDS_ATTENTION' ? 'text-amber-500' : 'text-pink-500';
            card.innerHTML = `
                <img src="${client.avatar}" alt="${client.name}" class="w-12 h-12 rounded-full">
                <div class="flex-grow">
                    <p class="font-bold text-gray-800">${client.name}</p>
                    <p class="text-sm ${statusColor}">${status.reason}</p>
                </div>
                <div class="text-gray-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
            `;
            allActionsListContainer.appendChild(card);
        });
    };

    if (backToDashboardBtn) backToDashboardBtn.addEventListener('click', showDashboard);
    if (backToDashboardFromActionsBtn) backToDashboardFromActionsBtn.addEventListener('click', showDashboard);

    document.body.addEventListener('click', (e) => {
        const viewDetailsBtn = e.target.closest('.view-details-btn');
        if (viewDetailsBtn) {
            const clientId = viewDetailsBtn.dataset.clientId;
            showClientDetail(clientId);
            return;
        }
        
        const viewAllBtn = e.target.closest('#view-all-actions-btn');
        if (viewAllBtn) {
            e.preventDefault();
            showAllActions();
            return;
        }
    });
    
    if (needsAttentionCard) {
        needsAttentionCard.addEventListener('click', (e) => {
            e.preventDefault();
            const clientsNeedingAttention = coachClients.filter(c => getClientStatus(c.id).type === 'NEEDS_ATTENTION');
            
            clientListContainer.innerHTML = ''; // Kosongkan dulu
            clientsNeedingAttention.forEach(client => {
                // Buat kartu untuk setiap klien yang butuh perhatian
                // Logikanya sama dengan di renderClientList, bisa diekstrak ke fungsi helper
                const status = getClientStatus(client.id);
                const card = document.createElement('div');
                card.className = 'bg-white p-4 rounded-xl shadow-sm flex items-center space-x-4 view-details-btn cursor-pointer';
                card.dataset.clientId = client.id;
                
                const clientData = allClientData[client.id] || {};
                const hasFoodLog = !!clientData[formatDateKey(new Date())]?.food;
                const hasWorkoutLog = !!clientData[formatDateKey(new Date())]?.workouts;

                card.innerHTML = `
                    <img src="${client.avatar}" alt="${client.name}" class="w-14 h-14 rounded-full object-cover">
                    <div class="flex-grow">
                        <p class="font-bold text-gray-800">${client.name}</p>
                        <p class="text-xs text-orange-500 mt-1">⚠️ ${status.reason}</p>
                        <div class="flex items-center text-xs text-gray-400 mt-2 space-x-3">
                            <span class="${hasFoodLog ? 'text-emerald-600' : 'text-gray-300'}">🍎 Food</span>
                            <span class="${hasWorkoutLog ? 'text-emerald-600' : 'text-gray-300'}">🏋️ Workout</span>
                        </div>
                    </div>
                    <div class="text-gray-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></div>
                `;
                clientListContainer.appendChild(card);
            });
            // Gulir ke bagian daftar klien
            clientListContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (searchClientInput) searchClientInput.addEventListener('input', (e) => renderClientList(e.target.value));
    
    if (diaryTabBtn) diaryTabBtn.addEventListener('click', () => {
        if (currentDetailTab === 'diary') return;
        currentDetailTab = 'diary';
        workoutTabBtn.classList.remove('tab-active');
        diaryTabBtn.classList.add('tab-active');
        renderClientFoodDiary(currentDetailDate);
    });

    if (workoutTabBtn) workoutTabBtn.addEventListener('click', () => {
        if (currentDetailTab === 'workout') return;
        currentDetailTab = 'workout';
        diaryTabBtn.classList.remove('tab-active');
        workoutTabBtn.classList.add('tab-active');
        renderClientWorkoutLog(currentDetailDate);
    });

    if (detailPrevDayBtn) detailPrevDayBtn.addEventListener('click', () => {
        currentDetailDate.setDate(currentDetailDate.getDate() - 1);
        updateDetailDateDisplay();
        if (currentDetailTab === 'diary') renderClientFoodDiary(currentDetailDate);
        else renderClientWorkoutLog(currentDetailDate);
    });

    if (detailNextDayBtn) detailNextDayBtn.addEventListener('click', () => {
        currentDetailDate.setDate(currentDetailDate.getDate() + 1);
        updateDetailDateDisplay();
        if (currentDetailTab === 'diary') renderClientFoodDiary(currentDetailDate);
        else renderClientWorkoutLog(currentDetailDate);
    });

    // --- INITIALIZATION ---


    const notifications = generateNotifications();
renderNotifications(notifications);
updateNotificationIndicator(notifications);
    updateDashboardStats();
    renderClientList();
});