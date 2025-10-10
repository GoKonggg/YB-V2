document.addEventListener('DOMContentLoaded', () => {
    // === DATA DUMMY (Lengkap dengan semua histori) ===
    const userProgress = {
        weightHistory: [
            { date: '2025-07-05', weight: 88.0 }, { date: '2025-08-15', weight: 86.5 },
            { date: '2025-09-01', weight: 85.0 }, { date: '2025-09-08', weight: 84.5 },
            { date: '2025-09-15', weight: 83.1 }, { date: '2025-09-22', weight: 83.3 },
            { date: '2025-09-29', weight: 82.5 }, { date: '2025-10-05', weight: 82.0 },
        ],
        // Asumsikan hari ini 10 Oktober, maka streaknya 5 hari
        nutritionHistory: {
            '2025-10-05': { calories: 2250, protein: 160, carbs: 240, fat: 72 },
            '2025-10-06': { calories: 2300, protein: 162, carbs: 245, fat: 71 },
            '2025-10-07': { calories: 2190, protein: 158, carbs: 240, fat: 69 },
            '2025-10-08': { calories: 2220, protein: 160, carbs: 235, fat: 70 },
            '2025-10-09': { calories: 2180, protein: 165, carbs: 225, fat: 68 },
        },
        workouts: [
            { date: '2025-08-18', type: 'Cardio' }, { date: '2025-09-23', type: 'Strength' },
            { date: '2025-09-25', type: 'Strength' }, { date: '2025-09-28', type: 'Strength' },
            { date: '2025-10-02', type: 'Yoga' }, { date: '2025-10-04', type: 'Cardio' },
        ],
        journalHistory: [
            { date: '2025-10-08', entry: '...' },
            { date: '2025-10-09', entry: '...' }, // Streak 2 hari
        ],
        personalRecords: {
            'Bench Press': { value: 80, unit: 'kg', date: '2025-09-28' },
            'Deadlift': { value: 120, unit: 'kg', date: '2025-09-26' },
            'Running 5K': { value: 28.5, unit: 'min', date: '2025-09-20' },
        },
        progressPhotos: [
            { date: '2025-07-05', weight: 88.0 },
            { date: '2025-08-25', weight: 85.5 },
            { date: '2025-10-05', weight: 82.0 }
        ]
    };

    // === SELEKSI ELEMEN DOM ===
    const filterContainer = document.getElementById('filter-container');
    const summaryDiaryStreakEl = document.getElementById('summary-diary-streak');
    const summaryJournalStreakEl = document.getElementById('summary-journal-streak');
    const summaryWorkoutsEl = document.getElementById('summary-workouts');
    const workoutPeriodEl = document.getElementById('workout-period');
    const prListContainer = document.getElementById('pr-list-container');
    const weightChartCanvas = document.getElementById('weightChart');
    const nutritionChartCanvas = document.getElementById('nutritionChart');
    const workoutChartCanvas = document.getElementById('workoutChart');
    const beforeDate = document.getElementById('before-date');
    const beforeWeight = document.getElementById('before-weight');
    const afterDate = document.getElementById('after-date');
    const afterWeight = document.getElementById('after-weight');
    const progressToShareContainer = document.getElementById('progress-to-share-container');
    const newWeightInput = document.getElementById('new-weight-input');
const addWeightBtn = document.getElementById('add-weight-btn');
    
    // Elemen Share
    const shareProgressBtn = document.getElementById('share-progress-btn');
    const shareOverlay = document.getElementById('share-overlay');
    const sharePopup = document.getElementById('share-popup');
    const closePopupBtn = document.getElementById('close-popup-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const imagePreview = document.getElementById('image-preview');
    const shareActions = document.getElementById('share-actions');
    const nativeShareBtn = document.getElementById('native-share-btn');
    const downloadBtn = document.getElementById('download-btn');

    const openWeightModalBtn = document.getElementById('open-weight-modal-btn');
const closeWeightModalBtn = document.getElementById('close-weight-modal-btn');
const weightModalOverlay = document.getElementById('weight-modal-overlay');
const weightModalPopup = document.getElementById('weight-modal-popup');

    // Variabel untuk menyimpan instance charts
    let weightChartInstance, nutritionChartInstance, workoutChartInstance;

    // --- Fungsi untuk memfilter data berdasarkan rentang waktu ---
    function filterDataByRange(data, range) {
        let startDate;
        if (range === 'all') {
            startDate = new Date('1970-01-01');
        } else {
            const daysToSubtract = parseInt(range);
            startDate = new Date();
            startDate.setDate(startDate.getDate() - daysToSubtract);
            startDate.setHours(0, 0, 0, 0);
        }

        const filteredData = {
            ...data,
            weightHistory: data.weightHistory.filter(entry => new Date(entry.date) >= startDate),
            workouts: data.workouts.filter(entry => new Date(entry.date) >= startDate),
            journalHistory: data.journalHistory.filter(entry => new Date(entry.date) >= startDate),
            nutritionHistory: Object.entries(data.nutritionHistory).reduce((acc, [date, values]) => {
                if (new Date(date) >= startDate) {
                    acc[date] = values;
                }
                return acc;
            }, {})
        };
        return filteredData;
    }

    function openWeightModal() {
    weightModalOverlay.classList.remove('hidden');
    weightModalPopup.classList.remove('hidden');
    
    // Memberi sedikit waktu agar transisi CSS bisa berjalan
    setTimeout(() => {
        weightModalOverlay.style.opacity = '1';
        weightModalPopup.style.opacity = '1';
        weightModalPopup.style.transform = 'translate(-50%, -50%) scale(1)';
        newWeightInput.focus(); // Langsung fokus ke input field
    }, 10);
}

function closeWeightModal() {
    weightModalOverlay.style.opacity = '0';
    weightModalPopup.style.opacity = '0';
    weightModalPopup.style.transform = 'translate(-50%, -50%) scale(0.95)';

    setTimeout(() => {
        weightModalOverlay.classList.add('hidden');
        weightModalPopup.classList.add('hidden');
    }, 300); // Waktu harus cocok dengan durasi transisi CSS
}

    // === FUNGSI-FUNGSI RENDER ===

    function calculateStreak(dates) {
        if (dates.length === 0) return 0;

        const sortedDates = dates.map(d => new Date(d)).sort((a, b) => b - a);
        const uniqueTimestamps = new Set(sortedDates.map(d => {
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        }));

        if (uniqueTimestamps.size === 0) return 0;

        let streak = 0;
        const today = new Date('2025-10-10');
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const latestDate = new Date(Math.max(...uniqueTimestamps));
        
        if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
            return 0;
        }

        let currentDate = latestDate;
        while (uniqueTimestamps.has(currentDate.getTime())) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        }
        return streak;
    }

    function renderConsistencyMetrics(data) {
        const diaryStreak = calculateStreak(Object.keys(data.nutritionHistory));
        summaryDiaryStreakEl.textContent = diaryStreak;

        const journalDates = data.journalHistory.map(entry => entry.date);
        const journalStreak = calculateStreak(journalDates);
        summaryJournalStreakEl.textContent = journalStreak;

        summaryWorkoutsEl.textContent = data.workouts.length;
    }

    function renderPRs(data) {
        if (!data.personalRecords || Object.keys(data.personalRecords).length === 0) {
            prListContainer.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">No records yet.</p>';
            return;
        }

        let html = '<ul class="space-y-3">';
        for (const [exercise, record] of Object.entries(data.personalRecords)) {
            html += `
                <li class="flex justify-between items-center text-sm">
                    <span class="font-semibold text-gray-700">${exercise}</span>
                    <span class="font-bold text-pink-500">${record.value} ${record.unit}</span>
                </li>
            `;
        }
        html += '</ul>';
        prListContainer.innerHTML = html;
    }

    // progress.js

// ... (di area fungsi-fungsi render)

function renderWeightStats(data) {
    const startWeightEl = document.getElementById('start-weight');
    const latestWeightEl = document.getElementById('latest-weight');
    const weightChangeEl = document.getElementById('weight-change');

    // Gunakan data asli (userProgress) untuk perbandingan start vs latest
    const weightHistory = userProgress.weightHistory;

    if (weightHistory.length === 0) {
        startWeightEl.textContent = '- kg';
        latestWeightEl.textContent = '- kg';
        weightChangeEl.textContent = '- kg';
        return;
    }

    const startWeight = weightHistory[0].weight;
    const latestWeight = weightHistory[weightHistory.length - 1].weight;
    
    startWeightEl.textContent = `${startWeight.toFixed(1)} kg`;
    latestWeightEl.textContent = `${latestWeight.toFixed(1)} kg`;

    if (weightHistory.length > 1) {
        const change = latestWeight - startWeight;
        
        // Atur teks dan warna berdasarkan perubahan
        weightChangeEl.classList.remove('text-green-500', 'text-red-500');
        if (change < 0) {
            weightChangeEl.textContent = `${change.toFixed(1)} kg`;
            weightChangeEl.classList.add('text-green-500');
        } else if (change > 0) {
            weightChangeEl.textContent = `+${change.toFixed(1)} kg`;
            weightChangeEl.classList.add('text-red-500');
        } else {
            weightChangeEl.textContent = '0.0 kg';
        }
    } else {
        weightChangeEl.textContent = '- kg';
    }
}

    function renderWeightChart(data) {
        if (weightChartInstance) {
            weightChartInstance.destroy();
        }
        const ctx = weightChartCanvas.getContext('2d');
        if (!data.weightHistory || data.weightHistory.length === 0) {
            ctx.clearRect(0, 0, weightChartCanvas.width, weightChartCanvas.height);
            return;
        }
        const labels = data.weightHistory.map(entry => new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
        const weights = data.weightHistory.map(entry => entry.weight);
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
        weightChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight',
                    data: weights,
                    borderColor: '#ec4899',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ec4899',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 7,
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: false, grid: { display: false }, ticks: { display: false }, border: { display: false } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#6b7280' }, border: { display: false } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { backgroundColor: '#1f2937', callbacks: { label: (ctx) => `${ctx.parsed.y} kg` } }
                }
            }
        });
    }

    function renderNutritionChart(data) {
        if (nutritionChartInstance) {
            nutritionChartInstance.destroy();
        }
        const ctx = nutritionChartCanvas.getContext('2d');
        if (!data.nutritionHistory || Object.keys(data.nutritionHistory).length === 0) {
            ctx.clearRect(0, 0, nutritionChartCanvas.width, nutritionChartCanvas.height);
            return;
        }
        const nutritionData = Object.values(data.nutritionHistory);
        const totalDays = nutritionData.length;
        const avgProtein = nutritionData.reduce((sum, day) => sum + day.protein, 0) / totalDays;
        const avgCarbs = nutritionData.reduce((sum, day) => sum + day.carbs, 0) / totalDays;
        const avgFat = nutritionData.reduce((sum, day) => sum + day.fat, 0) / totalDays;
        nutritionChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbs', 'Fat'],
                datasets: [{
                    data: [avgProtein, avgCarbs, avgFat],
                    backgroundColor: ['#ec4899', '#d946ef', '#f9a8d4'],
                    borderColor: '#f9fafb',
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${Math.round(ctx.parsed)}g` } }
                }
            }
        });
    }

    function renderWorkoutChart(data) {
        if (workoutChartInstance) {
            workoutChartInstance.destroy();
        }
        const ctx = workoutChartCanvas.getContext('2d');
        if (!data.workouts || data.workouts.length === 0) {
            ctx.clearRect(0, 0, workoutChartCanvas.width, workoutChartCanvas.height);
            return;
        }
        const workoutCounts = data.workouts.reduce((acc, workout) => {
            acc[workout.type] = (acc[workout.type] || 0) + 1;
            return acc;
        }, {});
        const labels = Object.keys(workoutCounts);
        const counts = Object.values(workoutCounts);
        workoutChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sessions',
                    data: counts,
                    backgroundColor: '#ec4899',
                    borderRadius: 6,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { display: false }, border: { display: false }, ticks: { stepSize: 1 } },
                    x: { grid: { display: false }, border: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
    
    function renderBeforeAfter(data) {
        if (!data.progressPhotos || data.progressPhotos.length === 0) {
            beforeWeight.textContent = '-';
            beforeDate.textContent = '-';
            afterWeight.textContent = '-';
            afterDate.textContent = '-';
            return;
        }
        const beforePhotoData = data.progressPhotos[0];
        beforeDate.textContent = new Date(beforePhotoData.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
        beforeWeight.textContent = `${beforePhotoData.weight.toFixed(1)} kg`;

        if (data.progressPhotos.length > 1) {
            const afterPhotoData = data.progressPhotos[data.progressPhotos.length - 1];
            afterDate.textContent = new Date(afterPhotoData.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
            afterWeight.textContent = `${afterPhotoData.weight.toFixed(1)} kg`;
        } else {
            afterWeight.textContent = '-';
            afterDate.textContent = '-';
        }
    }

    // --- LOGIKA UNTUK FITUR SHARE ---

    function dataURLtoFile(dataurl, filename) {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }

    function openSharePopup() {
        shareOverlay.classList.remove('hidden');
        sharePopup.classList.remove('hidden');
        setTimeout(() => {
            shareOverlay.style.opacity = '1';
            sharePopup.style.opacity = '1';
            sharePopup.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        loadingSpinner.classList.remove('hidden');
        imagePreview.classList.add('hidden');
        shareActions.classList.add('hidden');
    }

    function closeSharePopup() {
        shareOverlay.style.opacity = '0';
        sharePopup.style.opacity = '0';
        sharePopup.style.transform = 'translate(-50%, -50%) scale(0.95)';
        setTimeout(() => {
            shareOverlay.classList.add('hidden');
            sharePopup.classList.add('hidden');
        }, 300);
    }

    shareProgressBtn.addEventListener('click', () => {
        openSharePopup();
        
        // Buat elemen DIV temporer yang meniru desain yang Anda inginkan untuk di-share
        const tempShareElement = document.createElement('div');
        tempShareElement.className = 'p-4 rounded-xl share-card-style';
        tempShareElement.style.width = progressToShareContainer.offsetWidth + 'px';
        
        const beforeData = userProgress.progressPhotos[0];
        const afterData = userProgress.progressPhotos[userProgress.progressPhotos.length - 1];

        tempShareElement.innerHTML = `
            <h3 class="font-bold text-white mb-4">Compare Your Progress</h3>
            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col items-center">
                    <div class="w-full h-32 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center text-white/80 text-sm">Before Photo</div>
                    <p class="text-xs text-white/90 mt-2">${new Date(beforeData.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p class="text-sm font-bold text-white">${beforeData.weight.toFixed(1)} kg</p>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-full h-32 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center text-white/80 text-sm">After Photo</div>
                    <p class="text-xs text-white/90 mt-2">${new Date(afterData.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p class="text-sm font-bold text-white">${afterData.weight.toFixed(1)} kg</p>
                </div>
            </div>
            <p class="text-center text-xs text-white/70 mt-4">Generated by YourAppName</p>
        `;

        tempShareElement.style.position = 'absolute';
        tempShareElement.style.left = '-9999px';
        document.body.appendChild(tempShareElement);

        html2canvas(tempShareElement, { 
            backgroundColor: null,
            scale: 2 
        }).then(canvas => {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            const imageURL = canvas.toDataURL('image/png', 0.9);
            
            imagePreview.src = imageURL;
            loadingSpinner.classList.add('hidden');
            imagePreview.classList.remove('hidden');
            shareActions.classList.remove('hidden');
            
            downloadBtn.href = imageURL;
            downloadBtn.download = `my-progress-${new Date().toISOString().slice(0,10)}.png`;

            const file = dataURLtoFile(imageURL, `my-progress-${new Date().toISOString().slice(0,10)}.png`);
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                nativeShareBtn.classList.remove('hidden');
                nativeShareBtn.onclick = () => {
                    navigator.share({
                        files: [file],
                        title: 'My Progress!',
                        text: 'Check out my latest progress!'
                    }).catch(error => console.log('Error sharing:', error));
                };
            } else {
                nativeShareBtn.classList.add('hidden');
            }
        }).catch(error => {
            console.error('Error capturing element:', error);
            closeSharePopup();
        }).finally(() => {
            document.body.removeChild(tempShareElement);
        });
    });

    openWeightModalBtn.addEventListener('click', openWeightModal);
closeWeightModalBtn.addEventListener('click', closeWeightModal);
weightModalOverlay.addEventListener('click', closeWeightModal);
    closePopupBtn.addEventListener('click', closeSharePopup);
    shareOverlay.addEventListener('click', closeSharePopup);

    // === FUNGSI UTAMA & INISIALISASI ===
    function updateDashboard(data) {
        renderWeightStats(data);
        renderConsistencyMetrics(data);
        renderPRs(data);
        renderWeightChart(data);
        renderNutritionChart(data);
        renderWorkoutChart(data);
        renderBeforeAfter(data);
    }

    filterContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            filterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const range = e.target.dataset.range;
            workoutPeriodEl.textContent = `(${range.toUpperCase()})`;
            const filteredData = filterDataByRange(userProgress, range);
            updateDashboard(filteredData);
        }
    });

    // MODIFIKASI listener yang sudah ada
addWeightBtn.addEventListener('click', () => {
    // ... (semua logika yang sudah ada untuk ambil value, validasi, push data, dll)
    const newWeight = parseFloat(newWeightInput.value);
    if (!newWeight || newWeight <= 0) {
        alert('Please enter a valid weight.');
        return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const todayEntryIndex = userProgress.weightHistory.findIndex(entry => entry.date === today);

    if (todayEntryIndex !== -1) {
        userProgress.weightHistory[todayEntryIndex].weight = newWeight;
    } else {
        userProgress.weightHistory.push({ date: today, weight: newWeight });
    }
    
    userProgress.weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    const activeFilter = document.querySelector('.filter-btn.active').dataset.range;
    const updatedFilteredData = filterDataByRange(userProgress, activeFilter);
    updateDashboard(updatedFilteredData);

    newWeightInput.value = ''; 
    confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } }); 
    console.log("Updated weight history:", userProgress.weightHistory);

    // << TAMBAHAN PENTING DI SINI >>
    closeWeightModal(); // Tutup pop-up setelah berhasil
});

    function initializeDashboard() {
        workoutPeriodEl.textContent = '(30D)';
        const initialFilteredData = filterDataByRange(userProgress, '30d');
        updateDashboard(initialFilteredData);
    }

    initializeDashboard();
});