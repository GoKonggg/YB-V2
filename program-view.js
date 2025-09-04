// File: program-view.js (Versi Lengkap dan Benar)

document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen-elemen Penting ---
    const programTitleEl = document.querySelector('#app-container h1');
    const weeksTabsContainer = document.querySelector('.px-5.border-b');
    const weekScheduleContainer = document.querySelector('.p-5 .space-y-3');
    const weekTitleEl = document.querySelector('.p-5 h3');
    
    // Elemen Modal
    const videoModal = document.getElementById('video-modal');
    const videoIframe = document.getElementById('video-iframe');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // --- Fungsi Modal Video ---
    const openVideoModal = (url) => {
        if (!videoIframe || !videoModal) return;
        videoIframe.src = url;
        videoModal.classList.remove('hidden');
    };

    const closeVideoModal = () => {
        if (!videoIframe || !videoModal) return;
        videoIframe.src = ''; // Hentikan video saat ditutup
        videoModal.classList.add('hidden');
    };

    if(closeModalBtn) closeModalBtn.addEventListener('click', closeVideoModal);

    // --- Fungsi untuk Merender Konten ---
    const renderExercises = (exercises) => {
        let exercisesHtml = '<div class="space-y-3 border-t border-slate-200 pt-4">';
        if (exercises && exercises.length > 0) {
            exercises.forEach(ex => {
                exercisesHtml += `
                    <div class="flex items-center space-x-4">
                        <img src="https://placehold.co/100x75/f9a8d4/4a044e?text=Video" alt="${ex.name} Thumbnail" class="w-24 h-16 object-cover rounded-lg flex-shrink-0">
                        <div class="flex-grow">
                            <p class="font-semibold text-slate-800">${ex.name}</p>
                            <p class="text-sm text-slate-500">${ex.setsReps}</p>
                        </div>
                        <button class="play-video-btn p-2 rounded-full text-slate-500 hover:bg-slate-100" data-video-url="${ex.videoUrl}">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>
                `;
            });
        }
        exercisesHtml += '</div>';
        return exercisesHtml;
    };

    // [PASTIKAN FUNGSI INI BENAR] - Menerima 'programId' dan 'weekData'
    const renderWeekSchedule = (programId, weekData) => {
        if (!weekScheduleContainer || !weekData) return;
        
        // Baris yang menyebabkan error sebelumnya. 
        // Sekarang aman karena kita memastikan weekData tidak undefined.
        const days = weekData.days;
        weekScheduleContainer.innerHTML = ''; // Kosongkan jadwal

        days.forEach((day, index) => {
            const isRestDay = !day.exercises || day.exercises.length === 0;
            
            const dayWrapper = document.createElement(isRestDay ? 'div' : 'a');
            dayWrapper.className = `block`; // block agar link memenuhi div
            
            if (!isRestDay) {
                dayWrapper.href = `workout.html?programId=${programId}&week=${weekData.week}&day=${day.day}`;
            }

            const dayCard = document.createElement('div');
            dayCard.className = `p-4 rounded-xl shadow-sm ${isRestDay ? 'bg-white opacity-70' : 'bg-white shadow-md border border-slate-200 cursor-pointer hover:border-fuchsia-400'}`;
            
            let content = `
                <div class="flex justify-between items-center ${!isRestDay ? 'mb-4' : ''}">
                    <div>
                        <p class="font-bold ${!isRestDay ? 'text-fuchsia-600' : 'text-slate-500'}">Day ${day.day}</p>
                        <p class="text-slate-700 font-semibold">${day.title}</p>
                    </div>
                </div>
                ${!isRestDay ? renderExercises(day.exercises) : ''}
            `;
            
            dayCard.innerHTML = content;
            dayWrapper.appendChild(dayCard);
            weekScheduleContainer.appendChild(dayWrapper);
        });

        // Tambahkan event listener ke tombol play yang baru di-render
        document.querySelectorAll('.play-video-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Mencegah link <a> terbuka jika tombol play diklik
                e.stopPropagation(); // Mencegah event "bubble up" ke link <a>
                openVideoModal(btn.dataset.videoUrl);
            });
        });
    };
    
    // --- Logika Utama ---
    const urlParams = new URLSearchParams(window.location.search);
    const programId = urlParams.get('id');

    const program = programsData.find(p => p.id === programId);

    if (program) {
        programTitleEl.textContent = program.title;

        // Render Tabs
        weeksTabsContainer.innerHTML = '';
        if (program.plan && program.plan.length > 0) {
            program.plan.forEach((weekData, index) => {
                const tab = document.createElement('button');
                tab.className = `py-3 border-b-2 ${index === 0 ? 'tab-active' : 'border-transparent text-slate-500'}`;
                tab.textContent = `Week ${weekData.week}`;
                
                tab.addEventListener('click', () => {
                    weeksTabsContainer.querySelectorAll('button').forEach(t => t.classList.remove('tab-active'));
                    tab.classList.add('tab-active');
                    
                    weekTitleEl.textContent = `Week ${weekData.week} Schedule`;
                    // [PASTIKAN PEMANGGILAN INI BENAR] - Mengirim program.id dan objek weekData
                    renderWeekSchedule(program.id, weekData);
                });
                weeksTabsContainer.appendChild(tab);
            });

            // Render jadwal untuk minggu pertama secara default
            weekTitleEl.textContent = `Week ${program.plan[0].week} Schedule`;
            // [PASTIKAN PEMANGGILAN INI BENAR] - Mengirim program.id dan objek minggu pertama
            renderWeekSchedule(program.id, program.plan[0]);
        }
    } else {
        programTitleEl.textContent = 'Program Not Found';
    }
});