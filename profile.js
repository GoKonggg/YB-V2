// File: profile.js
// This script handles the interactive elements on the Profile page.

document.addEventListener('DOMContentLoaded', () => {
    
    // --- PLUS BUTTON MENU LOGIC ---
    // This ensures the main navigation's plus button and its menu
    // work consistently across all pages of the application.
    const plusButton = document.getElementById('plus-button');
    const plusMenu = document.getElementById('plus-menu');

    if (plusButton && plusMenu) {
        // When the plus button is clicked, toggle the menu's visibility
        plusButton.addEventListener('click', (event) => {
            // Stop the event from propagating to the window, which would close the menu
            event.stopPropagation();
            plusMenu.classList.toggle('hidden');
        });

        // Add a global click listener to the window
        window.addEventListener('click', () => {
            // If the menu is visible and the user clicks anywhere else, hide it
            if (!plusMenu.classList.contains('hidden')) {
                plusMenu.classList.add('hidden');
            }
        });
    }

});

