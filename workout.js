document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // == DATABASE & STATE ==
    // ===================================================================
    
    const programBlueprints = {
        'p001': {
            name: 'Booty Builder 101',
            workouts: [
                { day: 'Day 1: Glute Focus', exercises: [
                    { name: 'Squat', categories: ['Legs'], sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }, { weight: '', reps: '' }] },
                    { name: 'Lunge', categories: ['Legs'], sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }] },
                    { name: 'Deadlift', categories: ['Back', 'Legs'], sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }] },
                ]},
                { day: 'Day 2: Full Lower Body', exercises: [
                    { name: 'Leg Press', categories: ['Legs'], sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }] },
                    { name: 'Hamstring Curl', categories: ['Legs'], sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }] },
                    { name: 'Calf Raise', categories: ['Legs'], sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }] },
                ]},
            ]
        },
        'p002': { name: 'Functional Full Body', workouts: [ { day: 'Day 1: Push Day', exercises: [ { name: 'Bench Press', categories: ['Chest'], sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }] }, { name: 'Overhead Press', categories: ['Shoulders'], sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }] }, ]} ] },
        'p003': { name: 'Morning Yoga Flow', workouts: [ { day: 'Morning Session', exercises: [ { name: 'Sun Salutation', categories: ['Cardio'], sets: [{ time: '15' }] }, { name: 'Warrior Pose', categories: ['Cardio'], sets: [{ time: '5' }] }, ]} ] }
    };

    const exerciseDatabase = [
        { name: 'Bench Press', categories: ['Chest', 'Shoulders', 'Triceps'] }, { name: 'Incline Dumbbell Press', categories: ['Chest', 'Shoulders'] },
        { name: 'Push Up', categories: ['Chest', 'Triceps'] }, { name: 'Cable Fly', categories: ['Chest'] },
        { name: 'Dumbbell Pullover', categories: ['Chest', 'Back'] }, { name: 'Pull Up', categories: ['Back', 'Biceps'] },
        { name: 'Deadlift', categories: ['Back', 'Legs'] }, { name: 'Barbell Row', categories: ['Back', 'Biceps'] },
        { name: 'Lat Pulldown', categories: ['Back'] }, { name: 'T-Bar Row', categories: ['Back'] },
        { name: 'Dumbbell Row', categories: ['Back'] }, { name: 'Squat', categories: ['Legs'] },
        { name: 'Leg Press', categories: ['Legs'] }, { name: 'Lunge', categories: ['Legs'] },
        { name: 'Leg Extension', categories: ['Legs'] }, { name: 'Hamstring Curl', categories: ['Legs'] },
        { name: 'Calf Raise', categories: ['Legs'] }, { name: 'Overhead Press', categories: ['Shoulders', 'Triceps'] },
        { name: 'Lateral Raise', categories: ['Shoulders'] }, { name: 'Face Pull', categories: ['Shoulders', 'Back'] },
        { name: 'Arnold Press', categories: ['Shoulders'] }, { name: 'Shrugs', categories: ['Shoulders', 'Back'] },
        { name: 'Barbell Curl', categories: ['Biceps'] }, { name: 'Dumbbell Curl', categories: ['Biceps'] },
        { name: 'Hammer Curl', categories: ['Biceps'] }, { name: 'Preacher Curl', categories: ['Biceps'] },
        { name: 'Triceps Pushdown', categories: ['Triceps'] }, { name: 'Skull Crusher', categories: ['Triceps'] },
        { name: 'Close Grip Bench Press', categories: ['Triceps', 'Chest'] }, { name: 'Dips', categories: ['Triceps', 'Chest', 'Shoulders'] },
        { name: 'Crunches', categories: ['Abs'] }, { name: 'Leg Raise', categories: ['Abs'] },
        { name: 'Plank', categories: ['Abs'] }, { name: 'Russian Twist', categories: ['Abs'] },
        { name: 'Running', categories: ['Cardio'] }, { name: 'Cycling', categories: ['Cardio'] },
        { name: 'Jump Rope', categories: ['Cardio'] }, { name: 'Stair Master', categories: ['Cardio'] },
        { name: 'Elliptical', categories: ['Cardio'] }
    ];

    let currentDate = new Date();
    let sortableInstance = null;
    let calendarInstance = null;
    let currentRecapFilter = 'week';
    let distributionChartInstance = null;
    let progressChartInstance = null;
    let isEditingTemplate = false;
    let currentTemplateExercises = [];
    let currentEditingTemplateId = null;

    // ===================================================================
    // == ELEMENT SELECTORS ==
    // ===================================================================
    const appContainer = document.getElementById('app-container');
    const workoutListEl = document.getElementById('workout-list');
    const calendarContainer = document.getElementById('calendar-container');
    const timelineContainer = document.getElementById('date-timeline-container');
    const monthYearDisplay = document.getElementById('month-year-display');
    const addExerciseModal = document.getElementById('add-exercise-modal');
    const closeModalBtn = document.getElementById('close-add-exercise-modal-btn');
    const categoryContainer = document.getElementById('category-filter-container');
    const exerciseListContainer = document.getElementById('exercise-list-container');
    const searchInput = document.getElementById('search-exercise-input');
    const calendarModalOverlay = document.getElementById('calendar-modal-overlay');
    const openCalendarBtn = document.getElementById('open-calendar-btn');
    const customExerciseForm = document.getElementById('custom-exercise-form');
    const customExerciseNameInput = document.getElementById('custom-exercise-name');
    const customExerciseCategorySelect = document.getElementById('custom-exercise-category');
    const mainExerciseSelectionView = document.getElementById('main-exercise-selection-view');
    const addCustomExerciseView = document.getElementById('add-custom-exercise-view');
    const showExerciseListViewBtn = document.getElementById('show-exercise-list-btn');
    const showAddCustomFormBtn = document.getElementById('show-add-custom-form-btn');
    const backBtn = document.getElementById('back-btn');
    const toggleFilterBtn = document.getElementById('toggle-filter-btn');
    const collapsibleFilterArea = document.getElementById('collapsible-filter-area');
    const filterChevronIcon = document.getElementById('filter-chevron-icon');
    const mainFabBtn = document.getElementById('main-fab-btn');
    const fabPlusIcon = document.getElementById('fab-plus-icon');
    const fabBackdrop = document.getElementById('fab-backdrop');
    const recapFabAction = document.getElementById('recap-fab-action');
    const addFabAction = document.getElementById('add-fab-action');
    const fabRecapBtn = document.getElementById('fab-recap-btn');
    const fabAddBtn = document.getElementById('fab-add-btn');
    const recapView = document.getElementById('recap-view');
    const closeRecapBtn = document.getElementById('close-recap-btn');
    const recapPrevBtn = document.getElementById('recap-prev-btn');
    const recapNextBtn = document.getElementById('recap-next-btn');
    const recapPeriodDisplay = document.getElementById('recap-period-display');
    const recapFilterDayBtn = document.getElementById('recap-filter-day');
    const recapFilterWeekBtn = document.getElementById('recap-filter-week');
    const recapFilterMonthBtn = document.getElementById('recap-filter-month');
    const recapDynamicCardTitleEl = document.getElementById('recap-dynamic-card-title');
    const recapDynamicCardValueEl = document.getElementById('recap-dynamic-card-value');
    const recapTotalMovesEl = document.getElementById('recap-total-moves');
    const recapTotalSetsEl = document.getElementById('recap-total-sets');
    const recapTotalPRsEl = document.getElementById('recap-total-prs');
    const recapDistributionChartCanvas = document.getElementById('recap-distribution-chart');
    const recapPRListEl = document.getElementById('recap-pr-list');
    const chartCenterTextEl = document.getElementById('chart-center-text');
    const recapCustomLegendEl = document.getElementById('recap-custom-legend');
    const progressChartModal = document.getElementById('progress-chart-modal');
    const closeProgressChartBtn = document.getElementById('close-progress-chart-btn');
    const progressChartTitle = document.getElementById('progress-chart-title');
    const exerciseProgressChartCanvas = document.getElementById('exercise-progress-chart');
    const libraryFabAction = document.getElementById('library-fab-action');
    const fabLibraryBtn = document.getElementById('fab-library-btn');
    const libraryModalOverlay = document.getElementById('library-modal-overlay');
    const closeLibraryBtn = document.getElementById('close-library-btn');
    const createNewTemplateBtn = document.getElementById('create-new-template-btn');
    const libraryList = document.getElementById('library-list');
    const templateEditorModalOverlay = document.getElementById('template-editor-modal-overlay');
    const closeEditorBtn = document.getElementById('close-editor-btn');
    const templateEditorForm = document.getElementById('template-editor-form');
    const templateNameInput = document.getElementById('template-name-input');
    const templateExerciseList = document.getElementById('template-exercise-list');
    const addExerciseToTemplateBtn = document.getElementById('add-exercise-to-template-btn');

    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');

    Chart.register(ChartDataLabels);
    
    // ===================================================================
    // == LOCAL STORAGE FUNCTIONS ==
    // ===================================================================
    const getWorkouts = () => JSON.parse(localStorage.getItem('workouts')) || {};
    const saveWorkouts = (workouts) => localStorage.setItem('workouts', JSON.stringify(workouts));
    const getCustomExercises = () => JSON.parse(localStorage.getItem('customExercises')) || [];
    const saveCustomExercises = (customExercises) => localStorage.setItem('customExercises', JSON.stringify(customExercises));
    const getUserPrograms = () => JSON.parse(localStorage.getItem('userPrograms')) || [];
    const getUserTemplates = () => JSON.parse(localStorage.getItem('userTemplates')) || [];
    const saveUserTemplates = (templates) => localStorage.setItem('userTemplates', JSON.stringify(templates));
    
    // ===================================================================
    // == FUNGSI-FUNGSI BARU UNTUK "MY LIBRARY" & TEMPLATE ==
    // ===================================================================
    const getShownProgramGuides = () => JSON.parse(localStorage.getItem('shownProgramGuides')) || [];
    const saveShownProgramGuides = (guides) => localStorage.setItem('shownProgramGuides', JSON.stringify(guides));

    // [BARU] Fungsi untuk menampilkan notifikasi toast
    const showToast = (message) => {
    if (!toastNotification || !toastMessage) return;

    // Gunakan innerHTML agar bisa merender style dari <span>
    toastMessage.innerHTML = message; 
    toastNotification.classList.remove('hidden');

    // Beri jeda sesaat agar browser sempat memproses .remove('hidden')
    // sebelum kita memulai transisi animasi. Ini trik standar.
    setTimeout(() => {
        // Trigger animasi masuk (slide down & fade in) dengan menghapus class-nya
        toastNotification.classList.remove('opacity-0', '-translate-y-12');
    }, 50);

    // Atur waktu untuk menyembunyikan toast dengan animasi keluar
    setTimeout(() => {
        // Trigger animasi keluar dengan menambahkan kembali class-nya
        toastNotification.classList.add('opacity-0', '-translate-y-12');
        
        // Sembunyikan elemen sepenuhnya (display: none) setelah transisi selesai
        setTimeout(() => {
            toastNotification.classList.add('hidden');
        }, 500); // Durasi ini (500ms) harus cocok dengan `duration-500` di HTML
    }, 4000); // Total durasi notifikasi tampil di layar
};

    function renderLibraryList() {
    const programIds = getUserPrograms();
    const templates = getUserTemplates();
    libraryList.innerHTML = '';

    if (programIds.length === 0 && templates.length === 0) {
        libraryList.innerHTML = `<p class="text-center text-gray-400 py-8">Your saved programs and templates will appear here.</p>`;
        return;
    }

    // Render program yang dibeli dari data.js
    programIds.forEach(id => {
        const program = programsData.find(p => p.id === id);
        if (program) {
            const programCard = document.createElement('div');
            programCard.className = 'bg-white p-4 rounded-xl border';

            // [BARU] Buat elemen accordion untuk setiap minggu
            let weeksAccordionHTML = '';
            if (program.plan) {
                weeksAccordionHTML = program.plan.map(week => {
                    // Buat tombol "Load" untuk setiap hari latihan di dalam minggu ini
                    const workoutButtonsHTML = week.days
                        .filter(day => day.exercises && day.exercises.length > 0) // Hanya tampilkan hari yang ada latihan
                        .map(day => `
                            <button class="load-program-btn w-full text-left text-sm font-semibold text-pink-600 bg-pink-50 p-3 rounded-lg hover:bg-pink-100 mt-2" 
                                    data-program-id="${id}" 
                                    data-week="${week.week}" 
                                    data-day="${day.day}">
                                Load: ${day.title}
                            </button>
                        `).join('');

                    // Bungkus semuanya dalam tag <details>
                    return `
                        <details class="group">
                            <summary class="flex justify-between items-center cursor-pointer list-none py-2 font-semibold text-gray-700 hover:text-pink-600">
                                Week ${week.week}
                                <svg class="w-4 h-4 transition-transform duration-300 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                            </summary>
                            <div class="pl-2 pt-2 border-l-2 border-pink-100">
                                ${workoutButtonsHTML}
                            </div>
                        </details>
                    `;
                }).join('');
            }
            
            programCard.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-gray-800">${program.title}</h4>
                        <span class="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Program</span>
                    </div>
                    <button class="remove-program-btn p-1 text-gray-400 hover:text-red-500" data-program-id="${id}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
                <div class="mt-3 space-y-1">${weeksAccordionHTML}</div>`;
            libraryList.appendChild(programCard);
        }
    });

        templates.forEach(template => {
            const el = document.createElement('div');
            el.className = 'bg-white p-4 rounded-xl border';
            el.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-gray-800">${template.name}</h4>
                        <span class="text-xs font-semibold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">Template</span>
                    </div>
                    <div class="flex space-x-1">
                        <button class="edit-template-btn p-1 text-gray-400 hover:text-blue-500" data-template-id="${template.id}"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg></button>
                        <button class="delete-template-btn p-1 text-gray-400 hover:text-red-500" data-template-id="${template.id}"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                </div>
                <div class="mt-2 space-y-2">
                    <button class="load-template-btn w-full text-left text-sm font-semibold text-pink-600 bg-pink-50 p-3 rounded-lg hover:bg-pink-100 mt-2" data-template-id="${template.id}">
                        Load Template
                    </button>
                </div>`;
            libraryList.appendChild(el);
        });
    }

    function openTemplateEditor(templateId = null) {
        templateEditorForm.reset();
        currentEditingTemplateId = templateId;

        if (templateId) {
            const templates = getUserTemplates();
            const template = templates.find(t => t.id === templateId);
            if (template) {
                templateNameInput.value = template.name;
                currentTemplateExercises = [...template.exercises];
            }
        } else {
            currentTemplateExercises = [];
        }
        
        renderTemplateEditorExercises();
        templateEditorModalOverlay.classList.remove('hidden');
    }
    
    function closeTemplateEditor() {
        templateEditorModalOverlay.classList.add('hidden');
        currentTemplateExercises = [];
        currentEditingTemplateId = null;
    }

    function renderTemplateEditorExercises() {
        templateExerciseList.innerHTML = '';
        if (currentTemplateExercises.length === 0) {
            templateExerciseList.innerHTML = `<p class="text-center text-gray-400 py-4">No exercises added yet.</p>`;
            return;
        }
        currentTemplateExercises.forEach((exercise, index) => {
            const el = document.createElement('div');
            el.className = 'bg-white p-3 rounded-lg flex justify-between items-center';
            el.innerHTML = `
                <span class="font-semibold text-gray-700">${exercise.name}</span>
                <button type="button" class="remove-exercise-from-template-btn p-1 text-red-500" data-index="${index}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>
            `;
            templateExerciseList.appendChild(el);
        });
    }

    function handleSaveTemplate(e) {
        e.preventDefault();
        const name = templateNameInput.value.trim();
        if (!name || currentTemplateExercises.length === 0) {
            alert('Please provide a name and add at least one exercise.');
            return;
        }

        let templates = getUserTemplates();
        if (currentEditingTemplateId) {
            const templateIndex = templates.findIndex(t => t.id === currentEditingTemplateId);
            if (templateIndex > -1) {
                templates[templateIndex].name = name;
                templates[templateIndex].exercises = currentTemplateExercises;
            }
        } else {
            const newTemplate = {
                id: `template-${Date.now()}`,
                name: name,
                exercises: currentTemplateExercises
            };
            templates.push(newTemplate);
        }
        
        saveUserTemplates(templates);
        closeTemplateEditor();
        renderLibraryList();
    }
    
    function addExerciseToDailyLog(name, categories) {
        const dateKey = toDateKey(currentDate);
        const allWorkouts = getWorkouts();
        if (!allWorkouts[dateKey]) {
            allWorkouts[dateKey] = [];
        }
        const isCardio = categories.includes('Cardio');
        const newSet = isCardio ? { time: '' } : { weight: '', reps: '' };
        allWorkouts[dateKey].push({ name, categories, sets: [newSet] });
        saveWorkouts(allWorkouts);
        renderAll();
        addExerciseModal.classList.add('hidden');
    }

    function addExerciseToTemplate(name, categories) {
        const isCardio = categories.includes('Cardio');
        const newSet = isCardio ? { time: '' } : { weight: '', reps: '' };
        currentTemplateExercises.push({ name, categories, sets: [newSet] });
        renderTemplateEditorExercises();
        addExerciseModal.classList.add('hidden');
        isEditingTemplate = false;
    }
    
    // GANTI FUNGSI LAMA DENGAN VERSI BARU INI
function loadProgramWorkout(programId, weekNum, dayNum) {
    const program = programsData.find(p => p.id === programId);
    if (!program) return;

    const week = program.plan.find(w => w.week == weekNum);
    if (!week) return;

    const day = week.days.find(d => d.day == dayNum);
    if (!day || !day.exercises || day.exercises.length === 0) return;

    const workoutToLoad = day.exercises.map(ex => {
        return {
            name: ex.name,
            categories: exerciseDatabase.find(dbEx => dbEx.name === ex.name)?.categories || [],
            sets: ex.setsReps.startsWith('Follow along') 
                ? [{ time: '' }] 
                : Array(parseInt(ex.setsReps.split(' ')[0])).fill(null).map(() => ({ weight: '', reps: '' }))
        };
    });

    const allWorkouts = getWorkouts();
    const dateKey = toDateKey(currentDate);

    if (allWorkouts[dateKey] && allWorkouts[dateKey].length > 0) {
        if (!confirm('You already have a workout logged for today. Do you want to add these exercises?')) {
            return;
        }
    }
    
    allWorkouts[dateKey] = [...(allWorkouts[dateKey] || []), ...JSON.parse(JSON.stringify(workoutToLoad))];
    saveWorkouts(allWorkouts);
    renderAll();
    libraryModalOverlay.classList.add('hidden');
}

    function loadTemplateWorkout(templateId) {
        const templates = getUserTemplates();
        const template = templates.find(t => t.id === templateId);
        if (!template) return;
        const workoutToLoad = template.exercises;
        const allWorkouts = getWorkouts();
        const dateKey = toDateKey(currentDate);
        allWorkouts[dateKey] = [...(allWorkouts[dateKey] || []), ...JSON.parse(JSON.stringify(workoutToLoad))];
        saveWorkouts(allWorkouts);
        renderAll();
        libraryModalOverlay.classList.add('hidden');
    }

    // Tambahkan fungsi baru ini di workout.js

 function autoLoadWorkoutFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const programId = urlParams.get('programId');
        const weekNum = parseInt(urlParams.get('week'));
        const dayNum = parseInt(urlParams.get('day'));

        if (!programId || !weekNum || !dayNum) {
            return;
        }

        // --- Logika Panduan Pengguna Baru ---
        const shownGuides = getShownProgramGuides();
        if (!shownGuides.includes(programId)) {
            const programName = programsData.find(p => p.id === programId)?.title || 'This program';
            // Tampilkan notifikasi dan arahan HANYA jika panduan untuk program ini BELUM pernah ditampilkan
            showToast(`<span><span class="font-bold text-pink-400">${programName}</span> is now in your Library!</span>`);
            
            mainFabBtn.classList.add('call-to-action-glow');

            // Hentikan animasi saat pengguna berinteraksi dengan tombol FAB
            mainFabBtn.addEventListener('click', () => {
                mainFabBtn.classList.remove('call-to-action-glow');
            }, { once: true }); // Event listener ini hanya akan berjalan sekali

            // Simpan ID program agar panduan tidak muncul lagi
            shownGuides.push(programId);
            saveShownProgramGuides(shownGuides);
        }
        // --- Akhir Logika Panduan ---

        const program = programsData.find(p => p.id === programId);
        if (!program) return;

        const week = program.plan.find(w => w.week === weekNum);
        if (!week) return;

        const day = week.days.find(d => d.day === dayNum);
        if (!day || day.exercises.length === 0) return;

        const workoutToLoad = day.exercises.map(ex => ({
            name: ex.name,
            categories: exerciseDatabase.find(dbEx => dbEx.name === ex.name)?.categories || [],
            sets: ex.setsReps.startsWith('Follow along') 
                ? [{ time: '' }] 
                : Array(parseInt(ex.setsReps.split(' ')[0])).fill(null).map(() => ({ weight: '', reps: '' }))
        }));

        const allWorkouts = getWorkouts();
        const dateKey = toDateKey(new Date()); 
        
        if (allWorkouts[dateKey] && allWorkouts[dateKey].length > 0) {
            if (!confirm('You already have a workout logged for today. Do you want to add exercises from the program?')) {
                // Hapus parameter URL walaupun pengguna membatalkan, agar tidak muncul konfirmasi lagi
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }
        }

        allWorkouts[dateKey] = [...(allWorkouts[dateKey] || []), ...JSON.parse(JSON.stringify(workoutToLoad))];
        saveWorkouts(allWorkouts);

        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // ===================================================================
    // == RENDER & LOGIC FUNCTIONS (MAIN VIEW) ==
    // ===================================================================
    function renderWorkoutLog() {
    const dateKey = toDateKey(currentDate);
    const allWorkouts = getWorkouts();
    const dailyWorkouts = allWorkouts[dateKey] || [];

    workoutListEl.innerHTML = "";
    if (dailyWorkouts.length === 0) {
        workoutListEl.innerHTML = `<div class="flex flex-col items-center justify-center text-center text-gray-500 py-16 px-6 h-full"><svg class="w-16 h-16 text-pink-200 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.024.217 1.464l-.657.98c-.318.476-.945.642-1.464.325l-1.068-.89a.993.993 0 00-1.218 0l-1.068.89c-.519.317-1.146.15-1.464-.325l-.657-.98c-.318-.44-.225-1.095.217-1.464l1.068-.89a.993.993 0 00.405-.864v-.568a3 3 0 013-3c.954 0 1.84.464 2.404 1.224a2.998 2.998 0 01.596 2.776zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><h3 class="font-semibold text-lg text-gray-700">No workout logged</h3><p class="text-sm mt-2 max-w-xs">Tap the <span class="font-bold text-pink-500">+</span> button to add exercises or load one from <span class="font-bold text-pink-500">My Library</span>.</p></div>`;
        return;
    }

    // [BARU] Tambahkan event listener ini
    workoutListEl.addEventListener('blur', (e) => {
        // Cek jika yang kehilangan fokus adalah textarea catatan
        if (e.target.tagName === 'TEXTAREA' && e.target.dataset.type === 'note') {
            renderAll(); // Cukup render ulang, data sudah tersimpan otomatis
        }
    }, true); // Gunakan 'true' untuk event capturing

    dailyWorkouts.forEach((exercise, exerciseIndex) => {
        if (!exercise) return;
        const isCardio = exercise.categories && exercise.categories.includes("Cardio");
        
        const setsHtml = exercise.sets.map((set, setIndex) => {
            if (isCardio) {
                return `<div class="set-row flex items-center space-x-3 text-sm"><span class="set-number-badge">${setIndex + 1}</span><input type="number" value="${set.time || ""}" class="w-full form-input-custom p-2 rounded-lg text-center font-medium" placeholder="minutes" data-type="time" data-ex-index="${exerciseIndex}" data-set-index="${setIndex}"><div class="w-[20px] h-[20px] flex-shrink-0"></div></div>`;
            } else {
                return `<div class="set-row flex items-center space-x-3 text-sm"><span class="set-number-badge">${setIndex + 1}</span><input type="number" value="${set.weight || ""}" class="w-full form-input-custom p-2 rounded-lg text-center font-medium" placeholder="kg" data-type="weight" data-ex-index="${exerciseIndex}" data-set-index="${setIndex}"><span class="text-gray-400 font-sans">×</span><input type="number" value="${set.reps || ""}" class="w-full form-input-custom p-2 rounded-lg text-center font-medium" placeholder="reps" data-type="reps" data-ex-index="${exerciseIndex}" data-set-index="${setIndex}"><button class="delete-set-btn" data-action="delete-set" data-ex-index="${exerciseIndex}" data-set-index="${setIndex}"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div>`;
            }
        }).join("");

        const card = document.createElement("div");
        card.className = "workout-card bg-white rounded-2xl p-5 shadow-lg shadow-pink-500/5 space-y-4";
        
        // ▼▼▼ BAGIAN INI YANG BERUBAH ▼▼▼
        // [MODIFIKASI] Ganti innerHTML untuk card
        card.innerHTML = `
            <div class="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 class="font-bold text-gray-800 text-lg">${exercise.name}</h3>
                <button class="text-xs font-bold text-red-500 hover:text-red-700 tracking-wider" data-action="delete-exercise" data-ex-index="${exerciseIndex}">DELETE</button>
            </div>
            <div class="space-y-3">${setsHtml}</div>
            <div class="pt-2">
                <button class="add-set-btn" data-action="add-set" data-ex-index="${exerciseIndex}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Add Set</span>
                </button>
            </div>
            
            <div class="pt-2 border-t border-gray-100 note-section">
                <div class="note-display ${exercise.note ? '' : 'hidden'}">
                    <p class="text-sm text-gray-700 whitespace-pre-wrap">${exercise.note || ''}</p>
                    <button class="edit-note-btn text-xs font-bold text-pink-500 hover:text-pink-700 mt-2" data-ex-index="${exerciseIndex}">EDIT</button>
                </div>

                <button class="show-note-editor-btn add-set-btn !bg-gray-100 !text-gray-600 !font-medium ${exercise.note ? 'hidden' : ''}" data-ex-index="${exerciseIndex}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z"/></svg>
                    <span>Add Note</span>
                </button>
                
                <textarea class="note-editor hidden w-full form-input-custom p-2 rounded-lg text-sm" 
                          data-type="note" 
                          data-ex-index="${exerciseIndex}"
                          placeholder="e.g., focus on form...">${exercise.note || ''}</textarea>
            </div>
        `;

        workoutListEl.appendChild(card);
    });
    
    initializeDragAndDrop();
}
   function renderDateTimeline() {
    timelineContainer.innerHTML = "";
    monthYearDisplay.textContent = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    
    let startPoint = new Date(currentDate);
    startPoint.setDate(startPoint.getDate() - 3);

    const today = new Date();

    for (let i = 0; i < 7; i++) {
        let day = new Date(startPoint);
        day.setDate(day.getDate() + i);

        const isSelected = day.toDateString() === currentDate.toDateString();
        const isToday = day.toDateString() === today.toDateString();

        const dayEl = document.createElement("button");
        dayEl.className = "flex-shrink-0 flex flex-col items-center justify-center space-y-2 p-2 w-14 transition-colors relative rounded-full";
        
        // [INI PERBAIKANNYA] 'font-black' untuk menebalkan tanggal hari ini
        dayEl.innerHTML = `
            <span class="text-xs font-medium ${isSelected ? "text-gray-900" : "text-gray-400"}">${day.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}</span>
            <span class="${isToday ? 'font-black' : 'font-semibold'} text-lg ${isSelected ? "text-pink-500" : "text-gray-500"}">${day.getDate()}</span>
            <div class="workout-dots flex space-x-1 absolute bottom-0"></div>
        `;
        
        dayEl.addEventListener("click", () => {
            currentDate = day;
            renderAll();
        });
        
        timelineContainer.appendChild(dayEl);
    }
    updateTimelineDots();
}
    function updateTimelineDots(){const allWorkouts=getWorkouts(),timelineButtons=timelineContainer.querySelectorAll("button");let startPoint=new Date(currentDate);startPoint.setDate(startPoint.getDate()-3),timelineButtons.forEach((btn,i)=>{let day=new Date(startPoint);day.setDate(day.getDate()+i);const dateKey=toDateKey(day),dotsContainer=btn.querySelector(".workout-dots");dotsContainer.innerHTML="",allWorkouts[dateKey]&&allWorkouts[dateKey].length>0&&(dotsContainer.innerHTML='<div class="w-1.5 h-1.5 rounded-full bg-pink-500"></div>')})}
    function renderCategories(){if(!categoryContainer) return; const allDbCategories=exerciseDatabase.flatMap(ex=>ex.categories),uniqueCategories=[...new Set(allDbCategories)].sort(),customExercises=getCustomExercises(),allCustomCategories=customExercises.flatMap(ex=>ex.categories),uniqueCustomCategories=[...new Set(allCustomCategories)],categories=["All",...uniqueCategories,...uniqueCustomCategories],finalCategories=[...new Set(categories)];categoryContainer.innerHTML="",finalCategories.forEach(category=>{const btn=document.createElement("button");btn.textContent=category,btn.className="category-btn text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap bg-gray-200 text-gray-700",btn.addEventListener("click",e=>{document.querySelectorAll(".category-btn").forEach(b=>b.classList.remove("bg-pink-500","text-white")),e.currentTarget.classList.add("bg-pink-500","text-white"),renderExerciseList(category,searchInput.value)}),categoryContainer.appendChild(btn)}),categoryContainer.querySelector(".category-btn").classList.add("bg-pink-500","text-white")}
    function renderExerciseList(category="All",searchTerm=""){if(!exerciseListContainer) return; exerciseListContainer.innerHTML="";const lowerCaseSearchTerm=searchTerm.toLowerCase(),allExercises=[...exerciseDatabase,...getCustomExercises()];let filteredExercises=allExercises;if("All"!==category&&(filteredExercises=filteredExercises.filter(ex=>ex.categories.includes(category))),searchTerm&&(filteredExercises=filteredExercises.filter(ex=>ex.name.toLowerCase().includes(lowerCaseSearchTerm))),0===filteredExercises.length)return void(exerciseListContainer.innerHTML='<p class="text-center text-gray-500 mt-8">No exercises found.</p>');filteredExercises.sort((a,b)=>a.name.localeCompare(b.name)).forEach(exercise=>{const item=document.createElement("div");item.className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer",item.innerHTML=`<div><p class="font-semibold text-gray-800">${exercise.name}</p><p class="text-xs text-gray-500">${exercise.categories.join(", ")}</p></div>`,item.addEventListener("click",()=> isEditingTemplate ? addExerciseToTemplate(exercise.name, exercise.categories) : addExerciseToDailyLog(exercise.name, exercise.categories)),exerciseListContainer.appendChild(item)})}
    function populateCategorySelect(){if(customExerciseForm){customExerciseCategorySelect.innerHTML="";const allDbCategories=exerciseDatabase.flatMap(ex=>ex.categories),uniqueCategories=[...new Set(allDbCategories)].sort();uniqueCategories.forEach(cat=>{const option=document.createElement("option");option.value=cat,option.textContent=cat,customExerciseCategorySelect.appendChild(option)})}}
    function handleAddCustomExercise(e){e.preventDefault();const name=customExerciseNameInput.value.trim(),category=customExerciseCategorySelect.value;if(!name||!category)return alert("Please fill out both fields.");{const customExercises=getCustomExercises(),allExercises=[...exerciseDatabase,...customExercises];if(allExercises.some(ex=>ex.name.toLowerCase()===name.toLowerCase()))return alert("An exercise with this name already exists.");customExercises.push({name:name,categories:[category]}),saveCustomExercises(customExercises),customExerciseForm.reset(),mainExerciseSelectionView.classList.remove("hidden"),addCustomExerciseView.classList.add("hidden"),renderCategories(),renderExerciseList(category,""),document.querySelectorAll(".category-btn").forEach(b=>{b.textContent===category&&b.click()})}}
   function handleWorkoutListClick(e) {
    const target = e.target;
    const allWorkouts = getWorkouts();
    const dateKey = toDateKey(currentDate);

    if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target.dataset.type) {
        const exIndex = parseInt(target.dataset.exIndex);
        const type = target.dataset.type;
        if (type === 'note') {
            allWorkouts[dateKey][exIndex].note = target.value;
        } else {
            const setIndex = parseInt(target.dataset.setIndex);
            allWorkouts[dateKey][exIndex].sets[setIndex][type] = target.value;
        }
        saveWorkouts(allWorkouts);
        return;
    }

    const card = target.closest('.workout-card');
    if (card) {
        const showNoteBtn = target.closest('.show-note-editor-btn');
        const editNoteBtn = target.closest('.edit-note-btn');

        if (showNoteBtn || editNoteBtn) {
            card.querySelector('.note-display').classList.add('hidden');
            card.querySelector('.show-note-editor-btn').classList.add('hidden');
            const editor = card.querySelector('.note-editor');
            editor.classList.remove('hidden');
            editor.focus();
            return;
        }
    }

    const button = target.closest("button[data-action]");
    if (button) {
        const action = button.dataset.action;
        const exIndex = parseInt(button.dataset.exIndex);

        if (action === "add-set") {
            const isCardio = allWorkouts[dateKey][exIndex].categories.includes("Cardio");
            allWorkouts[dateKey][exIndex].sets.push(isCardio ? { time: "" } : { weight: "", reps: "" });
        } else if (action === "delete-set") {
            const setIndex = parseInt(button.dataset.setIndex);
            allWorkouts[dateKey][exIndex].sets.splice(setIndex, 1);
        } else if (action === "delete-exercise") {
            allWorkouts[dateKey].splice(exIndex, 1);
            
            if (allWorkouts[dateKey].length === 0) {
                delete allWorkouts[dateKey];
            }
        }
        
        saveWorkouts(allWorkouts);
        renderAll();
    }
}
    // ===================================================================
    // == ANALYTICS & PROGRESS CHART FUNCTIONS ==
    // ===================================================================
    function renderAnalyticsDashboard() { if(!recapView) return; updateRecapUI(); const range = getRecapDateRange(currentDate, currentRecapFilter); const analyticsData = calculateAnalytics(range.start, range.end); if (currentRecapFilter === 'day') { recapDynamicCardTitleEl.textContent = 'Total Reps'; animateCountUp(recapDynamicCardValueEl, analyticsData.totalReps); } else { const title = currentRecapFilter.charAt(0).toUpperCase() + currentRecapFilter.slice(1); recapDynamicCardTitleEl.textContent = `This ${title}'s Sessions`; animateCountUp(recapDynamicCardValueEl, analyticsData.workoutSessions); } animateCountUp(recapTotalMovesEl, analyticsData.totalMoves); animateCountUp(recapTotalSetsEl, analyticsData.totalSets); animateCountUp(recapTotalPRsEl, analyticsData.personalRecords.length); renderPRList(analyticsData.personalRecords); renderDistributionChart(analyticsData.setsByMuscleGroup); }
    function calculateAnalytics(startDate, endDate) { const allWorkouts = getWorkouts(); const analytics = { totalSets: 0, totalReps: 0, workoutSessions: 0, totalMoves: 0, personalRecords: [], setsByMuscleGroup: {}, }; const workoutDays = new Set(); const topLifts = {}; const moves = new Set(); for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) { const dateKey = toDateKey(d); const dailyWorkouts = allWorkouts[dateKey] || []; if (dailyWorkouts.length > 0) { workoutDays.add(dateKey); } dailyWorkouts.forEach(exercise => { if(!exercise) return; moves.add(exercise.name); if (exercise.categories.includes('Cardio')) return; let exerciseTopLift = topLifts[exercise.name] || { weight: 0, reps: 0 }; exercise.sets.forEach(set => { const weight = parseFloat(set.weight) || 0; const reps = parseInt(set.reps) || 0; if (weight > 0 && reps > 0) { analytics.totalSets++; analytics.totalReps += reps; exercise.categories.forEach(cat => { if (cat !== 'Cardio') { analytics.setsByMuscleGroup[cat] = (analytics.setsByMuscleGroup[cat] || 0) + 1; } }); if (weight >= exerciseTopLift.weight) { exerciseTopLift = { weight, reps }; } } }); topLifts[exercise.name] = exerciseTopLift; }); } analytics.workoutSessions = workoutDays.size; analytics.totalMoves = moves.size; analytics.personalRecords = Object.entries(topLifts).filter(([, lift]) => lift.weight > 0).map(([name, lift]) => ({ name, ...lift })); return analytics; }
    function renderPRList(prs) { if(!recapPRListEl) return; recapPRListEl.innerHTML = ''; if (prs.length === 0) { recapPRListEl.innerHTML = `<p class="text-center text-gray-400 py-4">No new PRs in this period.</p>`; return; } prs.sort((a,b) => b.weight - a.weight).forEach(pr => { const item = document.createElement('div'); item.className = 'flex justify-between items-center p-2 -m-2 rounded-lg cursor-pointer hover:bg-gray-100 pr-item-clickable'; item.dataset.exerciseName = pr.name; item.innerHTML = `<span class="font-semibold text-gray-700">${pr.name}</span><span class="font-bold text-pink-500">${pr.weight} kg <span class="font-medium text-gray-400">× ${pr.reps}</span></span>`; recapPRListEl.appendChild(item); }); }
    function renderDistributionChart(setsData) { if(!recapDistributionChartCanvas) return; if (distributionChartInstance) { distributionChartInstance.destroy(); } const sortedData = Object.entries(setsData).sort(([, a], [, b]) => b - a); const labels = sortedData.map(item => item[0]); const data = sortedData.map(item => item[1]); const totalSets = data.reduce((sum, value) => sum + value, 0); const chartColors = ['#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#60a5fa', '#34d399', '#f472b6']; chartCenterTextEl.innerHTML = ''; recapCustomLegendEl.innerHTML = ''; if(data.length === 0) { recapDistributionChartCanvas.style.display = 'none'; if(recapPRListEl) recapPRListEl.innerHTML = `<p class="text-center text-gray-400 py-4">No strength training logged.</p>`; return; } recapDistributionChartCanvas.style.display = 'block'; chartCenterTextEl.innerHTML = `<span class="text-3xl font-bold text-gray-800">${totalSets}</span><span class="text-sm font-medium text-gray-500">Total Sets</span><span class="text-xs text-gray-400 mt-1">${labels.length} groups</span>`; labels.forEach((label, index) => { const color = chartColors[index % chartColors.length]; const value = data[index]; const legendItemHTML = `<div class="flex items-center text-sm"><span class="w-3 h-3 rounded-sm mr-2" style="background-color: ${color};"></span><span class="font-medium text-gray-600">${label}</span><span class="ml-auto pl-2 font-semibold text-gray-800">${value}</span></div>`; recapCustomLegendEl.innerHTML += legendItemHTML; }); distributionChartInstance = new Chart(recapDistributionChartCanvas, { type: 'doughnut', data: { labels: labels, datasets: [{ label: 'Sets', data: data, backgroundColor: chartColors, borderColor: '#f9fafb', borderWidth: 4, hoverOffset: 12 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { const label = context.label || ''; const value = context.raw || 0; return ` ${label}: ${value} sets`; } } }, datalabels: { display: false }, } } }); }
    function updateRecapUI() { const range = getRecapDateRange(currentDate, currentRecapFilter); const formatOptions = { month: 'short', day: 'numeric' }; if (currentRecapFilter === 'day') { recapPeriodDisplay.textContent = range.start.toLocaleDateString('en-US', { ...formatOptions, year: 'numeric' }); } else if (currentRecapFilter === 'month') { recapPeriodDisplay.textContent = range.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); } else { recapPeriodDisplay.textContent = `${range.start.toLocaleDateString('en-US', formatOptions)} - ${range.end.toLocaleDateString('en-US', formatOptions)}`; } document.querySelectorAll('.recap-filter-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`recap-filter-${currentRecapFilter}`).classList.add('active'); }
    function getExerciseHistory(exerciseName) { const allWorkouts = getWorkouts(); const history = []; const endDate = new Date(); const startDate = new Date(); startDate.setDate(endDate.getDate() - 30); for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) { const dateKey = toDateKey(d); const dailyWorkouts = allWorkouts[dateKey] || []; const relevantExercises = dailyWorkouts.filter(ex => ex && ex.name === exerciseName); if (relevantExercises.length > 0) { let maxWeight = 0; relevantExercises.forEach(ex => { ex.sets.forEach(set => { const weight = parseFloat(set.weight) || 0; if (weight > maxWeight) { maxWeight = weight; } }); }); if (maxWeight > 0) { history.push({ date: new Date(d), maxWeight: maxWeight }); } } } return history; }
    function renderProgressChart(exerciseName, historyData) { if(!progressChartModal) return; if (progressChartInstance) { progressChartInstance.destroy(); } progressChartTitle.textContent = `${exerciseName} Progress`; const labels = historyData.map(item => item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })); const data = historyData.map(item => item.maxWeight); progressChartInstance = new Chart(exerciseProgressChartCanvas, { type: 'line', data: { labels: labels, datasets: [{ label: 'Max Weight (kg)', data: data, fill: true, backgroundColor: 'rgba(236, 72, 153, 0.1)', borderColor: '#ec4899', tension: 0.3, pointBackgroundColor: '#ec4899', pointRadius: 4, pointHoverRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } } } }); }

    // ===================================================================
    // == UTILITY & INITIALIZATION ==
    // ===================================================================
    const toDateKey = (date) => date.toISOString().split('T')[0];
    function getRecapDateRange(date, filter) { const d = new Date(date); if (filter === 'day') { return { start: d, end: d }; } if (filter === 'month') { const start = new Date(d.getFullYear(), d.getMonth(), 1); const end = new Date(d.getFullYear(), d.getMonth() + 1, 0); return { start, end }; } const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const start = new Date(d.setDate(diff)); const end = new Date(new Date(start).setDate(start.getDate() + 6)); return { start, end }; }
    function animateCountUp(el, endValue, suffix = '') { if(!el) return; let startValue = 0; const duration = 1200; const startTime = performance.now(); function update(currentTime) { const elapsedTime = currentTime - startTime; if (elapsedTime >= duration) { el.textContent = endValue.toLocaleString() + suffix; return; } const progress = elapsedTime / duration; const easedProgress = 1 - Math.pow(1 - progress, 3); const currentValue = Math.round(easedProgress * endValue); el.textContent = currentValue.toLocaleString() + suffix; requestAnimationFrame(update); } requestAnimationFrame(update); }
    function initializeDragAndDrop() { if(!workoutListEl) return; if (sortableInstance) sortableInstance.destroy(); sortableInstance = new Sortable(workoutListEl, { animation: 150, onEnd: function (evt) { const allWorkouts = getWorkouts(); const dateKey = toDateKey(currentDate); const [movedItem] = allWorkouts[dateKey].splice(evt.oldIndex, 1); allWorkouts[dateKey].splice(evt.newIndex, 0, movedItem); saveWorkouts(allWorkouts); renderAll(); } }); }
    // GANTI SELURUH FUNGSI INI
function initializeCalendar() {
    if (calendarInstance) return;
    calendarInstance = flatpickr(calendarContainer, {
        inline: true,
        defaultDate: currentDate,
        onChange: (selectedDates) => {
            // [INI PERBAIKANNYA] Buat salinan tanggal untuk mencegah bug
            currentDate = new Date(selectedDates[0]); 
            renderAll();
            calendarModalOverlay.classList.add('hidden');
        },
        onDayCreate: (dObj, dStr, fp, dayElem) => {
            const dateKey = toDateKey(dayElem.dateObj);
            const allWorkouts = getWorkouts();
            if (allWorkouts[dateKey] && allWorkouts[dateKey].some(exercise => exercise)) {
                dayElem.innerHTML += '<span class="workout-dot-marker"></span>';
            }
        },
    });
}
    function openCalendarModal() { if (calendarInstance) { calendarInstance.setDate(currentDate, false); } if(calendarModalOverlay) calendarModalOverlay.classList.remove('hidden'); }
    function renderAll() { renderWorkoutLog(); renderDateTimeline(); if (calendarInstance) { calendarInstance.setDate(currentDate, false); } }
    function initializePage() {autoLoadWorkoutFromURL(); renderAll(); renderCategories(); renderExerciseList(); populateCategorySelect(); initializeCalendar(); }

    // ===================================================================
    // == EVENT LISTENERS ==
    // ===================================================================


    if(closeModalBtn) closeModalBtn.addEventListener('click', () => { addExerciseModal.classList.add('hidden'); isEditingTemplate = false; });
    if(customExerciseForm) customExerciseForm.addEventListener('submit', handleAddCustomExercise);
    if(workoutListEl) {
        workoutListEl.addEventListener('input', handleWorkoutListClick);
        workoutListEl.addEventListener('click', handleWorkoutListClick);
    }
    if(monthYearDisplay) monthYearDisplay.addEventListener('click', openCalendarModal);
    if(openCalendarBtn) openCalendarBtn.addEventListener('click', openCalendarModal);
    if(calendarModalOverlay) calendarModalOverlay.addEventListener('click', (e) => { if (e.target === calendarModalOverlay) { calendarModalOverlay.classList.add('hidden'); } });
    
    if(fabLibraryBtn) fabLibraryBtn.addEventListener('click', () => {
        renderLibraryList();
        libraryModalOverlay.classList.remove('hidden');
        toggleFabMenu();
    });
    if(closeLibraryBtn) closeLibraryBtn.addEventListener('click', () => libraryModalOverlay.classList.add('hidden'));
    if(createNewTemplateBtn) createNewTemplateBtn.addEventListener('click', () => {
        libraryModalOverlay.classList.add('hidden');
        openTemplateEditor();
    });
    
    if(closeEditorBtn) closeEditorBtn.addEventListener('click', closeTemplateEditor);
    if(templateEditorForm) templateEditorForm.addEventListener('submit', handleSaveTemplate);
    if(addExerciseToTemplateBtn) addExerciseToTemplateBtn.addEventListener('click', () => {
        isEditingTemplate = true;
        addExerciseModal.classList.remove('hidden');
    });
    
    if(templateExerciseList) templateExerciseList.addEventListener('click', (e) => {
        if (e.target.closest('.remove-exercise-from-template-btn')) {
            const index = parseInt(e.target.closest('.remove-exercise-from-template-btn').dataset.index);
            currentTemplateExercises.splice(index, 1);
            renderTemplateEditorExercises();
        }
    });

    // GANTI BLOK EVENT LISTENER LAMA DENGAN VERSI BARU INI
if(libraryList) libraryList.addEventListener('click', (e) => {
    const loadProgramBtn = e.target.closest('.load-program-btn');
    const loadTemplateBtn = e.target.closest('.load-template-btn');
    const editTemplateBtn = e.target.closest('.edit-template-btn');
    const deleteTemplateBtn = e.target.closest('.delete-template-btn');
    const removeProgramBtn = e.target.closest('.remove-program-btn');

    if (loadProgramBtn) {
        const programId = loadProgramBtn.dataset.programId;
        const week = loadProgramBtn.dataset.week;
        const day = loadProgramBtn.dataset.day;
        loadProgramWorkout(programId, week, day); // Panggil fungsi baru dengan data lengkap
    } else if (loadTemplateBtn) {
        loadTemplateWorkout(loadTemplateBtn.dataset.templateId);
    } else if (editTemplateBtn) {
        libraryModalOverlay.classList.add('hidden');
        openTemplateEditor(editTemplateBtn.dataset.templateId);
    } else if (deleteTemplateBtn) {
        if (confirm('Are you sure you want to delete this template?')) {
            const templates = getUserTemplates();
            const updatedTemplates = templates.filter(t => t.id !== deleteTemplateBtn.dataset.templateId);
            saveUserTemplates(updatedTemplates);
            renderLibraryList();
        }
    } else if (removeProgramBtn) { 
        if (confirm('Are you sure you want to remove this program from your library?')) {
            const programIdToRemove = removeProgramBtn.dataset.programId;
            let savedPrograms = getUserPrograms();
            savedPrograms = savedPrograms.filter(id => id !== programIdToRemove);
            localStorage.setItem('userPrograms', JSON.stringify(savedPrograms)); 
            renderLibraryList();
        }
    }
});

    if(toggleFilterBtn) toggleFilterBtn.addEventListener('click', () => {
        const isExpanded = collapsibleFilterArea.classList.toggle('expanded');
        filterChevronIcon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
    });
    
    const fabActions = [libraryFabAction, recapFabAction, addFabAction];
    function toggleFabMenu() {
        const isOpen = mainFabBtn.classList.toggle('active');
        fabPlusIcon.style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)';
        fabBackdrop.classList.toggle('hidden');
        fabActions.forEach((action, index) => {
            if (action) { // Null check
                if (isOpen) {
                    action.classList.remove('hidden');
                    setTimeout(() => { action.classList.add('visible'); }, 50 * (index + 1));
                } else {
                    action.classList.remove('visible');
                    setTimeout(() => { action.classList.add('hidden'); }, 300);
                }
            }
        });
    }

    if(mainFabBtn) mainFabBtn.addEventListener('click', toggleFabMenu);
    if(fabBackdrop) fabBackdrop.addEventListener('click', toggleFabMenu);
    if(fabAddBtn) fabAddBtn.addEventListener('click', () => { isEditingTemplate = false; addExerciseModal.classList.remove('hidden'); toggleFabMenu(); });
    if(fabRecapBtn) fabRecapBtn.addEventListener('click', () => { appContainer.classList.add('hidden'); recapView.classList.remove('hidden'); renderAnalyticsDashboard(); toggleFabMenu(); });
    
    if(recapView) {
        closeRecapBtn.addEventListener('click', () => { recapView.classList.add('hidden'); appContainer.classList.remove('hidden'); });
        [recapFilterDayBtn, recapFilterWeekBtn, recapFilterMonthBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                currentRecapFilter = btn.id.split('-')[2];
                renderAnalyticsDashboard();
            });
        });
        recapPrevBtn.addEventListener('click', () => {
            if (currentRecapFilter === 'day') currentDate.setDate(currentDate.getDate() - 1);
            if (currentRecapFilter === 'week') currentDate.setDate(currentDate.getDate() - 7);
            if (currentRecapFilter === 'month') currentDate.setMonth(currentDate.getMonth() - 1);
            renderAnalyticsDashboard();
        });
        recapNextBtn.addEventListener('click', () => {
            if (currentRecapFilter === 'day') currentDate.setDate(currentDate.getDate() + 1);
            if (currentRecapFilter === 'week') currentDate.setDate(currentDate.getDate() + 7);
            if (currentRecapFilter === 'month') currentDate.setMonth(currentDate.getMonth() + 1);
            renderAnalyticsDashboard();
        });
        recapPRListEl.addEventListener('click', (e) => {
            const prItem = e.target.closest('.pr-item-clickable');
            if (prItem) {
                const exerciseName = prItem.dataset.exerciseName;
                const history = getExerciseHistory(exerciseName);
                renderProgressChart(exerciseName, history);
                progressChartModal.classList.remove('hidden');
            }
        });
        closeProgressChartBtn.addEventListener('click', () => {
            progressChartModal.classList.add('hidden');
        });
    }

    if (backBtn) { backBtn.addEventListener('click', (e) => { e.preventDefault(); window.history.back(); }); }
    
    if(searchInput) searchInput.addEventListener('input', () => { 
        const activeCategoryBtn = document.querySelector('.category-btn.bg-pink-500'); 
        const category = activeCategoryBtn ? activeCategoryBtn.textContent : 'All'; 
        renderExerciseList(category, searchInput.value); 
    });
    
    if(addCustomExerciseView) {
        showAddCustomFormBtn.addEventListener('click', () => { 
            mainExerciseSelectionView.classList.add('hidden'); 
            addCustomExerciseView.classList.remove('hidden'); 
        });
        showExerciseListViewBtn.addEventListener('click', () => { 
            mainExerciseSelectionView.classList.remove('hidden'); 
            addCustomExerciseView.classList.add('hidden'); 
        });
    }

    // --- START THE APP ---
    initializePage();
});