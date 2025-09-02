document.addEventListener('DOMContentLoaded', () => {
    // --- DATABASE & STATE ---
    const exerciseDatabase = {
        'Chest': ['Bench Press', 'Incline Dumbbell Press', 'Push Up', 'Cable Fly', 'Dumbbell Pullover'],
        'Back': ['Pull Up', 'Deadlift', 'Barbell Row', 'Lat Pulldown', 'T-Bar Row', 'Dumbbell Row'],
        'Legs': ['Squat', 'Leg Press', 'Lunge', 'Leg Extension', 'Hamstring Curl', 'Calf Raise'],
        'Shoulders': ['Overhead Press', 'Lateral Raise', 'Face Pull', 'Arnold Press', 'Shrugs'],
        'Biceps': ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl'],
        'Triceps': ['Triceps Pushdown', 'Skull Crusher', 'Close Grip Bench Press', 'Dips'],
        'Abs': ['Crunches', 'Leg Raise', 'Plank', 'Russian Twist'],
        'Cardio': ['Running', 'Cycling', 'Jump Rope', 'Stair Master', 'Elliptical']
    };
    const categoryColors = {
        'Chest': '#ef4444', 'Back': '#3b82f6', 'Legs': '#22c55e',
        'Shoulders': '#f97316', 'Biceps': '#a855f7', 'Triceps': '#6366f1',
        'Abs': '#eab308', 'Cardio': '#14b8a6', 'Custom': '#6b7280'
    };

    let currentDate = new Date();
    let datepicker;
    let sortableInstance = null;

    // --- ELEMENT SELECTORS ---
    const workoutListEl = document.getElementById('workout-list');
    const timelineContainer = document.getElementById('date-timeline-container');
    const monthYearDisplay = document.getElementById('month-year-display');
    const addExerciseModal = document.getElementById('add-exercise-modal');
    const openModalBtn = document.getElementById('open-add-exercise-modal-btn');
    const closeModalBtn = document.getElementById('close-add-exercise-modal-btn');
    const categoryContainer = document.getElementById('category-filter-container');
    const exerciseListContainer = document.getElementById('exercise-list-container');
    const searchInput = document.getElementById('search-exercise-input');
    
    // Calendar Elements
    const openCalendarBtn = document.getElementById('open-calendar-btn');
    const calendarModalOverlay = document.getElementById('calendar-modal-overlay');
    const calendarContainer = document.getElementById('calendar-container');
    const calendarLegend = document.getElementById('calendar-legend');

    // Custom Exercise Form Elements
    const addCustomExerciseView = document.getElementById('add-custom-exercise-view');
    const showExerciseListViewBtn = document.getElementById('show-exercise-list-btn');
    const showAddCustomFormBtn = document.getElementById('show-add-custom-form-btn');
    const customExerciseForm = document.getElementById('custom-exercise-form');
    const customExerciseNameInput = document.getElementById('custom-exercise-name');
    const customExerciseCategorySelect = document.getElementById('custom-exercise-category');
    const mainExerciseSelectionView = document.getElementById('main-exercise-selection-view');

    // --- LOCAL STORAGE FUNCTIONS ---
    const getWorkouts = () => JSON.parse(localStorage.getItem('workouts')) || {};
    const saveWorkouts = (workouts) => localStorage.setItem('workouts', JSON.stringify(workouts));
    const getCustomExercises = () => JSON.parse(localStorage.getItem('customExercises')) || {};
    const saveCustomExercises = (customExercises) => localStorage.setItem('customExercises', JSON.stringify(customExercises));

    // --- MAIN RENDER FUNCTIONS ---
    function renderWorkoutLog() {
        const dateKey = currentDate.toISOString().split('T')[0];
        const allWorkouts = getWorkouts();
        const dailyWorkouts = allWorkouts[dateKey] || [];
        workoutListEl.innerHTML = '';
        if (dailyWorkouts.length === 0) {
            workoutListEl.innerHTML = `<div class="flex flex-col items-center justify-center text-center text-gray-500 py-16 px-6 h-full"><svg class="w-16 h-16 text-pink-200 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.024.217 1.464l-.657.98c-.318.476-.945.642-1.464.325l-1.068-.89a.993.993 0 00-1.218 0l-1.068.89c-.519.317-1.146.15-1.464-.325l-.657-.98c-.318-.44-.225-1.095.217-1.464l1.068-.89a.993.993 0 00.405-.864v-.568a3 3 0 013-3c.954 0 1.84.464 2.404 1.224a2.998 2.998 0 01.596 2.776zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><h3 class="font-semibold text-lg text-gray-700">Welcome to your training log!</h3><p class="text-sm mt-2 max-w-xs">Plan your first session by tapping the <span class="font-bold text-pink-500">+</span> button to add exercises and log your reps & weights.</p></div>`;
            return;
        }
        dailyWorkouts.forEach((exercise, exerciseIndex) => {
            const setsHtml = exercise.sets.map((set, setIndex) => `
                <div class="flex items-center space-x-3 text-sm">
                    <span class="font-bold text-gray-500 w-6">${setIndex + 1}</span>
                    <input type="number" value="${set.weight}" class="w-full form-input-custom p-2 rounded-md text-center" placeholder="kg" data-type="weight" data-ex-index="${exerciseIndex}" data-set-index="${setIndex}">
                    <span class="text-gray-400">x</span>
                    <input type="number" value="${set.reps}" class="w-full form-input-custom p-2 rounded-md text-center" placeholder="reps" data-type="reps" data-ex-index="${exerciseIndex}" data-set-index="${setIndex}">
                    <button class="p-1 text-red-400 hover:text-red-600" data-action="delete-set" data-ex-index="${exerciseIndex}" data-set-index="${setIndex}">&times;</button>
                </div>
            `).join('');

            const card = document.createElement('div');
            card.className = 'glass-card rounded-xl p-4 space-y-3';
            card.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        
                        <h3 class="font-bold text-gray-800">${exercise.name}</h3>
                    </div>
                    <button class="text-xs font-semibold text-red-500 hover:text-red-700" data-action="delete-exercise" data-ex-index="${exerciseIndex}">DELETE</button>
                </div>
                <div class="space-y-2">${setsHtml}</div>
                <button class="w-full text-center text-sm font-semibold text-pink-500 py-2 rounded-lg hover:bg-pink-100" data-action="add-set" data-ex-index="${exerciseIndex}">+ Add Set</button>
            `;
            workoutListEl.appendChild(card);
        });

        initializeDragAndDrop();
    }

    function renderDateTimeline() {
        if (!timelineContainer || !monthYearDisplay) return;
        timelineContainer.innerHTML = '';
        monthYearDisplay.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const fragment = document.createDocumentFragment();
        let startPoint = new Date(currentDate);
        startPoint.setDate(startPoint.getDate() - 3);

        for (let i = 0; i < 7; i++) {
            let day = new Date(startPoint);
            day.setDate(day.getDate() + i);
            const isActive = day.toDateString() === currentDate.toDateString();

            const dayEl = document.createElement('button');
            dayEl.className = `flex-shrink-0 flex flex-col items-center justify-center space-y-2 p-2 w-14 transition-colors relative`;
            // KODE BARU
dayEl.innerHTML = `
    <span class="text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}">${day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</span>
    <span class="font-semibold text-lg ${isActive ? 'text-pink-500' : 'text-gray-500'}">${day.getDate()}</span>
    <div class="workout-dots flex space-x-1 absolute bottom-0"></div>
`;
            dayEl.addEventListener('click', () => {
                currentDate = day;
                renderAll();
                if (datepicker) datepicker.setDate(currentDate);
            });
            fragment.appendChild(dayEl);
        }
        timelineContainer.appendChild(fragment);
        updateTimelineDots();
    }
    
    function updateTimelineDots() {
        const allWorkouts = getWorkouts();
        const timelineButtons = timelineContainer.querySelectorAll('button');
        let startPoint = new Date(currentDate);
        startPoint.setDate(startPoint.getDate() - 3);

        timelineButtons.forEach((btn, i) => {
            let day = new Date(startPoint);
            day.setDate(day.getDate() + i);
            const dateKey = day.toISOString().split('T')[0];
            const dotsContainer = btn.querySelector('.workout-dots');
            dotsContainer.innerHTML = '';
            
            // KODE BARU
if (allWorkouts[dateKey] && allWorkouts[dateKey].length > 0) {
    // Cukup tambahkan satu titik sebagai penanda
    dotsContainer.innerHTML = `<div class="workout-dot" style="background-color: #ec4899;"></div>`;
}
        });
    }

    // --- ADD EXERCISE MODAL FUNCTIONS ---
    function renderCategories() {
        if (!categoryContainer) return;
        categoryContainer.innerHTML = '';
        
        const customExercises = getCustomExercises();
        const categories = ['All', ...Object.keys(exerciseDatabase)];
        if (Object.keys(customExercises).length > 0) {
            categories.push('Custom');
        }

        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.textContent = category;
            btn.className = 'category-btn text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap';
            if (category === 'All') {
                btn.classList.add('bg-pink-500', 'text-white');
            } else {
                btn.classList.add('bg-gray-200', 'text-gray-700');
            }
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => {
                    b.classList.remove('bg-pink-500', 'text-white');
                    b.classList.add('bg-gray-200', 'text-gray-700');
                });
                btn.classList.add('bg-pink-500', 'text-white');
                btn.classList.remove('bg-gray-200', 'text-gray-700');
                renderExerciseList(category, searchInput.value);
            });
            categoryContainer.appendChild(btn);
        });
    }

    function renderExerciseList(category = 'All', searchTerm = '') {
        if (!exerciseListContainer) return;
        exerciseListContainer.innerHTML = '';
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        const allDefaultExercises = { ...exerciseDatabase };
        const customExercises = getCustomExercises();
        let allExercises = { ...allDefaultExercises };

        if (Object.keys(customExercises).length > 0) {
            allExercises.Custom = Object.keys(customExercises);
        }

        let filteredExercises = [];

        if (category === 'All') {
            Object.values(allExercises).forEach(exercises => {
                filteredExercises.push(...exercises);
            });
        } else {
            filteredExercises = allExercises[category] || [];
        }

        if (searchTerm) {
            filteredExercises = filteredExercises.filter(ex => ex.toLowerCase().includes(lowerCaseSearchTerm));
        }
        
        // Remove duplicates that might appear if a custom exercise has a default name
        filteredExercises = [...new Set(filteredExercises)];

        if (filteredExercises.length === 0) {
            exerciseListContainer.innerHTML = `<p class="text-center text-gray-500 mt-8">No exercises found.</p>`;
            return;
        }

        filteredExercises.sort().forEach(exerciseName => {
            let exerciseCategory = '';
            if (customExercises[exerciseName]) {
                exerciseCategory = customExercises[exerciseName].category;
            } else {
                for (const cat in exerciseDatabase) {
                    if (exerciseDatabase[cat].includes(exerciseName)) {
                        exerciseCategory = cat;
                        break;
                    }
                }
            }

            const item = document.createElement('div');
            item.className = 'flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer';
            item.innerHTML = `
                
                <div class="ml-4">
                
                    <p class="font-semibold text-gray-800">${exerciseName}</p>
                    <p class="text-xs text-gray-500">${exerciseCategory}</p>
                </div>
            `;
            item.addEventListener('click', () => addExerciseToLog(exerciseName, exerciseCategory));
            exerciseListContainer.appendChild(item);
        });
    }

    function populateCategorySelect() {
        if (!customExerciseCategorySelect) return;
        customExerciseCategorySelect.innerHTML = '';
        Object.keys(exerciseDatabase).forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            customExerciseCategorySelect.appendChild(option);
        });
    }

    // --- CALENDAR FUNCTIONS ---
    function initializeCalendar() {
        if (!calendarContainer) return;
        const elem = calendarContainer;
        datepicker = new Datepicker(elem, {
            autohide: false,
            todayHighlight: true,
        });
        elem.addEventListener('changeDate', (e) => {
            currentDate = new Date(e.detail.date);
            renderAll();
            calendarModalOverlay.classList.add('hidden');
        });
        renderCalendarLegend();
        updateCalendarDots();
    }
    
    function updateCalendarDots() {
        if (!datepicker) return;
        const allWorkouts = getWorkouts();
        setTimeout(() => { // Use timeout to ensure DOM is updated
            const cells = calendarContainer.querySelectorAll('.datepicker-cell');
            cells.forEach(cell => {
                const day = cell.querySelector('.day');
                if (!day || day.classList.contains('disabled')) return;
                
                const date = new Date(datepicker.getDate());
                date.setDate(parseInt(day.textContent));
                const dateKey = date.toISOString().split('T')[0];
                
                let dotsContainer = cell.querySelector('.workout-dots');
                if (!dotsContainer) {
                    dotsContainer = document.createElement('div');
                    dotsContainer.className = 'workout-dots';
                    cell.appendChild(dotsContainer);
                }
                dotsContainer.innerHTML = '';
                
                if (allWorkouts[dateKey]) {
                    const categories = [...new Set(allWorkouts[dateKey].map(ex => ex.category))];
                    categories.slice(0, 3).forEach(cat => {
                        dotsContainer.innerHTML += `<div class="workout-dot" style="background-color: ${categoryColors[cat] || '#6b7280'}"></div>`;
                    });
                }
            });
        }, 0);
    }
    
    function renderCalendarLegend() {
        if (!calendarLegend) return;
        calendarLegend.innerHTML = '';
        Object.entries(categoryColors).forEach(([category, color]) => {
            if (category !== 'Custom') {
                calendarLegend.innerHTML += `
                    <div class="flex items-center">
                        <div class="w-2.5 h-2.5 rounded-full mr-2" style="background-color: ${color};"></div>
                        <span>${category}</span>
                    </div>
                `;
            }
        });
    }

    function initializeDragAndDrop() {
    // Hancurkan instance lama jika ada, untuk mencegah duplikasi event listener
    if (sortableInstance) {
        sortableInstance.destroy();
    }

    // Inisialisasi SortableJS pada container workout list
    sortableInstance = new Sortable(workoutListEl, {
        animation: 150, // Animasi saat item dipindahkan
        
        onEnd: function (evt) {
            // Fungsi ini berjalan setelah user selesai men-drag dan melepaskan item
            const allWorkouts = getWorkouts();
            const dateKey = currentDate.toISOString().split('T')[0];

            // Ambil item yang dipindahkan dari array data
            const [movedItem] = allWorkouts[dateKey].splice(evt.oldIndex, 1);
            // Masukkan item tersebut ke posisi barunya di array data
            allWorkouts[dateKey].splice(evt.newIndex, 0, movedItem);

            // Simpan urutan array yang baru ke localStorage
            saveWorkouts(allWorkouts);
        }
    });
}


    // --- DATA MANIPULATION LOGIC ---
    function addExerciseToLog(name, category) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const allWorkouts = getWorkouts();
        if (!allWorkouts[dateKey]) {
            allWorkouts[dateKey] = [];
        }
        allWorkouts[dateKey].push({
            name: name,
            category: category,
            sets: [{ weight: '', reps: '' }]
        });
        saveWorkouts(allWorkouts);
        renderAll();
        addExerciseModal.classList.add('hidden');
    }

    function handleAddCustomExercise(e) {
        e.preventDefault();
        const name = customExerciseNameInput.value.trim();
        const category = customExerciseCategorySelect.value;
        if (!name || !category) return alert('Please fill out both fields.');

        const customExercises = getCustomExercises();
        if (customExercises[name] || Object.values(exerciseDatabase).flat().includes(name)) {
            return alert('An exercise with this name already exists.');
        }

        customExercises[name] = { category };
        saveCustomExercises(customExercises);
        customExerciseForm.reset();
        
        mainExerciseSelectionView.classList.remove('hidden');
        addCustomExerciseView.classList.add('hidden');
        renderCategories();
        renderExerciseList('Custom', '');
        searchInput.value = '';
        // Select the new 'Custom' filter button
        document.querySelectorAll('.category-btn').forEach(b => {
            if (b.textContent === 'Custom') b.click();
        });
    }

    function handleWorkoutListClick(e) {
        const target = e.target.closest('button[data-action], input');
        if (!target) return;
        
        const allWorkouts = getWorkouts();
        const dateKey = currentDate.toISOString().split('T')[0];
        const exIndex = parseInt(target.dataset.exIndex);
        
        if (target.matches('[data-action="add-set"]')) {
            allWorkouts[dateKey][exIndex].sets.push({ weight: '', reps: '' });
        } else if (target.matches('[data-action="delete-set"]')) {
            const setIndex = parseInt(target.dataset.setIndex);
            allWorkouts[dateKey][exIndex].sets.splice(setIndex, 1);
        } else if (target.matches('[data-action="delete-exercise"]')) {
            allWorkouts[dateKey].splice(exIndex, 1);
        } else if (target.matches('input')) {
            const setIndex = parseInt(target.dataset.setIndex);
            const type = target.dataset.type;
            allWorkouts[dateKey][exIndex].sets[setIndex][type] = target.value;
        }

        saveWorkouts(allWorkouts);
        if (target.matches('[data-action]')) {
             renderAll();
        }
    }


    // --- INITIALIZATION & EVENT LISTENERS ---
    function renderAll() {
        renderWorkoutLog();
        renderDateTimeline();
        if(datepicker) updateCalendarDots();
    }

    function initializePage() {
        renderAll();
        renderCategories();
        renderExerciseList();
        populateCategorySelect();
        initializeCalendar();
    }
    
    // Modal open/close listeners
    openModalBtn.addEventListener('click', () => addExerciseModal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => addExerciseModal.classList.add('hidden'));

    openCalendarBtn.addEventListener('click', () => {
        if (!datepicker) initializeCalendar();
        datepicker.setDate(currentDate);
        updateCalendarDots();
        calendarModalOverlay.classList.remove('hidden');
    });

    monthYearDisplay.addEventListener('click', () => openCalendarBtn.click());

    calendarModalOverlay.addEventListener('click', (e) => {
        if (e.target === calendarModalOverlay) {
            calendarModalOverlay.classList.add('hidden');
        }
    });

    // Search and filter listeners
    searchInput.addEventListener('input', () => {
        const activeCategoryBtn = document.querySelector('.category-btn.bg-pink-500');
        const category = activeCategoryBtn ? activeCategoryBtn.textContent : 'All';
        renderExerciseList(category, searchInput.value);
    });

    // View switching in 'Add Exercise' modal
    showAddCustomFormBtn.addEventListener('click', () => {
        mainExerciseSelectionView.classList.add('hidden');
        addCustomExerciseView.classList.remove('hidden');
    });
    showExerciseListViewBtn.addEventListener('click', () => {
        mainExerciseSelectionView.classList.remove('hidden');
        addCustomExerciseView.classList.add('hidden');
    });

    // Form submission listener
    customExerciseForm.addEventListener('submit', handleAddCustomExercise);
    
    // Event delegation for workout list actions
    workoutListEl.addEventListener('input', handleWorkoutListClick);
    workoutListEl.addEventListener('click', handleWorkoutListClick);


    // --- START THE APP ---
    initializePage();
});