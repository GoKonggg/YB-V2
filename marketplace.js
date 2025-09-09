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

    // --- ELEMENT SELECTORS UNTUK DETAIL VIEW ---
    const mainHeaderArea = document.querySelector('.px-5.pt-6.pb-4');
    const programDetailView = document.getElementById('program-detail-view');
    const programCards = document.querySelectorAll('.program-card');
    const backToMarketBtn = document.getElementById('back-to-market-btn');
    const getProgramBtn = document.getElementById('get-program-btn');
    const detailTitle = document.getElementById('detail-title');
    const detailAuthor = document.getElementById('detail-author');
    const detailDuration = document.getElementById('detail-duration');
    const detailEquipment = document.getElementById('detail-equipment');
    const detailPrice = document.getElementById('detail-price');
    const detailDescription = document.getElementById('detail-description');
    const detailVideo = document.getElementById('detail-video');
    const detailFrequency = document.getElementById('detail-frequency');
    const detailGoals = document.getElementById('detail-goals');
    const detailSuitableFor = document.getElementById('detail-suitable-for');
    const detailPurchaseCount = document.getElementById('detail-purchase-count');
    const ownedProgramActions = document.getElementById('owned-program-actions');

    // --- [BARU] ELEMENT SELECTOR UNTUK TOAST NOTIFICATION ---
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');

    let activeView = 'programs';

    // --- [BARU] FUNGSI UNTUK MENAMPILKAN NOTIFIKASI TOAST ---
    const showToast = (message) => {
        toastMessage.textContent = message;
        toastNotification.classList.remove('hidden');

        // Sembunyikan toast setelah 3 detik
        setTimeout(() => {
            toastNotification.classList.add('hidden');
        }, 3000);
    };

    const showProgramDetail = (programId) => {
        const program = programsData.find(p => p.id === programId);
        if (!program) return;

        detailTitle.textContent = program.title;
        detailAuthor.textContent = program.author;
        detailDuration.textContent = program.duration;
        detailEquipment.textContent = program.equipment.replace('_', ' ');
        detailPrice.textContent = `$${program.price}`;
        detailDescription.textContent = program.description;
        getProgramBtn.dataset.programId = program.id;
        detailVideo.src = program.videoUrl;
        detailFrequency.textContent = program.frequency;
        detailGoals.textContent = program.goals;
        detailSuitableFor.textContent = program.suitableFor;
        detailPurchaseCount.textContent = program.purchaseCount;

        const includesList = document.getElementById('detail-includes-list');
        includesList.innerHTML = '';

        const iconMap = {
            'Workout Program': '<svg class="w-5 h-5 text-fuchsia-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>',
            'Video Guides': '<svg class="w-5 h-5 text-fuchsia-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>',
            'Community Group': '<svg class="w-5 h-5 text-fuchsia-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>'
        };

        if (program.includes && program.includes.length > 0) {
            program.includes.forEach(item => {
                const listItem = document.createElement('div');
                listItem.className = 'flex items-center space-x-3';
                listItem.innerHTML = `
                    <div class="bg-fuchsia-100 p-2 rounded-full">${iconMap[item] || ''}</div>
                    <span class="text-slate-700 font-medium">${item}</span>
                `;
                includesList.appendChild(listItem);
            });
        }

        const savedPrograms = JSON.parse(localStorage.getItem('userPrograms') || '[]');
        if (savedPrograms.includes(programId)) {
            getProgramBtn.classList.add('hidden');
            ownedProgramActions.classList.remove('hidden');
            document.getElementById('start-workout-btn').href = `program-view.html?id=${programId}`;
        } else {
            getProgramBtn.classList.remove('hidden');
            ownedProgramActions.classList.add('hidden');
        }

        mainHeaderArea.classList.add('hidden');
        programsView.classList.add('hidden');
        coachesView.classList.add('hidden');
        filterPanel.classList.add('hidden');
        programDetailView.classList.remove('hidden');
    };

    const showMarketplace = () => {
        programDetailView.classList.add('hidden');
        mainHeaderArea.classList.remove('hidden');
        switchView(activeView);
    };

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
        const itemsToFilter = activeView === 'programs' ?
            document.querySelectorAll('#programs-view .program-card') :
            document.querySelectorAll('#coaches-view .coach-card');

        itemsToFilter.forEach(item => {
            const title = item.querySelector('.card-title').textContent.toLowerCase();
            const matchesSearch = title.includes(searchTerm);
            const matchesFilters = checkItemAgainstFilters(item, activeFilters);
            item.style.display = (matchesSearch && matchesFilters) ? '' : 'none';
        });
    };

    const getActiveFilters = () => {
        const visibleFilterPanel = activeView === 'programs' ? programFilters : coachFilters;
        const activeButtons = visibleFilterPanel.querySelectorAll('.filter-option-active');
        const filters = {};
        activeButtons.forEach(button => {
            const type = button.dataset.filterType;
            const value = button.dataset.filterValue;
            if (!filters[type]) filters[type] = [];
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

    // --- EVENT LISTENERS ---
    if (programsToggle && coachesToggle) {
        programsToggle.addEventListener('click', () => switchView('programs'));
        coachesToggle.addEventListener('click', () => switchView('coaches'));
    }

    if (filterButton) {
        filterButton.addEventListener('click', () => filterPanel.classList.toggle('hidden'));
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
        button.addEventListener('click', () => button.classList.toggle('filter-option-active'));
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

    programCards.forEach(card => {
        card.addEventListener('click', () => {
            const programId = card.dataset.id;
            showProgramDetail(programId);
        });
    });

    backToMarketBtn.addEventListener('click', showMarketplace);

    // --- [DIUBAH TOTAL] EVENT LISTENER UNTUK TOMBOL BELI ---
    getProgramBtn.addEventListener('click', () => {
        const programId = getProgramBtn.dataset.programId;
        const savedPrograms = JSON.parse(localStorage.getItem('userPrograms') || '[]');

        if (!savedPrograms.includes(programId)) {
            savedPrograms.push(programId);
            localStorage.setItem('userPrograms', JSON.stringify(savedPrograms));

            // 1. Tampilkan notifikasi toast yang baru
            showToast('Purchase successful! The program is yours.');
            
            // 2. Refresh UI untuk menampilkan tombol "See the Program"
            showProgramDetail(programId);
            
            // 3. Setelah UI di-refresh, scroll dan highlight tombolnya
            setTimeout(() => {
                ownedProgramActions.scrollIntoView({ behavior: 'smooth', block: 'center' });
                ownedProgramActions.classList.add('highlight-flash');

                // Hapus class highlight setelah animasi selesai
                setTimeout(() => {
                    ownedProgramActions.classList.remove('highlight-flash');
                }, 5000);
            }, 100); // Beri jeda sedikit agar DOM sempat update

        } else {
            // Jika sudah punya, tetap gunakan alert atau bisa juga toast
            showToast('You already own this program.');
        }
    });

    // --- INITIALIZATION ---
    switchView('programs');
});