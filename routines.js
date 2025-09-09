// File: routines.js (Versi Final - Tanpa Mock Data)

document.addEventListener('DOMContentLoaded', () => {
    // Pastikan kita berada di halaman yang benar dengan memeriksa keberadaan elemen
    const routineListContainer = document.getElementById('routine-meals-list');
    if (!routineListContainer) return;

    // --- UTILITY FUNCTIONS ---
    /**
     * Mengubah objek Date menjadi format string YYYY-MM-DD.
     * @param {Date} date - Objek tanggal yang akan diformat.
     * @returns {string} String tanggal dengan format 'YYYY-MM-DD'.
     */
    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // --- RENDER FUNCTION ---
    /**
     * Memuat data rutinitas dari localStorage, lalu menampilkannya ke dalam halaman.
     * Jika tidak ada data, akan memulai dengan array kosong.
     */
    const loadAndRenderRoutines = () => {
        // [PERUBAHAN] Sekarang hanya memuat data atau memulai dengan array kosong
        const routines = JSON.parse(localStorage.getItem('routineMealsList')) || [];

        // Kosongkan kontainer sebelum menampilkan daftar baru.
        routineListContainer.innerHTML = ''; 

        // Tampilkan pesan jika tidak ada rutinitas sama sekali.
        if (routines.length === 0) {
            routineListContainer.innerHTML = `<p class="text-center text-gray-500 py-10">No routine meals created yet.</p>`;
            return;
        }

        // Loop melalui setiap rutinitas dan buat elemen HTML-nya.
        routines.forEach(routine => {
            const routineEl = document.createElement('div');
            routineEl.className = 'bg-white/60 rounded-xl p-4 shadow-sm flex items-center justify-between space-x-4';
            routineEl.dataset.id = routine.id;

            let scheduleDesc = '';
            // Cek apakah rutinitas memiliki jadwal aktif dan ada hari yang dipilih.
            if (routine.schedule && routine.schedule.enabled && routine.schedule.days.length > 0) {
                const dayMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
                const dayStr = routine.schedule.days.map(d => dayMap[d]).join(', ');
                const mealSectionDisplay = routine.schedule.mealSection.charAt(0).toUpperCase() + routine.schedule.mealSection.slice(1);
                scheduleDesc = `<p class="text-xs text-pink-500 font-semibold">Logs to ${mealSectionDisplay} on ${dayStr}</p>`;
            } else {
                scheduleDesc = `<p class="text-xs text-gray-500">Manual log only</p>`;
            }
            
            // Hitung total kalori untuk ditampilkan di ringkasan.
            const totalCalories = routine.foods.reduce((sum, food) => sum + food.calories, 0);
            const icon = routine.schedule.mealSection === 'snack' ? '🥤' : '🥗';

            // Buat HTML untuk satu item rutinitas.
            routineEl.innerHTML = `
                <a href="edit-routine.html?id=${routine.id}" class="flex-grow flex items-center space-x-4">
                    <div class="text-3xl">${icon}</div>
                    <div>
                        <p class="font-bold text-gray-800">${routine.name}</p>
                        ${scheduleDesc}
                        <p class="text-xs text-gray-500">${routine.foods.length} items · Approx. ${totalCalories} kcal</p>
                    </div>
                </a>
                <button class="log-now-btn bg-pink-500 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-pink-600">Log Now</button>
            `;
            routineListContainer.appendChild(routineEl);
        });
    };

    // --- EVENT HANDLER UNTUK TOMBOL "LOG NOW" ---
    /**
     * Menangani klik pada tombol "Log Now". Menggunakan event delegation.
     * @param {Event} e - Event object dari klik.
     */
    const handleLogNowClick = (e) => {
        // Hanya proses jika yang diklik adalah tombol "Log Now".
        if (!e.target.classList.contains('log-now-btn')) return;

        // Ambil ID rutinitas dari elemen parent terdekat.
        const routineEl = e.target.closest('[data-id]');
        const routineId = parseInt(routineEl.dataset.id, 10);
        
        const routines = JSON.parse(localStorage.getItem('routineMealsList')) || [];
        const routineToLog = routines.find(r => r.id === routineId);

        if (!routineToLog) {
            alert('Error: Routine not found!');
            return;
        }

        // Ambil data diary untuk HARI INI dari localStorage.
        const todayKey = formatDateKey(new Date());
        const allFoodData = JSON.parse(localStorage.getItem('allFoodData')) || {};
        const todayDiary = allFoodData[todayKey] || { breakfast: [], lunch: [], dinner: [], snack: [] };
        
        const targetMealSection = routineToLog.schedule.mealSection;

        // Pemeriksaan keamanan untuk memastikan target sesi makan ada di diary
        if (!todayDiary[targetMealSection]) {
            alert(`Error logging routine. Invalid meal section: ${targetMealSection}`);
            return;
        }
        
        // Tambahkan setiap item makanan dari rutinitas ke dalam data diary.
        routineToLog.foods.forEach(foodItem => {
            const newFoodEntry = {
                ...foodItem,
                id: `food-${Date.now()}-${Math.random()}`, // Buat ID unik baru
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
            };
            todayDiary[targetMealSection].push(newFoodEntry);
        });

        // Simpan kembali data diary yang sudah diperbarui.
        allFoodData[todayKey] = todayDiary;
        localStorage.setItem('allFoodData', JSON.stringify(allFoodData));

        // Beri notifikasi kepada pengguna dan arahkan ke halaman diary.
        alert(`"${routineToLog.name}" has been logged to your diary!`);
        window.location.href = 'diary.html';
    };
    
    // --- INITIALIZATION ---
    // Panggil fungsi utama untuk memuat dan menampilkan data saat halaman dibuka.
    loadAndRenderRoutines();
    // Tambahkan satu event listener ke kontainer untuk menangani semua klik tombol "Log Now".
    routineListContainer.addEventListener('click', handleLogNowClick);
});