document.addEventListener('DOMContentLoaded', function() {
    
    // =================================================================================
    // SETUP & INISIALISASI
    // =================================================================================

    function initializeDummyData() {
        if (!localStorage.getItem('weightData')) {
            const dummyWeights = [
                { date: '2025-10-01', weight: 72.5, time: '07:30' },
                { date: '2025-09-24', weight: 73.1, time: '08:00' },
                { date: '2025-09-17', weight: 74.0, time: '07:45' },
                { date: '2025-09-10', weight: 75.2, time: '08:15' },
                { date: '2025-09-03', weight: 76.8, time: '08:05' },
                { date: '2025-08-27', weight: 77.5, time: '08:00' }
            ];
            localStorage.setItem('weightData', JSON.stringify(dummyWeights));
            console.log('✅ Dummy data berat badan dibuat.');
        }
        if (!localStorage.getItem('goalWeight')) {
            localStorage.setItem('goalWeight', '70');
            console.log('✅ Dummy goal weight dibuat.');
        }
    }
    initializeDummyData();

    // --- Elemen-elemen ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const latestWeightDisplay = document.getElementById('latest-weight-display');
    const goalWeightDisplay = document.getElementById('goal-weight-display');
    const weightHistoryList = document.getElementById('weight-history-list');
    const historyFilter = document.getElementById('history-filter');
    const updateWeightModal = document.getElementById('update-weight-modal');
    const openUpdateModalBtn = document.getElementById('update-weight-btn');
    const closeUpdateModalBtn = document.getElementById('cancel-update-btn');
    const saveWeightBtn = document.getElementById('save-weight-btn');
    const newWeightInput = document.getElementById('new-weight-input');
    const entryDateInput = document.getElementById('entry-date-input');
    const setGoalModal = document.getElementById('set-goal-modal');
    const openSetGoalBtn = document.getElementById('set-goal-btn');
    const closeGoalModalBtn = document.getElementById('cancel-goal-btn');
    const saveGoalBtn = document.getElementById('save-goal-btn');
    const newGoalInput = document.getElementById('new-goal-input');
    const measurementDateDisplay = document.getElementById('measurement-date-display');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');
    const measurementForm = document.getElementById('measurement-form');
    const saveMeasurementBtn = document.getElementById('save-measurement-btn');
    const measurementHistoryList = document.getElementById('measurement-history-list');
    const shareViewContainer = document.getElementById('share-view');
    const sharePreviewModal = document.getElementById('share-preview-modal');
    const shareModalOverlay = document.getElementById('share-modal-overlay');
    const achievementImagePreview = document.getElementById('achievement-image-preview');
    const qrcodeContainer = document.getElementById('qrcode-container');
    const downloadAchievementBtn = document.getElementById('download-achievement-btn');
    const shareCardTemplate = document.getElementById('share-card-template');
    const templateIcon = document.getElementById('template-icon');
    const templateUserName = document.getElementById('template-user-name');
    const templateTitle = document.getElementById('template-title');
    const templateSubtitle = document.getElementById('template-subtitle');
    const templateStats = document.getElementById('template-stats');

    let currentMeasurementDate = new Date();
    let achievementsGenerated = false;
    let qrcodeInstance = null;

    const ctx = document.getElementById('weight-chart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.parentElement.clientHeight);
    gradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
    const weightChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ 
            label: 'Weight (kg)', data: [], borderColor: '#ec4899', tension: 0.4, fill: true,
            backgroundColor: gradient, pointBackgroundColor: '#ec4899', pointBorderColor: '#fff',
            pointHoverRadius: 7, pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#ec4899', pointHoverBorderWidth: 2
        }] },
        options: { 
            plugins: { legend: { display: false } }, 
            scales: { 
                y: { beginAtZero: false, grid: { drawBorder: false, color: '#f0f0f0' } },
                x: { grid: { display: false } }
            } 
        }
    });

    // =================================================================================
    // MANAJEMEN DATA
    // =================================================================================
    function getWeightData() { return JSON.parse(localStorage.getItem('weightData')) || []; }
    function saveWeightData(data) {
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('weightData', JSON.stringify(data));
    }
    function getGoalWeight() { return localStorage.getItem('goalWeight') || '--'; }
    function saveGoalWeight(goal) { localStorage.setItem('goalWeight', goal); }
    function getMeasurementData() { return JSON.parse(localStorage.getItem('measurementData')) || {}; }
    function saveMeasurementData(data) { localStorage.setItem('measurementData', JSON.stringify(data)); }

    // =================================================================================
    // LOGIKA TAB SWITCHER
    // =================================================================================
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            tabButtons.forEach(btn => {
                btn.classList.toggle('bg-white', btn.dataset.tab === targetTab);
                btn.classList.toggle('shadow', btn.dataset.tab === targetTab);
                btn.classList.toggle('text-pink-500', btn.dataset.tab === targetTab);
                btn.classList.toggle('text-gray-500', btn.dataset.tab !== targetTab);
            });
            tabContents.forEach(content => {
                content.classList.toggle('hidden', content.id !== `${targetTab}-view`);
            });
            if (targetTab === 'share' && !achievementsGenerated) {
                generateAchievements();
                achievementsGenerated = true;
            }
        });
    });

    // =================================================================================
    // LOGIKA SHARE & ACHIEVEMENTS
    // =================================================================================
    
    shareViewContainer.addEventListener('click', function(event) {
        const shareButton = event.target.closest('.share-achievement-btn');
        if (shareButton) {
            handleShare(shareButton.dataset);
        }
    });

    async function handleShare(dataset) {
        prepareShareCard(dataset);
        shareCardTemplate.style.left = '0px'; 
        
        try {
            const canvas = await html2canvas(shareCardTemplate, { backgroundColor: null, useCORS: true });
            shareCardTemplate.style.left = '-9999px'; 
            
            if (navigator.share && navigator.canShare) {
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], "achievement.png", { type: "image/png" });
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({ files: [file], title: dataset.title });
                    } else {
                         showSharePreviewModal(canvas); // Fallback ke modal jika tidak bisa share file
                    }
                }, 'image/png');
            } else {
                showSharePreviewModal(canvas);
            }
        } catch (err) {
            console.error("Error generating canvas:", err);
            shareCardTemplate.style.left = '-9999px';
        }
    }

    function prepareShareCard(data) {
        const userName = "Alex";
        templateUserName.textContent = userName;
        templateStats.innerHTML = '';
        templateTitle.textContent = data.title;
        templateSubtitle.textContent = data.subtitle;

        const icons = getAchievementIcons();
        const colors = getAchievementColors(data.type);
        templateIcon.innerHTML = icons[data.type] || '';
        templateIcon.className = `w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${colors.bg} ${colors.text}`;

        if (data.type === 'weight-loss' || data.type === 'record') {
            templateStats.innerHTML = `
                <div class="text-center">
                    <p class="text-sm text-gray-500">From</p>
                    <p class="text-4xl font-extrabold">${data.startvalue} <span class="text-lg font-semibold">kg</span></p>
                </div>
                <div class="text-2xl font-bold text-primary-gradient mx-2 pb-2">&rarr;</div>
                <div class="text-center">
                    <p class="text-sm text-gray-500">To</p>
                    <p class="text-4xl font-extrabold">${data.endvalue} <span class="text-lg font-semibold">kg</span></p>
                </div>
            `;
        }
    }

    function showSharePreviewModal(canvas) {
        const imageUrl = canvas.toDataURL("image/png");
        achievementImagePreview.src = imageUrl;
        
        qrcodeContainer.innerHTML = '';
        new QRCode(qrcodeContainer, { text: window.location.href, width: 100, height: 100 });

        downloadAchievementBtn.onclick = () => {
            const link = document.createElement('a');
            link.download = 'my-achievement.png';
            link.href = imageUrl;
            link.click();
        };
        sharePreviewModal.classList.remove('hidden');
    }

    shareModalOverlay.addEventListener('click', () => sharePreviewModal.classList.add('hidden'));

    function generateAchievements() {
        shareViewContainer.innerHTML = '';
        const weightData = getWeightData();
        const goalWeight = parseFloat(getGoalWeight());
        let achievementsFound = 0;
        
        if (weightData.length < 2) {
            shareViewContainer.innerHTML = '<p class="text-center text-gray-500 mt-8">Not enough data to generate achievements.</p>';
            return;
        }

        const latestWeight = weightData[0].weight;
        const startingWeight = weightData[weightData.length - 1].weight;
        const weightLost = (startingWeight - latestWeight).toFixed(1);

        if (weightLost >= 5) {
            createAchievementCard('Lost 5 kg!', `From ${startingWeight} kg to ${latestWeight} kg`, 'weight-loss', { startValue: startingWeight, endValue: latestWeight });
            achievementsFound++;
        }
        if (goalWeight && latestWeight <= goalWeight) {
            createAchievementCard('Goal Reached!', `Congratulations on reaching your goal of ${goalWeight} kg.`, 'goal', { startValue: startingWeight, endValue: goalWeight });
            achievementsFound++;
        }
        const lowestWeight = Math.min(...weightData.map(d => d.weight));
        if (latestWeight === lowestWeight && latestWeight < weightData[1].weight) {
            createAchievementCard('New Lowest Weight!', `You've set a new personal record at ${latestWeight} kg.`, 'record', { startValue: weightData[1].weight, endValue: latestWeight });
            achievementsFound++;
        }
        createAchievementCard('7-Day Workout Streak!', `You're on fire, keep the momentum.`, 'streak', {});
        achievementsFound++;
        
        if(achievementsFound === 0) {
             shareViewContainer.innerHTML = '<p class="text-center text-gray-500 mt-8">No special achievements yet. Keep up the good work!</p>';
        }
    }

    function createAchievementCard(title, subtitle, type, extraData = {}) {
        const datasetStrings = Object.entries(extraData).map(([key, value]) => `data-${key.toLowerCase()}="${value}"`).join(' ');
        const colors = getAchievementColors(type);

        const cardHTML = `
            <div class="glass-card rounded-xl p-4 flex items-center achievement-card">
                <div class="mr-4 p-3 rounded-full ${colors.bg} ${colors.text}">
                    ${getAchievementIcons()[type] || ''}
                </div>
                <div class="flex-grow text-left">
                    <p class="font-bold text-gray-900">${title}</p>
                    <p class="text-xs text-gray-600">${subtitle}</p>
                </div>
                <button 
                    class="share-achievement-btn bg-primary-gradient text-white text-xs font-bold py-2 px-4 rounded-full shadow-lg"
                    data-type="${type}" data-title="${title}" data-subtitle="${subtitle}" ${datasetStrings}>
                    Share
                </button>
            </div>
        `;
        shareViewContainer.innerHTML += cardHTML;
    }
    
    function getAchievementIcons() {
        return {
            'weight-loss': `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>`,
            'goal': `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l1.8-2.4c.4-.5 1-.8 1.7-.8h.9c.7 0 1.3.3 1.7.8L17 6v13m-2-4h-4m-6-4h16"></path></svg>`,
            'record': `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M4 17v4m-2-2h4m1-9a7 7 0 1114 0 7 7 0 01-14 0z"></path></svg>`,
            'streak': `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.024.217 1.464l-.657.98c-.318.476-.945.642-1.464.325l-1.068-.89a.993.993 0 00-1.218 0l-1.068.89c-.519.317-1.146.15-1.464-.325l-.657-.98c-.318-.44-.225-1.095.217-1.464l1.068-.89a.993.993 0 00.405-.864v-.568a3 3 0 013-3c.954 0 1.84.464 2.404 1.224a2.998 2.998 0 01.596 2.776zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        };
    }

    function getAchievementColors(type) {
        const colorMap = {
            'weight-loss': { bg: 'bg-pink-100', text: 'text-pink-500' },
            'goal': { bg: 'bg-yellow-100', text: 'text-yellow-500' },
            'record': { bg: 'bg-blue-100', text: 'text-blue-500' },
            'streak': { bg: 'bg-orange-100', text: 'text-orange-500' }
        };
        return colorMap[type] || { bg: 'bg-gray-100', text: 'text-gray-500' };
    }

    // =================================================================================
    // RENDER & EVENT LISTENERS LAINNYA
    // =================================================================================
    
    function renderWeightView() {
        const data = getWeightData();
        const goal = getGoalWeight();
        const latestWeight = data.length > 0 ? data[0].weight : '--';
        latestWeightDisplay.textContent = `${latestWeight} kg`;
        goalWeightDisplay.textContent = `${goal} kg`;
        renderWeightHistoryList(data);
        filterAndRenderChart();
    }
    
    function renderWeightHistoryList(data) {
        weightHistoryList.innerHTML = '';
        if (data.length === 0) {
            weightHistoryList.innerHTML = '<p class="text-sm text-gray-500 text-center">No history yet.</p>'; return;
        }
        data.forEach(entry => {
            const date = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeHTML = entry.time ? `<span class="text-xs text-gray-400 ml-2">at ${entry.time}</span>` : '';
            const listItem = `<div class="flex justify-between items-center py-1"><div><span class="text-sm text-gray-800">${date}</span>${timeHTML}</div><span class="font-semibold text-sm">${entry.weight} kg</span></div>`;
            weightHistoryList.innerHTML += listItem;
        });
    }

    function filterAndRenderChart() {
        let data = getWeightData();
        let filterValue = historyFilter.value;
        let filteredData = data;
        if (filterValue !== 'all') {
            let daysToFilter;
            if (filterValue === '4w') daysToFilter = 28;
            if (filterValue === '3m') daysToFilter = 90;
            if (filterValue === '6m') daysToFilter = 180;
            const filterDate = new Date(new Date().setDate(new Date().getDate() - daysToFilter));
            filteredData = data.filter(entry => new Date(entry.date) >= filterDate);
        }
        filteredData.reverse();
        weightChart.data.labels = filteredData.map(d => new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        weightChart.data.datasets[0].data = filteredData.map(d => d.weight);
        weightChart.update();
    }

    function renderMeasurementView() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        currentMeasurementDate.setHours(0, 0, 0, 0);
        if (today.getTime() === currentMeasurementDate.getTime()) {
            measurementDateDisplay.textContent = "Today";
        } else {
            measurementDateDisplay.textContent = currentMeasurementDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        }
        nextDayBtn.disabled = today.getTime() <= currentMeasurementDate.getTime();
        nextDayBtn.classList.toggle('opacity-50', nextDayBtn.disabled);
        const dateKey = currentMeasurementDate.toISOString().split('T')[0];
        const allData = getMeasurementData();
        const dataForDate = allData[dateKey] || {};
        measurementForm.querySelectorAll('input').forEach(input => {
            input.value = dataForDate[input.name] || '';
        });
        renderMeasurementHistory();
    }

    function renderMeasurementHistory() {
        measurementHistoryList.innerHTML = '';
        const allData = getMeasurementData();
        const sortedDates = Object.keys(allData).sort((a, b) => new Date(b) - new Date(a));
        if (sortedDates.length === 0) {
            measurementHistoryList.innerHTML = '<p class="text-sm text-gray-500 text-center">No history yet.</p>';
            return;
        }
        sortedDates.forEach(dateKey => {
            const data = allData[dateKey];
            const date = new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            let detailsHtml = '<ul class="text-xs text-gray-600 grid grid-cols-2 gap-x-4">';
            Object.keys(data).forEach(key => {
                if (data[key]) {
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    detailsHtml += `<li class="flex justify-between"><span>${label}:</span><span class="font-medium">${data[key]} cm</span></li>`;
                }
            });
            detailsHtml += '</ul>';
            const listItem = `<div class="p-2 border-b border-gray-200/50"><p class="font-semibold text-sm mb-1 text-gray-900">${date}</p>${detailsHtml}</div>`;
            measurementHistoryList.innerHTML += listItem;
        });
    }

    openUpdateModalBtn.addEventListener('click', () => {
        const todayString = new Date().toISOString().split('T')[0];
        entryDateInput.value = todayString;
        entryDateInput.max = todayString;
        updateWeightModal.classList.remove('hidden');
    });
    closeUpdateModalBtn.addEventListener('click', () => updateWeightModal.classList.add('hidden'));
    openSetGoalBtn.addEventListener('click', () => setGoalModal.classList.remove('hidden'));
    closeGoalModalBtn.addEventListener('click', () => setGoalModal.classList.add('hidden'));
    
    saveWeightBtn.addEventListener('click', () => {
        const newWeight = parseFloat(newWeightInput.value);
        const selectedDate = entryDateInput.value;
        if (!newWeight || newWeight <= 0) { alert('Please enter a valid weight.'); return; }
        if (!selectedDate) { alert('Please select a date.'); return; }
        const now = new Date();
        const formattedTime = now.toTimeString().slice(0, 5);
        let data = getWeightData();
        const newEntry = { date: selectedDate, weight: newWeight, time: formattedTime };
        const entryIndex = data.findIndex(entry => entry.date === selectedDate);
        if (entryIndex > -1) {
            data[entryIndex] = newEntry;
        } else {
            data.push(newEntry);
        }
        saveWeightData(data);
        renderWeightView();
        updateWeightModal.classList.add('hidden');
        newWeightInput.value = '';
    });

    saveGoalBtn.addEventListener('click', () => {
        const newGoal = parseFloat(newGoalInput.value);
        if (!newGoal || newGoal <= 0) { alert('Please enter a valid goal weight.'); return; }
        saveGoalWeight(newGoal);
        renderWeightView();
        setGoalModal.classList.add('hidden');
        newGoalInput.value = '';
    });

    historyFilter.addEventListener('change', filterAndRenderChart);

    prevDayBtn.addEventListener('click', () => {
        currentMeasurementDate.setDate(currentMeasurementDate.getDate() - 1);
        renderMeasurementView();
    });

    nextDayBtn.addEventListener('click', () => {
        currentMeasurementDate.setDate(currentMeasurementDate.getDate() + 1);
        renderMeasurementView();
    });

    saveMeasurementBtn.addEventListener('click', () => {
        const allData = getMeasurementData();
        const dateKey = currentMeasurementDate.toISOString().split('T')[0];
        let newDataForDate = {};
        let hasValue = false;
        measurementForm.querySelectorAll('input').forEach(input => {
            if (input.value) {
                newDataForDate[input.name] = parseFloat(input.value);
                hasValue = true;
            }
        });
        if (hasValue) {
            allData[dateKey] = newDataForDate;
        } else {
            delete allData[dateKey];
        }
        saveMeasurementData(allData);
        renderMeasurementHistory();
        saveMeasurementBtn.textContent = 'Saved!';
        saveMeasurementBtn.classList.add('bg-green-500');
        setTimeout(() => {
            saveMeasurementBtn.textContent = 'Save Measurement';
            saveMeasurementBtn.classList.remove('bg-green-500');
        }, 1500);
    });

    // =================================================================================
    // INISIALISASI HALAMAN
    // =================================================================================
    renderWeightView();
});