document.addEventListener('DOMContentLoaded', () => {
    
    // --- [BARU] DATABASE PROGRAM ---
    // Menyimpan data di sini lebih baik karena bisa menampung info lebih detail (deskripsi, dll)
    const programsData = [
        {
            id: 'p001',
            title: 'Booty Builder 101',
            author: 'By Jen Selter',
            price: 9,
            equipment: 'minimal',
            image: 'https://placehold.co/400x200/fce7f3/be185d?text=Booty+Builder',
            duration: '4 Weeks',
            description: 'A comprehensive 4-week program designed to build and strengthen your glutes with minimal equipment. Perfect for home workouts.'
        },
        {
            id: 'p002',
            title: 'Functional Full Body',
            author: 'By Dave Spitz',
            price: 15,
            equipment: 'full_gym',
            image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            duration: '6 Weeks',
            description: 'This 6-week program focuses on functional strength, improving your performance in and out of the gym. Requires full gym access.'
        },
        {
            id: 'p003',
            title: 'Morning Yoga Flow',
            author: 'By Chloe Chen',
            price: 18,
            equipment: 'minimal',
            image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            duration: 'Subscription',
            description: 'Start your day with a revitalizing yoga flow. This subscription gives you access to a new session every morning to build flexibility and mindfulness.'
        }
    ];

    // --- ELEMENT SELECTORS (YANG SUDAH ADA) ---
    const programsToggle = document.getElementById('programs-toggle');
    const coachesToggle = document.getElementById('coaches-toggle');
    const searchInput = document.getElementById('search-input');
    const programsView = document.getElementById('programs-view');
    const coachesView = document.getElementById('coaches-view');
    const filterButton = document.getElementById('filter-button');
    const filterPanel = document.getElementById('filter-panel');
    const programFilters = document.getElementById('program-filters-content');
    const coachFilters = document.getElementById('coach-filters-content');
    const applyFilterButton = document.getElementById('apply-filter-button');
    const resetFilterButton = document.getElementById('reset-filter-button');

    // --- [BARU] ELEMENT SELECTORS UNTUK DETAIL VIEW ---
    const mainHeaderArea = document.querySelector('.px-5.pt-6.pb-4');
    const programDetailView = document.getElementById('program-detail-view');
    const programCards = document.querySelectorAll('.program-card');
    const backToMarketBtn = document.getElementById('back-to-market-btn');
    const getProgramBtn = document.getElementById('get-program-btn');
    const detailImg = document.getElementById('detail-img');
    const detailTitle = document.getElementById('detail-title');
    const detailAuthor = document.getElementById('detail-author');
    const detailDuration = document.getElementById('detail-duration');
    const detailEquipment = document.getElementById('detail-equipment');
    const detailPrice = document.getElementById('detail-price');
    const detailDescription = document.getElementById('detail-description');
    
    // State untuk melacak view yang sedang aktif
    let activeView = 'programs';

    // --- [BARU] FUNGSI UNTUK MENAMPILKAN & MENYEMBUNYIKAN DETAIL ---
    const showProgramDetail = (programId) => {
        const program = programsData.find(p => p.id === programId);
        if (!program) return;

        // Populate data
        detailImg.src = program.image;
        detailTitle.textContent = program.title;
        detailAuthor.textContent = program.author;
        detailDuration.textContent = program.duration;
        detailEquipment.textContent = program.equipment.replace('_', ' ');
        detailPrice.textContent = `$${program.price}`;
        detailDescription.textContent = program.description;
        getProgramBtn.dataset.programId = program.id;

        // Sembunyikan semua view utama dan tampilkan detail
        mainHeaderArea.classList.add('hidden');
        programsView.classList.add('hidden');
        coachesView.classList.add('hidden');
        filterPanel.classList.add('hidden');
        programDetailView.classList.remove('hidden');
    };
    
    const showMarketplace = () => {
        // Sembunyikan detail
        programDetailView.classList.add('hidden');
        // Tampilkan kembali view utama
        mainHeaderArea.classList.remove('hidden');
        // Panggil switchView untuk menampilkan kembali view yang terakhir aktif (programs/coaches)
        switchView(activeView); 
    };

    // --- MAIN FUNCTIONS (YANG SUDAH ADA, TIDAK DIUBAH) ---
    const switchView = (view) => {
        activeView = view;
        const isPrograms = view === 'programs';

        programsView.classList.toggle('hidden', !isPrograms);
        coachesView.classList.toggle('hidden', isPrograms);
        programsToggle.classList.toggle('toggle-active', isPrograms);
        coachesToggle.classList.toggle('toggle-active', !isPrograms);
        programFilters.classList.toggle('hidden', !isPrograms);
        coachFilters.classList.toggle('hidden', isPrograms);
        searchInput.placeholder = isPrograms ? "Search for programs..." : "Search for coaches...";
        
        applyFiltersAndSearch();
    };

    const applyFiltersAndSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilters = getActiveFilters();
        const itemsToFilter = activeView === 'programs' 
            ? document.querySelectorAll('#programs-view .program-card') 
            : document.querySelectorAll('#coaches-view .coach-card');

        itemsToFilter.forEach(item => {
            const title = item.querySelector('.card-title').textContent.toLowerCase();
            const matchesSearch = title.includes(searchTerm);
            const matchesFilters = checkItemAgainstFilters(item, activeFilters);
            item.style.display = (matchesSearch && matchesFilters) ? '' : 'none';
        });
    };

    // --- HELPER FUNCTIONS (YANG SUDAH ADA, TIDAK DIUBAH) ---
    const getActiveFilters = () => {
        const visibleFilterPanel = activeView === 'programs' ? programFilters : coachFilters;
        const activeButtons = visibleFilterPanel.querySelectorAll('.filter-option-active');
        const filters = {};
        activeButtons.forEach(button => {
            const type = button.dataset.filterType;
            const value = button.dataset.filterValue;
            if (!filters[type]) {
                filters[type] = [];
            }
            filters[type].push(value);
        });
        return filters;
    };

    const checkItemAgainstFilters = (item, filters) => {
        for (const type in filters) {
            const itemValue = item.dataset[type];
            const filterValues = filters[type];
            if (!itemValue || filterValues.length === 0) continue;
            let matchFound = false;
            if (type === 'price') {
                const price = parseFloat(itemValue);
                if (filterValues.some(range => checkPriceRange(price, range))) {
                    matchFound = true;
                }
            } else if (type === 'rating') {
                const rating = parseFloat(itemValue);
                if (filterValues.some(minRating => rating >= parseFloat(minRating))) {
                    matchFound = true;
                }
            } else {
                if (filterValues.includes(itemValue)) {
                    matchFound = true;
                }
            }
            if (!matchFound) return false;
        }
        return true;
    };

    const checkPriceRange = (price, range) => {
        switch (range) {
            case 'under-10': return price < 10;
            case '10-20': return price >= 10 && price <= 20;
            case 'over-20': return price > 20;
            case 'under-15': return price < 15;
            case '15-30': return price >= 15 && price <= 30;
            case 'over-30': return price > 30;
            default: return false;
        }
    };
    
    // --- EVENT LISTENERS (YANG SUDAH ADA + TAMBAHAN) ---
    if (programsToggle && coachesToggle) {
        programsToggle.addEventListener('click', () => switchView('programs'));
        coachesToggle.addEventListener('click', () => switchView('coaches'));
    }

    if (filterButton) {
        filterButton.addEventListener('click', () => {
            filterPanel.classList.toggle('hidden');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', applyFiltersAndSearch);
    }

    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', () => {
            applyFiltersAndSearch();
            filterPanel.classList.add('hidden');
        });
    }
    
    document.querySelectorAll('.filter-option').forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('filter-option-active');
        });
    });

    if (resetFilterButton) {
        resetFilterButton.addEventListener('click', () => {
            const visibleFilterPanel = activeView === 'programs' ? programFilters : coachFilters;
            visibleFilterPanel.querySelectorAll('.filter-option-active').forEach(button => {
                button.classList.remove('filter-option-active');
            });
            applyFiltersAndSearch();
        });
    }

    // --- [BARU] EVENT LISTENERS UNTUK DETAIL VIEW ---
    programCards.forEach(card => {
        card.addEventListener('click', () => {
            const programId = card.dataset.id;
            showProgramDetail(programId);
        });
    });

    backToMarketBtn.addEventListener('click', showMarketplace);
    
    // GANTI BLOK KODE LAMA INI...
/*
getProgramBtn.addEventListener('click', (e) => {
    const programId = e.currentTarget.dataset.programId;
    alert(`Program ${programId} has been added! (Functionality for Fase 2)`);
});
*/

// ...DENGAN KODE BARU DI BAWAH INI:
getProgramBtn.addEventListener('click', (e) => {
    const programId = e.currentTarget.dataset.programId;
    
    // 1. Ambil data program yang sudah ada dari localStorage
    // Gunakan '[]' sebagai default jika belum ada data sama sekali
    const savedProgramsRaw = localStorage.getItem('userPrograms') || '[]';
    const savedPrograms = JSON.parse(savedProgramsRaw);

    // 2. Cek apakah program ini sudah pernah disimpan
    if (savedPrograms.includes(programId)) {
        alert('You already have this program!');
    } else {
        // 3. Jika belum, tambahkan ID program baru ke dalam array
        savedPrograms.push(programId);
        
        // 4. Simpan kembali array yang sudah diupdate ke localStorage
        localStorage.setItem('userPrograms', JSON.stringify(savedPrograms));
        
        // Beri notifikasi ke pengguna
        alert(`Program has been added to "My Programs"!`);
    }
});
    // --- INITIALIZATION ---
    switchView('programs');
});