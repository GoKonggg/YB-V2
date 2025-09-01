document.addEventListener('DOMContentLoaded', function() {
    // =================================================================================
    // SETUP & INISIALISASI
    // =================================================================================
    
    const dummyWeights = [
    { date: '2025-08-30', weight: 75.5, time: '08:00' },
    { date: '2025-08-23', weight: 76.1, time: '08:15' },
    { date: '2025-08-16', weight: 76.0, time: '07:50' },
    { date: '2025-08-09', weight: 76.8, time: '08:05' },
    { date: '2025-08-02', weight: 77.2, time: '08:20' },
    { date: '2025-07-26', weight: 77.5, time: '08:00' }
];

// Simpan data ke localStorage
localStorage.setItem('weightData', JSON.stringify(dummyWeights));

// Tampilkan pesan konfirmasi di console
console.log('✅ Dummy data untuk berat badan berhasil ditambahkan!');

const dummyMeasurements = {
    '2025-08-30': { neck: 38.5, waist: 85, chest: 102, hips: 98, leftUpperArm: 35.5 },
    '2025-08-16': { neck: 38.7, waist: 85.5, chest: 102.5, hips: 98.5, leftUpperArm: 35.8 },
    '2025-08-02': { neck: 39, waist: 86, chest: 103, hips: 99, leftUpperArm: 36 }
};

// Simpan data ke localStorage
localStorage.setItem('measurementData', JSON.stringify(dummyMeasurements));

// Tampilkan pesan konfirmasi di console
console.log('✅ Dummy data untuk pengukuran tubuh berhasil ditambahkan!');


    // --- Elemen Umum ---
    const viewSelector = document.getElementById('view-selector');
    const weightView = document.getElementById('weight-view');
    const measurementView = document.getElementById('measurement-view');

    // --- Elemen Tampilan "Weight" ---
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

    // --- Elemen Tampilan "Body Measurement" ---
    const measurementDateDisplay = document.getElementById('measurement-date-display');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');
    const measurementForm = document.getElementById('measurement-form');
    const saveMeasurementBtn = document.getElementById('save-measurement-btn');
    const measurementHistoryList = document.getElementById('measurement-history-list');
    
    // Variabel state untuk tanggal pengukuran
    let currentMeasurementDate = new Date();

    // Setup Grafik (Chart.js)
    const ctx = document.getElementById('weight-chart').getContext('2d');
    const weightChart = new Chart(ctx, {
        type: 'line', data: { labels: [], datasets: [{ label: 'Weight (kg)', data: [], borderColor: '#E54B8C', tension: 0.3 }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { min: 0 } } }
    });

    // =================================================================================
    // MANAJEMEN DATA (localStorage)
    // =================================================================================
    
    // --- Fungsi untuk Data Berat Badan ---
    function getWeightData() { return JSON.parse(localStorage.getItem('weightData')) || []; }
    function saveWeightData(data) {
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('weightData', JSON.stringify(data));
    }
    function getGoalWeight() { return localStorage.getItem('goalWeight') || '--'; }
    function saveGoalWeight(goal) { localStorage.setItem('goalWeight', goal); }

    // --- Fungsi BARU untuk Data Pengukuran Tubuh ---
    function getMeasurementData() { return JSON.parse(localStorage.getItem('measurementData')) || {}; }
    function saveMeasurementData(data) { localStorage.setItem('measurementData', JSON.stringify(data)); }
    
    // =================================================================================
    // FUNGSI RENDER (Menampilkan data ke layar)
    // =================================================================================
    
    // --- Render untuk Tampilan Berat Badan ---
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
            const timeHTML = entry.time ? `<span class="text-xs text-gray-400">at ${entry.time}</span>` : '';
            const listItem = `<div class="flex justify-between items-center p-1"><div><span class="text-sm text-gray-600">${date}</span> ${timeHTML}</div><span class="font-semibold text-sm">${entry.weight} kg</span></div>`;
            weightHistoryList.innerHTML += listItem;
        });
    }

    function filterAndRenderChart() { /* ... (fungsi ini tidak berubah) ... */
        let data = getWeightData(); let filterValue = historyFilter.value; let filteredData = data;
        if (filterValue !== 'all') {
            let daysToFilter; if (filterValue === '4w') daysToFilter = 28; if (filterValue === '3m') daysToFilter = 90; if (filterValue === '6m') daysToFilter = 180;
            const filterDate = new Date(new Date().setDate(new Date().getDate() - daysToFilter));
            filteredData = data.filter(entry => new Date(entry.date) >= filterDate);
        }
        filteredData.reverse();
        weightChart.data.labels = filteredData.map(d => new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric'}));
        weightChart.data.datasets[0].data = filteredData.map(d => d.weight); weightChart.update();
    }

    // --- Render BARU untuk Tampilan Pengukuran Tubuh ---
    function renderMeasurementView() {
        // 1. Update tampilan tanggal
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        currentMeasurementDate.setHours(0, 0, 0, 0);

        if (today.getTime() === currentMeasurementDate.getTime()) {
            measurementDateDisplay.textContent = "Today";
        } else {
            measurementDateDisplay.textContent = currentMeasurementDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        }
        // Tombol next tidak bisa diklik jika tanggalnya hari ini
        nextDayBtn.disabled = today.getTime() <= currentMeasurementDate.getTime();
        nextDayBtn.classList.toggle('opacity-50', nextDayBtn.disabled);
        
        // 2. Isi form dengan data yang ada
        const dateKey = currentMeasurementDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const allData = getMeasurementData();
        const dataForDate = allData[dateKey] || {};
        
        measurementForm.querySelectorAll('input').forEach(input => {
            input.value = dataForDate[input.name] || '';
        });

        // 3. Render riwayat pengukuran
        renderMeasurementHistory();
    }

    function renderMeasurementHistory() {
        measurementHistoryList.innerHTML = '';
        const allData = getMeasurementData();
        const sortedDates = Object.keys(allData).sort((a,b) => new Date(b) - new Date(a));

        if (sortedDates.length === 0) {
            measurementHistoryList.innerHTML = '<p class="text-sm text-gray-500 text-center">No history yet.</p>'; return;
        }

        sortedDates.forEach(dateKey => {
            const data = allData[dateKey];
            const date = new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'});

            // Buat daftar kecil dari item yang diisi
            let detailsHtml = '<ul class="text-xs text-gray-600 grid grid-cols-2 gap-x-4">';
            Object.keys(data).forEach(key => {
                if (data[key]) { // Hanya tampilkan yang ada nilainya
                   const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // Format "leftArm" -> "Left Arm"
                   detailsHtml += `<li class="flex justify-between"><span>${label}:</span><span class="font-medium">${data[key]} cm</span></li>`;
                }
            });
            detailsHtml += '</ul>';

            const listItem = `
                <div class="p-2 border-b border-gray-200/50">
                    <p class="font-semibold text-sm mb-1">${date}</p>
                    ${detailsHtml}
                </div>
            `;
            measurementHistoryList.innerHTML += listItem;
        });
    }

    // =================================================================================
    // EVENT LISTENERS
    // =================================================================================

    // Ganti view utama
    viewSelector.addEventListener('change', function() {
        const isWeightView = this.value === 'weight';
        weightView.classList.toggle('hidden', !isWeightView);
        measurementView.classList.toggle('hidden', isWeightView);
        if(!isWeightView) {
            currentMeasurementDate = new Date();
            renderMeasurementView();
        }
    });

    // --- Listener untuk Tampilan Berat Badan ---
    openUpdateModalBtn.addEventListener('click', () => {
        const todayString = new Date().toISOString().split('T')[0];
        entryDateInput.value = todayString; entryDateInput.max = todayString;
        updateWeightModal.classList.remove('hidden');
    });
    closeUpdateModalBtn.addEventListener('click', () => updateWeightModal.classList.add('hidden'));
    openSetGoalBtn.addEventListener('click', () => setGoalModal.classList.remove('hidden'));
    closeGoalModalBtn.addEventListener('click', () => setGoalModal.classList.add('hidden'));

    saveWeightBtn.addEventListener('click', () => { /* ... (fungsi ini tidak berubah) ... */
        const newWeight = parseFloat(newWeightInput.value); const selectedDate = entryDateInput.value;
        if (!newWeight || newWeight <= 0) { alert('Please enter a valid weight.'); return; }
        if (!selectedDate) { alert('Please select a date.'); return; }
        const now = new Date(); const formattedTime = now.toTimeString().slice(0, 5);
        let data = getWeightData(); const newEntry = { date: selectedDate, weight: newWeight, time: formattedTime };
        const entryIndex = data.findIndex(entry => entry.date === selectedDate);
        if (entryIndex > -1) { data[entryIndex] = newEntry; } else { data.push(newEntry); }
        saveWeightData(data); renderWeightView(); updateWeightModal.classList.add('hidden'); newWeightInput.value = '';
    });
    saveGoalBtn.addEventListener('click', () => { /* ... (fungsi ini tidak berubah) ... */
        const newGoal = parseFloat(newGoalInput.value);
        if (!newGoal || newGoal <= 0) { alert('Please enter a valid goal weight.'); return; }
        saveGoalWeight(newGoal); renderWeightView(); setGoalModal.classList.add('hidden'); newGoalInput.value = '';
    });
    historyFilter.addEventListener('change', filterAndRenderChart);

    // --- Listener BARU untuk Tampilan Pengukuran Tubuh ---
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
            if(input.value) {
                newDataForDate[input.name] = parseFloat(input.value);
                hasValue = true;
            }
        });

        if (hasValue) {
            allData[dateKey] = newDataForDate;
        } else {
            // Jika semua input kosong, hapus data untuk tanggal itu (jika ada)
            delete allData[dateKey];
        }

        saveMeasurementData(allData);
        renderMeasurementHistory();
        // Beri feedback visual
        saveMeasurementBtn.textContent = 'Saved!';
        saveMeasurementBtn.classList.add('bg-green-500');
        setTimeout(() => {
            saveMeasurementBtn.textContent = 'Save Measurement';
            saveMeasurementBtn.classList.remove('bg-green-500');
        }, 1500);
    });

    // =================================================================================
    // JALANKAN SAAT PERTAMA KALI HALAMAN DIBUKA
    // =================================================================================
    renderWeightView();
});