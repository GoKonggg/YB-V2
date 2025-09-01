// File: marketplace.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- PLUS BUTTON MENU LOGIC ---
    const plusButton = document.getElementById('plus-button');
    const plusMenu = document.getElementById('plus-menu');

    if (plusButton && plusMenu) {
        plusButton.addEventListener('click', (event) => {
            sessionStorage.setItem('flowOrigin', window.location.pathname); 
            event.stopPropagation();
            plusMenu.classList.toggle('hidden');
        });

        window.addEventListener('click', () => {
            if (!plusMenu.classList.contains('hidden')) {
                plusMenu.classList.add('hidden');
            }
        });
    }

    // --- EXPLORE PAGE LOGIC ---
    const programsToggle = document.getElementById('programs-toggle');
    const coachesToggle = document.getElementById('coaches-toggle');
    const programsView = document.getElementById('programs-view');
    const coachesView = document.getElementById('coaches-view');
    
    const filterButton = document.getElementById('filter-button');
    const filterPanel = document.getElementById('filter-panel');
    const programFilters = document.getElementById('program-filters-content');
    const coachFilters = document.getElementById('coach-filters-content');

    // Handles switching between the Programs and Coaches views
    if(programsToggle && coachesToggle) {
        programsToggle.addEventListener('click', () => {
            programsView.classList.remove('hidden');
            coachesView.classList.add('hidden');
            programsToggle.classList.add('toggle-active');
            coachesToggle.classList.remove('toggle-active');
            
            // Update which filter set is visible inside the panel
            programFilters.classList.remove('hidden');
            coachFilters.classList.add('hidden');
        });

        coachesToggle.addEventListener('click', () => {
            coachesView.classList.remove('hidden');
            programsView.classList.add('hidden');
            coachesToggle.classList.add('toggle-active');
            programsToggle.classList.remove('toggle-active');
            
            // Update which filter set is visible inside the panel
            coachFilters.classList.remove('hidden');
            programFilters.classList.add('hidden');
        });
    }

    // Handles showing and hiding the filter panel
    if(filterButton && filterPanel) {
        filterButton.addEventListener('click', () => {
            filterPanel.classList.toggle('hidden');
        });
    }
    
    // The "Apply" button also hides the filter panel
    const applyFilterButton = document.getElementById('apply-filter-button');
    if(applyFilterButton && filterPanel) {
        applyFilterButton.addEventListener('click', () => {
            filterPanel.classList.add('hidden');
        });
    }
    
    // Handles toggling the active state of filter option buttons
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('filter-option-active');
        });
    });

    // Handles the Reset button logic
    const resetFilterButton = document.getElementById('reset-filter-button');
    if(resetFilterButton) {
        resetFilterButton.addEventListener('click', () => {
            // Find which panel is currently visible
            const visiblePanelId = !programFilters.classList.contains('hidden') ? '#program-filters-content' : '#coach-filters-content';
            const activeOptions = document.querySelectorAll(`${visiblePanelId} .filter-option-active`);
            
            // Remove the active class from only the visible options
            activeOptions.forEach(button => {
                button.classList.remove('filter-option-active');
            });
        });
    }
});