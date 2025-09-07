document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    // App Containers
    const startScreen = document.getElementById('start-screen');
    const wizardContainer = document.getElementById('wizard-container');

    const imageUploadInput = document.getElementById('program-image-upload');
const imagePreview = document.getElementById('image-preview');
const imageUploadLabel = document.querySelector('label[for="program-image-upload"]');
    
    const videoIntroInput = document.getElementById('program-video-intro');
const videoInputContainer = document.getElementById('video-input-container');
const videoPreviewContainer = document.getElementById('video-preview-container');
const videoThumbnailPreview = document.getElementById('video-thumbnail-preview');
const removeVideoBtn = document.getElementById('remove-video-btn');

    // Start Screen
    const createNewBtn = document.getElementById('create-new-btn');
    const templateListContainer = document.getElementById('template-list-container');

    // Wizard
    const stepperItems = document.querySelectorAll('.stepper-item');
    const stepContainers = document.querySelectorAll('.wizard-step');
    const saveProgramBtnFooter = document.querySelector('footer');
    const step1NextBtn = document.getElementById('step-1-next-btn');
    const programTypeSelector = document.getElementById('program-type-selector');
    const clientSelectorContainer = document.getElementById('client-selector-container');
    const step2BackBtn = document.getElementById('step-2-back-btn');
    const step2NextBtn = document.getElementById('step-2-next-btn');
    const priceContainer = document.getElementById('price-container');
    const step3BackBtn = document.getElementById('step-3-back-btn');

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
    // START SCREEN & TEMPLATE LOGIC
    // =======================================================
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

        programState = {
            type: template.type || 'general',
            plan: JSON.parse(JSON.stringify(template.plan))
        };
        
        // Isi form details jika ada di template
        document.getElementById('program-title').value = template.title || '';
        document.getElementById('program-price').value = template.price || '';
        document.getElementById('program-duration').value = template.duration || '';
        document.getElementById('program-description').value = template.description || '';
        document.getElementById('program-image').value = template.image || '';

        startScreen.classList.add('hidden');
        wizardContainer.classList.remove('hidden');
        goToStep(3);
        renderPlan();
    };

    createNewBtn.addEventListener('click', () => {
        programState = { plan: [] };
        selectedProgramType = null;
        
        document.querySelectorAll('.type-selector-card').forEach(card => card.classList.remove('selected'));
        clientSelectorContainer.classList.add('hidden');
        priceContainer.classList.remove('hidden');

        videoPreviewContainer.classList.add('hidden');
    videoInputContainer.classList.remove('hidden');
    videoIntroInput.value = '';
    videoThumbnailPreview.src = '';

        step1NextBtn.disabled = true;
        step1NextBtn.classList.add('opacity-50', 'cursor-not-allowed');
        imagePreview.classList.add('hidden');
    imagePreview.src = '';
    imageUploadLabel.classList.remove('hidden');
        form.reset();

        startScreen.classList.add('hidden');
        wizardContainer.classList.remove('hidden');
        goToStep(1);
    });

    templateListContainer.addEventListener('click', (e) => {
        if (e.target.matches('button[data-template-index]')) {
            const index = e.target.dataset.templateIndex;
            loadFromTemplate(index);
        }
    });

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
    // PLANNER & MODAL LOGIC (Tidak berubah)
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
    
    // ... (Sisa fungsi renderLibraryExercises, updateLibraryFooter, applyLibraryFiltersAndRender, dan event listener lainnya tetap sama persis) ...
    // ... (Mereka sudah benar dan tidak perlu diubah, jadi saya tidak sertakan lagi di sini agar tidak terlalu panjang) ...
    // ... (Namun, di file Anda, pastikan semua fungsi tersebut ADA dan TIDAK DIHAPUS) ...

    // --- FORM SUBMISSION ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Kumpulkan data dari form details
        programState.title = document.getElementById('program-title').value;
        programState.price = document.getElementById('program-price').value;
        programState.duration = document.getElementById('program-duration').value;
        programState.description = document.getElementById('program-description').value;
        programState.image = document.getElementById('program-image').value;

        console.log("Program siap disimpan:", programState);
        saveSuccessModal.classList.remove('hidden');
    });

    closeSuccessModalBtn.addEventListener('click', () => {
        saveSuccessModal.classList.add('hidden');
        wizardContainer.classList.add('hidden');
        startScreen.classList.remove('hidden');
        renderTemplates();
    });

    // [BARU] Event listener untuk menangani file upload dan image preview
imageUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
        return; // Tidak ada file yang dipilih
    }

    // Gunakan FileReader untuk membaca file sebagai Data URL (base64)
    const reader = new FileReader();
    reader.onload = (event) => {
        const imageDataUrl = event.target.result;
        
        // Tampilkan preview gambar
        imagePreview.src = imageDataUrl;
        imagePreview.classList.remove('hidden');

        // Sembunyikan tombol upload
        imageUploadLabel.classList.add('hidden');
        
        // Simpan data gambar (sebagai base64 string) ke state
        programState.image = imageDataUrl;
    };
    
    reader.readAsDataURL(file);
});


addWeekBtn.addEventListener('click', () => {
    programState.plan.push({ week: programState.plan.length + 1, days: [] });
    renderPlan();
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
            // Jika variabelnya belum ada, buat baru
            window.programTemplatesData = [newTemplate];
        }

        console.log("Template Disimpan:", newTemplate);
        alert(`Template "${templateName}" has been saved!`);

        saveSuccessModal.classList.add('hidden');
        wizardContainer.classList.add('hidden');
        startScreen.classList.remove('hidden');
        renderTemplates();
    });

    // [BARU] Fungsi untuk mengambil YouTube ID dari berbagai format URL
const extractYouTubeID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// [BARU] Event listener saat pengguna memasukkan URL video
videoIntroInput.addEventListener('input', () => {
    const url = videoIntroInput.value;
    const videoID = extractYouTubeID(url);

    if (videoID) {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
        
        // Tampilkan preview
        videoThumbnailPreview.src = thumbnailUrl;
        videoPreviewContainer.classList.remove('hidden');
        videoInputContainer.classList.add('hidden');
        
        // Simpan URL ke state
        programState.videoIntroUrl = url;
    }
});

// [BARU] Event listener untuk tombol hapus/ganti video
removeVideoBtn.addEventListener('click', () => {
    // Sembunyikan preview dan tampilkan lagi input
    videoPreviewContainer.classList.add('hidden');
    videoInputContainer.classList.remove('hidden');
    
    // Kosongkan nilai
    videoIntroInput.value = '';
    videoThumbnailPreview.src = '';
    programState.videoIntroUrl = '';
});

    // --- INITIALIZATION ---
    renderTemplates();
});