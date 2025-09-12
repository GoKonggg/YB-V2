document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIG & DATA ---
    const COACH_STORAGE_KEY = 'fitcoach_coach_profile_c001';
    // Load data from localStorage if it exists, otherwise use default from data.js
    const savedCoachData = JSON.parse(localStorage.getItem(COACH_STORAGE_KEY));
    let currentCoach = savedCoachData || coachesData.find(c => c.id === 'c001');

    // --- ELEMENT SELECTORS ---
    const form = document.getElementById('profile-editor-form');
    const coachAvatarUpload = document.getElementById('coach-avatar-upload');
    const coachAvatarPreviewEditor = document.getElementById('coach-avatar-preview-editor');
    const coachNameInput = document.getElementById('coach-name');
    const coachSpecialtyInput = document.getElementById('coach-specialty');
    const coachBioInput = document.getElementById('coach-bio');
    const certificationsContainer = document.getElementById('certifications-container');
    const addCertBtn = document.getElementById('add-certification-btn');
    const packagesContainer = document.getElementById('packages-container');
    const addPackageBtn = document.getElementById('add-package-btn');
    const saveToast = document.getElementById('save-toast');

    // Preview Pane Elements
    const previewAvatar = document.getElementById('preview-avatar');
    const previewName = document.getElementById('preview-name');
    const previewSpecialty = document.getElementById('preview-specialty');
    const previewRating = document.getElementById('preview-rating');
    const previewExp = document.getElementById('preview-exp');
    const previewClients = document.getElementById('preview-clients');
    const previewCertCount = document.getElementById('preview-cert-count');
    const previewBio = document.getElementById('preview-bio');
    const previewCertList = document.getElementById('preview-certifications-list');
    const previewPackagesList = document.getElementById('preview-packages-list');
    const previewBookingButtonContainer = document.getElementById('preview-booking-button');
    
    // --- FUNCTIONS ---

    const showSaveToast = () => {
        saveToast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => {
            saveToast.classList.add('translate-y-20', 'opacity-0');
        }, 3000); // Hide after 3 seconds
    };

    const updatePreview = () => {
        // About Me Section
        previewAvatar.src = coachAvatarPreviewEditor.src;
        previewName.textContent = coachNameInput.value || 'Coach Name';
        previewSpecialty.textContent = coachSpecialtyInput.value || 'Specialty';
        previewBio.textContent = coachBioInput.value || 'Your bio will appear here.';
        
        // Stats
        previewRating.textContent = currentCoach.rating || 'No reviews';
        previewExp.textContent = currentCoach.stats.experience || '0';
        previewClients.textContent = currentCoach.stats.clients || '0';

        // Certifications
        const certInputs = certificationsContainer.querySelectorAll('input');
        previewCertList.innerHTML = '';
        let certCount = 0;
        certInputs.forEach(input => {
            const value = input.value.trim();
            if(value !== '') {
                certCount++;
                const certItem = document.createElement('div');
                certItem.className = 'bg-gray-100 rounded-lg p-3 flex items-center text-sm font-medium';
                certItem.innerHTML = `<svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> <span>${value}</span>`;
                previewCertList.appendChild(certItem);
            }
        });
        previewCertCount.textContent = certCount;
        
        // Packages & Booking Button
        const packageItems = packagesContainer.querySelectorAll('.package-item');
        previewPackagesList.innerHTML = '';
        let popularPackage = null;
        packageItems.forEach(pkg => {
            const title = pkg.querySelector('input[data-field="title"]').value;
            const price = pkg.querySelector('input[data-field="price"]').value;
            const desc = pkg.querySelector('textarea[data-field="description"]').value;
            const isPopular = pkg.querySelector('input[data-field="isPopular"]').checked;

            if (isPopular && !popularPackage) {
                popularPackage = { title, price };
            }

            if (title.trim() !== '') {
                const packageCard = document.createElement('div');
                packageCard.className = `border rounded-lg p-3 ${isPopular ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`;
                packageCard.innerHTML = `
                    <div class="flex justify-between items-center">
                        <h4 class="font-bold text-gray-800">${title}</h4>
                        <p class="font-bold text-pink-500 text-lg">$${price || '0'}</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${desc}</p>
                `;
                previewPackagesList.appendChild(packageCard);
            }
        });

        // Update booking button
        if(popularPackage) {
             previewBookingButtonContainer.innerHTML = `<button class="w-full bg-primary-gradient text-white font-bold py-3 rounded-lg shadow-lg">Book ${popularPackage.title} - $${popularPackage.price}</button>`;
        } else {
            previewBookingButtonContainer.innerHTML = `<button class="w-full bg-gray-300 text-gray-600 font-bold py-3 rounded-lg cursor-not-allowed">No Packages Available</button>`;
        }
    };

    const addCertificationInput = (value = '') => {
        const id = `cert-${new Date().getTime()}`;
        const container = document.createElement('div');
        container.className = 'flex items-center space-x-2';
        container.innerHTML = `
            <input type="text" id="${id}" class="w-full form-input certification-input" value="${value}" placeholder="e.g., NASM Certified">
            <button type="button" class="remove-btn text-gray-400 hover:text-red-500 p-1"><svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        `;
        certificationsContainer.appendChild(container);
        container.querySelector('.remove-btn').addEventListener('click', () => { container.remove(); updatePreview(); });
        container.querySelector('input').addEventListener('input', updatePreview);
    };

    const addPackageInput = (pkg = { title: '', price: '', description: '', isPopular: false }) => {
        const idSuffix = new Date().getTime();
        const container = document.createElement('div');
        container.className = 'package-item border border-gray-200 p-4 rounded-lg space-y-3 relative';
        container.innerHTML = `
            <button type="button" class="remove-btn absolute -top-2 -right-2 bg-white rounded-full p-1 text-gray-400 hover:text-red-500 shadow"><svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            <input type="text" class="w-full form-input font-semibold" value="${pkg.title}" placeholder="Package Title" data-field="title">
            <input type="number" class="w-full form-input" value="${pkg.price}" placeholder="Price" data-field="price">
            <textarea rows="2" class="w-full form-input" placeholder="Short description..." data-field="description">${pkg.description}</textarea>
            <div class="flex items-center"><input type="checkbox" id="popular-${idSuffix}" class="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" data-field="isPopular" ${pkg.isPopular ? 'checked' : ''}><label for="popular-${idSuffix}" class="ml-2 block text-sm text-gray-900">Mark as popular</label></div>
        `;
        packagesContainer.appendChild(container);
        container.querySelector('.remove-btn').addEventListener('click', () => { container.remove(); updatePreview(); });
        container.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', updatePreview));
    };

    const populateForm = (coach) => {
        coachAvatarPreviewEditor.src = coach.avatarUrl;
        coachNameInput.value = coach.name;
        coachSpecialtyInput.value = coach.specialty;
        coachBioInput.value = coach.bio;
        
        certificationsContainer.innerHTML = '';
        coach.certifications.forEach(cert => addCertificationInput(cert));
        
        packagesContainer.innerHTML = '';
        coach.offerings.forEach(pkg => addPackageInput(pkg));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        // Collect data from the form
        const updatedData = { ...currentCoach }; // Start with existing data
        updatedData.name = coachNameInput.value;
        updatedData.specialty = coachSpecialtyInput.value;
        updatedData.bio = coachBioInput.value;
        updatedData.avatarUrl = coachAvatarPreviewEditor.src;

        updatedData.certifications = Array.from(certificationsContainer.querySelectorAll('.certification-input')).map(i => i.value).filter(Boolean);

        updatedData.offerings = Array.from(packagesContainer.querySelectorAll('.package-item')).map(pkg => ({
            title: pkg.querySelector('[data-field="title"]').value,
            price: pkg.querySelector('[data-field="price"]').value,
            description: pkg.querySelector('[data-field="description"]').value,
            isPopular: pkg.querySelector('[data-field="isPopular"]').checked,
        }));
        
        // Save to localStorage
        localStorage.setItem(COACH_STORAGE_KEY, JSON.stringify(updatedData));
        currentCoach = updatedData; // Update the in-memory state
        
        showSaveToast();
        console.log('Saved Data:', updatedData);
    };

    // --- INITIALIZATION ---
    populateForm(currentCoach);
    updatePreview();

    // Event Listeners
    [coachNameInput, coachSpecialtyInput, coachBioInput].forEach(input => input.addEventListener('input', updatePreview));
    coachAvatarUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { coachAvatarPreviewEditor.src = e.target.result; updatePreview(); };
            reader.readAsDataURL(file);
        }
    });
    addCertBtn.addEventListener('click', () => addCertificationInput());
    addPackageBtn.addEventListener('click', () => addPackageInput());
    form.addEventListener('submit', handleFormSubmit);
});