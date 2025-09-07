document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const form = document.getElementById('program-builder-form');
    
    // Wizard Selectors
    const stepperItems = document.querySelectorAll('.stepper-item');
    const stepContainers = document.querySelectorAll('.wizard-step'); // Fixed selector
    const saveProgramBtnFooter = document.querySelector('footer');
    const step1NextBtn = document.getElementById('step-1-next-btn');
    const programTypeSelector = document.getElementById('program-type-selector');
    const clientSelectorContainer = document.getElementById('client-selector-container');
    const step2BackBtn = document.getElementById('step-2-back-btn');
    const step2NextBtn = document.getElementById('step-2-next-btn');
    const priceContainer = document.getElementById('price-container');
    const step3BackBtn = document.getElementById('step-3-back-btn');

    // Planner Selectors
    const planContainer = document.getElementById('plan-builder-container');
    const addWeekBtn = document.getElementById('add-week-btn');

    // Modal Selectors
    const libraryModal = document.getElementById('exercise-library-modal');
    const closeLibraryBtn = document.getElementById('close-library-btn');
    const libraryListContainer = document.getElementById('exercise-library-list');
    const addSelectedBtn = document.getElementById('add-selected-to-plan-btn');
    const selectedCountEl = document.getElementById('selected-count');
    const searchInput = document.getElementById('search-exercise-input');
    const muscleGroupFilter = document.getElementById('filter-muscle-group');
    const equipmentFilter = document.getElementById('filter-equipment');

    // --- STATE MANAGEMENT ---
    let currentStep = 1;
    let selectedProgramType = null;
    let selectedExercises = new Set();
    let programState = { plan: [] };

    // =======================================================
    // WIZARD LOGIC
    // =======================================================
    const goToStep = (stepNumber) => {
        currentStep = stepNumber;
        stepContainers.forEach(container => container.classList.add('hidden'));
        document.getElementById(`step-${stepNumber}`).classList.remove('hidden');

        stepperItems.forEach((item, index) => {
            item.classList.toggle('active', (index + 1) === stepNumber);
        });

        saveProgramBtnFooter.classList.toggle('hidden', stepNumber !== 3);
    };

    step1NextBtn.addEventListener('click', () => {
        if (!selectedProgramType) return;
        goToStep(2);
    });

    step2BackBtn.addEventListener('click', () => goToStep(1));
    step2NextBtn.addEventListener('click', () => goToStep(3));
    step3BackBtn.addEventListener('click', () => goToStep(2));

    programTypeSelector.addEventListener('click', (e) => {
        const selectedCard = e.target.closest('.type-selector-card');
        if (!selectedCard) return;

        selectedProgramType = selectedCard.dataset.type;
        programState.type = selectedProgramType;

        document.querySelectorAll('.type-selector-card').forEach(card => card.classList.remove('selected'));
        selectedCard.classList.add('selected');

        if (selectedProgramType === 'personalized') {
            clientSelectorContainer.classList.remove('hidden');
            priceContainer.classList.add('hidden');
        } else {
            clientSelectorContainer.classList.add('hidden');
            priceContainer.classList.remove('hidden');
        }
        
        step1NextBtn.disabled = false;
        step1NextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    });

    // =======================================================
    // PLANNER & MODAL LOGIC
    // =======================================================
    const renderPlan = () => {
        planContainer.innerHTML = '';
        if (programState.plan.length === 0) {
            planContainer.innerHTML = '<p class="text-center text-sm text-gray-500 py-4">No weeks added yet.</p>';
        }

        programState.plan.forEach((week, weekIndex) => {
            const weekWrapper = document.createElement('div');
            weekWrapper.className = 'week-container bg-black/5 p-3 rounded-lg';
            
            let daysHTML = '';
            week.days.forEach((day, dayIndex) => {
                let exercisesHTML = '';
                day.exercises.forEach((ex, exIndex) => {
                    exercisesHTML += `
                        <div class="border-t border-white/40 pt-3 mt-3 space-y-2">
                            <div class="flex items-center space-x-2 text-sm">
                                <input type="text" value="${ex.name}" class="form-input p-2 text-xs flex-grow font-medium" readonly>
                                <input type="text" value="${ex.setsReps || ''}" class="form-input p-2 text-xs w-28" placeholder="Sets x Reps" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}" data-field="setsReps">
                                <button type="button" class="remove-exercise-btn text-red-500 hover:text-red-700 p-1" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}">✕</button>
                            </div>
                        </div>
                    `;
                });

                daysHTML += `
                    <div class="day-card bg-white/30 p-3 rounded-md mt-2">
                        <div class="flex justify-between items-center mb-2">
                            <input type="text" value="${day.title || ''}" class="form-input p-1 text-sm font-semibold text-gray-700 w-full" placeholder="Day Title" data-week="${weekIndex}" data-day="${dayIndex}" data-field="title">
                            <button type="button" class="remove-day-btn text-red-500 font-bold ml-2 text-xs" data-week="${weekIndex}" data-day="${dayIndex}">DELETE</button>
                        </div>
                        <div class="space-y-2">${exercisesHTML}</div>
                        <button type="button" class="open-library-btn w-full text-xs text-center border-2 border-dashed border-gray-400/50 text-gray-500 font-semibold p-2 rounded-lg hover:bg-white/50 hover:text-pink-500 hover:border-pink-300 transition-colors mt-3" data-week="${weekIndex}" data-day="${dayIndex}">
                            ⊕ Add Exercise from Library
                        </button>
                    </div>
                `;
            });

            weekWrapper.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold text-gray-800">Week ${weekIndex + 1}</h3>
                    <button type="button" class="remove-week-btn text-red-500 font-bold text-xs" data-week="${weekIndex}">DELETE WEEK</button>
                </div>
                <div class="space-y-2">${daysHTML}</div>
                <button type="button" class="add-day-btn w-full text-xs text-center bg-gray-200/60 text-gray-600 font-semibold p-2 rounded-lg hover:bg-gray-200 mt-3" data-week="${weekIndex}">+ Add Day</button>
            `;
            planContainer.appendChild(weekWrapper);
        });
    };

    const renderLibraryExercises = (exercisesToRender) => {
        libraryListContainer.innerHTML = '';
        if (exercisesToRender.length === 0) {
            libraryListContainer.innerHTML = '<p class="col-span-full text-center text-gray-500">No exercises found.</p>';
            return;
        }
        exercisesToRender.forEach(ex => {
            const isSelected = selectedExercises.has(ex.id);
            const card = document.createElement('div');
            card.className = `exercise-card p-2 border-2 rounded-lg flex flex-col items-center cursor-pointer hover:border-pink-400 transition-colors ${isSelected ? 'border-pink-500 bg-pink-50' : 'border-transparent'}`;
            card.dataset.exerciseId = ex.id;
            card.innerHTML = `<img src="${ex.thumbnailUrl}" alt="${ex.name}" class="w-full h-24 object-cover rounded-md mb-2 pointer-events-none"><p class="text-sm font-semibold text-center text-gray-700 pointer-events-none">${ex.name}</p><span class="text-xs text-gray-400 pointer-events-none">${ex.muscleGroup}</span>`;
            libraryListContainer.appendChild(card);
        });
    };

    const updateLibraryFooter = () => {
        const count = selectedExercises.size;
        selectedCountEl.textContent = `${count} ${count === 1 ? 'exercise' : 'exercises'} selected`;
        addSelectedBtn.disabled = count === 0;
    };

    const applyLibraryFiltersAndRender = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const muscle = muscleGroupFilter.value;
        const equipment = equipmentFilter.value;
        const filteredExercises = exerciseLibraryData.filter(ex => 
            ex.name.toLowerCase().includes(searchTerm) &&
            (muscle === 'all' || ex.muscleGroup === muscle) &&
            (equipment === 'all' || ex.equipment === equipment)
        );
        renderLibraryExercises(filteredExercises);
    };

    addWeekBtn.addEventListener('click', () => {
        programState.plan.push({ week: programState.plan.length + 1, days: [] });
        renderPlan();
    });

    planContainer.addEventListener('click', (e) => {
        const target = e.target;
        const openLibraryButton = target.closest('.open-library-btn');
        if (openLibraryButton) {
            e.preventDefault();
            libraryModal.dataset.currentTargetWeek = openLibraryButton.dataset.week;
            libraryModal.dataset.currentTargetDay = openLibraryButton.dataset.day;
            selectedExercises.clear();
            searchInput.value = '';
            muscleGroupFilter.value = 'all';
            equipmentFilter.value = 'all';
            applyLibraryFiltersAndRender();
            updateLibraryFooter();
            libraryModal.classList.remove('hidden');
            return;
        }
        const weekIndex = parseInt(target.dataset.week);
        const dayIndex = parseInt(target.dataset.day);
        const exIndex = parseInt(target.dataset.ex);
        let stateChanged = false;
        if (target.matches('.remove-week-btn')) {
            programState.plan.splice(weekIndex, 1);
            stateChanged = true;
        } else if (target.matches('.add-day-btn')) {
            programState.plan[weekIndex].days.push({ day: programState.plan[weekIndex].days.length + 1, title: '', exercises: [] });
            stateChanged = true;
        } else if (target.matches('.remove-day-btn')) {
            programState.plan[weekIndex].days.splice(dayIndex, 1);
            stateChanged = true;
        } else if (target.matches('.remove-exercise-btn')) {
            programState.plan[weekIndex].days[dayIndex].exercises.splice(exIndex, 1);
            stateChanged = true;
        }
        if (stateChanged) renderPlan();
    });

    planContainer.addEventListener('input', (e) => {
        const { week, day, ex, field } = e.target.dataset;
        if (week === undefined) return;
        if (ex !== undefined) {
            programState.plan[week].days[day].exercises[ex][field] = e.target.value;
        } else if (day !== undefined) {
            programState.plan[week].days[day][field] = e.target.value;
        }
    });

    closeLibraryBtn.addEventListener('click', () => libraryModal.classList.add('hidden'));
    libraryModal.addEventListener('click', (e) => {
        if (e.target === libraryModal) libraryModal.classList.add('hidden');
    });

    searchInput.addEventListener('input', applyLibraryFiltersAndRender);
    muscleGroupFilter.addEventListener('change', applyLibraryFiltersAndRender);
    equipmentFilter.addEventListener('change', applyLibraryFiltersAndRender);

    libraryListContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.exercise-card');
        if (!card) return;
        const exerciseId = card.dataset.exerciseId;
        if (selectedExercises.has(exerciseId)) {
            selectedExercises.delete(exerciseId);
            card.classList.remove('border-pink-500', 'bg-pink-50');
        } else {
            selectedExercises.add(exerciseId);
            card.classList.add('border-pink-500', 'bg-pink-50');
        }
        updateLibraryFooter();
    });

    addSelectedBtn.addEventListener('click', () => {
        const weekIndex = parseInt(libraryModal.dataset.currentTargetWeek);
        const dayIndex = parseInt(libraryModal.dataset.currentTargetDay);
        if (isNaN(weekIndex) || isNaN(dayIndex)) return;
        const exercisesToAdd = Array.from(selectedExercises).map(exerciseId => {
            const libraryEx = exerciseLibraryData.find(ex => ex.id === exerciseId);
            return { name: libraryEx.name, setsReps: '', videoUrl: libraryEx.videoUrl, notes: '' };
        });
        programState.plan[weekIndex].days[dayIndex].exercises.push(...exercisesToAdd);
        renderPlan();
        libraryModal.classList.add('hidden');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Program Saved!');
    });
    
    // --- INITIALIZATION ---
    goToStep(1);
});