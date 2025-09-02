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

    let currentDate = new Date();
    let sortableInstance = null;
    let calendarInstance = null;

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
    const openCalendarBtn = document.getElementById('open-calendar-btn');
    const calendarModalOverlay = document.getElementById('calendar-modal-overlay');
    const calendarContainer = document.getElementById('calendar-container');
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

    // --- RENDER FUNCTIONS ---
    function renderWorkoutLog() {
        const dateKey = currentDate.toISOString().split('T')[0];
        const allWorkouts = getWorkouts();
        const dailyWorkouts = allWorkouts[dateKey] || [];
        workoutListEl.innerHTML = '';

        if (dailyWorkouts.length === 0) {
            workoutListEl.innerHTML = `<div class="flex flex-col items-center justify-center text-center text-gray-500 py-16 px-6 h-full"><svg class="w-16 h-16 text-pink-200 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.024.217 1.464l-.657.98c-.318.476-.945.642-1.464.325l-1.068-.89a.993.993 0 00-1.218 0l-1.068.89c-.519.317-1.146.15-1.464-.325l-.657-.98c-.318-.44-.225-1.095.217-1.464l1.068-.89a.993.993 0 00.405-.864v-.568a3 3 0 013-3c.954 0 1.84.464 2.404 1.224a2.998 2.998 0 01.596 2.776zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><h3 class="font-semibold text-lg text-gray-700">No workout logged</h3><p class="text-sm mt-2 max-w-xs">Tap the <span class="font-bold text-pink-500">+</span> button to add exercises.</p></div>`;
            return;
        }

        dailyWorkouts.forEach((exercise, exerciseIndex) => {
            const setsHtml = exercise.sets.map((set, setIndex) => `
                <div class="set-row flex items-center space-x-3 text-sm">
                    <span class="set-number-badge">${setIndex + 1}</span>
                    <input type="number" value="${set.weight}" class="w-full form-input-custom p-2 rounded-lg text-center font-medium" placeholder="kg" data-type="weight" data-ex-index="${exerciseIndex}" data-set-index="${setIndex}">
                    <span class="text-gray-400 font-sans">×</span>
                    <input type="number" value="${set.reps}" class="w-full form-input-custom p-2 rounded-lg text-center font-medium" placeholder="reps" data-type="reps" data-ex-index="${exerciseIndex}" data-set-index="${setIndex}">
                    <button class="delete-set-btn" data-action="delete-set" data-ex-index="${exerciseIndex}" data-set-index="${setIndex}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            `).join('');

            const card = document.createElement('div');
            card.className = 'workout-card bg-white rounded-2xl p-5 shadow-lg shadow-pink-500/5';
            
            card.innerHTML = `
                <div class="flex justify-between items-center pb-4 border-b border-gray-100">
                    <h3 class="font-bold text-gray-800 text-lg">${exercise.name}</h3>
                    <button class="text-xs font-bold text-red-500 hover:text-red-700 tracking-wider" data-action="delete-exercise" data-ex-index="${exerciseIndex}">DELETE</button>
                </div>
                
                <div class="space-y-3 pt-4">${setsHtml}</div>
                
                <div class="pt-2">
                    <button class="add-set-btn" data-action="add-set" data-ex-index="${exerciseIndex}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>Add Set</span>
                    </button>
                </div>
            `;
            workoutListEl.appendChild(card);
        });

        initializeDragAndDrop();
    }

    function renderDateTimeline() {
        timelineContainer.innerHTML = '';
        monthYearDisplay.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        let startPoint = new Date(currentDate);
        startPoint.setDate(startPoint.getDate() - 3);

        for (let i = 0; i < 7; i++) {
            let day = new Date(startPoint);
            day.setDate(day.getDate() + i);
            const isActive = day.toDateString() === currentDate.toDateString();

            const dayEl = document.createElement('button');
            dayEl.className = `flex-shrink-0 flex flex-col items-center justify-center space-y-2 p-2 w-14 transition-colors relative`;
            dayEl.innerHTML = `
                <span class="text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}">${day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</span>
                <span class="font-semibold text-lg ${isActive ? 'text-pink-500' : 'text-gray-500'}">${day.getDate()}</span>
                <div class="workout-dots flex space-x-1 absolute bottom-0"></div>
            `;
            dayEl.addEventListener('click', () => {
                currentDate = day;
                renderAll();
            });
            timelineContainer.appendChild(dayEl);
        }
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
            
            if (allWorkouts[dateKey] && allWorkouts[dateKey].length > 0) {
                dotsContainer.innerHTML = `<div class="w-1.5 h-1.5 rounded-full bg-pink-500"></div>`;
            }
        });
    }

    function renderCategories() {
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
            Object.values(allExercises).forEach(exercises => filteredExercises.push(...exercises));
        } else {
            filteredExercises = allExercises[category] || [];
        }

        if (searchTerm) {
            filteredExercises = filteredExercises.filter(ex => ex.toLowerCase().includes(lowerCaseSearchTerm));
        }
        
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

    function initializeCalendar() {
        if (calendarInstance) {
            return;
        }
        calendarInstance = flatpickr(calendarContainer, {
            inline: true,
            defaultDate: currentDate,
            onChange: function(selectedDates, dateStr, instance) {
                currentDate = selectedDates[0];
                renderAll();
                calendarModalOverlay.classList.add('hidden');
            },
            onDayCreate: function(dObj, dStr, fp, dayElem) {
                const date = dayElem.dateObj;
                const dateKey = date.toISOString().split('T')[0];
                const allWorkouts = getWorkouts();
                if (allWorkouts[dateKey] && allWorkouts[dateKey].length > 0) {
                    const dot = document.createElement('span');
                    dot.className = 'workout-dot-marker';
                    dayElem.appendChild(dot);
                }
            },
            onMonthChange: function() {
                setTimeout(() => this.redraw(), 10);
            },
             onYearChange: function() {
                setTimeout(() => this.redraw(), 10);
            }
        });
    }
    
    // --- LOGIC FUNCTIONS ---
    function addExerciseToLog(name, category) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const allWorkouts = getWorkouts();
        if (!allWorkouts[dateKey]) {
            allWorkouts[dateKey] = [];
        }
        allWorkouts[dateKey].push({ name, category, sets: [{ weight: '', reps: '' }] });
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
        document.querySelectorAll('.category-btn').forEach(b => {
            if (b.textContent === 'Custom') b.click();
        });
    }

    function handleWorkoutListClick(e) {
        const target = e.target;
        const allWorkouts = getWorkouts();
        const dateKey = currentDate.toISOString().split('T')[0];
        
        if (target.tagName === 'INPUT' && target.dataset.type) {
            const exIndex = parseInt(target.dataset.exIndex);
            const setIndex = parseInt(target.dataset.setIndex);
            const type = target.dataset.type;
            allWorkouts[dateKey][exIndex].sets[setIndex][type] = target.value;
            saveWorkouts(allWorkouts);
            return;
        }

        const button = target.closest('button[data-action]');
        if (!button) return;

        const action = button.dataset.action;
        const exIndex = parseInt(button.dataset.exIndex);
        
        if (action === 'add-set') {
            allWorkouts[dateKey][exIndex].sets.push({ weight: '', reps: '' });
        } else if (action === 'delete-set') {
            const setIndex = parseInt(button.dataset.setIndex);
            allWorkouts[dateKey][exIndex].sets.splice(setIndex, 1);
        } else if (action === 'delete-exercise') {
            allWorkouts[dateKey].splice(exIndex, 1);
        }

        saveWorkouts(allWorkouts);
        renderAll();
    }

    function initializeDragAndDrop() {
        if (sortableInstance) {
            sortableInstance.destroy();
        }
        sortableInstance = new Sortable(workoutListEl, {
            animation: 150,
            onEnd: function (evt) {
                const allWorkouts = getWorkouts();
                const dateKey = currentDate.toISOString().split('T')[0];
                const [movedItem] = allWorkouts[dateKey].splice(evt.oldIndex, 1);
                allWorkouts[dateKey].splice(evt.newIndex, 0, movedItem);
                saveWorkouts(allWorkouts);
                renderAll(); // Re-render to ensure data attributes are correct
            }
        });
    }

    // --- INITIALIZATION & EVENT LISTENERS ---
    function renderAll() {
        renderWorkoutLog();
        renderDateTimeline();
        if (calendarInstance) {
            calendarInstance.setDate(currentDate, false);
            calendarInstance.redraw();
        }
    }

    function initializePage() {
        renderAll();
        renderCategories();
        renderExerciseList();
        populateCategorySelect();
        initializeCalendar();
    }
    
    openModalBtn.addEventListener('click', () => addExerciseModal.classList.remove('hidden'));
    closeModalBtn.addEventListener('click', () => addExerciseModal.classList.add('hidden'));

    openCalendarBtn.addEventListener('click', () => {
        calendarInstance.setDate(currentDate, false);
        calendarInstance.redraw();
        calendarModalOverlay.classList.remove('hidden');
    });

    monthYearDisplay.addEventListener('click', () => openCalendarBtn.click());

    calendarModalOverlay.addEventListener('click', (e) => {
        if (e.target === calendarModalOverlay) {
            calendarModalOverlay.classList.add('hidden');
        }
    });

    searchInput.addEventListener('input', () => {
        const activeCategoryBtn = document.querySelector('.category-btn.bg-pink-500');
        const category = activeCategoryBtn ? activeCategoryBtn.textContent : 'All';
        renderExerciseList(category, searchInput.value);
    });

    showAddCustomFormBtn.addEventListener('click', () => {
        mainExerciseSelectionView.classList.add('hidden');
        addCustomExerciseView.classList.remove('hidden');
    });
    showExerciseListViewBtn.addEventListener('click', () => {
        mainExerciseSelectionView.classList.remove('hidden');
        addCustomExerciseView.classList.add('hidden');
    });

    customExerciseForm.addEventListener('submit', handleAddCustomExercise);
    
    workoutListEl.addEventListener('input', handleWorkoutListClick);
    workoutListEl.addEventListener('click', handleWorkoutListClick);

    // --- START THE APP ---
    initializePage();
});
