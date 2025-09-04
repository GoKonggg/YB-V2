// File: main-coach.js
// Fungsi: Mengelola semua interaksi navigasi bawah untuk Coach, termasuk menu pop-up.

document.addEventListener('DOMContentLoaded', () => {
    const plusButton = document.getElementById('plus-button');
    const plusMenu = document.getElementById('plus-menu-coach');
    const plusMenuOverlay = document.getElementById('plus-menu-overlay');
    const plusIcon = plusButton ? plusButton.querySelector('svg') : null;

    const toggleMenu = (event) => {
        if (event) event.stopPropagation();
        const isHidden = plusMenu.classList.contains('hidden');
        
        plusMenu.classList.toggle('hidden');
        plusMenuOverlay.classList.toggle('hidden');

        // Animate the plus icon to a close icon (X)
        if (plusIcon) {
            plusIcon.style.transform = isHidden ? 'rotate(45deg)' : 'rotate(0deg)';
        }
    };

    if (plusButton && plusMenu && plusMenuOverlay) {
        plusButton.addEventListener('click', toggleMenu);
        plusMenuOverlay.addEventListener('click', toggleMenu);
    }
});