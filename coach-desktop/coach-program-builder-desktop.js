document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    // App Containers
    const startScreen = document.getElementById('start-screen');
    const wizardContainer = document.getElementById('wizard-container');

    // Start Screen
    const createNewBtn = document.getElementById('create-new-btn');
    const templateListContainer = document.getElementById('template-list-container');

    // Wizard
    const stepperItems = document.querySelectorAll('.stepper-item');
    const stepContainers = document.querySelectorAll('.wizard-step');
    const saveProgramBtnFooter = document.querySelector('#wizard-container footer');
    const step1NextBtn = document.getElementById('step-1-next-btn');
    const programTypeSelector = document.getElementById('program-type-selector');
    const clientSelectorContainer = document.getElementById('client-selector-container');
    
    // Step 2 General Selectors
    const step2GeneralBackBtn = document.getElementById('step-2-general-back-btn');
    const step2GeneralNextBtn = document.getElementById('step-2-general-next-btn');
    
    // Step 2 Personalized Selectors
    const step2PersonalizedBackBtn = document.getElementById('step-2-personalized-back-btn');
    const step2PersonalizedNextBtn = document.getElementById('step-2-personalized-next-btn');

    // Step 3
    const step3BackBtn = document.getElementById('step-3-back-btn');
    
    // Back to Start Screen Button
    const backToStartScreenBtn = document.getElementById('back-to-start-screen-btn');

    // Media Inputs (General)
    const imageUploadInput = document.getElementById('program-image-upload');
    const imagePreview = document.getElementById('image-preview');
    const imageUploadLabel = document.querySelector('label[for="program-image-upload"]');
    const videoIntroInput = document.getElementById('program-video-intro');
    const videoInputContainer = document.getElementById('video-input-container');
    const videoPreviewContainer = document.getElementById('video-preview-container');
    const videoThumbnailPreview = document.getElementById('video-thumbnail-preview');
    const removeVideoBtn = document.getElementById('remove-video-btn');

    // Media Inputs (Personalized)
    const videoIntroInputPersonalized = document.getElementById('program-video-intro-personalized');
    const videoInputContainerPersonalized = document.getElementById('video-input-container-personalized');
    const videoPreviewContainerPersonalized = document.getElementById('video-preview-container-personalized');
    const videoThumbnailPreviewPersonalized = document.getElementById('video-thumbnail-preview-personalized');
    const removeVideoBtnPersonalized = document.getElementById('remove-video-btn-personalized');

    // Planner
    const planContainer = document.getElementById('plan-builder-container');
    const addWeekBtn = document.getElementById('add-week-btn');

    // Exercise Library Modal
    const libraryModal = document.getElementById('exercise-library-modal');
    const closeLibraryBtn = document.getElementById('close-library-btn');
    const libraryListContainer = document.getElementById('exercise-library-list');
    const addSelectedBtn = document.getElementById('add-selected-to-plan-btn');
    const selectedCountEl = document.getElementById('selected-count');
    const searchInput = document.getElementById('search-exercise-input');
    const muscleGroupFilter = document.getElementById('filter-muscle-group');
    const equipmentFilter = document.getElementById('filter-equipment');

    // Save Success Modal
    const saveSuccessModal = document.getElementById('save-success-modal');
    const templateNameInput = document.getElementById('template-name-input');
    const saveAsTemplateBtn = document.getElementById('save-as-template-btn');
    const closeSuccessModalBtn = document.getElementById('close-success-modal-btn');
    
    const form = document.getElementById('program-builder-form');

    // --- STATE MANAGEMENT ---
    let currentStep = 1;
    let selectedProgramType = null;
    let selectedExercises = new Set();
    let programState = { plan: [] };

    // =======================================================
    // FUNCTIONS
    // =======================================================

    const goToStep = (step) => {
        currentStep = step;
        stepContainers.forEach(container => container.classList.add('hidden'));
        
        const stepId = `step-${step}`;
        const currentStepContainer = document.getElementById(stepId);
        if (currentStepContainer) {
            currentStepContainer.classList.remove('hidden');
        }

        const stepNumber = parseInt(step.toString().charAt(0));
        stepperItems.forEach((item, index) => {
            item.classList.toggle('active', (index + 1) === stepNumber);
        });
        saveProgramBtnFooter.classList.toggle('hidden', stepNumber !== 3);
    };

    const renderTemplates = () => {
        templateListContainer.innerHTML = '';
        if (typeof programTemplatesData === 'undefined' || programTemplatesData.length === 0) {
            templateListContainer.innerHTML = '<p class="text-center text-sm text-gray-400 py-4">No templates saved yet.</p>';
            return;
        }
        programTemplatesData.forEach((template, index) => {
            const button = document.createElement('button');
            button.className = 'w-full text-left p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors';
            button.textContent = template.name;
            button.dataset.templateIndex = index;
            templateListContainer.appendChild(button);
        });
    };

    const loadFromTemplate = (templateIndex) => {
        const template = programTemplatesData[templateIndex];
        if (!template) return;
        programState = JSON.parse(JSON.stringify(template));
        
        if (programState.type === 'general') {
            document.getElementById('program-title').value = programState.title || '';
            document.getElementById('program-price').value = programState.price || '';
            document.getElementById('program-duration').value = programState.duration || '';
            document.getElementById('program-description').value = programState.description || '';
            if (programState.image) {
                imagePreview.src = programState.image;
                imagePreview.classList.remove('hidden');
                imageUploadLabel.classList.add('hidden');
            }
            if (programState.videoIntroUrl) {
                const videoID = extractYouTubeID(programState.videoIntroUrl);
                if (videoID) {
                    videoThumbnailPreview.src = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
                    videoPreviewContainer.classList.remove('hidden');
                    videoInputContainer.classList.add('hidden');
                }
            }
        } else {
             document.getElementById('program-title-personalized').value = programState.title || '';
             document.getElementById('program-duration-personalized').value = programState.duration || '';
             document.getElementById('program-description-personalized').value = programState.description || '';
             if (programState.videoIntroUrl) {
                const videoID = extractYouTubeID(programState.videoIntroUrl);
                if (videoID) {
                    videoThumbnailPreviewPersonalized.src = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
                    videoPreviewContainerPersonalized.classList.remove('hidden');
                    videoInputContainerPersonalized.classList.add('hidden');
                }
            }
        }
        
        startScreen.classList.add('hidden');
        wizardContainer.classList.remove('hidden');
        goToStep(3);
        renderPlan();
    };

    const renderPlan = () => {
        planContainer.innerHTML = '';
        if (!programState.plan || programState.plan.length === 0) {
            planContainer.innerHTML = '<p class="text-center text-sm text-gray-500 py-4">No weeks added yet. Click "+ Add Week" to start.</p>';
            return;
        }
        programState.plan.forEach((week, weekIndex) => {
            const weekWrapper = document.createElement('div');
            weekWrapper.className = 'week-container bg-black/5 p-3 rounded-lg';
            let daysHTML = '';
            week.days.forEach((day, dayIndex) => {
                let exercisesHTML = '';
                day.exercises.forEach((ex, exIndex) => {
                    const isReadOnly = !ex.isPlaceholder && ex.name !== '';
                    const hasThumbnail = ex.thumbnailUrl && ex.thumbnailUrl !== '';
                    
                    const thumbnailHTML = hasThumbnail 
                        ? `<img src="${ex.thumbnailUrl}" alt="${ex.name}" class="w-20 h-16 object-cover rounded-md border border-gray-200">`
                        : `<div class="w-20 h-16 rounded-md bg-gray-200 flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.55a2 2 0 010 3.98l-4.55 2.55M4 12h8m4-4l-4 4 4 4"></path></svg></div>`;

                    exercisesHTML += `
                        <div class="border-t border-gray-200/60 pt-3 mt-3">
                            <div class="flex items-start space-x-3 text-sm">
                                ${thumbnailHTML}
                                <div class="flex-grow space-y-2">
                                    <input type="text" value="${ex.name}" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}" data-field="name" class="w-full form-input p-2 text-xs font-semibold" ${isReadOnly ? 'readonly' : ''} placeholder="Type exercise name or add from library...">
                                    <div class="flex items-center space-x-2">
                                        <input type="text" value="${ex.setsReps || ''}" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}" data-field="setsReps" class="form-input p-2 text-xs w-full" placeholder="e.g., 3 sets x 12 reps">
                                        <button type="button" class="remove-exercise-btn text-red-500 hover:text-red-700 p-1 flex-shrink-0" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                });
                daysHTML += `
                    <div class="day-card bg-white/30 p-3 rounded-md mt-2">
                        <div class="flex justify-between items-center mb-2">
                            <input type="text" value="${day.title || ''}" class="form-input p-1 text-sm font-semibold text-gray-700 w-full" placeholder="Day Title (e.g., Leg Day)" data-week="${weekIndex}" data-day="${dayIndex}" data-field="title">
                            <button type="button" class="remove-day-btn text-red-500 font-bold ml-2 text-xs" data-week="${weekIndex}" data-day="${dayIndex}">DELETE</button>
                        </div>
                        <div class="space-y-2">${exercisesHTML}</div>
                        <button type="button" class="open-library-btn w-full text-xs text-center border-2 border-dashed border-gray-400/50 text-gray-500 font-semibold p-2 rounded-lg hover:bg-white/50 hover:text-pink-500 hover:border-pink-300 transition-colors mt-3" data-week="${weekIndex}" data-day="${dayIndex}">⊕ Add Exercise from Library</button>
                    </div>`;
            });
            weekWrapper.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold text-gray-800">Week ${weekIndex + 1}</h3>
                    <button type="button" class="remove-week-btn text-red-500 font-bold text-xs" data-week="${weekIndex}">DELETE WEEK</button>
                </div>
                <div class="space-y-2">${daysHTML}</div>
                <button type="button" class="add-day-btn w-full text-xs text-center bg-gray-200/60 text-gray-600 font-semibold p-2 rounded-lg hover:bg-gray-200 mt-3" data-week="${weekIndex}">+ Add Day</button>`;
            planContainer.appendChild(weekWrapper);
        });
    };

    const renderLibraryExercises = (exercisesToRender) => {
        libraryListContainer.innerHTML = '';
        if (!exercisesToRender || exercisesToRender.length === 0) {
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

    const extractYouTubeID = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // =======================================================
    // EVENT HANDLING
    // =======================================================
    createNewBtn.addEventListener('click', () => {
        programState = { plan: [] };
        selectedProgramType = null;
        form.reset();
        
        document.querySelectorAll('.type-selector-card').forEach(card => card.classList.remove('selected'));
        clientSelectorContainer.classList.add('hidden');
        step1NextBtn.disabled = true;
        step1NextBtn.classList.add('opacity-50', 'cursor-not-allowed');
        
        imagePreview.classList.add('hidden');
        imagePreview.src = '';
        imageUploadLabel.classList.remove('hidden');
        
        videoPreviewContainer.classList.add('hidden');
        videoInputContainer.classList.remove('hidden');
        videoIntroInput.value = '';
        videoThumbnailPreview.src = '';

        videoPreviewContainerPersonalized.classList.add('hidden');
        videoInputContainerPersonalized.classList.remove('hidden');
        videoIntroInputPersonalized.value = '';
        videoThumbnailPreviewPersonalized.src = '';

        startScreen.classList.add('hidden');
        wizardContainer.classList.remove('hidden');
        goToStep(1);
        renderPlan();
    });

    templateListContainer.addEventListener('click', (e) => {
        if (e.target.matches('button[data-template-index]')) {
            const index = e.target.dataset.templateIndex;
            loadFromTemplate(index);
        }
    });

    backToStartScreenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        wizardContainer.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });

    step1NextBtn.addEventListener('click', () => {
        if (!selectedProgramType) return;
        goToStep(selectedProgramType === 'general' ? '2-general' : '2-personalized');
    });

    step2GeneralBackBtn.addEventListener('click', () => goToStep(1));
    step2GeneralNextBtn.addEventListener('click', () => goToStep(3));
    step2PersonalizedBackBtn.addEventListener('click', () => goToStep(1));
    step2PersonalizedNextBtn.addEventListener('click', () => goToStep(3));

    step3BackBtn.addEventListener('click', () => {
        goToStep(programState.type === 'general' ? '2-general' : '2-personalized');
    });

    programTypeSelector.addEventListener('click', (e) => {
        const selectedCard = e.target.closest('.type-selector-card');
        if (!selectedCard) return;
        selectedProgramType = selectedCard.dataset.type;
        programState.type = selectedProgramType;
        document.querySelectorAll('.type-selector-card').forEach(card => card.classList.remove('selected'));
        selectedCard.classList.add('selected');
        clientSelectorContainer.classList.toggle('hidden', selectedProgramType !== 'personalized');
        step1NextBtn.disabled = false;
        step1NextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    });
    
    imageUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            programState.image = event.target.result;
            imagePreview.src = event.target.result;
            imagePreview.classList.remove('hidden');
            imageUploadLabel.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    });

    videoIntroInput.addEventListener('input', () => {
        const url = videoIntroInput.value;
        const videoID = extractYouTubeID(url);
        if (videoID) {
            videoThumbnailPreview.src = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
            videoPreviewContainer.classList.remove('hidden');
            videoInputContainer.classList.add('hidden');
            programState.videoIntroUrl = url;
        }
    });

    removeVideoBtn.addEventListener('click', () => {
        videoPreviewContainer.classList.add('hidden');
        videoInputContainer.classList.remove('hidden');
        videoIntroInput.value = '';
        videoThumbnailPreview.src = '';
        programState.videoIntroUrl = '';
    });

    videoIntroInputPersonalized.addEventListener('input', () => {
        const url = videoIntroInputPersonalized.value;
        const videoID = extractYouTubeID(url);
        if (videoID) {
            videoThumbnailPreviewPersonalized.src = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
            videoPreviewContainerPersonalized.classList.remove('hidden');
            videoInputContainerPersonalized.classList.add('hidden');
            programState.videoIntroUrl = url;
        }
    });

    removeVideoBtnPersonalized.addEventListener('click', () => {
        videoPreviewContainerPersonalized.classList.add('hidden');
        videoInputContainerPersonalized.classList.remove('hidden');
        videoIntroInputPersonalized.value = '';
        videoThumbnailPreviewPersonalized.src = '';
        programState.videoIntroUrl = '';
    });

    addWeekBtn.addEventListener('click', () => {
        if (!programState.plan) programState.plan = [];
        programState.plan.push({ week: programState.plan.length + 1, days: [] });
        renderPlan();
    });

    planContainer.addEventListener('click', (e) => {
        const target = e.target;
        let stateChanged = false;

        const openLibraryButton = target.closest('.open-library-btn');
        if (openLibraryButton) {
            e.preventDefault();
            const weekIndex = parseInt(openLibraryButton.dataset.week);
            const dayIndex = parseInt(openLibraryButton.dataset.day);

            const newExercisePlaceholder = {
                name: '',
                setsReps: '',
                thumbnailUrl: '',
                isPlaceholder: true
            };

            programState.plan[weekIndex].days[dayIndex].exercises.push(newExercisePlaceholder);

            const newExerciseIndex = programState.plan[weekIndex].days[dayIndex].exercises.length - 1;

            libraryModal.dataset.currentTargetWeek = weekIndex;
            libraryModal.dataset.currentTargetDay = dayIndex;
            libraryModal.dataset.currentTargetExercise = newExerciseIndex;

            selectedExercises.clear();
            searchInput.value = '';
            muscleGroupFilter.value = 'all';
            equipmentFilter.value = 'all';
            applyLibraryFiltersAndRender();
            updateLibraryFooter();
            libraryModal.classList.remove('hidden');

            renderPlan();
            
            return;
        }

        const weekIndex = parseInt(target.dataset.week);
        const dayIndex = parseInt(target.dataset.day);
        const exIndex = parseInt(target.dataset.ex);
        
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
        
        if (stateChanged) {
            renderPlan();
        }
    });

    planContainer.addEventListener('input', (e) => {
        const { week, day, ex, field } = e.target.dataset;
        if (week === undefined) return;

        const value = e.target.value;

        if (ex !== undefined) {
            const exercise = programState.plan[week].days[day].exercises[ex];
            exercise[field] = value;
            // Jika nama diketik manual, hapus status placeholder agar tidak ditimpa
            if (field === 'name' && value.trim() !== '') {
                delete exercise.isPlaceholder;
            }
        } else if (day !== undefined) {
            programState.plan[week].days[day][field] = value;
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
        const exerciseIndex = parseInt(libraryModal.dataset.currentTargetExercise);

        if (isNaN(weekIndex) || isNaN(dayIndex) || isNaN(exerciseIndex)) {
            alert("Terjadi kesalahan. Tidak ada kartu latihan yang ditargetkan.");
            return;
        }
        
        if (selectedExercises.size === 0) {
            alert("Pilih setidaknya satu latihan dari Pustaka Latihan.");
            return;
        }

        const firstSelectedId = selectedExercises.values().next().value;
        const libraryEx = exerciseLibraryData.find(ex => ex.id === firstSelectedId);
        if (!libraryEx) {
            alert("Latihan yang dipilih tidak ditemukan di data pustaka.");
            return;
        }

        const targetExercise = programState.plan[weekIndex].days[dayIndex].exercises[exerciseIndex];
        const hasCustomName = targetExercise.name.trim() !== '';

        targetExercise.name = hasCustomName ? targetExercise.name : libraryEx.name;
        targetExercise.thumbnailUrl = libraryEx.thumbnailUrl; 
        delete targetExercise.isPlaceholder;

        renderPlan();
        
        libraryModal.classList.add('hidden');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (programState.type === 'general') {
            programState.title = document.getElementById('program-title').value;
            programState.price = document.getElementById('program-price').value;
            programState.duration = document.getElementById('program-duration').value;
            programState.description = document.getElementById('program-description').value;
        } else if (programState.type === 'personalized') {
            programState.title = document.getElementById('program-title-personalized').value;
            programState.price = 0;
            programState.duration = document.getElementById('program-duration-personalized').value;
            programState.description = document.getElementById('program-description-personalized').value;
            programState.image = ''; 
        }
        console.log("Program siap disimpan:", JSON.stringify(programState, null, 2));
        saveSuccessModal.classList.remove('hidden');
    });

    closeSuccessModalBtn.addEventListener('click', () => {
        saveSuccessModal.classList.add('hidden');
        wizardContainer.classList.add('hidden');
        startScreen.classList.remove('hidden');
        renderTemplates();
    });

    saveAsTemplateBtn.addEventListener('click', () => {
        const templateName = templateNameInput.value;
        if (!templateName) {
            alert('Please enter a name for the template.');
            return;
        }
        const newTemplate = { ...programState, name: templateName };
        if (typeof programTemplatesData !== 'undefined') {
            programTemplatesData.push(newTemplate);
        } else {
            window.programTemplatesData = [newTemplate];
        }
        alert(`Template "${templateName}" has been saved!`);
        saveSuccessModal.classList.add('hidden');
        wizardContainer.classList.add('hidden');
        startScreen.classList.remove('hidden');
        renderTemplates();
    });

    // --- INITIALIZATION ---
    renderTemplates();
});