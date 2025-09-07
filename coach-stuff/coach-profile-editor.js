// File: coach-profile-editor.js
// Versi Lengkap
document.addEventListener('DOMContentLoaded', () => {
    // --- SIMULASI COACH YANG SEDANG LOGIN ---
    const LOGGED_IN_COACH_ID = 'c001';

    // --- ELEMENT SELECTORS (DENGAN TAMBAHAN) ---
    const form = document.getElementById('profile-editor-form');
    const nameInput = document.getElementById('coach-name');
    const specialtyInput = document.getElementById('coach-specialty');
    const avatarInput = document.getElementById('coach-avatar'); // Input tersembunyi
    const bioInput = document.getElementById('coach-bio');
    const certificationsContainer = document.getElementById('certifications-container');
    const addCertificationBtn = document.getElementById('add-certification-btn');
    const packagesContainer = document.getElementById('packages-container');
    const addPackageBtn = document.getElementById('add-package-btn');

    // [BARU] Elemen untuk avatar visual
    const avatarPreview = document.getElementById('coach-avatar-preview');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    // Tambahkan ini di bagian ELEMENT SELECTORS
    const previewProfileBtn = document.getElementById('preview-profile-btn');
    // --- RENDER FUNCTIONS ---

    const renderCertifications = (certifications = []) => {
        certificationsContainer.innerHTML = '';
        certifications.forEach((cert, index) => {
            const div = document.createElement('div');
            div.className = 'flex items-center space-x-2';
            div.innerHTML = `
                <input type="text" value="${cert}" class="w-full form-input certification-input" placeholder="e.g., NASM Certified">
                <button type="button" class="remove-cert-btn text-red-400 hover:text-red-600 p-1" data-index="${index}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>
            `;
            certificationsContainer.appendChild(div);
        });
    };

    const renderPackages = (packages = []) => {
        packagesContainer.innerHTML = '';
        packages.forEach((pkg, index) => {
            const div = document.createElement('div');
            div.className = 'package-item border border-gray-200 p-4 rounded-lg space-y-3 bg-white/60';
            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <h4 class="font-semibold text-gray-600">Package ${index + 1}</h4>
                     <button type="button" class="remove-pkg-btn text-red-400 hover:text-red-600 p-1" data-index="${index}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
                <input type="text" value="${pkg.title}" class="w-full form-input" data-field="title" placeholder="Package Title">
                <textarea rows="2" class="w-full form-input" data-field="description" placeholder="Package Description...">${pkg.description}</textarea>
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" value="${pkg.price}" class="w-full form-input" data-field="price" placeholder="Price ($)">
                    <select class="w-full form-input" data-field="type">
                        <option value="One-Time" ${pkg.type === 'One-Time' ? 'selected' : ''}>One-Time</option>
                        <option value="Subscription" ${pkg.type === 'Subscription' ? 'selected' : ''}>Subscription</option>
                    </select>
                </div>
            `;
            packagesContainer.appendChild(div);
        });
    };
    
    // --- DATA HANDLING ---

    const loadCoachData = () => {
        // coachesData diambil dari data.js
        const coach = coachesData.find(c => c.id === LOGGED_IN_COACH_ID);
        if (coach) {
            nameInput.value = coach.name;
            specialtyInput.value = coach.specialty;
            avatarInput.value = coach.avatarUrl; // Mengisi input tersembunyi
            avatarPreview.src = coach.avatarUrl; // Menampilkan gambar
            bioInput.value = coach.bio;
            renderCertifications(coach.certifications);
            renderPackages(coach.offerings);
        }
    };
    
    const saveCoachData = (e) => {
        e.preventDefault();
        
        // Temukan index coach di database simulasi
        const coachIndex = coachesData.findIndex(c => c.id === LOGGED_IN_COACH_ID);
        if (coachIndex === -1) {
            alert('Error: Coach not found!');
            return;
        }

        // Kumpulkan semua data dari form
        coachesData[coachIndex].name = nameInput.value;
        coachesData[coachIndex].specialty = specialtyInput.value;
        coachesData[coachIndex].avatarUrl = avatarInput.value; // Data diambil dari input tersembunyi
        coachesData[coachIndex].bio = bioInput.value;
        
        // Kumpulkan sertifikasi
        const certInputs = certificationsContainer.querySelectorAll('.certification-input');
        coachesData[coachIndex].certifications = Array.from(certInputs).map(input => input.value).filter(Boolean);

        // Kumpulkan paket
        const packageItems = packagesContainer.querySelectorAll('.package-item');
        const newPackages = Array.from(packageItems).map(item => ({
            title: item.querySelector('[data-field="title"]').value,
            description: item.querySelector('[data-field="description"]').value,
            price: parseFloat(item.querySelector('[data-field="price"]').value) || 0,
            type: item.querySelector('[data-field="type"]').value,
        }));
        coachesData[coachIndex].offerings = newPackages;

        // Di aplikasi nyata, Anda akan mengirim ini ke server.
        // Di sini, kita bisa simpan ke localStorage jika ingin data persisten,
        // tapi untuk demo, mengubah variabel `coachesData` sudah cukup.
        console.log('Updated coachesData:', coachesData);
        
        alert('Profile saved successfully!');
    };

    // --- EVENT LISTENERS ---

    // Event listener untuk tombol ganti foto
    changePhotoBtn.addEventListener('click', () => {
        const newUrl = prompt('Please enter a new image URL:', avatarInput.value);
        if (newUrl) {
            avatarInput.value = newUrl; // Update input tersembunyi
            avatarPreview.src = newUrl;  // Update gambar yang terlihat
        }
    });

    addCertificationBtn.addEventListener('click', () => {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2';
        div.innerHTML = `
            <input type="text" class="w-full form-input certification-input" placeholder="e.g., NASM Certified">
            <button type="button" class="remove-cert-btn text-red-400 hover:text-red-600 p-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
        `;
        certificationsContainer.appendChild(div);
    });

    certificationsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-cert-btn')) {
            e.target.closest('.flex').remove();
        }
    });
    
    addPackageBtn.addEventListener('click', () => {
        const newPackage = { title: '', description: '', price: '', type: 'One-Time' };
        // Ambil data paket yang ada saat ini dari UI dan tambahkan yang baru
        const currentPackages = Array.from(packagesContainer.querySelectorAll('.package-item')).map(item => ({
            title: item.querySelector('[data-field="title"]').value,
            description: item.querySelector('[data-field="description"]').value,
            price: item.querySelector('[data-field="price"]').value,
            type: item.querySelector('[data-field="type"]').value,
        }));
        renderPackages([...currentPackages, newPackage]);
    });
    
    packagesContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-pkg-btn')) {
            e.target.closest('.package-item').remove();
        }
    });

    // Tambahkan ini di bagian EVENT LISTENERS
previewProfileBtn.addEventListener('click', () => {
    // Ambil ID coach yang sedang login
    const coachId = LOGGED_IN_COACH_ID; 

    // Buat URL untuk halaman pratinjau dengan menyertakan ID coach
    const previewUrl = `../coach-profile.html?id=${coachId}&from=editor`;

    // Buka pratinjau di tab baru agar tidak menutup halaman editor
    window.open(previewUrl, '_blank');
});

    form.addEventListener('submit', saveCoachData);

    // --- INITIALIZATION ---
    loadCoachData();
});