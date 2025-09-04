// File: coach-program-builder.js
document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const form = document.getElementById('program-builder-form');
    const planContainer = document.getElementById('plan-builder-container');
    const addWeekBtn = document.getElementById('add-week-btn');

    // --- STATE MANAGEMENT ---
    let programState = {
        title: '',
        price: '',
        duration: '',
        description: '',
        image: '',
        plan: [] // Array of weeks
    };

    // --- RENDER FUNCTION ---
    const renderPlan = () => {
        planContainer.innerHTML = '';
        programState.plan.forEach((week, weekIndex) => {
            const weekEl = document.createElement('div');
            weekEl.className = 'week-card bg-white/50 p-4 rounded-lg space-y-3';
            
            let daysHTML = '';
            week.days.forEach((day, dayIndex) => {
                let exercisesHTML = '';
                day.exercises.forEach((ex, exIndex) => {
                    exercisesHTML += `
                        <div class="flex items-center space-x-2 text-sm">
                            <input type="text" value="${ex.name}" class="form-input p-2 flex-grow" placeholder="Exercise Name" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}" data-field="name">
                            <input type="text" value="${ex.setsReps}" class="form-input p-2 w-28" placeholder="Sets x Reps" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}" data-field="setsReps">
                            <button type="button" class="remove-exercise-btn text-red-400 hover:text-red-600 p-1" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}">✕</button>
                        </div>
                    `;
                });

                daysHTML += `
                    <div class="day-card bg-white/80 p-3 rounded-md space-y-2 mt-2">
                        <div class="flex justify-between items-center">
                            <input type="text" value="${day.title}" class="form-input p-1 font-semibold text-gray-700 w-full" placeholder="Day Title (e.g., Glute Focus A)" data-week="${weekIndex}" data-day="${dayIndex}" data-field="title">
                            <button type="button" class="remove-day-btn text-red-500 font-bold ml-2 text-xs" data-week="${weekIndex}" data-day="${dayIndex}">DELETE DAY</button>
                        </div>
                        <div class="space-y-2">${exercisesHTML}</div>
                        <button type="button" class="add-exercise-btn text-xs font-semibold text-pink-500 hover:text-pink-700 mt-2" data-week="${weekIndex}" data-day="${dayIndex}">+ Add Exercise</button>
                    </div>
                `;
            });

            weekEl.innerHTML = `
                <div class="flex justify-between items-center">
                    <h3 class="font-bold text-gray-600">Week ${weekIndex + 1}</h3>
                    <button type="button" class="remove-week-btn text-red-500 font-bold text-xs" data-week="${weekIndex}">DELETE WEEK</button>
                </div>
                <div class="space-y-2">${daysHTML}</div>
                <button type="button" class="add-day-btn w-full text-xs text-center bg-gray-200/60 text-gray-600 font-semibold p-2 rounded-lg hover:bg-gray-200 mt-2" data-week="${weekIndex}">+ Add Day</button>
            `;
            planContainer.appendChild(weekEl);
        });
    };

    // --- EVENT HANDLING ---

    addWeekBtn.addEventListener('click', () => {
        programState.plan.push({ week: programState.plan.length + 1, days: [] });
        renderPlan();
    });

    planContainer.addEventListener('click', (e) => {
        const target = e.target;
        const weekIndex = parseInt(target.dataset.week);

        if (target.matches('.remove-week-btn')) {
            programState.plan.splice(weekIndex, 1);
        }
        if (target.matches('.add-day-btn')) {
            programState.plan[weekIndex].days.push({ day: programState.plan[weekIndex].days.length + 1, title: '', exercises: [] });
        }

        const dayIndex = parseInt(target.dataset.day);
        if (target.matches('.remove-day-btn')) {
            programState.plan[weekIndex].days.splice(dayIndex, 1);
        }
        if (target.matches('.add-exercise-btn')) {
            programState.plan[weekIndex].days[dayIndex].exercises.push({ name: '', setsReps: '' });
        }
        
        const exIndex = parseInt(target.dataset.ex);
        if(target.matches('.remove-exercise-btn')) {
            programState.plan[weekIndex].days[dayIndex].exercises.splice(exIndex, 1);
        }

        renderPlan();
    });
    
    planContainer.addEventListener('input', (e) => {
        const { week, day, ex, field } = e.target.dataset;
        if (week === undefined) return;
        
        if (ex !== undefined) { // Exercise level
            programState.plan[week].days[day].exercises[ex][field] = e.target.value;
        } else if (day !== undefined) { // Day level
            programState.plan[week].days[day][field] = e.target.value;
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Get top-level details from form
        programState.title = document.getElementById('program-title').value;
        programState.price = parseFloat(document.getElementById('program-price').value);
        programState.duration = document.getElementById('program-duration').value;
        programState.description = document.getElementById('program-description').value;
        programState.image = document.getElementById('program-image').value;
        
        // 2. Add other details (bisa di-hardcode untuk sekarang)
        programState.id = `p${Date.now()}`;
        programState.author = 'By Alex Johnson'; // Ganti dengan nama coach yang login
        programState.equipment = 'minimal';
        // ...dan seterusnya

        if (!programState.title || !programState.price || !programState.duration) {
            alert('Please fill in all program details.');
            return;
        }

        // 3. Save to localStorage
        // Kita akan tambahkan program baru ini ke `programsData` yang sudah ada
        // Catatan: `programsData` harus sudah di-load dari data.js
        // [UBAH] Logika penyimpanan program baru
// 1. Tambahkan program baru ke database global (simulasi)
programsData.push(programState);

// 2. Hubungkan program ini ke coach yang sedang login
const LOGGED_IN_COACH_ID = 'c001'; // Asumsi coach Alex Johnson
const coachIndex = coachesData.findIndex(c => c.id === LOGGED_IN_COACH_ID);

if (coachIndex !== -1) {
    // Tambahkan ID program baru ke daftar program yang dijual coach
    coachesData[coachIndex].sellsPrograms.push(programState.id);
    console.log(`Program ${programState.id} added to coach ${LOGGED_IN_COACH_ID}`);
}

// Untuk demo, kita bisa lihat hasilnya di console
console.log('Updated programsData:', programsData);
console.log('Updated coachesData:', coachesData);

alert(`Program "${programState.title}" has been saved and linked to your profile!`);
// Arahkan ke dashboard setelah menyimpan
window.location.href = 'coach-dashboard.html';
    });
    
    // --- INITIALIZATION ---
    renderPlan();
});