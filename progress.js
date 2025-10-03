document.addEventListener('DOMContentLoaded', function() {
    
    // =================================================================================
    // SETUP & INISIALISASI
    // =================================================================================

    // --- Elemen Tab & Konten ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // --- Elemen "Weight" ---
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

    // --- Elemen "Measurement" ---
    const measurementDateDisplay = document.getElementById('measurement-date-display');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');
    const measurementForm = document.getElementById('measurement-form');
    const saveMeasurementBtn = document.getElementById('save-measurement-btn');
    const measurementHistoryList = document.getElementById('measurement-history-list');
    
    // --- Elemen "Share" & Modal Preview (BARU) ---
    const shareViewContainer = document.getElementById('share-view');
    const sharePreviewModal = document.getElementById('share-preview-modal');
    const shareModalOverlay = document.getElementById('share-modal-overlay');
    const achievementImagePreview = document.getElementById('achievement-image-preview');
    const qrcodeContainer = document.getElementById('qrcode-container');
    const downloadAchievementBtn = document.getElementById('download-achievement-btn');
    
    let currentMeasurementDate = new Date();
    let achievementsGenerated = false;
    let qrcodeInstance = null; // Untuk menyimpan instance QR code

    // Setup Grafik (Chart.js)
    const ctx = document.getElementById('weight-chart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.parentElement.clientHeight);
    gradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');

    const weightChart = new Chart(ctx, { /* ... (Konfigurasi Chart.js tidak berubah) ... */ });

    // =================================================================================
    // MANAJEMEN DATA (localStorage) - Tidak ada perubahan
    // =================================================================================
    function getWeightData() { return JSON.parse(localStorage.getItem('weightData')) || []; }
    function saveWeightData(data) { /* ... */ }
    function getGoalWeight() { return localStorage.getItem('goalWeight') || '--'; }
    function saveGoalWeight(goal) { /* ... */ }
    function getMeasurementData() { return JSON.parse(localStorage.getItem('measurementData')) || {}; }
    function saveMeasurementData(data) { /* ... */ }

    // =================================================================================
    // LOGIKA TAB SWITCHER - Tidak ada perubahan
    // =================================================================================
    tabButtons.forEach(button => { /* ... */ });

    // =================================================================================
    // LOGIKA SHARE & ACHIEVEMENTS (DIPERBARUI)
    // =================================================================================
    
    // Event listener utama untuk semua tombol share di dalam tab "Share"
    shareViewContainer.addEventListener('click', function(event) {
        const shareButton = event.target.closest('.share-achievement-btn');
        if (shareButton) {
            const achievementCard = shareButton.closest('.achievement-card');
            
            // Ambil data dari kartu untuk di-share
            const title = shareButton.dataset.title;
            const subtitle = shareButton.dataset.subtitle;

            handleShare(achievementCard, title, subtitle);
        }
    });

    async function handleShare(cardElement, title, subtitle) {
        // Cek apakah di mobile dan Web Share API tersedia
        if (navigator.share) {
            try {
                const canvas = await html2canvas(cardElement);
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], "achievement.png", { type: "image/png" });
                    await navigator.share({
                        files: [file],
                        title: title,
                        text: `${title} - ${subtitle}`,
                    });
                }, 'image/png');
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Alur untuk Desktop: Tampilkan Modal Preview
            showSharePreviewModal(cardElement);
        }
    }

    async function showSharePreviewModal(cardElement) {
        try {
            // 1. Generate gambar dari kartu HTML
            const canvas = await html2canvas(cardElement, { 
                backgroundColor: null, // Jaga agar background transparan/gradient tetap ada
                useCORS: true 
            });
            const imageUrl = canvas.toDataURL("image/png");
            
            // 2. Tampilkan gambar di modal
            achievementImagePreview.src = imageUrl;

            // 3. Generate QR Code
            if (qrcodeInstance) {
                qrcodeInstance.clear(); // Hapus QR code lama
                qrcodeInstance.makeCode(window.location.href); // Buat yang baru
            } else {
                qrcodeInstance = new QRCode(qrcodeContainer, {
                    text: window.location.href,
                    width: 100,
                    height: 100,
                });
            }

            // 4. Siapkan tombol download
            downloadAchievementBtn.onclick = () => {
                const link = document.createElement('a');
                link.download = 'my-achievement.png';
                link.href = imageUrl;
                link.click();
            };

            // 5. Tampilkan modal
            sharePreviewModal.classList.remove('hidden');

        } catch (err) {
            console.error("Error generating canvas:", err);
            alert("Sorry, there was an error creating the share image.");
        }
    }

    // Fungsi untuk menutup modal
    shareModalOverlay.addEventListener('click', () => {
        sharePreviewModal.classList.add('hidden');
    });

    function generateAchievements() { /* ... (fungsi tidak berubah) ... */ }

    // Diperbarui sedikit untuk menambahkan data-* attribute ke tombol
    function createAchievementCard(title, subtitle, type) {
        const icons = { /* ... */ };
        const colors = { /* ... */ };

        const cardHTML = `
            <div class="glass-card rounded-xl p-4 flex items-center achievement-card">
                <div class="mr-4 p-3 rounded-full ${colors[type] || 'text-gray-500 bg-gray-100'}">
                    ${icons[type] || ''}
                </div>
                <div class="flex-grow text-left">
                    <p class="font-bold text-gray-900">${title}</p>
                    <p class="text-xs text-gray-600">${subtitle}</p>
                </div>
                <button 
                    class="share-achievement-btn bg-primary-gradient text-white text-xs font-bold py-2 px-4 rounded-full shadow-lg"
                    data-title="${title}"
                    data-subtitle="${subtitle}">
                    Share
                </button>
            </div>
        `;
        shareViewContainer.innerHTML += cardHTML;
    }

    // =================================================================================
    // FUNGSI RENDER LAMA & EVENT LISTENERS - Tidak ada perubahan
    // =================================================================================
    function renderWeightView() { /* ... */ }
    function renderWeightHistoryList(data) { /* ... */ }
    function filterAndRenderChart() { /* ... */ }
    function renderMeasurementView() { /* ... */ }
    function renderMeasurementHistory() { /* ... */ }
    
    // Event listeners lama...
    openUpdateModalBtn.addEventListener('click', () => { /* ... */ });
    // dan seterusnya...


    // =================================================================================
    // INISIALISASI HALAMAN
    // =================================================================================
    renderWeightView();

    // -- Salin-tempel semua fungsi dan event listener lama yang tidak berubah ke sini --
    // (Agar kode lengkap, saya sertakan lagi semuanya di bawah)

    saveWeightData(getWeightData()); // Pastikan data diurutkan saat awal load
    saveMeasurementData(getMeasurementData());
    
    // --- Semua Fungsi Lama ---
    function saveWeightData(data) {
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('weightData', JSON.stringify(data));
    }
    function saveGoalWeight(goal) { localStorage.setItem('goalWeight', goal); }
    function saveMeasurementData(data) { localStorage.setItem('measurementData', JSON.stringify(data)); }
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            tabButtons.forEach(btn => {
                if (btn.dataset.tab === targetTab) {
                    btn.classList.add('bg-white', 'shadow', 'text-pink-500');
                    btn.classList.remove('text-gray-500');
                } else {
                    btn.classList.remove('bg-white', 'shadow', 'text-pink-500');
                    btn.classList.add('text-gray-500');
                }
            });
            tabContents.forEach(content => {
                if (content.id === `${targetTab}-view`) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
            if (targetTab === 'share' && !achievementsGenerated) {
                generateAchievements();
                achievementsGenerated = true;
            }
        });
    });
    function generateAchievements() {
        shareViewContainer.innerHTML = '';
        const weightData = getWeightData();
        const goalWeight = parseFloat(getGoalWeight());
        let achievementsFound = 0;
        
        if (weightData.length < 2) {
            shareViewContainer.innerHTML = '<p class="text-center text-gray-500 mt-8">Not enough data to generate achievements. Keep tracking your progress!</p>';
            return;
        }

        const latestWeight = weightData[0].weight;
        const startingWeight = weightData[weightData.length - 1].weight;
        const weightLost = startingWeight - latestWeight;
        if (weightLost >= 5) {
            createAchievementCard('Lost 5 kg!', `From ${startingWeight} kg to ${latestWeight} kg. Great progress!`, 'weight-loss');
            achievementsFound++;
        }
        if (goalWeight && latestWeight <= goalWeight) {
            createAchievementCard('Goal Reached!', `Congratulations on reaching your goal of ${goalWeight} kg.`, 'goal');
            achievementsFound++;
        }
        const lowestWeight = Math.min(...weightData.map(d => d.weight));
        if (latestWeight === lowestWeight) {
            createAchievementCard('New Lowest Weight!', `You've set a new personal record at ${latestWeight} kg.`, 'record');
            achievementsFound++;
        }
        createAchievementCard('7-Day Workout Streak!', `You're on fire, keep the momentum.`, 'streak');
        achievementsFound++;
        if(achievementsFound === 0) {
             shareViewContainer.innerHTML = '<p class="text-center text-gray-500 mt-8">No special achievements yet. Keep up the good work!</p>';
        }
    }
    renderWeightView();
    renderWeightHistoryList(getWeightData());
    filterAndRenderChart();
    renderMeasurementView();
    renderMeasurementHistory();
    openUpdateModalBtn.addEventListener('click', () => {
        const todayString = new Date().toISOString().split('T')[0];
        entryDateInput.value = todayString; entryDateInput.max = todayString;
        updateWeightModal.classList.remove('hidden');
    });
    closeUpdateModalBtn.addEventListener('click', () => updateWeightModal.classList.add('hidden'));
    openSetGoalBtn.addEventListener('click', () => setGoalModal.classList.remove('hidden'));
    closeGoalModalBtn.addEventListener('click', () => setGoalModal.classList.add('hidden'));
    saveWeightBtn.addEventListener('click', () => {
        const newWeight = parseFloat(newWeightInput.value); const selectedDate = entryDateInput.value;
        if (!newWeight || newWeight <= 0) { alert('Please enter a valid weight.'); return; }
        if (!selectedDate) { alert('Please select a date.'); return; }
        const now = new Date(); const formattedTime = now.toTimeString().slice(0, 5);
        let data = getWeightData(); const newEntry = { date: selectedDate, weight: newWeight, time: formattedTime };
        const entryIndex = data.findIndex(entry => entry.date === selectedDate);
        if (entryIndex > -1) { data[entryIndex] = newEntry; } else { data.push(newEntry); }
        saveWeightData(data); renderWeightView(); updateWeightModal.classList.add('hidden'); newWeightInput.value = '';
    });
    saveGoalBtn.addEventListener('click', () => {
        const newGoal = parseFloat(newGoalInput.value);
        if (!newGoal || newGoal <= 0) { alert('Please enter a valid goal weight.'); return; }
        saveGoalWeight(newGoal); renderWeightView(); setGoalModal.classList.add('hidden'); newGoalInput.value = '';
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
        let newDataForDate = {}; let hasValue = false;
        measurementForm.querySelectorAll('input').forEach(input => {
            if(input.value) { newDataForDate[input.name] = parseFloat(input.value); hasValue = true; }
        });
        if (hasValue) { allData[dateKey] = newDataForDate; } else { delete allData[dateKey]; }
        saveMeasurementData(allData);
        renderMeasurementHistory();
        saveMeasurementBtn.textContent = 'Saved!'; saveMeasurementBtn.classList.add('bg-green-500');
        setTimeout(() => {
            saveMeasurementBtn.textContent = 'Save Measurement';
            saveMeasurementBtn.classList.remove('bg-green-500');
        }, 1500);
    });
});