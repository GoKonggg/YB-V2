document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const startScreen = document.getElementById('start-screen');
    const wizardContainer = document.getElementById('wizard-container');
    const createNewBtn = document.getElementById('create-new-btn');
    const templateListContainer = document.getElementById('template-list-container');
    const stepperItems = document.querySelectorAll('.stepper-item');
    const stepContainers = document.querySelectorAll('.wizard-step');
    const saveProgramBtnFooter = document.querySelector('footer');
    const step1NextBtn = document.getElementById('step-1-next-btn');
    const programTypeSelector = document.getElementById('program-type-selector');
    const clientSelectorContainer = document.getElementById('client-selector-container');
    const step2GeneralBackBtn = document.getElementById('step-2-general-back-btn');
    const step2GeneralNextBtn = document.getElementById('step-2-general-next-btn');
    const step2PersonalizedBackBtn = document.getElementById('step-2-personalized-back-btn');
    const step2PersonalizedNextBtn = document.getElementById('step-2-personalized-next-btn');
    const step3BackBtn = document.getElementById('step-3-back-btn');
    const backToStartScreenBtn = document.getElementById('back-to-start-screen-btn');
    const imageUploadInput = document.getElementById('program-image-upload');
    const imagePreview = document.getElementById('image-preview');
    const imageUploadLabel = document.querySelector('label[for="program-image-upload"]');
    const videoIntroInput = document.getElementById('program-video-intro');
    const videoInputContainer = document.getElementById('video-input-container');
    const videoPreviewContainer = document.getElementById('video-preview-container');
    const videoThumbnailPreview = document.getElementById('video-thumbnail-preview');
    const removeVideoBtn = document.getElementById('remove-video-btn');
    const videoIntroInputPersonalized = document.getElementById('program-video-intro-personalized');
    const videoInputContainerPersonalized = document.getElementById('video-input-container-personalized');
    const videoPreviewContainerPersonalized = document.getElementById('video-preview-container-personalized');
    const videoThumbnailPreviewPersonalized = document.getElementById('video-thumbnail-preview-personalized');
    const removeVideoBtnPersonalized = document.getElementById('remove-video-btn-personalized');
    const planContainer = document.getElementById('plan-builder-container');
    const addWeekBtn = document.getElementById('add-week-btn');
    const libraryModal = document.getElementById('exercise-library-modal');
    const closeLibraryBtn = document.getElementById('close-library-btn');
    const libraryListContainer = document.getElementById('exercise-library-list');
    const addSelectedBtn = document.getElementById('add-selected-to-plan-btn');
    const selectedCountEl = document.getElementById('selected-count');
    const searchInput = document.getElementById('search-exercise-input');
    const muscleGroupFilter = document.getElementById('filter-muscle-group');
    const equipmentFilter = document.getElementById('filter-equipment');
    const saveSuccessModal = document.getElementById('save-success-modal');
    const templateNameInput = document.getElementById('template-name-input');
    const saveAsTemplateBtn = document.getElementById('save-as-template-btn');
    const closeSuccessModalBtn = document.getElementById('close-success-modal-btn');
    const form = document.getElementById('program-builder-form');

    // --- STATE & STORAGE KEYS ---
    const TEMPLATE_STORAGE_KEY = 'fitcoach_program_templates';
    const PROGRAM_STORAGE_KEY = 'fitcoach_saved_programs';
    let currentStep = 1;
    let selectedProgramType = null;
    let selectedExercises = new Set();
    let programState = { plan: [] };
    let activeDayTarget = null;

    // =======================================================
    // FUNCTIONS
    // =======================================================

    const goToStep = (step) => {
        currentStep = step;
        stepContainers.forEach(container => container.classList.add('hidden'));
        document.getElementById(`step-${step}`).classList.remove('hidden');

        const stepNumber = parseInt(step.toString().charAt(0));
        stepperItems.forEach((item, index) => {
            item.classList.toggle('active', (index + 1) === stepNumber);
        });
        saveProgramBtnFooter.classList.toggle('hidden', stepNumber !== 3);
    };

    const loadTemplatesFromLocalStorage = () => {
        const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    };
    
    const saveTemplatesToLocalStorage = (templates) => {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
    };

    const renderTemplates = () => {
        const templates = loadTemplatesFromLocalStorage();
        templateListContainer.innerHTML = '';
        if (templates.length === 0) {
            templateListContainer.innerHTML = '<p class="text-center text-sm text-gray-400 py-4">No templates saved yet.</p>';
            return;
        }
        templates.forEach((template, index) => {
            const button = document.createElement('button');
            button.className = 'w-full text-left p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors';
            button.textContent = template.name;
            button.dataset.templateIndex = index;
            templateListContainer.appendChild(button);
        });
    };

    const loadFromTemplate = (templateIndex) => {
        const templates = loadTemplatesFromLocalStorage();
        const template = templates[templateIndex];
        if (!template) return;
        
        programState = JSON.parse(JSON.stringify(template));
        
        // Populate fields based on type
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
                    const libraryExercise = typeof exerciseLibraryData !== 'undefined' ? exerciseLibraryData.find(libEx => libEx.name === ex.name) : null;
                    const thumbnailUrl = libraryExercise ? libraryExercise.thumbnailUrl : 'https://placehold.co/80x64/e2e8f0/64748b?text=N/A';
                    exercisesHTML += `
                        <div class="border-t border-gray-200/60 pt-3 mt-3">
                            <div class="flex items-start space-x-3 text-sm">
                                <img src="${thumbnailUrl}" alt="${ex.name}" class="w-20 h-16 object-cover rounded-md border border-gray-200 flex-shrink-0">
                                <div class="flex-grow space-y-2">
                                    <p class="w-full form-input p-2 text-xs font-semibold bg-white/50 cursor-default">${ex.name}</p>
                                    <div class="flex items-center space-x-2">
                                        <input type="text" value="${ex.setsReps || ''}" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}" data-field="setsReps" class="form-input p-2 text-xs w-full" placeholder="e.g., 3 sets x 12 reps">
                                        <button type="button" class="remove-exercise-btn text-red-500 hover:text-red-700 p-1 flex-shrink-0" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}">
                                            <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                });
                daysHTML += `
                    <div class="day-card bg-white/30 p-3 rounded-md mt-2">
                        <div class="flex justify-between items-center mb-2">
                            <input type="text" value="${day.title || ''}" class="form-input p-1 text-sm font-semibold text-gray-700 w-full" placeholder="Day ${dayIndex + 1} Title" data-week="${weekIndex}" data-day="${dayIndex}" data-field="title">
                            <button type="button" class="remove-day-btn text-red-500 hover:text-red-700 font-bold ml-2 text-xs px-2" data-week="${weekIndex}" data-day="${dayIndex}">DELETE</button>
                        </div>
                        <div class="space-y-2">${exercisesHTML}</div>
                        <button type="button" class="open-library-btn w-full text-xs text-center border-2 border-dashed border-gray-400/50 text-gray-500 font-semibold p-2 rounded-lg hover:bg-white/50 hover:text-pink-500 hover:border-pink-300 transition-colors mt-3" data-week="${weekIndex}" data-day="${dayIndex}">⊕ Add Exercise</button>
                    </div>`;
            });
            weekWrapper.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold text-gray-800">Week ${weekIndex + 1}</h3>
                    <button type="button" class="remove-week-btn text-red-500 hover:text-red-700 font-bold text-xs" data-week="${weekIndex}">DELETE WEEK</button>
                </div>
                <div class="space-y-2">${daysHTML}</div>
                <button type="button" class="add-day-btn w-full text-xs text-center bg-gray-200/60 text-gray-600 font-semibold p-2 rounded-lg hover:bg-gray-200 mt-3" data-week="${weekIndex}">+ Add Day</button>`;
            planContainer.appendChild(weekWrapper);
        });
    };

    const renderLibraryExercises = (exercisesToRender) => {
        libraryListContainer.innerHTML = '';
        if (typeof exerciseLibraryData === 'undefined' || !exercisesToRender || exercisesToRender.length === 0) {
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
        if (typeof exerciseLibraryData === 'undefined') {
            renderLibraryExercises([]);
            return;
        }
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

    

    const saveAndRedirect = (status) => {
        programState.status = status;
        programState.id = `prog_${new Date().getTime()}`;

        try {
            const savedPrograms = JSON.parse(localStorage.getItem(PROGRAM_STORAGE_KEY)) || [];
            savedPrograms.push(programState);
            localStorage.setItem(PROGRAM_STORAGE_KEY, JSON.stringify(savedPrograms));
            
            // Mengarahkan pengguna ke halaman daftar program setelah berhasil menyimpan
            window.location.href = 'coach-programs.html';
        } catch (error) {
            console.error("Gagal menyimpan program:", error);
            alert("Maaf, terjadi kesalahan saat menyimpan program Anda.");
        }
    };

    saveAsTemplateBtn.addEventListener('click', () => {
        const templateName = templateNameInput.value.trim();
        if (!templateName) {
            alert('Mohon masukkan nama untuk template.');
            return;
        }

        // 1. Simpan sebagai Template
        const newTemplate = { ...programState, name: templateName };
        const templates = JSON.parse(localStorage.getItem(TEMPLATE_STORAGE_KEY)) || [];
        templates.push(newTemplate);
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
        
        alert(`Template "${templateName}" berhasil disimpan!`);

        // 2. Simpan sebagai Program PUBLISHED lalu redirect
        saveAndRedirect('Published'); // Panggil fungsi save & redirect dengan status 'Published'
    });

    
    // ... (sisa event listeners akan ditambahkan di bawah)
    
    // =======================================================
    // EVENT HANDLING
    // =======================================================
    
    // Reset function for new program
    const resetBuilder = () => {
        programState = { plan: [] };
        selectedProgramType = null;
        activeDayTarget = null;
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
    };

    createNewBtn.addEventListener('click', () => {
        resetBuilder();
        startScreen.classList.add('hidden');
        wizardContainer.classList.remove('hidden');
        goToStep(1);
        renderPlan();
    });

    templateListContainer.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-template-index]');
        if (button) {
            const index = button.dataset.templateIndex;
            loadFromTemplate(index);
        }
    });

    backToStartScreenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        wizardContainer.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });

    // Wizard Navigation
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
    
    // Media Upload Handlers
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
        programState.videoIntroUrl = '';
    });

    // Plan Builder Event Listeners
    addWeekBtn.addEventListener('click', () => {
        if (!programState.plan) programState.plan = [];
        programState.plan.push({ days: [] });
        renderPlan();
    });

    planContainer.addEventListener('click', (e) => {
        const target = e.target;
        let stateChanged = false;

        if (target.closest('.open-library-btn')) {
            activeDayTarget = {
                weekIndex: parseInt(target.closest('.open-library-btn').dataset.week),
                dayIndex: parseInt(target.closest('.open-library-btn').dataset.day)
            };
            libraryModal.classList.remove('hidden');
            return;
        }
        if (target.closest('.remove-week-btn')) {
            const weekIndex = parseInt(target.closest('.remove-week-btn').dataset.week);
            programState.plan.splice(weekIndex, 1);
            stateChanged = true;
        } else if (target.closest('.add-day-btn')) {
            const weekIndex = parseInt(target.closest('.add-day-btn').dataset.week);
            programState.plan[weekIndex].days.push({ title: '', exercises: [] });
            stateChanged = true;
        } else if (target.closest('.remove-day-btn')) {
            const weekIndex = parseInt(target.closest('.remove-day-btn').dataset.week);
            const dayIndex = parseInt(target.closest('.remove-day-btn').dataset.day);
            programState.plan[weekIndex].days.splice(dayIndex, 1);
            stateChanged = true;
        } else if (target.closest('.remove-exercise-btn')) {
            const btn = target.closest('.remove-exercise-btn');
            const weekIndex = parseInt(btn.dataset.week);
            const dayIndex = parseInt(btn.dataset.day);
            const exIndex = parseInt(btn.dataset.ex);
            programState.plan[weekIndex].days[dayIndex].exercises.splice(exIndex, 1);
            stateChanged = true;
        }

        if (stateChanged) renderPlan();
    });

    planContainer.addEventListener('input', (e) => {
        const { week, day, ex, field } = e.target.dataset;
        if (week === undefined) return;
        const value = e.target.value;
        if (ex !== undefined) {
            programState.plan[week].days[day].exercises[ex][field] = value;
        } else if (day !== undefined) {
            programState.plan[week].days[day][field] = value;
        }
    });

    // Library Modal Listeners
    closeLibraryBtn.addEventListener('click', () => libraryModal.classList.add('hidden'));
    libraryModal.addEventListener('click', (e) => { if (e.target === libraryModal) libraryModal.classList.add('hidden'); });
    searchInput.addEventListener('input', applyLibraryFiltersAndRender);
    muscleGroupFilter.addEventListener('change', applyLibraryFiltersAndRender);
    equipmentFilter.addEventListener('change', applyLibraryFiltersAndRender);

    libraryListContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.exercise-card');
        if (!card) return;
        const exerciseId = card.dataset.exerciseId;
        if (selectedExercises.has(exerciseId)) {
            selectedExercises.delete(exerciseId);
        } else {
            selectedExercises.add(exerciseId);
        }
        applyLibraryFiltersAndRender(); 
        updateLibraryFooter();
    });

    addSelectedBtn.addEventListener('click', () => {
        if (!activeDayTarget) return;
        const { weekIndex, dayIndex } = activeDayTarget;
        const targetDay = programState.plan[weekIndex]?.days[dayIndex];
        if (!targetDay) return;

        selectedExercises.forEach(exerciseId => {
            const libraryEx = exerciseLibraryData.find(ex => ex.id === exerciseId);
            if (libraryEx) {
                targetDay.exercises.push({
                    name: libraryEx.name,
                    setsReps: ''
                });
            }
        });
        
        renderPlan();
        libraryModal.classList.add('hidden');
        selectedExercises.clear();
        updateLibraryFooter();
    });

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Mengumpulkan data terakhir dari form sebelum menampilkan modal
        if (programState.type === 'general') {
            programState.title = document.getElementById('program-title').value.trim();
            programState.price = document.getElementById('program-price').value;
            programState.duration = document.getElementById('program-duration').value.trim();
            programState.description = document.getElementById('program-description').value.trim();
             // Validasi form general
            if (!programState.title || !programState.duration || !programState.description) {
                alert('Judul, Durasi, dan Deskripsi harus diisi.');
                goToStep('2-general');
                return;
            }
        } else if (programState.type === 'personalized') {
            programState.title = document.getElementById('program-title-personalized').value.trim();
            programState.duration = document.getElementById('program-duration-personalized').value.trim();
            programState.description = document.getElementById('program-description-personalized').value.trim();
            programState.price = 0; 
            programState.image = '';
             // Validasi form personalized
            if (!programState.title || !programState.duration || !programState.description) {
                alert('Judul, Durasi, dan Catatan Program harus diisi.');
                goToStep('2-personalized');
                return;
            }
        }
        
        // Validasi apakah ada latihan
        const hasExercises = programState.plan && programState.plan.some(week => week.days.some(day => day.exercises.length > 0));
        if (!hasExercises) {
            alert('Tidak bisa menyimpan program kosong. Mohon tambahkan setidaknya satu latihan.');
            return;
        }

        saveSuccessModal.classList.remove('hidden');
    });


    // Save Success Modal Listeners
    closeSuccessModalBtn.addEventListener('click', () => {
        saveSuccessModal.classList.add('hidden');
        saveAndRedirect('Draft'); // Panggil fungsi save & redirect dengan status 'Draft'
    });

    saveAsTemplateBtn.addEventListener('click', () => {
        const templateName = templateNameInput.value.trim();
        if (!templateName) {
            alert('Please enter a name for the template.');
            return;
        }
        const newTemplate = { ...programState, name: templateName };
        const templates = loadTemplatesFromLocalStorage();
        templates.push(newTemplate);
        saveTemplatesToLocalStorage(templates);
        
        alert(`Template "${templateName}" has been saved!`);
        saveAndRedirect('Published');
    });

    // --- INITIALIZATION ---
    renderTemplates();
    applyLibraryFiltersAndRender();
});