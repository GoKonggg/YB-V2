document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENT SELECTORS ---
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

    // State untuk melacak view yang sedang aktif
    let activeView = 'programs';

    // --- MAIN FUNCTIONS ---

    /**
     * Mengganti antara view "Programs" dan "Coaches".
     * @param {string} view - Nama view yang akan diaktifkan ('programs' or 'coaches').
     */
    const switchView = (view) => {
        activeView = view;
        const isPrograms = view === 'programs';

        // Tampilkan/sembunyikan view utama
        programsView.classList.toggle('hidden', !isPrograms);
        coachesView.classList.toggle('hidden', isPrograms);

        // Atur style tombol toggle
        programsToggle.classList.toggle('toggle-active', isPrograms);
        coachesToggle.classList.toggle('toggle-active', !isPrograms);

        // Tampilkan panel filter yang sesuai
        programFilters.classList.toggle('hidden', !isPrograms);
        coachFilters.classList.toggle('hidden', isPrograms);
        
        // Update placeholder di search bar
        searchInput.placeholder = isPrograms ? "Search for programs..." : "Search for coaches...";
        
        // Terapkan filter dan pencarian setiap kali view diganti
        applyFiltersAndSearch();
    };

    /**
     * Fungsi utama yang menjalankan logika filter dan pencarian.
     */
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

            // Tampilkan item jika cocok dengan pencarian DAN filter
            item.style.display = (matchesSearch && matchesFilters) ? '' : 'none';
        });
    };

    // --- HELPER FUNCTIONS ---

    /**
     * Mengumpulkan semua filter yang sedang aktif dari tombol-tombol.
     * @returns {object} Objek yang berisi filter aktif. e.g., { price: ['under-10'], equipment: ['minimal'] }
     */
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

    /**
     * Memeriksa apakah sebuah item (kartu) cocok dengan kriteria filter yang aktif.
     * @param {HTMLElement} item - Elemen kartu program atau coach.
     * @param {object} filters - Objek filter yang aktif.
     * @returns {boolean} - True jika cocok, false jika tidak.
     */
    const checkItemAgainstFilters = (item, filters) => {
        for (const type in filters) {
            const itemValue = item.dataset[type];
            const filterValues = filters[type];

            if (!itemValue || filterValues.length === 0) continue;

            let matchFound = false;
            // Logika spesifik untuk setiap tipe filter
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
            } else { // Untuk filter 'equipment' dan 'specialty'
                if (filterValues.includes(itemValue)) {
                    matchFound = true;
                }
            }

            // Jika ada satu saja tipe filter yang tidak cocok, langsung kembalikan false
            if (!matchFound) return false;
        }
        // Jika item lolos semua pengecekan, kembalikan true
        return true;
    };

    /**
     * Helper untuk memeriksa apakah harga berada dalam rentang yang dipilih.
     * @param {number} price - Harga dari item.
     * @param {string} range - String rentang harga (e.g., 'under-10').
     * @returns {boolean}
     */
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
    
    // --- EVENT LISTENERS ---

    // Toggle antara Programs dan Coaches
    if (programsToggle && coachesToggle) {
        programsToggle.addEventListener('click', () => switchView('programs'));
        coachesToggle.addEventListener('click', () => switchView('coaches'));
    }

    // Tombol untuk membuka/menutup panel filter
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            filterPanel.classList.toggle('hidden');
        });
    }

    // Search bar (real-time search)
    if (searchInput) {
        searchInput.addEventListener('keyup', applyFiltersAndSearch);
    }

    // Tombol "Apply" di panel filter
    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', () => {
            applyFiltersAndSearch();
            filterPanel.classList.add('hidden'); // Sembunyikan panel setelah apply
        });
    }
    
    // Semua tombol pilihan filter
    document.querySelectorAll('.filter-option').forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('filter-option-active');
        });
    });

    // Tombol "Reset"
    if (resetFilterButton) {
        resetFilterButton.addEventListener('click', () => {
            const visibleFilterPanel = activeView === 'programs' ? programFilters : coachFilters;
            visibleFilterPanel.querySelectorAll('.filter-option-active').forEach(button => {
                button.classList.remove('filter-option-active');
            });
            // Terapkan kembali filter (yang sekarang sudah kosong) untuk menampilkan semua item
            applyFiltersAndSearch();
        });
    }

    // --- INITIALIZATION ---
    // Atur tampilan awal saat halaman dimuat
    switchView('programs');
});

