document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const startScreen = document.getElementById('start-screen');
    const wizardContainer = document.getElementById('wizard-container');
    const createNewBtn = document.getElementById('create-new-btn');
    const templateListContainer = document.getElementById('template-list-container');
    const stepperItems = document.querySelectorAll('.stepper-item');
    const stepContainers = document.querySelectorAll('.wizard-step');
    const step1NextBtn = document.getElementById('step-1-next-btn');
    const programTypeSelector = document.getElementById('program-type-selector');
    const clientSelectorContainer = document.getElementById('client-selector-container');
    const step2GeneralBackBtn = document.getElementById('step-2-general-back-btn');
    const step2GeneralNextBtn = document.getElementById('step-2-general-next-btn');
    const programTitleInput = document.getElementById('program-title');
    const programDescriptionInput = document.getElementById('program-description');
    const step2PersonalizedBackBtn = document.getElementById('step-2-personalized-back-btn');
    const step2PersonalizedNextBtn = document.getElementById('step-2-personalized-next-btn');
    const programTitlePersonalizedInput = document.getElementById('program-title-personalized');
    const programDescriptionPersonalizedInput = document.getElementById('program-description-personalized');
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
    //const addWeekBtn = document.getElementById('add-week-btn');
    const libraryListContainer = document.getElementById('exercise-library-list');
    const addSelectedBtn = document.getElementById('add-selected-to-plan-btn');
    const selectedCountEl = document.getElementById('selected-count');
    const searchInput = document.getElementById('search-exercise-input');
    const muscleGroupFilter = document.getElementById('filter-muscle-group');
    const equipmentFilter = document.getElementById('filter-equipment');
    const libraryModal = document.getElementById('exercise-library-modal');
    const closeLibraryBtn = document.getElementById('close-library-btn');
    const libraryListContainerModal = document.getElementById('exercise-library-list-modal');
    const addSelectedBtnModal = document.getElementById('add-selected-to-plan-btn-modal');
    const selectedCountElModal = document.getElementById('selected-count-modal');
    const searchInputModal = document.getElementById('search-exercise-input-modal');
    const muscleGroupFilterModal = document.getElementById('filter-muscle-group-modal');
    const equipmentFilterModal = document.getElementById('filter-equipment-modal');
    const saveSuccessModal = document.getElementById('save-success-modal');
    const templateNameInput = document.getElementById('template-name-input');
    const saveAsTemplateBtn = document.getElementById('save-as-template-btn');
    const closeSuccessModalBtn = document.getElementById('close-success-modal-btn');
    const form = document.getElementById('program-builder-form');

    // --- STATE MANAGEMENT ---
    let programTemplatesData = [];
    const TEMPLATE_STORAGE_KEY = 'fitcoach_program_templates';
    const PROGRAM_STORAGE_KEY = 'fitcoach_saved_programs';

    let currentStep = 1;
    let selectedProgramType = null;
    let selectedExercises = new Set();
    let programState = { plan: [] };
    let activeDayTarget = null; // <-- VARIABEL BARU UNTUK MELACAK HARI AKTIF

    // =======================================================
    // FUNCTIONS
    // =======================================================

    const saveTemplatesToLocalStorage = () => {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(programTemplatesData));
    };

    const loadTemplatesFromLocalStorage = () => {
        const savedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
        if (savedTemplates) {
            programTemplatesData = JSON.parse(savedTemplates);
        }
    };

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
        const saveProgramBtn = document.getElementById('save-program-btn');
        if (saveProgramBtn) {
            saveProgramBtn.classList.toggle('hidden', stepNumber !== 3);
        }
    };

    const renderTemplates = () => {
        templateListContainer.innerHTML = '';
        if (programTemplatesData.length === 0) {
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
            programTitleInput.value = programState.title || '';
            document.getElementById('program-price').value = programState.price || '';
            document.getElementById('program-duration').value = programState.duration || '';
            programDescriptionInput.value = programState.description || '';
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
            programTitlePersonalizedInput.value = programState.title || '';
            document.getElementById('program-duration-personalized').value = programState.duration || '';
            programDescriptionPersonalizedInput.value = programState.description || '';
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
            planContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500 mb-4">Your plan is empty. Start by adding a week.</p>
                    <button type="button" id="add-initial-week-btn" class="btn-plan btn-plan-primary">
                        + Add First Week
                    </button>
                </div>
            `;
            document.getElementById('add-initial-week-btn').addEventListener('click', () => {
                if (!programState.plan) programState.plan = [];
                programState.plan.push({ days: [] });
                renderPlan();
            });
            return;
        }
    
        programState.plan.forEach((week, weekIndex) => {
            const weekWrapper = document.createElement('div');
            weekWrapper.className = 'plan-week-card p-4 rounded-xl mb-6';
    
            let daysHTML = '';
            week.days.forEach((day, dayIndex) => {
                let exercisesHTML = '';
                day.exercises.forEach((ex, exIndex) => {
                    const hasThumbnail = ex.thumbnailUrl && ex.thumbnailUrl !== '';
                    const thumbnailHTML = hasThumbnail
                        ? `<img src="${ex.thumbnailUrl}" alt="${ex.name}" class="w-20 h-16 object-cover rounded-md border border-gray-200">`
                        : `<div class="w-20 h-16 rounded-md bg-gray-200 flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.55a2 2 0 010 3.98l-4.55 2.55M4 12h8m4-4l-4 4 4 4"></path></svg></div>`;
                    
                    exercisesHTML += `<div class="border-t border-gray-200 pt-3 mt-3">
                        <div class="flex items-start space-x-4">
                            ${thumbnailHTML}
                            <div class="flex-grow space-y-2">
                                <div class="flex justify-between items-start">
                                     <p class="font-semibold text-gray-800">${ex.name}</p>
                                     <button type="button" class="remove-exercise-btn text-gray-400 hover:text-red-500 p-1 flex-shrink-0" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}">
                                        <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                                <input type="text" value="${ex.setsReps || ''}" data-week="${weekIndex}" data-day="${dayIndex}" data-ex="${exIndex}" data-field="setsReps" class="plan-input w-full" placeholder="e.g., 3 sets x 12 reps">
                            </div>
                        </div>
                    </div>`;
                });
    
                const isActive = activeDayTarget && activeDayTarget.weekIndex === weekIndex && activeDayTarget.dayIndex === dayIndex;
                const activeClass = isActive ? 'day-active' : '';
    
                daysHTML += `<div class="day-card p-3 rounded-lg mt-2 ${activeClass} cursor-pointer" data-week="${weekIndex}" data-day="${dayIndex}">
    <div class="flex justify-between items-center mb-3">
        <span class="font-bold text-lg">Day ${dayIndex + 1}</span>
        <div class="flex items-center space-x-2">
            <button type="button" class="duplicate-day-btn btn-plan btn-plan-secondary btn-plan-compact" data-week="${weekIndex}" data-day="${dayIndex}">DUPLICATE</button>
            <button type="button" class="remove-day-btn btn-plan btn-plan-danger btn-plan-compact" data-week="${weekIndex}" data-day="${dayIndex}">DELETE</button>
        </div>
    </div>
                    <input type="text" value="${day.title || ''}" class="plan-input w-full mb-3 font-medium" placeholder="Workout Title (e.g., Leg Day)" data-week="${weekIndex}" data-day="${dayIndex}" data-field="title">
                    <div class="space-y-2">${exercisesHTML}</div>
                    <p class="text-center text-gray-400 text-sm mt-4">Click this card to add an exercise</p>
                </div>`;
            });
    
            weekWrapper.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-bold text-2xl">Week ${weekIndex + 1}</h3>
                    <div class="flex items-center space-x-4">
                        <button type="button" class="duplicate-week-btn btn-plan-text secondary" data-week="${weekIndex}">Duplicate Week</button>
                        <button type="button" class="remove-week-btn btn-plan-text danger" data-week="${weekIndex}">Delete Week</button>
                    </div>
                </div>
                <div class="space-y-2">${daysHTML}</div>
                <button type="button" class="add-day-btn btn-plan btn-plan-primary w-full mt-4" data-week="${weekIndex}">+ Add Day</button>`;
            
            planContainer.appendChild(weekWrapper);
        });
    
        const addWeekButtonHTML = `<button type="button" id="add-week-btn" class="btn-plan btn-plan-secondary w-full mt-4">+ Add Another Week</button>`;
        planContainer.insertAdjacentHTML('beforeend', addWeekButtonHTML);
    
        document.getElementById('add-week-btn').addEventListener('click', () => {
            programState.plan.push({ days: [] });
            renderPlan();
        });
    };
    const renderLibraryExercises = (exercisesToRender, container) => {
        if (typeof exerciseLibraryData === 'undefined') return;
        container.innerHTML = '';
        if (!exercisesToRender || exercisesToRender.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">No exercises found.</p>';
            return;
        }
        exercisesToRender.forEach(ex => {
            const isSelected = selectedExercises.has(ex.id);
            const card = document.createElement('div');
            card.className = `exercise-card p-2 border-2 rounded-lg flex flex-col items-center cursor-pointer hover:border-pink-400 transition-colors ${isSelected ? 'border-pink-500 bg-pink-50' : 'border-transparent'}`;
            card.dataset.exerciseId = ex.id;
            card.innerHTML = `<img src="${ex.thumbnailUrl}" alt="${ex.name}" class="w-full h-24 object-cover rounded-md mb-2 pointer-events-none"><p class="text-sm font-semibold text-center text-gray-700 pointer-events-none">${ex.name}</p><span class="text-xs text-gray-400 pointer-events-none">${ex.muscleGroup}</span>`;
            container.appendChild(card);
        });
    };

    const updateLibraryFooters = () => {
        const count = selectedExercises.size;
        const text = `${count} ${count === 1 ? 'exercise' : 'exercises'} selected`;
        selectedCountEl.textContent = text;
        selectedCountElModal.textContent = text;
        addSelectedBtn.disabled = count === 0;
        addSelectedBtnModal.disabled = count === 0;
    };

    const applyLibraryFiltersAndRender = () => {
        if (typeof exerciseLibraryData === 'undefined') return;
        const searchTerm = searchInput.value.toLowerCase();
        const muscle = muscleGroupFilter.value;
        const equipment = equipmentFilter.value;
        const searchTermModal = searchInputModal.value.toLowerCase();
        const muscleModal = muscleGroupFilterModal.value;
        const equipmentModal = equipmentFilterModal.value;

        const filtered = exerciseLibraryData.filter(ex => ex.name.toLowerCase().includes(searchTerm) && (muscle === 'all' || ex.muscleGroup === muscle) && (equipment === 'all' || ex.equipment === equipment));
        const filteredModal = exerciseLibraryData.filter(ex => ex.name.toLowerCase().includes(searchTermModal) && (muscleModal === 'all' || ex.muscleGroup === muscleModal) && (equipmentModal === 'all' || ex.equipment === equipmentModal));
        
        renderLibraryExercises(filtered, libraryListContainer);
        renderLibraryExercises(filteredModal, libraryListContainerModal);
    };

    const extractYouTubeID = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    
    const handleAddSelectedToPlan = () => {
    if (!activeDayTarget) {
        alert("Please select a day by clicking on a day card first.");
        return;
    }
    const { weekIndex, dayIndex } = activeDayTarget;
    if (selectedExercises.size === 0) {
        return; // Tidak perlu alert, tombolnya sudah disabled
    }

    const targetDay = programState.plan[weekIndex].days[dayIndex];
    
    selectedExercises.forEach(exerciseId => {
        if (typeof exerciseLibraryData === 'undefined') return;
        const libraryEx = exerciseLibraryData.find(ex => ex.id === exerciseId);
        
        // Pastikan libraryEx ditemukan dan salin semua data yang dibutuhkan
        if (libraryEx) {
            targetDay.exercises.push({
                name: libraryEx.name,
                setsReps: '',
                thumbnailUrl: libraryEx.thumbnailUrl || '' // Pastikan thumbnailUrl selalu ada
            });
        }
    });
    
    // Reset dan render ulang
    renderPlan();
    libraryModal.classList.add('hidden');
    selectedExercises.clear();
    applyLibraryFiltersAndRender();
    updateLibraryFooters();
};

    // =======================================================
    // EVENT HANDLING
    // =======================================================
// Mencegah form tersubmit saat menekan Enter di input field
    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName.toLowerCase() !== 'textarea') {
            e.preventDefault();
        }
    });

    createNewBtn.addEventListener('click', () => {
        programState = { plan: [] };
        selectedProgramType = null;
        activeDayTarget = null; // Reset active day
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
    step2PersonalizedBackBtn.addEventListener('click', () => goToStep(1));
    step2GeneralNextBtn.addEventListener('click', () => {
        if (programTitleInput.value.trim() === '' || programDescriptionInput.value.trim() === '') {
            alert('Program Title and Description must be filled out.');
            return;
        }
        goToStep(3);
    });
    step2PersonalizedNextBtn.addEventListener('click', () => {
        if (programTitlePersonalizedInput.value.trim() === '' || programDescriptionPersonalizedInput.value.trim() === '') {
            alert('Program Title and Program Notes must be filled out.');
            return;
        }
        goToStep(3);
    });

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

    // addWeekBtn.addEventListener('click', () => {
    //     if (!programState.plan) programState.plan = [];
    //     programState.plan.push({ days: [] });
    //     renderPlan();
    // });

    planContainer.addEventListener('click', (e) => {
    const target = e.target;
    let stateChanged = false;

    // --- LOGIKA 1: MEMILIH HARI AKTIF & MEMBUKA LIBRARY ---
    // Cek apakah yang diklik adalah kartu hari, TAPI bukan input atau tombol lain di dalamnya.
    const dayCard = target.closest('.day-card');
    if (dayCard && !target.closest('input, button')) {
        e.preventDefault();
        const weekIndex = parseInt(dayCard.dataset.week);
        const dayIndex = parseInt(dayCard.dataset.day);
        
        // Tetapkan hari ini sebagai target aktif untuk penambahan exercise
        activeDayTarget = { weekIndex, dayIndex };
        
        // Render ulang plan untuk menampilkan highlight pada hari yang aktif
        renderPlan();
        
        // Tampilkan library (modal untuk mobile, panel untuk desktop)
        const exercisePanel = document.getElementById('exercise-library-panel');
        if (exercisePanel) {
            exercisePanel.classList.add('flash-active');
            // Hapus class setelah animasi selesai agar bisa berkedip lagi nanti
            setTimeout(() => exercisePanel.classList.remove('flash-active'), 1000);
        }
        libraryModal.classList.remove('hidden');
        
        // Hentikan eksekusi fungsi di sini, karena tujuannya hanya memilih hari
        return; 
    }

    // --- LOGIKA 2: MENANGANI AKSI TOMBOL (DELETE, DUPLICATE, DLL.) ---
    // Baris ini hanya akan dieksekusi jika yang diklik BUKAN background kartu (karena ada 'return' di atas)
    
    // Ambil data index dari elemen yang diklik
    const weekIndex = parseInt(target.dataset.week);
    const dayIndex = parseInt(target.dataset.day);
    const exIndex = parseInt(target.dataset.ex);
    
    // Cek tombol mana yang ditekan
    if (target.matches('.remove-week-btn')) {
        if (confirm(`Are you sure you want to delete Week ${weekIndex + 1}?`)) {
            programState.plan.splice(weekIndex, 1);
            stateChanged = true;
        }
    } else if (target.matches('.duplicate-week-btn')) {
        const weekToDuplicate = JSON.parse(JSON.stringify(programState.plan[weekIndex]));
        programState.plan.splice(weekIndex + 1, 0, weekToDuplicate);
        stateChanged = true;
    } else if (target.matches('.add-day-btn')) {
        programState.plan[weekIndex].days.push({ title: '', exercises: [] });
        stateChanged = true;
    } else if (target.matches('.remove-day-btn')) {
        programState.plan[weekIndex].days.splice(dayIndex, 1);
        stateChanged = true;
    } else if (target.matches('.duplicate-day-btn')) {
        const dayToDuplicate = JSON.parse(JSON.stringify(programState.plan[weekIndex].days[dayIndex]));
        programState.plan[weekIndex].days.splice(dayIndex + 1, 0, dayToDuplicate);
        stateChanged = true;
    } else if (target.closest('.remove-exercise-btn')) {
        // Menggunakan .closest() karena ikon SVG di dalam tombol bisa menjadi target klik
        const button = target.closest('.remove-exercise-btn');
        const weekIdx = parseInt(button.dataset.week);
        const dayIdx = parseInt(button.dataset.day);
        const exIdx = parseInt(button.dataset.ex);
        programState.plan[weekIdx].days[dayIdx].exercises.splice(exIdx, 1);
        stateChanged = true;
    }
    
    // Jika ada perubahan pada state (dihapus/ditambah/diduplikasi), render ulang seluruh plan
    if (stateChanged) {
        renderPlan();
    }
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
    
    [searchInput, searchInputModal].forEach(input => input.addEventListener('input', applyLibraryFiltersAndRender));
    [muscleGroupFilter, muscleGroupFilterModal].forEach(select => select.addEventListener('change', applyLibraryFiltersAndRender));
    [equipmentFilter, equipmentFilterModal].forEach(select => select.addEventListener('change', applyLibraryFiltersAndRender));
    [libraryListContainer, libraryListContainerModal].forEach(container => {
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.exercise-card');
            if (!card) return;
            const exerciseId = card.dataset.exerciseId;
            if (selectedExercises.has(exerciseId)) {
                selectedExercises.delete(exerciseId);
            } else {
                selectedExercises.add(exerciseId);
            }
            applyLibraryFiltersAndRender();
            updateLibraryFooters();
        });
    });

    closeLibraryBtn.addEventListener('click', () => libraryModal.classList.add('hidden'));
    libraryModal.addEventListener('click', (e) => {
        if (e.target === libraryModal) libraryModal.classList.add('hidden');
    });
    
    addSelectedBtn.addEventListener('click', handleAddSelectedToPlan);
    addSelectedBtnModal.addEventListener('click', handleAddSelectedToPlan);

    // GANTI SELURUH FUNGSI INI
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // =======================================================
    // BAGIAN VALIDASI BARU
    // =======================================================

    // 1. Validasi detail program dari Step 2
    if (programState.type === 'general') {
        const title = document.getElementById('program-title').value.trim();
        const description = document.getElementById('program-description').value.trim();
        const price = document.getElementById('program-price').value.trim();
        const duration = document.getElementById('program-duration').value.trim();

        if (!title || !description || !price || !duration) {
            alert('Please go back to Step 2 and fill in all required program details (Title, Price, Duration, Description).');
            // Arahkan pengguna kembali ke step yang bermasalah
            goToStep('2-general');
            return; // Hentikan proses save
        }
    } else if (programState.type === 'personalized') {
        const title = document.getElementById('program-title-personalized').value.trim();
        const description = document.getElementById('program-description-personalized').value.trim();
        const duration = document.getElementById('program-duration-personalized').value.trim();

        if (!title || !description || !duration) {
            alert('Please go back to Step 2 and fill in all required program details (Title, Duration, Notes).');
            // Arahkan pengguna kembali ke step yang bermasalah
            goToStep('2-personalized');
            return; // Hentikan proses save
        }
    }

    // 2. Validasi apakah sudah ada exercise di Step 3
    const hasExercises = programState.plan && programState.plan.some(week => week.days.some(day => day.exercises.length > 0));
    if (!hasExercises) {
        alert('Cannot save an empty program. Please add at least one exercise in Step 3.');
        return; // Hentikan proses save
    }

    // =======================================================
    // LANJUTKAN PROSES SAVE JIKA SEMUA VALIDASI LOLOS
    // =======================================================

    // Ambil data terbaru dari form sebelum menampilkan modal
    if (programState.type === 'general') {
        programState.title = document.getElementById('program-title').value;
        programState.price = document.getElementById('program-price').value;
        programState.duration = document.getElementById('program-duration').value;
        programState.description = document.getElementById('program-description').value;
    } else if (programState.type === 'personalized') {
        programState.title = document.getElementById('program-title-personalized').value;
        programState.duration = document.getElementById('program-duration-personalized').value;
        programState.description = document.getElementById('program-description-personalized').value;
        // Reset data yang tidak relevan untuk personalized
        programState.price = 0; 
        programState.image = ''; 
    }

    // Tampilkan modal konfirmasi save
    saveSuccessModal.classList.remove('hidden');
});

    // --- FUNGSI BARU UNTUK MENYIMPAN DAN REDIRECT ---
    const saveAndRedirect = (status) => {
        // 1. Set status program (Draft atau Published)
        programState.status = status;
        
        // 2. Buat ID unik untuk program
        programState.id = `prog_${new Date().getTime()}`;

        try {
            // 3. Ambil data program yang sudah ada dari localStorage
            const savedPrograms = JSON.parse(localStorage.getItem(PROGRAM_STORAGE_KEY)) || [];
            
            // 4. Tambahkan program baru ke dalam array
            savedPrograms.push(programState);
            
            // 5. Simpan kembali array yang sudah diupdate ke localStorage
            localStorage.setItem(PROGRAM_STORAGE_KEY, JSON.stringify(savedPrograms));
            
            // 6. Redirect ke halaman daftar program
            console.log(`Program saved with status: ${status}. Redirecting...`);
            window.location.href = 'coach-programs-desktop.html';

        } catch (error) {
            console.error("Failed to save program to localStorage:", error);
            alert("Sorry, there was an error saving your program. Please check the console for details.");
        }
    };

    // --- EVENT LISTENER YANG SUDAH DIPERBARUI ---
    closeSuccessModalBtn.addEventListener('click', () => {
        saveSuccessModal.classList.add('hidden');
        // Panggil fungsi baru dengan status 'Draft'
        saveAndRedirect('Draft');
    });

    saveAsTemplateBtn.addEventListener('click', () => {
        const templateName = templateNameInput.value.trim();
        if (!templateName) {
            alert('Please enter a name for the template.');
            return;
        }

        // Simpan sebagai template terlebih dahulu
        const newTemplate = { ...programState, name: templateName };
        programTemplatesData.push(newTemplate);
        saveTemplatesToLocalStorage();
        
        saveSuccessModal.classList.add('hidden');
        alert(`Template "${templateName}" has been saved!`);

        // Panggil fungsi baru dengan status 'Published'
        saveAndRedirect('Published');
    });

    const initializeApp = () => {
        loadTemplatesFromLocalStorage();
        renderTemplates();
        goToStep(1);
        applyLibraryFiltersAndRender();
    };

    initializeApp();
});